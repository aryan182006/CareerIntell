# 🚀 CareerIntell — AI-Powered Career Intelligence & Placement Readiness Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![SQLite](https://img.shields.io/badge/SQLite-Async_aiosqlite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org)

> **CareerIntell** is a full-stack, enterprise-grade AI career advisory and campus placement intelligence platform. It bridges the gap between students, recruiters, and Training & Placement Officers (TPOs) by providing automated resume parsing, real-time job description matching, personalized learning roadmaps, verified skill quizzes, and institutional cohort readiness analytics.

---

## 🌟 Key Features

### 1. 📄 Smart Resume Parsing & NLP Engine
- **PyMuPDF & RapidOCR**: High-precision extraction of text, sections, and metadata from PDF resumes (including scanned documents).
- **Canonical Skill Taxonomy**: Maps 85+ skills and 139+ alias variants (e.g. `k8s` → `Kubernetes`, `react.js` → `React`) using regex word-boundary detection and confidence scoring.
- **Section Segmentation**: Automatically partitions Education, Experience, Skills, Certifications, and Projects.

### 2. 🎯 Job Description (JD) Compatibility Matcher
- Analyzes candidate resumes against target job descriptions or predefined industry roles.
- Computes weighted compatibility scores (**70% Required Skills**, **30% Preferred Skills**).
- Identifies critical missing skills and strengths.

### 3. 📊 Multi-Factor Placement Readiness Scoring
Calculates an objective, composite readiness score (0–100%) using an institutional formula:
$$\text{Readiness} = (0.40 \times \text{Tech Skills}) + (0.25 \times \text{Role Alignment}) + (0.15 \times \text{Projects}) + (0.10 \times \text{Resume Quality}) + (0.10 \times \text{Assessments})$$
- Produces natural-language diagnostic feedback and actionable advice.

### 4. 🗺️ Dynamic Personalized Learning Roadmaps
- Generates 4-phase milestone roadmaps tailored directly to identified candidate skill gaps.
- Real-time progress tracking (`NOT_STARTED` → `IN_PROGRESS` → `COMPLETED`).
- Curated direct links to reputable resources (Coursera, YouTube, and official documentation).

### 5. ✍️ Verified Skill Assessments (MCQ Engine)
- Timed assessment player with real-time countdown timer.
- Server-side grading with anti-cheat state isolation (answers hidden until submission).
- Verifiable skill badges awarded upon achieving passing threshold score.

### 6. 🏛️ TPO & Campus Placement Analytics Portal
- Institutional dashboard with student readiness distribution charts.
- Department-wise readiness rankings and cohort metrics.
- Comprehensive student roster filtering and placement tracking.

---

## 🏗️ System Architecture

```
CareerIntell/
├── backend/
│   ├── app/
│   │   ├── api/            # REST API route handlers (Auth, Resumes, Jobs, TPO, etc.)
│   │   ├── core/           # Configuration, async DB session, security (JWT, bcrypt)
│   │   ├── models/         # SQLAlchemy 2.0 async database schemas (23 tables)
│   │   ├── nlp/            # Resume parser, OCR engine, skill extractor
│   │   ├── schemas/        # Pydantic validation schemas
│   │   ├── seed/           # Initial role, skill, and assessment datasets
│   │   └── services/       # Core business logic & scoring algorithms
│   ├── tests/              # Pytest test suite
│   ├── requirements.txt    # Python dependencies
│   └── test_api.py         # End-to-end API test script
├── src/                    # React 18 + TypeScript frontend
│   ├── components/         # Reusable UI components & layouts
│   ├── pages/              # Role-specific views (Dashboard, Analyze, Roadmap, TPO, etc.)
│   ├── services/           # Axios API client & endpoints
│   └── types/              # TypeScript interface definitions
├── sample resume/          # Sample PDF resumes for testing
├── launch.html             # Quick visual access launcher
├── start_app.bat           # 1-Click launcher script for Windows
└── vite.config.ts          # Vite build configuration
```

---

## ⚡ Quick Start Guide

### Prerequisites
- **Node.js** (v18.x or later) & `npm`
- **Python** (v3.10 or later) & `pip`
- **Git**

---

### Option A: One-Click Start (Windows)
Simply double-click:
```bash
start_app.bat
```
This automatically boots both the backend FastAPI server on `http://127.0.0.1:8000` and the React frontend on `http://localhost:5173`.

---

### Option B: Manual Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/aryan182006/CareerIntell.git
cd CareerIntell
```

#### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create & activate a virtual environment (optional but recommended)
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Docs (Swagger UI): `http://127.0.0.1:8000/docs`
- Redoc: `http://127.0.0.1:8000/redoc`

#### 3. Frontend Setup
```bash
# From the project root:
npm install

# Start Vite dev server
npm run dev
```
- Web Application: `http://localhost:5173`

---

## 👥 Demo / Testing Credentials

The system automatically initializes and seeds default roles and demo accounts:

| Role | Email | Password | Description |
|---|---|---|---|
| 🎓 **Student** | `student@careerintell.com` | `student123` | Pre-loaded candidate profile (Alex Chen, Data Science track) |
| 🏢 **TPO Officer** | `tpo@careerintell.com` | `tpo123` | Institutional dashboard, placement statistics & roster |
| ⚙️ **Admin** | `admin@careerintell.com` | `admin123` | System taxonomy, role management, assessment builder |

*(TPO registration secret code for new signups: `TPO-SECURE-2026`)*

---

## 🧪 Testing

Run backend tests:
```bash
cd backend
pytest
```

---

## 🛡️ License

This project was developed for academic and educational evaluation. Distributed under the MIT License.
