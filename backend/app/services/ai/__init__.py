from app.core.config import settings
from app.services.ai.base import AIProvider, TranslationOutput

__all__ = ["AIProvider", "TranslationOutput", "get_ai_provider"]


def get_ai_provider() -> AIProvider:
    """Return the configured AI provider. The ONLY place that knows which
    concrete provider is active. Providers are imported lazily so a deployment
    only needs the libraries for the provider it actually uses."""
    if settings.ai_provider == "ollama":
        from app.services.ai.ollama_provider import OllamaProvider

        return OllamaProvider()
    if settings.ai_provider == "groq":
        from app.services.ai.groq_provider import GroqProvider

        return GroqProvider()
    raise ValueError(f"Unknown AI provider: {settings.ai_provider!r}")
