from datetime import datetime


def contains_help_me(text: str) -> bool:
    """Keyword match for emergency phrase."""
    return bool(text) and "help me" in text.lower()


def build_voice_detect_response(text: str) -> dict[str, str | bool]:
    """Create a simple response payload from transcript text."""
    detected = contains_help_me(text)
    return {
        "detected": detected,
        "message": "Help me detected." if detected else "No emergency keyword detected.",
        "transcript": text,
        "timestamp": datetime.now().isoformat(),
    }