export type LearningMode = 
  | 'explain_simply'
  | 'explain_detail'
  | 'give_example'
  | 'summarize'
  | 'practical_app'
  | 'quiz_me';

export interface LearningModeMeta {
  id: LearningMode;
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
  systemDirective: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  category: string;
  duration: string;
  description: string;
  highlights: string[];
  keySkills: string[];
  sampleQuestions: string[];
}

export interface RAGSource {
  id: string;
  docName: string;
  courseId: string;
  courseName: string;
  page: number;
  chunkIndex: number;
  excerpt: string;
  similarity: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  mode?: LearningMode;
  courseId?: string;
  sources?: RAGSource[];
  isStreaming?: boolean;
  error?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  courseId: string;
  mode: LearningMode;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

export interface AdminDocument {
  id: string;
  title: string;
  courseId: string;
  fileName: string;
  fileSize: string;
  status: 'indexed' | 'processing' | 'ready' | 'failed';
  chunkCount: number;
  pages: number;
  uploadDate: string;
  description: string;
  previewChunks?: string[];
  rawText?: string;
}

export interface SystemConfig {
  llmModel: string;
  embeddingModel: string;
  vectorDatabase: string;
  database: string;
  temperature: number;
  maxTokens: number;
  topK: number;
  chunkSize: number;
  chunkOverlap: number;
}
