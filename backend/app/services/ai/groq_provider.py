import json

from groq import Groq

from app.core.config import settings
from app.services.ai.base import AIProvider, TranslationOutput, normalize_code

_TRANSLATE_SYSTEM = (
    "You are an expert computer-science tutor who converts data-structures and "
    "algorithms code from C, C++, or Java into clean, idiomatic Python and "
    "explains it for a student. Respond ONLY with a JSON object using exactly "
    "these keys: python_code (valid runnable Python with real newlines and "
    "4-space indentation, no markdown fences), explanation (clear step-by-step "
    "walkthrough), algorithm (the technique used, or 'General logic'), "
    "time_complexity and space_complexity (Big-O like 'O(n)'), "
    "leetcode_problems (array of 3 related LeetCode problem titles), "
    "video_topics (array of 3 short YouTube search phrases)."
)

_CHAT_SYSTEM = (
    "You are a friendly DSA tutor. Answer the student's question about the code "
    "and its analysis below. Be concise and clear."
)


class GroqProvider(AIProvider):
    """AIProvider backed by Groq's free hosted LLMs (OpenAI-compatible).

    Used for public deployment where Ollama can't run. Swappable via config —
    no application code changes (Strategy pattern)."""

    def __init__(self) -> None:
        if not settings.groq_api_key:
            raise RuntimeError("GROQ_API_KEY is not set")
        self._client = Groq(api_key=settings.groq_api_key)
        self._model = settings.groq_model

    def translate_code(self, source_language: str, code: str) -> TranslationOutput:
        resp = self._client.chat.completions.create(
            model=self._model,
            messages=[
                {"role": "system", "content": _TRANSLATE_SYSTEM},
                {"role": "user", "content": f"Convert this {source_language} code to Python:\n\n{code}"},
            ],
            response_format={"type": "json_object"},
            temperature=0.2,
        )
        data = json.loads(resp.choices[0].message.content or "{}")
        return TranslationOutput(
            python_code=normalize_code(data.get("python_code", "")),
            explanation=data.get("explanation", ""),
            algorithm=data.get("algorithm", ""),
            time_complexity=data.get("time_complexity", ""),
            space_complexity=data.get("space_complexity", ""),
            leetcode_problems=[str(x) for x in data.get("leetcode_problems", [])][:5],
            video_topics=[str(x) for x in data.get("video_topics", [])][:5],
        )

    def chat(self, context: str, history: list[dict[str, str]], question: str) -> str:
        messages = [
            {"role": "system", "content": f"{_CHAT_SYSTEM}\n\n{context}"},
            *history,
            {"role": "user", "content": question},
        ]
        resp = self._client.chat.completions.create(
            model=self._model, messages=messages, temperature=0.4,
        )
        return resp.choices[0].message.content or ""
