import { LearningModeMeta } from '../types';

export const LEARNING_MODES: LearningModeMeta[] = [
  {
    id: 'explain_simply',
    label: 'Explain Simply',
    shortLabel: 'Simple',
    description: 'Simplified explanation suitable for beginners without heavy jargon.',
    icon: 'Sparkles',
    systemDirective: 'Provide a clear, intuitive, and beginner-friendly explanation. Use plain language, accessible analogies, and break down complex engineering concepts into easy-to-digest steps without overwhelming jargon.'
  },
  {
    id: 'explain_detail',
    label: 'Explain in Detail',
    shortLabel: 'Deep Dive',
    description: 'Comprehensive, in-depth engineering breakdown with architecture & mechanisms.',
    icon: 'BookOpen',
    systemDirective: 'Provide an exhaustive, technically rigorous engineering explanation. Detail underlying architectures, hardware/software interfaces, timing diagrams, memory layouts, register-level specifics, and edge cases.'
  },
  {
    id: 'give_example',
    label: 'Give Example',
    shortLabel: 'Examples',
    description: 'Concrete code, circuit, or firmware examples to illustrate concepts.',
    icon: 'Code2',
    systemDirective: 'Illustrate the concept with concrete, practical examples, such as C/C++ embedded code snippets, register configurations, Verilog modules, or state machine flowcharts.'
  },
  {
    id: 'summarize',
    label: 'Summarize',
    shortLabel: 'Summary',
    description: 'Condensed executive summary and key takeaway bullet points.',
    icon: 'ListFilter',
    systemDirective: 'Deliver a concise, high-density summary. Highlight key definitions, core architectural blocks, critical trade-offs, and exam/interview takeaways in clear bullet points.'
  },
  {
    id: 'practical_app',
    label: 'Practical Application',
    shortLabel: 'Real World',
    description: 'Real-world industrial use cases, automotive/medical/aerospace applications.',
    icon: 'Cpu',
    systemDirective: 'Focus on industrial and real-world deployment. Explain how companies (like Bosch, Qualcomm, Texas Instruments, Intel) implement this in automotive ECUs, IoT nodes, avionics, robotics, or consumer hardware.'
  },
  {
    id: 'quiz_me',
    label: 'Quiz Me',
    shortLabel: 'Quiz',
    description: 'Generate interactive multiple-choice & technical assessment questions.',
    icon: 'HelpCircle',
    systemDirective: 'Generate 2-3 engaging technical multiple-choice questions (MCQs) to test understanding of this topic. Clearly number each question (Q1, Q2...), provide 4 distinct options (A, B, C, D), and include a detailed explanation with the correct answer hidden under a "Correct Answer & Explanation" section.'
  }
];
