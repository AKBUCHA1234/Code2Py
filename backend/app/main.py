from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.routes import auth, chat, notes, translate, translations
from app.core.config import settings
from app.core.rate_limit import limiter

# The single application instance. Everything (routes, middleware, docs)
# attaches to this object. The title/description/version below populate
# the auto-generated docs at /docs.
app = FastAPI(
    title="Code2Py",
    description="Convert C/C++/Java DSA code into Python with educational insights.",
    version="0.1.0",
)

# Register the rate limiter: store it on app.state (slowapi looks for it there)
# and install the handler that turns over-limit requests into a clean 429.
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Allowed frontend origins come from config (CORS_ORIGINS env var in production —
# add your Vercel URL there).
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["system"])
def health_check():
    """Liveness probe — confirms the API process is up and serving."""
    return {"status": "ok"}


# Plug each feature group's router into the app. main.py stays a thin
# wiring file; the actual endpoints live in their own modules.
app.include_router(auth.router)
app.include_router(translate.router)
app.include_router(translations.router)
app.include_router(notes.router)
app.include_router(chat.router)
