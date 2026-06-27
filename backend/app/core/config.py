from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """App configuration, loaded from environment / .env file.

    Field names map to env vars case-insensitively (database_url -> DATABASE_URL).
    Defaults are dev-friendly; production overrides them via real env vars.
    """

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "DSA Mentor AI"
    environment: str = "development"

    # Local Postgres (Postgres.app), passwordless, current macOS user.
    database_url: str = "postgresql+psycopg://akshaykumarbucha@localhost:5432/code2py"

    # JWT auth. jwt_secret has NO default on purpose — it must come from .env
    # so a real secret is never baked into source. (Empty string fails loudly.)
    jwt_secret: str = ""
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 24 hours

    # AI provider (swappable abstraction layer). Only the value here changes
    # to switch models/providers; no application code changes.
    # "ollama" for local dev; "groq" for free hosted deployment.
    ai_provider: str = "ollama"
    ollama_host: str = "http://localhost:11434"
    ollama_model: str = "qwen2.5-coder:7b"
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"

    # Comma-separated list of allowed frontend origins for CORS.
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


# Single shared settings instance imported across the app.
settings = Settings()
