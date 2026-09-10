import logging
from typing import List, Dict, Optional

from app.ai.interface import AIService
from app.core.config import get_settings

logger = logging.getLogger(__name__)


class OpenAIProvider(AIService):
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        settings = get_settings()
        self.api_key = api_key or settings.openai_api_key
        self.model_name = model or settings.llm_model or "gpt-4o-mini"
        self._client = None

    def get_provider_name(self) -> str:
        return "openai"

    def _get_client(self):
        if not self.api_key:
            return None
        if self._client is None:
            try:
                from openai import AsyncOpenAI
                self._client = AsyncOpenAI(api_key=self.api_key)
            except Exception as e:
                logger.warning(f"Failed to init OpenAI client: {e}")
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
            raise RuntimeError("OpenAI API key not configured")

        target_model = model or self.model_name
        messages = [{"role": "system", "content": system_instruction}]
        if history:
            for h in history[-10:]:
                role = h.get("role", "user")
                # Map 'model' -> 'assistant'
                if role == "model":
                    role = "assistant"
                if role not in ("user", "assistant", "system"):
                    role = "user"
                if h.get("content"):
                    messages.append({"role": role, "content": h["content"]})
        messages.append({"role": "user", "content": message})

        response = await client.chat.completions.create(
            model=target_model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content or ""
