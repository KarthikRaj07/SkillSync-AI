import re
import string
from collections import Counter

try:
    import spacy
    from spacy.lang.en import English
except ImportError:
    spacy = None
    English = None

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

SKILL_CATEGORIES = {
    "Programming Languages": [
        "Python", "Java", "Javascript", "Typescript", "C++", "C#", "Go", "Rust",
        "Kotlin", "Swift", "Scala", "Php", "R", "Matlab", "Perl", "Bash", "Shell",
    ],
    "Frameworks & Libraries": [
        "React", "Angular", "Vue", "Flask", "Django", "Fastapi", "Express", "Node.js",
        "Spring", "Rails", "Laravel", "Bootstrap", "Tailwind", "Svelte", "Next.js",
        "Nuxt", "Redux", "Webpack", "Vite", "Graphql",
    ],
    "Databases": [
        "Sql", "Mysql", "Postgresql", "Sqlite", "Mongodb", "Redis", "Cassandra",
        "Dynamodb", "Firebase", "Firestore", "Elasticsearch",
    ],
    "Cloud & DevOps": [
        "Aws", "Azure", "Gcp", "Docker", "Kubernetes", "Terraform", "Ansible",
        "Jenkins", "Github Actions", "Nginx", "Linux", "Ci/Cd",
    ],
    "AI/ML": [
        "Tensorflow", "Pytorch", "Keras", "Scikit-Learn", "Pandas", "Numpy", "Spark",
        "Hadoop", "Nlp", "Machine Learning", "Deep Learning", "Opencv", "Hugging Face", "Llm",
    ],
    "Tools": [
        "Git", "Postman", "Figma", "Jira", "Excel",
    ],
}


def _normalize(text: str) -> str:
    """Lower-case and strip extra whitespace."""
    return re.sub(r'\s+', ' ', text.lower().strip())


def get_nlp():
    if not spacy:
        return None
    try:
        return spacy.load("en_core_web_sm")
    except Exception:
        try:
            nlp = spacy.blank("en")
            if "sentencizer" not in nlp.pipe_names:
                nlp.add_pipe("sentencizer")
            return nlp
        except Exception:
            return None

NLP = get_nlp()


def make_doc(text: str):
    if NLP:
        return NLP(text)
    if English:
        return English()(text)
    return None


def extract_skills_from_text(text: str) -> list:
    normalized = _normalize(text)
    found = set()
    for skill in SKILL_KEYWORDS:
        pattern = r'(?<![a-z0-9])' + re.escape(skill) + r'(?![a-z0-9])'
        if re.search(pattern, normalized):
            found.add(skill.title())
    return sorted(found)


def extract_entities(text: str) -> dict:
    skills = extract_skills_from_text(text)
    email = re.findall(r'[\w.+-]+@[\w-]+\.[a-z]{2,}', text, re.IGNORECASE)
    phone = re.findall(r'\+?\d[\d\s\-().]{8,}\d', text)

    entities = {}
    if email:
        entities["EMAIL"] = email
    if phone:
        entities["PHONE"] = phone[:3]

    return {
        "text": text[:500] + ("..." if len(text) > 500 else ""),
        "skills": skills,
        "entities": entities,
    }


def extract_education(text: str) -> list:
    degree_patterns = [
        r'\b(?:Bachelor(?:\'s)?|B\.?Tech|Master(?:\'s)?|M\.?Tech|MBA|Ph\.?D|Doctorate|Associate(?:\'s)?|Diploma)\b[^,\n]*',
    ]
    school_patterns = [
        r'([A-Z][A-Za-z& ]+(?:University|College|Institute|School))',
    ]

    found = set()
    for pattern in degree_patterns + school_patterns:
        for match in re.findall(pattern, text, re.IGNORECASE):
            if isinstance(match, tuple):
                match = match[0]
            entry = match.strip()
            if entry:
                found.add(entry)

    return sorted(found)


def extract_experience(text: str) -> list:
    years = re.findall(r'(\d+(?:\.\d+)?\+?\s+years?)', text, re.IGNORECASE)
    roles = []
    roles += re.findall(r'(?:(?:worked as|role as|as a|as an|position as|experience as)\s+)([^.,\n]+)', text, re.IGNORECASE)
    roles += re.findall(r'\b(Software Engineer|Data Scientist|Product Manager|Developer|Consultant|Analyst|Designer|Manager|Lead|Architect)\b', text, re.IGNORECASE)

    cleaned = [item.strip().title() for item in years + roles if item.strip()]
    return sorted(set(cleaned), key=lambda x: (-len(x), x))


