from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
from services.file_parser import get_text
from services.nlp_service import extract_entities, calculate_match_score, process_job_description

app = Flask(__name__)
CORS(app)

# ── Firebase Setup (optional — only fails gracefully) ──────────────────────
try:
    import firebase_admin
    from firebase_admin import credentials, firestore

    KEY_PATH = os.path.join(os.path.dirname(__file__), "serviceAccountKey.json")
    if os.path.exists(KEY_PATH) and not firebase_admin._apps:
        cred = credentials.Certificate(KEY_PATH)
        firebase_admin.initialize_app(cred)
    db = firestore.client() if firebase_admin._apps else None
except Exception as e:
    print(f"[WARN] Firebase not initialized: {e}")
    db = None

# ── Upload folder ──────────────────────────────────────────────────────────
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024  # 10 MB

ALLOWED_EXTS = {".pdf", ".docx"}


# ── Health check ───────────────────────────────────────────────────────────
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "firebase": db is not None}), 200


# ── POST /api/upload-resume ────────────────────────────────────────────────
@app.route("/api/upload-resume", methods=["POST"])
def upload_resume():
    if "resume" not in request.files:
        return jsonify({"error": "No file part in request"}), 400

    file = request.files["resume"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTS:
        return jsonify({"error": "Only PDF and DOCX files are supported"}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(file_path)

    try:
        text = get_text(file_path)
        extracted = extract_entities(text)

        # Optionally persist to Firestore
        user_id = request.form.get("userId")
        if db and user_id:
            db.collection("resumes").add({
                "userId": user_id,
                "skills": extracted["skills"],
                "filename": filename,
            })

        return jsonify({
            "message": "Resume parsed successfully",
            "extracted_data": extracted,
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)


# ── POST /api/match-job ────────────────────────────────────────────────────
@app.route("/api/match-job", methods=["POST"])
def match_job():
    data = request.get_json(force=True, silent=True) or {}
    resume_skills = data.get("resume_skills", [])
    jd_text       = data.get("job_description", "")

    if not jd_text:
        return jsonify({"error": "job_description field is required"}), 400

    try:
        job_skills = process_job_description(jd_text)
        score, matched, missing, suggestions = calculate_match_score(resume_skills, job_skills)

        return jsonify({
            "match_score":    score,
            "matched_skills": matched,
            "missing_skills": missing,
            "suggestions":    suggestions,
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── POST /api/parse-resume (text-only shortcut) ────────────────────────────
@app.route("/api/parse-resume", methods=["POST"])
def parse_resume():
    data = request.get_json(force=True, silent=True) or {}
    text = data.get("text", "")
    if not text:
        return jsonify({"error": "text field is required"}), 400
    return jsonify(extract_entities(text)), 200


if __name__ == "__main__":
    app.run(debug=True, port=5000)
