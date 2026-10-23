# CareerIntell — Development Status & Operational Guide

## System Status: PRODUCTION-READY (LOCAL & CLOUD)

All planned phases have been completed and verified end-to-end.

---

## 1. Quick Start & Credentials

### Services
- **Backend API**: `http://localhost:8000` (FastAPI + SQLite Async)
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **Frontend App**: `http://localhost:5173` (React + Vite + Tailwind CSS)

### Pre-Seeded Accounts for Testing
| Role | Email | Password | Details |
|---|---|---|---|
| **Student** | `student@careerintell.com` | `student123` | Alex Chen — Target Role: Data Scientist (pre-loaded with skills, projects, certifications, and history) |
| **TPO Officer** | `tpo@careerintell.com` | `tpo123` | Dr. Priya Sharma — Campus placement analytics & student roster |
| **Admin** | `admin@careerintell.com` | `admin123` | System Administrator — Taxonomy, roles, and questions management |

---

## 2. Completed Architecture & Features

### Core Modules
1. **Authentication & Authorization**
   - JWT tokens with bcrypt password hashing.
   - Role-based route protection (`student`, `tpo`, `admin`).
   - In-memory Axios client interceptors for token management.

2. **Database & Models (SQLite via `aiosqlite`)**
   - 23 relational database tables: `users`, `student_profiles`, `skills`, `skill_aliases`, `career_roles`, `role_skills`, `resumes`, `resume_extractions`, `job_descriptions`, `job_skills`, `skill_gaps`, `readiness_assessments`, `readiness_history`, `projects`, `certifications`, `learning_resources`, `roadmaps`, `roadmap_items`, `assessments`, `questions`, `assessment_attempts`, `recommendations`.

3. **Natural Language Processing & Extraction**
   - **PyMuPDF (`pymupdf`)**: High-accuracy text and metadata extraction from PDF resumes.
   - **Section Segmenter**: Detects Education, Experience, Skills, and Projects sections.
   - **Skill Extractor**: 85+ canonical skills, 139+ aliases (e.g. `k8s` → `Kubernetes`), regex word-boundary matching, confidence scoring.

4. **Intelligence Engine & Readiness Scoring**
   - **JD Analyzer**: Extracts title, required skills, preferred skills, and experience constraints.
   - **Matching Service**: Computes weighted compatibility scores (Required 70%, Preferred 30%).
   - **Readiness Service**: Placement readiness formula:
     $$\text{Readiness} = (0.40 \times \text{Tech}) + (0.25 \times \text{Role}) + (0.15 \times \text{Projects}) + (0.10 \times \text{Resume}) + (0.10 \times \text{Assessments})$$
   - Generates natural-language diagnostic feedback.

5. **Personalized Learning Roadmap**
   - Dynamic 4-phase learning milestones tailored to identified skill gaps.
   - Interactive status toggling (`NOT_STARTED` → `IN_PROGRESS` → `COMPLETED`) with real-time recalculation of completion percentage.
   - Curated direct links to Coursera, YouTube, and official documentation.

6. **Verified Skill Assessments**
   - Timed MCQ quiz player with countdown timers.
   - Server-side grading, answer hiding during quiz, and post-submission explanations.
   - Verified skill badges awarded upon achieving passing threshold.

7. **TPO Placement Intelligence Portal**
   - Institutional analytics with cohort readiness distribution charts.
   - Department readiness ranking.
   - Searchable and role-filtered student placement roster.

---

## 3. How to Run & Test

```bash
# 1. Start Backend Server
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# 2. Start Frontend Server
npm.cmd run dev

# 3. Run Backend Test Suite
python -m pytest backend/tests/ -v

# 4. Run Frontend Type Check
npx.cmd tsc --noEmit
```
