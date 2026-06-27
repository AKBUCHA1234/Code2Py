# Code2Py 🐍

**Understand DSA code by turning it into Python.** Paste C, C++, or Java — Code2Py converts it to clean Python, detects the algorithm, explains the logic step-by-step, analyzes time & space complexity, and recommends LeetCode problems and concept videos to help you learn faster.

Built as a production-style, full-stack application that runs entirely on free tiers.

---

## ✨ Features

- **Code translation** — C / C++ / Java → idiomatic Python
- **Algorithm detection** — identifies the technique automatically
- **Step-by-step explanation** — written for a student, not a compiler
- **Complexity analysis** — Big-O time and space
- **LeetCode & YouTube suggestions** — practice problems + concept videos
- **Follow-up chat** — ask questions about any analysis
- **Run Python in-browser** — execute the output via Pyodide (no server)
- **Image → code (OCR)** — extract code from a screenshot
- **Dashboard** — history, stats, learning path, daily challenge, streaks
- **Auth** — JWT-based register/login, user-scoped data
- **Light + dark themes**, ⌘K command palette, animated UI

## 🧱 Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, TypeScript, Framer Motion |
| Backend | FastAPI, SQLAlchemy 2, Alembic |
| Database | PostgreSQL |
| AI | Local **Ollama** (qwen2.5-coder) in dev · **Groq** (Llama) in prod — swappable via an `AIProvider` abstraction |
| Hosting | Vercel (frontend) · Render (backend) · Neon (DB) |

## 🏗️ Architecture

```
React (Vite)  ──HTTP──►  FastAPI  ──►  PostgreSQL
                            │
                            └──►  AIProvider  ──►  Ollama (dev) / Groq (prod)
```

A pluggable AI layer means switching LLM providers is a one-line config change — no application code touched.

## 🚀 Local setup

**Backend**
```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # then fill in values
alembic upgrade head
uvicorn app.main:app --reload
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. Requires a local PostgreSQL and (for dev AI) [Ollama](https://ollama.com).

## ☁️ Deployment

See [DEPLOY.md](DEPLOY.md) — a step-by-step guide for shipping to Vercel + Render + Neon + Groq, all on free tiers.

## 📁 Structure

```
Code2Py/
├── backend/    # FastAPI app, SQLAlchemy models, Alembic migrations
├── frontend/   # React + Vite + TypeScript app
├── render.yaml # Render blueprint (backend)
└── DEPLOY.md   # deployment guide
```

## 👤 Author

**Akshay Kumar Bucha**

---

*Built with FastAPI, React, and a local Llama-family model.*
# Code2Py
