import logging
from typing import List, Dict, Optional

from app.ai.interface import AIService
from app.ai.providers.gemini import GeminiProvider
from app.ai.providers.openai import OpenAIProvider
from app.core.config import get_settings

logger = logging.getLogger(__name__)


class MockAIService(AIService):
    """Fallback when no API keys configured - uses curated RAG-like response generation."""

    def get_provider_name(self) -> str:
        return "mock"

    async def generate(
        self,
        message: str,
        system_instruction: str,
        history: Optional[List[Dict[str, str]]] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048,
        model: Optional[str] = None,
    ) -> str:
        # Extract mode from system instruction if present
        # For mock, we generate based on retrieved context that should already be in system_instruction
        # We attempt to produce a mode-aware response
        lower_msg = message.lower()
        # Simple mode detection from system_instruction
        mode = "explain_simply"
        if "EXPLAIN IN DETAIL" in system_instruction:
            mode = "explain_detail"
        elif "GIVE EXAMPLE" in system_instruction:
            mode = "give_example"
        elif "SUMMARIZE" in system_instruction:
            mode = "summarize"
        elif "PRACTICAL APPLICATION" in system_instruction:
            mode = "practical_app"
        elif "QUIZ ME" in system_instruction:
            mode = "quiz_me"

        # Try to extract RAG context section
        rag_marker = "OFFICIAL CRANES VARSITY KNOWLEDGE"
        rag_section = ""
        if rag_marker in system_instruction:
            rag_section = system_instruction.split(rag_marker, 1)[1].split("INSTRUCTIONS", 1)[0]
            rag_section = rag_section.strip()[:2000]

        if not rag_section:
            rag_section = "Cranes Varsity (Estd. 1996, Bengaluru) - Embedded, VLSI, Automotive & IoT programs. 28+ years, 50k+ alumni, 2000+ hiring partners."

        institute = "\n\n---\n**Cranes Varsity Factsheet:** Rajajinagar & Jayanagar campuses | 100% placement support | Labs: STM32, Xilinx FPGA, CANoe"

        if mode == "explain_simply":
            return f"### Cranes Varsity Learning Assistant (Simple Explanation)\n\nHere is a beginner-friendly overview based on Cranes Varsity's documentation:\n\n{rag_section}\n\n**Key Takeaways:**\n- Start with C pointers, digital electronics fundamentals\n- 70% hands-on labs with real hardware kits\n- Paths: Embedded, VLSI, Automotive ECU, IoT" + institute
        elif mode == "explain_detail":
            return f"### Technical Deep-Dive: Comprehensive Engineering Breakdown\n\n{rag_section}\n\n#### Architectural Considerations:\n1. **Hardware & Registers:** MMIO, ISR latency, RCC clock tree\n2. **Protocols & State Machines:** Timing constraints, arbitration, serialization\n3. **Quality Standards:** MISRA-C, ISO 26262 ASIL, UVM ASVs" + institute
        elif mode == "give_example":
            return f"### Concrete Engineering Example\n\n```c\n/* Cranes Lab - Register Access */\n#include <stdint.h>\n#define PERIPH_BASE 0x40021000UL\n#define REG_CR1 (*(volatile uint32_t*)(PERIPH_BASE+0x00))\nvoid Device_Init(void){{\n    REG_CR1 |= (1<<0);\n    while(!(REG_CR1 & (1<<1))); // poll ready\n}}\n```\n\n{rag_section}" + institute
        elif mode == "summarize":
            return f"### High-Yield Summary\n- **Alignment:** Qualcomm, Bosch, Intel hiring standards\n- **Pillars:** Register control, RTOS scheduling, HW-SW co-design\n\n{rag_section}" + institute
        elif mode == "practical_app":
            return f"### Industrial Applications\n1. **Automotive ECUs:** AUTOSAR stacks, ADAS controllers\n2. **Silicon Validation:** Pre-silicon SoC testing\n3. **IIoT:** Edge telemetry over CAN/MQTT\n\n{rag_section}" + institute
        elif mode == "quiz_me":
            return (
                "### Technical Assessment Quiz\n\n"
                "**Q1:** What prevents priority inversion in FreeRTOS?\nA) Round-robin B) Priority inheritance C) Larger stack D) Disable SysTick\n"
                "**Q2:** Why use 'volatile' for hardware registers?\nA) Flash allocation B) Heap C) Prevent compiler optimization D) FP accel\n\n"
                "---\n**Answers:** Q1=B (inherits priority), Q2=C (force bus access)\n\n" + rag_section + institute
            )
        return rag_section + institute


def get_ai_service() -> AIService:
    settings = get_settings()
    provider = (settings.llm_provider or "mock").lower()
    if provider == "gemini" and settings.gemini_api_key:
        return GeminiProvider()
    if provider == "openai" and settings.openai_api_key:
        return OpenAIProvider()
    # Auto-detect if keys present
    if settings.gemini_api_key:
        return GeminiProvider()
    if settings.openai_api_key:
        return OpenAIProvider()
    return MockAIService()
