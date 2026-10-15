# AI-Powered Academic Study Assistant Using RAG and Personalized Learning Analytics

> **BSAI Final Year Project Proposal (Revised) • Fall 2026**  
> **University of Central Punjab (UCP) • Outcome-Based Education (OBE) Platform**  
> **Project Advisor:** Dr. Iqra Tariq  

A modular, LMS-style academic study platform organized like an integrated application suite (inspired by Odoo). Built around **Source-Grounded Retrieval-Augmented Generation (RAG)**, **Bloom's Taxonomy Course Learning Outcomes (CLOs)**, and **HEC / PEC Washington Accord Program Learning Outcomes (PLOs 1–12)**.

---

## 🌟 Key Features & Core Modules

### 1. 📚 Academic LMS Core
- **Course & Curricula Management**: Detailed course structures (`/dashboard/courses`), credit hours, instructors, and enrolled student cohorts.
- **Role-Based Workspaces**: Tailored capabilities for **Students**, **Course Instructors/Advisors**, and **QEC / Scrutiny Committee Admins**.
- **Course Materials Repository**: Direct upload and indexing of lecture slides (PPTX/PDF), task files, and notes with automated slide-locator extraction (`[Slide 12]`, `[Slide 19]`).

### 2. 💬 Source-Grounded Academic RAG Chatbot
- **Slide-Level Verifiable Citations**: Every answer attaches provenance citations displaying document title, slide/page locator, and verbatim excerpts.
- **Confidence Thresholding**: Evaluates cosine/hybrid similarity scores. If retrieval confidence falls below threshold (`< 35%`), the system explicitly flags the question with a **Low Confidence Warning** rather than hallucinating or guessing.
- **Multi-Model Orchestration**: Supports local Ollama (Mistral 7B) and OpenRouter LLMs.

### 3. 🎯 CLO/PLO Auto-Mapping Engine
- **Automated Semantic Tagging**: Auto-tags uploaded lecture slides, assignments, and generated quiz questions against Course Learning Outcomes (CLOs).
- **Instructor Review & Approval**: Dedicated faculty review interface (`/dashboard/obe-mapping`) to approve, adjust, or override AI-suggested mappings with confidence ratings.
- **Eliminates Manual Spreadsheets**: Automates the manual semester-end outcome-mapping process into real-time digital matrices.

### 4. 📝 Formative Quizzes & 3D Interactive Flashcards
- **CLO-Mapped Quiz Generator**: Auto-generates topic-based multiple-choice quizzes mapped directly to specific Bloom's cognitive levels (C1 Remembering to C6 Creating).
- **Interactive Quiz Taker**: Real-time timer, answer evaluation, explanation breakdowns, and score distribution per CLO.
- **3D Spaced-Repetition Flashcards**: Interactive 3D flip card revision decks (`/dashboard/flashcards`) with mastery tracking ("Mastered" vs. "Need Review").

### 5. 📊 Personalized Learning Analytics & OBE Attainment
- **Student Weak-Topic Detection**: Automatically detects topics where student score is below passing threshold (`< 60%`).
- **Adaptive Recommendations**: Generates personalized study recommendations directing students to specific lecture slides, flashcard decks, and practice quizzes.
- **Live Faculty Attainment Matrix**: Calculates real-time attainment percentages across CLO-1 through CLO-4 and all 12 HEC/PEC PLOs.
- **Accreditation Audit Export**: 1-click export of the Continuous Quality Improvement (CQI) OBE Attainment Matrix in standard **RFC-4180 CSV** and **JSON** formats.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 22+
- pnpm (`corepack enable && corepack prepare pnpm@latest --activate`)

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Run Test Suite
```bash
pnpm test
# Or run targeted academic tests:
node --test tests/academic.test.mjs
```
*(All 24 unit and integration tests pass with 0 failures)*

### 3. Start Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. The platform includes a **Zero-Config Instant Demo Mode** that allows immediate exploration as Student, Instructor, or QEC Admin without requiring any external database setup.

---

## 🌐 1-Click Free Deployments

### Option A: Vercel (Recommended - 100% Free)
1. Push this repository to your GitHub account (`zamadshakil/ai-academic-study-assistant`).
2. Visit [Vercel](https://vercel.com/new).
3. Import the repository. The pre-configured `vercel.json` and Next.js preset will detect all build settings automatically.
4. Click **Deploy**. Your academic platform is live in ~60 seconds with SSL and global edge routing!

### Option B: Render (100% Free Web Service)
1. Connect your repository on [Render](https://dashboard.render.com).
2. The included `render.yaml` automatically configures the web service, build command (`pnpm run build`), and standalone runner (`node .next/standalone/server.js`).
3. Click **Create Web Service**.

### Option C: Docker / Docker Compose
Deploy locally or on any cloud VPS (DigitalOcean, AWS, Fly.io) with a single command:
```bash
docker compose up --build -d
```
The application will run on port `3000` via an optimized multi-stage standalone Node.js container.

---

## 📂 Project Structure

```
├── app/
│   ├── (dashboard)/dashboard/
│   │   ├── courses/             # LMS Course Management & Curricula
│   │   ├── materials/           # Slide Repository & File Uploads
│   │   ├── smart-ai/            # Academic RAG Chatbot with Slide Citations
│   │   ├── quizzes/             # CLO-Mapped Formative Quizzes
│   │   ├── flashcards/          # 3D Interactive Revision Decks
│   │   ├── analytics/           # Weak-Topic Diagnostics & Adaptive Study Cards
│   │   ├── obe-framework/       # 12 HEC/PEC PLOs & Bloom's Taxonomy CLOs
│   │   ├── obe-mapping/         # Instructor Review & Approval for AI Mappings
│   │   ├── obe-attainment/      # Real-Time Course Attainment Matrix
│   │   └── obe-reports/         # HEC Accreditation Export (CSV & JSON)
│   ├── api/academic/            # Academic REST APIs (RAG, CLOs, Materials, Export)
│   └── auth/                    # Role-based login with instant demo personas
├── components/
│   └── dashboard/
│       ├── smart-ai/            # Citation display, confidence alerts & RAG panel
│       └── navigation.ts        # Modular LMS app navigation
├── lib/
│   ├── academic/
│   │   ├── service.ts           # Academic RAG, OBE Attainment & Quiz Engines
│   │   └── types.ts             # Academic TypeScript Definitions
│   └── auth.ts                  # Resilient session & demo persona resolution
├── tests/
│   └── academic.test.mjs        # 14 comprehensive academic module test cases
├── Dockerfile                   # Multi-stage production container
├── docker-compose.yml           # Container orchestration
├── render.yaml                  # Render free deployment blueprint
└── vercel.json                  # Vercel deployment configuration
```

---

## 📜 Compliance & Accreditations
- **Washington Accord / PEC**: Compliant with Program Learning Outcomes 1 through 12.
- **HEC Outcome-Based Education (OBE)**: Standard 60% passing attainment threshold with CQI loop.
- **Bloom's Taxonomy**: Full cognitive domain coverage (C1 Remembering to C6 Creating).