def extract_keywords(text: str, limit: int = 10) -> list:
    doc = make_doc(text)
    if doc:
        tokens = [token.lemma_.lower() for token in doc if token.is_alpha and not token.is_stop and token.pos_ in {"NOUN", "PROPN", "ADJ"}]
    else:
        tokens = [token.lower() for token in re.findall(r'\b[a-zA-Z]{5,}\b', text)]

    counts = Counter(tokens)
    keywords = [token.title() for token, _ in counts.most_common(limit)]
    return keywords


def categorize_skills(skills: list) -> dict:
    category_map = {}
    lookup = {}
    for category, terms in SKILL_CATEGORIES.items():
        for term in terms:
            lookup[term.lower()] = category

    for category in SKILL_CATEGORIES:
        category_map[category] = []

    for skill in skills:
        normalized = skill.lower()
        if normalized in lookup:
            category_map[lookup[normalized]].append(skill)

    return category_map


def extract_project_count(text: str) -> int:
    matches = re.findall(r'\b(projects?|capstone|portfolio)\b', text, re.IGNORECASE)
    return len(matches)


def summarize_resume(categories: dict, education: str, experience: str) -> str:
    parts = []
    if categories.get("Programming Languages") or categories.get("Frameworks & Libraries"):
        parts.append("Strong in web development and programming")
    if categories.get("Cloud & DevOps"):
        parts.append("includes cloud and DevOps exposure")
    else:
        parts.append("lacks cloud and DevOps exposure")
    if categories.get("AI/ML"):
        parts.append("has AI/ML capability")
    if education and not experience:
        parts.append("needs more experience detail")
    if experience and not education:
        parts.append("needs more education detail")
    return ", ".join(parts) + "."


def build_resume_insights(text: str, job_description: str = "") -> dict:
    skills = extract_skills_from_text(text)
    categories = categorize_skills(skills)
    education_list = extract_education(text)
    experience_list = extract_experience(text)
    education = education_list[0] if education_list else ""
    experience = experience_list[0] if experience_list else ""
    project_count = extract_project_count(text)
    matched = []
    missing = []
    if job_description:
        job_skills = process_job_description(job_description)
        _, matched, missing, _ = calculate_match_score(skills, job_skills)

    summary = summarize_resume(categories, education, experience)
    return {
        "categories": categories,
        "education": education,
        "experience": experience,
        "projects": project_count,
        "total_skills": len(skills),
        "matched_skills": matched,
        "missing_skills": missing,
        "summary": summary,
    }


def calculate_match_score(resume_skills: list, job_skills: list) -> tuple:
    if not job_skills:
        return 0.0, [], [], ["Please provide skills in the job description."]

    resume_set = {s.lower() for s in resume_skills}
    job_set = {s.lower() for s in job_skills}

    matched = sorted([s for s in job_set if s in resume_set])
    missing = sorted([s for s in job_set if s not in resume_set])

    score = round((len(matched) / len(job_set)) * 100, 2)
    suggestions = [f"Learn {skill.title()} — it's required for this role." for skill in missing]
    if not missing:
        suggestions.append("Great match! Focus on showcasing your experience in your top skills.")

    return score, [s.title() for s in matched], [s.title() for s in missing], suggestions


def calculate_resume_score(education: list, experience: list, skills: list) -> int:
    score = 20
    score += min(40, len(skills) * 8)
    if education:
        score += 20
    if experience:
        score += 20
    return min(100, score)


def generate_resume_suggestions(skills: list, education: list, experience: list) -> list:
    suggestions = []
    if not skills:
        suggestions.append("Add more relevant skills to your resume.")
    if not education:
        suggestions.append("Include your highest degree or academic achievements.")
    if not experience:
        suggestions.append("Describe your work experience using measurable achievements.")
    if skills and education and experience:
        suggestions.append("Use action verbs and quantify your impact where possible.")
    return suggestions


def analyze_resume_text(text: str) -> dict:
    word_count = len(re.findall(r'\b\w+\b', text))
    skills = extract_skills_from_text(text)
    education = extract_education(text)
    experience = extract_experience(text)
    keywords = extract_keywords(text)
    score = calculate_resume_score(education, experience, skills)
    suggestions = generate_resume_suggestions(skills, education, experience)

    return {
        "word_count": word_count,
        "skills": skills,
        "education": education,
        "experience": experience,
        "keywords": keywords,
        "score": score,
        "suggestions": suggestions,
    }


def process_job_description(jd_text: str) -> list:
    return extract_skills_from_text(jd_text)
