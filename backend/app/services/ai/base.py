from abc import ABC, abstractmethod
from dataclasses import dataclass, field


def normalize_code(code: str) -> str:
    """Repair code a model returned with escaped newlines.

    Some replies arrive with literal two-character '\\n'/'\\t' sequences instead
    of real line breaks. Only fix when there are NO real newlines at all, so we
    never corrupt a legitimate '\\n' inside a string literal of multi-line code.
    """
    if "\n" not in code and "\\n" in code:
        code = code.replace("\\n", "\n").replace("\\t", "\t")
    return code


@dataclass
class TranslationOutput:
    """The analysis fields an AI provider must produce."""
    python_code: str
    explanation: str
    algorithm: str
    time_complexity: str
    space_complexity: str
    # learning resources
    leetcode_problems: list[str] = field(default_factory=list)  # problem titles
    video_topics: list[str] = field(default_factory=list)       # concept keywords


class AIProvider(ABC):
    """Contract every AI provider must fulfil. Application code depends on
    THIS, never on a concrete provider — so providers are swappable."""

    @abstractmethod
    def translate_code(self, source_language: str, code: str) -> TranslationOutput:
        """Convert C/C++/Java code to Python + educational analysis."""
        ...

    @abstractmethod
    def chat(self, context: str, history: list[dict[str, str]], question: str) -> str:
        """Answer a follow-up question given the analysis context + prior messages."""
        ...
