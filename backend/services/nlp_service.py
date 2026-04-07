import re
import string

# =====================================================================
# Comprehensive skill keyword list — no spaCy model required
# =====================================================================
SKILL_KEYWORDS = [
    # Languages
    "python", "java", "javascript", "typescript", "c++", "c#", "c", "ruby", "go", "rust",
    "kotlin", "swift", "scala", "php", "r", "matlab", "perl", "bash", "shell",
    # Frontend
    "react", "angular", "vue", "html", "css", "tailwind", "bootstrap", "sass", "scss",
    "next.js", "nuxt", "svelte", "vite", "webpack", "redux",
    # Backend
    "node.js", "express", "flask", "django", "fastapi", "spring", "rails", "laravel",
    "graphql", "rest api", "grpc",
    # Databases
    "sql", "mysql", "postgresql", "sqlite", "mongodb", "redis", "cassandra", "dynamodb",
    "firebase", "firestore", "elasticsearch",
    # DevOps / Cloud
    "docker", "kubernetes", "aws", "azure", "gcp", "linux", "nginx", "jenkins",
    "terraform", "ansible", "ci/cd", "github actions", "git",
    # ML / AI / Data
    "machine learning", "deep learning", "nlp", "tensorflow", "pytorch", "keras",
    "scikit-learn", "pandas", "numpy", "matplotlib", "opencv", "hugging face",
    "llm", "generative ai", "data science", "spark", "hadoop",
    # Mobile
    "android", "ios", "react native", "flutter", "xamarin",
    # Tools / Other
    "figma", "jira", "agile", "scrum", "postman", "git", "linux", "excel",
]


def _normalize(text: str) -> str:
    """Lower-case and strip extra whitespace."""
    return re.sub(r'\s+', ' ', text.lower().strip())


def extract_skills_from_text(text: str) -> list:
    """
    Extract skills from free-form text using keyword matching.
    Works entirely without a spaCy model.
    """
    normalized = _normalize(text)
    found = set()
    for skill in SKILL_KEYWORDS:
        # Use word-boundary style matching
        pattern = r'(?<![a-z0-9])' + re.escape(skill) + r'(?![a-z0-9])'
        if re.search(pattern, normalized):
            found.add(skill.title())  # capitalise nicely, e.g. "python" → "Python"
    return sorted(found)


def extract_entities(text: str) -> dict:
    """Return skills + basic entity structure (no model needed)."""
    skills = extract_skills_from_text(text)

    # Very simple heuristics for education / experience mentions
    email = re.findall(r'[\w.+-]+@[\w-]+\.[a-z]{2,}', text, re.IGNORECASE)
    phone = re.findall(r'\+?\d[\d\s\-().]{8,}\d', text)

    entities = {}
    if email:
        entities["EMAIL"] = email
    if phone:
        entities["PHONE"] = phone[:3]  # cap at 3

    return {
        "text": text[:500] + ("..." if len(text) > 500 else ""),
        "skills": skills,
        "entities": entities,
    }


def process_job_description(jd_text: str) -> list:
    """Extract skill keywords from a job description."""
    return extract_skills_from_text(jd_text)


def calculate_match_score(resume_skills: list, job_skills: list) -> tuple:
    """
    Returns (score_float, matched_list, missing_list, suggestions_list)
    All comparisons are case-insensitive.
    """
    if not job_skills:
        return 0.0, [], [], ["Please provide skills in the job description."]

    resume_set = {s.lower() for s in resume_skills}
    job_set    = {s.lower() for s in job_skills}

    matched = sorted([s for s in job_set if s in resume_set])
    missing = sorted([s for s in job_set if s not in resume_set])

    score = round((len(matched) / len(job_set)) * 100, 2)

    suggestions = []
    for skill in missing:
        nice = skill.title()
        suggestions.append(f"Learn {nice} — it's required for this role.")
    if not missing:
        suggestions.append("Great match! Focus on showcasing your experience in your top skills.")

    return score, [s.title() for s in matched], [s.title() for s in missing], suggestions
