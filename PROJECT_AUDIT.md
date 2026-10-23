# CareerIntell — Full Project Audit

**Date**: September 11, 2026  
**Auditor**: Automated deep-inspection of repository `d:\T.Y Project`

---

## 1. Existing Architecture

```
d:\T.Y Project/
├── index.html                    # Vite HTML entry point
├── package.json                  # React 18 + Vite 5 project
├── vite.config.ts                # Vite config (polling watcher enabled)
├── tailwind.config.js            # Tailwind CSS 3 configuration
├── postcss.config.js             # PostCSS (Tailwind + Autoprefixer)
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── public/
│   └── images/
│       ├── dashboard-bg.jpg
│       └── hero-bg.jpg
└── src/
    ├── main.tsx                  # React DOM entry
    ├── App.tsx                   # Router with AuthProvider + Layout
    ├── index.css                 # Tailwind directives + custom utilities
    ├── vite-env.d.ts
    ├── components/
    │   ├── auth/
    │   │   └── ProtectedRoute.tsx
    │   ├── layout/
    │   │   └── Layout.tsx
    │   └── navigation/
    │       ├── Sidebar.tsx
    │       └── TopBar.tsx
    ├── context/
    │   └── AuthContext.tsx
    ├── data/
    │   └── mockData.ts           # ALL data originates here
    ├── pages/
    │   ├── LandingPage.tsx       # 852 lines - marketing page
    │   ├── AuthPage.tsx          # Login / Register form
    │   ├── DashboardPage.tsx     # Student dashboard
    │   ├── ProfilePage.tsx       # Profile editor (React Hook Form + Zod)
    │   ├── AnalyzePage.tsx       # Resume upload + JD paste
    │   ├── IntelligencePage.tsx  # Skill gap matrix display
    │   ├── RoadmapPage.tsx       # Learning roadmap timeline
    │   └── NotFoundPage.tsx      # 404 page
    ├── types/
    │   └── index.ts              # TypeScript interfaces
    └── utils/
        └── helpers.ts            # cn() class merge utility
```

**Architecture Summary**: Frontend-only SPA. No backend. No database. No API layer. No AI/NLP pipeline. All data is hardcoded in `mockData.ts`.

---

## 2. Existing Frontend Features

| Feature | Files | Status |
|---------|-------|--------|
| Landing Page (marketing) | `LandingPage.tsx` (852 lines) | **[WORKING]** - static marketing page, renders correctly |
| Routing (React Router) | `App.tsx` | **[WORKING]** - 8 routes, protected route wrapper |
| Layout (Sidebar + TopBar) | `Layout.tsx`, `Sidebar.tsx`, `TopBar.tsx` | **[WORKING]** - responsive sidebar, mobile toggle |
| Auth Page (Login/Register) | `AuthPage.tsx` | **[MOCK]** - form collects name/email/password but does NOT validate against a database; login just sets mockStudent in localStorage |
| Protected Routes | `ProtectedRoute.tsx` | **[PARTIALLY WORKING]** - checks isAuthenticated from context, but auth is fake |
| Student Profile Form | `ProfilePage.tsx` | **[MOCK]** - Zod-validated form, saves to React Context + localStorage, NOT to a database |
| Dashboard | `DashboardPage.tsx` | **[MOCK]** - ALL metrics (readiness 68%, role matches, skill gaps, "+12% MoM") come from mockData.ts |
| Resume Upload + JD Analysis | `AnalyzePage.tsx` | **[MOCK]** - file input exists, JD textarea exists, "Analyze" button runs a 2-second setTimeout then shows hardcoded results (82% compatibility, 7/10 matched skills, 3 priority gaps) |
| Career Intelligence | `IntelligencePage.tsx` | **[MOCK]** - displays mockSkillGaps and mockRoleMatches from static data |
| Learning Roadmap | `RoadmapPage.tsx` | **[MOCK]** - renders mockRoadmap (4 hardcoded phases) |
| 404 Page | `NotFoundPage.tsx` | **[WORKING]** - simple static page |
| Search Bar | `TopBar.tsx` | **[MOCK]** - input field exists, no search logic |
| Notifications Bell | `TopBar.tsx` | **[MOCK]** - bell icon with fake blue dot, no notification system |

---

## 3. Existing Backend Features

