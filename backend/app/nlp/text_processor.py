import re
from typing import Dict, List, Any, Optional

SECTION_HEADERS = {
    "education": [
        "education", "academic background", "academic qualifications", "academics", 
        "educational qualifications", "education & credentials"
    ],
    "skills": [
        "skills", "technical skills", "skills & competencies", "core competencies", 
        "technologies", "tech stack", "tools & technologies", "technical proficiencies",
        "areas of expertise", "programming skills"
    ],
    "experience": [
        "experience", "work experience", "professional experience", "employment history", 
        "internships", "work history", "career history", "relevant experience"
    ],
    "projects": [
        "projects", "personal projects", "academic projects", "key projects", 
        "technical projects", "featured projects"
    ],
    "certifications": [
        "certifications", "certificates", "licenses & certifications", "courses & certifications",
        "professional certifications", "accreditations", "awards & certifications", "awards"
    ]
}

# Sub-categories typically present within a skills block
SKILL_SUBCATEGORY_PATTERNS = [
    r'(?:programming\s+)?languages\s*[:\-]',
    r'web(?:\s*&\s*mobile)?\s*[:\-]',
    r'frameworks?(?:\s*&\s*libraries)?\s*[:\-]',
    r'cloud(?:\s*services)?\s*[:\-]',
    r'devops(?:\s*&\s*tools)?\s*[:\-]',
    r'databases?(?:\s*&\s*storage)?\s*[:\-]',
    r'tools?(?:\s*&\s*technologies)?\s*[:\-]',
    r'platforms?\s*[:\-]',
    r'machine\s+learning(?:\s*&\s*ai)?\s*[:\-]',
]

def clean_text(text: str) -> str:
    """Normalize whitespace, remove weird non-printable characters, sanitize bullets."""
    if not text:
        return ""
    # Normalize unicode spaces & zero-width artifacts
    text = re.sub(r'[\u200b\u200c\u200d\uFEFF\xa0\u2009\u200a]', ' ', text)
    
    # Normalize bullet points and dashes with spaces to prevent token concatenation
    text = re.sub(r'[\u2022\u25cf\u25aa\u25ba\u25b8\uf0b7\u25e6\u2219▪●•◆►]\s*', ' • ', text)
    text = re.sub(r'[\u2013\u2014–—]', '-', text)
    
    # Strip whitespace on individual lines
    lines = [re.sub(r'[ \t]+', ' ', line).strip() for line in text.splitlines()]
    text = '\n'.join(lines)
    
    # Replace excessive blank lines
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

def segment_sections(text: str) -> Dict[str, Any]:
    """
    Segment resume text into standard sections based on detected headers.
    Also extracts sub-categories if detected within the skills block.
    """
    lines = text.split('\n')
    sections: Dict[str, List[str]] = {k: [] for k in SECTION_HEADERS}
    sections["header"] = []
    
    current_section = "header"
    
    for line in lines:
        cleaned_line = line.strip().lower()
        if not cleaned_line:
            continue
            
        # Clean line from Markdown symbols, numbers, and trailing punctuation
        # Handles cases like: "1. EDUCATION", "### WORK EXPERIENCE:", "SKILLS -"
        header_candidate = re.sub(r'^(?:[0-9]+[.)]|\*+|-+|#+)\s*', '', cleaned_line)
        header_candidate = re.sub(r'[:\-_#*]+$', '', header_candidate).strip()
        
        matched_section = None
        for sec_name, synonyms in SECTION_HEADERS.items():
            if header_candidate in synonyms:
                matched_section = sec_name
                break
                
        if matched_section:
            current_section = matched_section
        else:
            sections[current_section].append(line)
            
    result: Dict[str, str] = {k: clean_text('\n'.join(v)) for k, v in sections.items() if v}
    return result

def parse_skill_subcategories(skills_text: str) -> Dict[str, List[str]]:
    """
    Parse categorized skill lines such as:
    Languages: Python, Java, SQL
    Web & Mobile: React, Node.js
    """
    subcats: Dict[str, List[str]] = {}
    lines = skills_text.split('\n')
    
    current_subcat = "General"
    for line in lines:
        matched = False
        for pat in SKILL_SUBCATEGORY_PATTERNS:
            m = re.match(pat, line, re.IGNORECASE)
            if m:
                cat_name = line[:m.end()].rstrip(':-').strip()
                skills_part = line[m.end():].strip()
                tokens = [t.strip() for t in re.split(r'[,;•|/]', skills_part) if t.strip()]
                subcats[cat_name] = tokens
                current_subcat = cat_name
                matched = True
                break
        if not matched and line.strip():
            tokens = [t.strip() for t in re.split(r'[,;•|/]', line) if t.strip()]
            if current_subcat not in subcats:
                subcats[current_subcat] = []
            subcats[current_subcat].extend(tokens)
            
    return subcats

def extract_resume_entities(text: str) -> Dict[str, Any]:
    """Extract contact points, academic GPA, degree, and URLs from resume text."""
    lower = text.lower()
    
    # Email
    email_m = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    email = email_m.group(0) if email_m else None
    
    # Phone
    phone_m = re.search(r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
    phone = phone_m.group(0) if phone_m else None
    
    # GitHub & LinkedIn
    github_m = re.search(r'github\.com/([a-zA-Z0-9_\-]+)', text, re.IGNORECASE)
    github = f"github.com/{github_m.group(1)}" if github_m else None
    
    linkedin_m = re.search(r'linkedin\.com/in/([a-zA-Z0-9_\-]+)', text, re.IGNORECASE)
    linkedin = f"linkedin.com/in/{linkedin_m.group(1)}" if linkedin_m else None
    
    # Portfolio / personal website
    site_m = re.search(r'(?:https?://)?(?:www\.)?([a-zA-Z0-9\-]+\.(?:co\.in|com|io|dev|me|org|tech|net))(?:\b|/)', text)
    portfolio = site_m.group(1) if site_m and "github.com" not in site_m.group(0) and "linkedin.com" not in site_m.group(0) else None
    
    # GPA / CGPA
    gpa_m = re.search(r'(?:gpa|cgpa)\s*[:\-]?\s*([0-9]+(?:\.[0-9]+)?(?:\s*/\s*[0-9]+(?:\.[0-9]+)?)?)', text, re.IGNORECASE)
    gpa = gpa_m.group(1) if gpa_m else None
    
    # Degrees detected
    degrees = []
    if re.search(r'\b(master(?:s)?(?:\s+of)?(?:\s+science)?|m\.s\.|m\.tech|m\.e\.)\b', lower):
        degrees.append("Master's")
    if re.search(r'\b(bachelor(?:s)?(?:\s+of)?(?:\s+technology|\s+science|\s+engineering)?|b\.tech|b\.e\.|b\.s\.)\b', lower):
        degrees.append("Bachelor's")
    if re.search(r'\b(ph\.d|doctorate)\b', lower):
        degrees.append("Ph.D.")
        
    # Major / discipline
    major = "Computer Science / Engineering" if any(k in lower for k in ["computer science", "computer engineering", "information technology", "software engineering"]) else None

    return {
        "email": email,
        "phone": phone,
        "github": github,
        "linkedin": linkedin,
        "portfolio": portfolio,
        "gpa": gpa,
        "degrees": degrees,
        "major": major
    }
