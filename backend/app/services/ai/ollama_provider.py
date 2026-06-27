import json

import ollama

from app.core.config import settings
from app.services.ai.base import AIProvider, TranslationOutput, normalize_code

_TRANSLATE_SYSTEM = (
    "You are an expert computer-science tutor who converts data-structures and "
    "algorithms code from C, C++, or Java into clean, idiomatic Python and "
    "explains it for a student. "
    "python_code must be valid, runnable Python with real newlines and 4-space "
    "indentation (no markdown fences). explanation is a clear step-by-step "
    "walkthrough. algorithm names the algorithm/technique (or 'General logic'). "
    "time_complexity and space_complexity use Big-O notation like 'O(n)'. "
    "leetcode_problems is a list of 3 well-known LeetCode problem TITLES that "
    "practise the same concept (e.g. 'Binary Search', 'Two Sum'). "
    "video_topics is a list of 3 short search phrases a student could type on "
    "YouTube to learn the concept (e.g. 'binary search explained')."
)

# JSON schema for Ollama structured outputs. Far more reliable than format='json'
# (which double-escaped newlines in code strings).
_TRANSLATE_SCHEMA = {
    "type": "object",
    "properties": {
        "python_code": {"type": "string"},
        "explanation": {"type": "string"},
        "algorithm": {"type": "string"},
        "time_complexity": {"type": "string"},
        "space_complexity": {"type": "string"},
        "leetcode_problems": {"type": "array", "items": {"type": "string"}},
        "video_topics": {"type": "array", "items": {"type": "string"}},
    },
    "required": [
        "python_code", "explanation", "algorithm",
        "time_complexity", "space_complexity",
        "leetcode_problems", "video_topics",
    ],
}

_CHAT_SYSTEM = (
    "You are a friendly DSA tutor. Answer the student's question about the code "
    "and its analysis below. Be concise and clear."
)


class OllamaProvider(AIProvider):
    """AIProvider backed by a local Ollama server (zero-cost, offline)."""

    def __init__(self) -> None:
        self._client = ollama.Client(host=settings.ollama_host)
        self._model = settings.ollama_model

    def translate_code(self, source_language: str, code: str) -> TranslationOutput:
        user = f"Convert this {source_language} code to Python:\n\n{code}"
        response = self._client.chat(
            model=self._model,
            messages=[
                {"role": "system", "content": _TRANSLATE_SYSTEM},
                {"role": "user", "content": user},
            ],
            format=_TRANSLATE_SCHEMA,      # structured output — preserves real newlines
            options={"temperature": 0.2},  # low temp = more deterministic
        )
        data = json.loads(response["message"]["content"])
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
            *history,  # prior user/assistant turns replayed for context
            {"role": "user", "content": question},
        ]
        response = self._client.chat(
            model=self._model, messages=messages, options={"temperature": 0.4}
        )
        return response["message"]["content"]