| Feature | Status |
|---------|--------|
| Backend server | **[MISSING]** - no backend directory, no Python files, no server |
| API endpoints | **[MISSING]** - zero fetch() or API calls in frontend |
| Database connection | **[MISSING]** - no database |
| Authentication service | **[MISSING]** - no password hashing, no JWT, no sessions |

---

## 4. Existing Database Features

| Feature | Status |
|---------|--------|
| PostgreSQL / any RDBMS | **[MISSING]** - no database installed or configured |
| Migrations | **[MISSING]** |
| Data models (server-side) | **[MISSING]** - only TypeScript interfaces exist |
| Data persistence | **[MOCK]** - localStorage only (lost on clear) |

---

## 5. Existing AI/NLP Features

| Feature | Status |
|---------|--------|
| Resume parsing (PDF to text) | **[MISSING]** - file input exists but file is never read/processed |
| Skill extraction | **[MISSING]** - no NLP pipeline |
| JD analysis | **[MISSING]** - textarea exists but content is never analyzed |
| Skill matching/similarity | **[MISSING]** - no algorithm |
| Readiness scoring | **[MISSING]** - score is 68 from mockData.ts |
| Recommendation engine | **[MISSING]** - no logic |
| Roadmap generation | **[MISSING]** - roadmap is static JSON |

---

## 6. Existing Authentication

| Feature | Status |
|---------|--------|
| Registration form | **[MOCK]** - collects name + email, creates in-memory object, no backend call |
| Login form | **[MOCK]** - accepts ANY email, loads mockStudent, no password verification |
| Password handling | **[BROKEN]** - password field exists in UI but is never used/validated |
| Token management | **[MISSING]** - no JWT, no session cookies |
| Role-based auth (Student/TPO/Admin) | **[MISSING]** - only one role exists (Student) |
| Logout | **[PARTIALLY WORKING]** - clears localStorage and React state |

---

## 7. Existing API Integrations

| Feature | Status |
|---------|--------|
| Frontend to Backend API calls | **[MISSING]** - zero fetch/axios calls in entire codebase |
| External API integrations | **[MISSING]** |
| API service layer | **[MISSING]** - no src/api/ or src/services/ directory |

---

## 8. Existing Mock/Demo Functionality

Everything data-driven in this application is mock:

| Mock Data | Location | Details |
|-----------|----------|---------|
| mockStudent | mockData.ts:3 | Hardcoded student "Aryan" with fixed skills, projects, certifications |
| mockRoleMatches | mockData.ts:53 | 5 roles with hardcoded match scores (84%, 72%, 66%, 58%, 51%) |
| mockSkillGaps | mockData.ts:91 | 6 hardcoded skill gaps with fixed levels |
| mockReadiness | mockData.ts:100 | Score = 68, category = "Developing" - hardcoded |
| mockRoadmap | mockData.ts:112 | 4 phases with hardcoded tasks and statuses |
| Dashboard "+12% MoM" | DashboardPage.tsx:86 | Hardcoded string, no historical data |
| "Placement Potential High" | DashboardPage.tsx:118 | Hardcoded string |
| Analysis results (82%, 7/10) | AnalyzePage.tsx:196-210 | Hardcoded after 2s setTimeout |
| "$115,000 / yr avg" salary | IntelligencePage.tsx:49 | Hardcoded string |

---

## 9. Broken Features

| Feature | Issue |
|---------|-------|
| Password in AuthPage | Password field collected but NEVER used - login ignores it completely |
| Resume Upload | File is stored in React state but never uploaded or processed |
| JD Analysis button | Runs setTimeout(2000) then shows hardcoded results - no actual analysis |
| "Demo Login" | Loads the same mock user regardless of input |
| Search bar | Form with method="GET" and action="#" - no search functionality |

---

## 10. Missing Features (Required for Working Product)

