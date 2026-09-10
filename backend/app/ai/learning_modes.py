"""
Learning Assistant - exactly 6 modes as per Phase 1 spec.
Prompt routing - no extra modes.
"""

LEARNING_MODES = {
    "explain_simply": {
        "label": "Explain Simply",
        "directive": "MODE [EXPLAIN SIMPLY]: Provide a crystal-clear, beginner-friendly explanation. Use intuitive everyday analogies, eliminate opaque jargon where possible, and break down the concepts into easily digestible steps.",
    },
    "explain_detail": {
        "label": "Explain in Detail",
        "directive": "MODE [EXPLAIN IN DETAIL]: Provide an exhaustive, technically rigorous engineering breakdown. Detail underlying architectures, hardware/software interfaces, registers, timing constraints, and memory layouts.",
    },
    "give_example": {
        "label": "Give Example",
        "directive": "MODE [GIVE EXAMPLE]: Provide practical, concrete engineering examples. Include formatted C/C++ firmware snippets, Verilog HDL code, protocol packet hex dumps, or circuit schematics where applicable.",
    },
    "summarize": {
        "label": "Summarize",
        "directive": "MODE [SUMMARIZE]: Provide a condensed, high-yield summary. Use clean bullet points, key takeaways, and critical interview/exam points.",
    },
    "practical_app": {
        "label": "Give Practical Application",
        "directive": "MODE [PRACTICAL APPLICATION]: Emphasize real-world industrial use cases. Explain how companies like Bosch, Qualcomm, Texas Instruments, Intel, and Continental deploy this in automotive ECUs, IoT devices, or chip verification.",
    },
    "quiz_me": {
        "label": "Quiz Me",
        "directive": "MODE [QUIZ ME]: Generate 2-3 engaging multiple-choice technical questions with 4 options (A, B, C, D) each. At the end, include a clear collapsible or marked section with the correct answers and in-depth explanations so the learner can test themselves.",
    },
}

VALID_MODES = set(LEARNING_MODES.keys())


def get_mode_directive(mode: str) -> str:
    return LEARNING_MODES.get(mode, LEARNING_MODES["explain_simply"])["directive"]


def validate_mode(mode: str) -> bool:
    return mode in VALID_MODES
