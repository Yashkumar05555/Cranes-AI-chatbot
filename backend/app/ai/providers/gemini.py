import asyncio
import logging
from typing import List, Dict, Optional

from app.ai.interface import AIService
from app.core.config import get_settings

logger = logging.getLogger(__name__)


class GeminiProvider(AIService):
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        settings = get_settings()
        self.api_key = api_key or settings.gemini_api_key
        self.model_name = model or settings.llm_model or "gemini-2.0-flash"
        self._client = None

    def get_provider_name(self) -> str:
        return "gemini"

    def _get_client(self):
        if not self.api_key:
            return None
        if self._client is None:
            try:
                from google import genai
                self._client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini client: {e}")
                return None
        return self._client

    async def generate(
        self,
        message: str,
        system_instruction: str,
        history: Optional[List[Dict[str, str]]] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048,
        model: Optional[str] = None,
    ) -> str:
        client = self._get_client()
        if client is None:
            raise RuntimeError("Gemini API key not configured")

        target_model = model or self.model_name
        # Build contents with strictly alternating roles
        contents = []
        if history:
            clean = []
            # Sanitize last 6, remove duplicates
            filtered = [h for h in history if h.get("content") and h["content"].strip()]
            # Remove last if duplicate of current message
            if filtered and filtered[-1].get("content", "").strip() == message.strip() and filtered[-1].get("role") == "user":
                filtered = filtered[:-1]
            filtered = filtered[-6:]
            last_role = None
            for item in filtered:
                role = "model" if item.get("role") == "assistant" else "user"
                if role != last_role:
                    clean.append({"role": role, "parts": [{"text": item["content"].strip()}]})
                    last_role = role
            # Ensure next message can be user
            if clean and clean[-1]["role"] == "user":
                clean.pop()
            contents.extend(clean)

        contents.append({"role": "user", "parts": [{"text": message}]})

        # Try with timeout and fallback models
        models_to_try = [target_model, "gemini-2.0-flash", "gemini-flash-latest", "gemini-1.5-flash"]
        # Deduplicate
        seen = set()
        models_to_try = [m for m in models_to_try if not (m in seen or seen.add(m))]

        for m in models_to_try:
            try:
                # google-genai sync call -> run in executor
                def _call():
                    return client.models.generate_content(
                        model=m,
                        contents=contents,
                        config={
                            "system_instruction": system_instruction,
                            "temperature": temperature,
                            "max_output_tokens": max_tokens,
                        },
                    )

                response = await asyncio.wait_for(asyncio.to_thread(_call), timeout=15)
                if response and getattr(response, "text", None):
                    return response.text
            except asyncio.TimeoutError:
                logger.warning(f"Gemini timeout for model {m}")
                continue
            except Exception as e:
                logger.warning(f"Gemini call failed for model {m}: {e}")
                # Check for retryable errors
                err_str = str(e).lower()
                if "429" in err_str or "503" in err_str or "quota" in err_str or "overload" in err_str:
                    continue
                # For non-retryable, try next model anyway
                continue

        raise RuntimeError("All Gemini model attempts failed")