| # | Feature | Priority |
|---|---------|----------|
| 1 | Backend server (FastAPI) | Critical |
| 2 | PostgreSQL database + migrations | Critical |
| 3 | Real authentication (register, login, JWT, password hashing) | Critical |
| 4 | Student profile persistence (DB-backed CRUD) | Critical |
| 5 | Resume upload (file storage + PDF text extraction) | Critical |
| 6 | Skill extraction (NLP pipeline from resume text) | Critical |
| 7 | JD analysis (extract requirements from job description text) | Critical |
| 8 | Skill taxonomy (structured skill database with aliases) | High |
| 9 | Skill matching (student skills vs job requirements) | High |
| 10 | Skill gap analysis (dynamic comparison) | High |
| 11 | Career role matching (dynamic compatibility scoring) | High |
| 12 | Readiness scoring engine (explainable, from real data) | High |
| 13 | Recommendation engine (prioritized learning suggestions) | High |
| 14 | Learning roadmap generation (personalized, not static) | High |
| 15 | Assessment system (questions, scoring, attempts) | Medium |
| 16 | Progress tracking (readiness history over time) | Medium |
| 17 | TPO dashboard (aggregated analytics from real data) | Medium |
| 18 | Admin panel (user/skill/role/resource management) | Medium |
| 19 | Report generation (PDF career readiness report) | Low |
| 20 | Frontend API integration layer (src/api/) | Critical |
| 21 | Security (CORS, rate limiting, file validation) | High |
| 22 | Testing (unit + integration + e2e) | Medium |
| 23 | Docker setup (docker-compose for dev environment) | Low |
| 24 | Documentation (architecture, API docs, methodology) | Medium |

---

## 11. Technical Debt

| Issue | Severity |
|-------|----------|
| All pages import directly from mockData.ts - no abstraction layer | High |
| Auth context defaults to logged-in with mock user (line 32: return mockStudent) | High |
| isAuthenticated always returns true (line 37: saved !== null ? true : true) | High |
| Password field is completely unused | Medium |
| No error boundaries in React | Medium |
| No loading states for data fetching | Medium |
| LandingPage.tsx is 852 lines - should be decomposed | Low |
| No src/api/, src/services/, or src/hooks/ directories | Medium |

---

## 12. Security Concerns

| Concern | Severity |
|---------|----------|
| No password hashing - passwords are not even stored | Critical |
| No authentication - any email logs in as the same mock user | Critical |
| No authorization - no role-based access control | Critical |
| No CORS configuration (no backend exists to configure) | High |
| No file validation on resume upload - accepts anything | High |
| No API key management (none exist yet) | Medium |
| Student data in localStorage is unencrypted | Low |

---

## 13. Recommended Implementation Order

### Phase 1: Foundation (Backend + Database)
1. Create FastAPI backend with proper project structure
2. Set up PostgreSQL database with SQLAlchemy models
3. Create database migration system (Alembic)
4. Implement seed data for skill taxonomy and career roles

### Phase 2: Authentication
5. Implement user registration with password hashing (bcrypt)
6. Implement JWT-based login/logout
7. Role-based authorization (STUDENT, TPO, ADMIN)
8. Connect frontend auth to real backend API

### Phase 3: Student Profile
9. Backend CRUD endpoints for student profiles
10. Connect ProfilePage form to real API
11. Database persistence for skills, projects, certifications

### Phase 4: Resume Processing
12. PDF upload endpoint with file validation
13. PDF text extraction (PyMuPDF/pdfplumber)
14. Skill extraction NLP pipeline (spaCy)
15. Skill normalization against taxonomy
16. Connect AnalyzePage to real upload + extraction API

### Phase 5: Intelligence Engine
17. Job description analysis endpoint
18. Skill matching algorithm
19. Skill gap analysis (dynamic comparison)
20. Career role matching (dynamic compatibility scoring)
21. Readiness scoring engine (explainable)
22. Connect Dashboard/IntelligencePage to real API

### Phase 6: Recommendations and Roadmap
23. Recommendation engine (prioritized by gap severity)
24. Dynamic roadmap generation
25. Connect RoadmapPage to real API

### Phase 7: Assessment and Progress
26. Assessment system (questions DB, scoring, attempts)
27. Progress tracking (readiness history)

### Phase 8: TPO and Admin
28. TPO dashboard with aggregated analytics
29. Admin panel for managing users/skills/roles

### Phase 9: Polish and Production
30. Security hardening
31. Testing suite
32. Report generation
33. Docker setup
34. Documentation

---

## Environment Status

| Tool | Available | Version |
|------|-----------|---------|
| Node.js | Yes | (npm works) |
| Python | Yes | 3.14.2 |
| pip | Yes | 26.2.1 |
| Docker | No | Not installed |
| PostgreSQL | Unknown | Not yet checked |
| Git | No | No .git repository |
