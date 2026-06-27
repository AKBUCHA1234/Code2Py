# Deploying Code2Py (₹0)

Code2Py is a monorepo: `frontend/` (React/Vite) + `backend/` (FastAPI). Public deploy uses four free services:

| Piece | Service | Why |
|---|---|---|
| Frontend | **Vercel** | static React hosting |
| Backend | **Render** | runs FastAPI (long-running) |
| Database | **Neon** | managed Postgres |
| AI | **Groq** | free hosted LLM (Ollama can't run on free hosts) |

> The app uses a swappable `AIProvider`. Locally it uses **Ollama**; in production set `AI_PROVIDER=groq`. No app code changes.

---

## 1. Push to GitHub

```bash
cd Code2Py
git init
git add .
git commit -m "Code2Py: full-stack DSA mentor"
# confirm no secrets are staged (should print the safe message):
git ls-files | grep -E "\.env$" || echo "✅ no .env committed"
gh repo create code2py --public --source=. --remote=origin --push
```

## 2. Database — Neon

1. Create a project at **neon.tech**, copy the connection string.
2. **Important:** change the scheme from `postgresql://` to **`postgresql+psycopg://`** (our driver).
3. Migrations run automatically on Render deploy (`alembic upgrade head` in the start command).

## 3. AI — Groq

1. Get a free API key at **console.groq.com**.
2. You'll set it as `GROQ_API_KEY` on Render below.

## 4. Backend — Render

1. At **render.com** → New → **Blueprint** → pick your repo (it reads `render.yaml`).
2. Set the secret env vars in the dashboard:
   - `DATABASE_URL` → Neon string (with `+psycopg`)
   - `GROQ_API_KEY` → from Groq
   - `CORS_ORIGINS` → your Vercel URL (add after step 5, e.g. `https://code2py.vercel.app`)
3. Deploy. Note the backend URL, e.g. `https://code2py-api.onrender.com`.

## 5. Frontend — Vercel

1. At **vercel.com** → Add New → Project → import the repo.
2. **Root Directory → `frontend`**.
3. Environment variable: `VITE_API_URL` = your Render backend URL.
4. Deploy → you get `https://code2py.vercel.app`.

## 6. Connect them

- Put the Vercel URL into Render's `CORS_ORIGINS` (redeploy backend).
- Confirm `VITE_API_URL` on Vercel points at the Render URL (redeploy frontend if changed).

Done — visit your Vercel URL. 🎉

---

### Notes
- Render free tier sleeps after inactivity; the first request may take ~30s to wake.
- Local dev is unchanged: `AI_PROVIDER=ollama` in `backend/.env`.
- Never commit `.env` (it's gitignored).
