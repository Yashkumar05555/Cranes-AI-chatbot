import React from 'react';
import { 
  Layers, 
  Database, 
  Bot, 
  Cpu, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  FileText, 
  Workflow, 
  Key, 
  Server, 
  Zap, 
  Share2 
} from 'lucide-react';
import { LEARNING_MODES } from '../data/learningModes';

export const ArchitectureViewer: React.FC = () => {
  return (
    <div className="flex-1 bg-slate-100 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Banner Header */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Workflow className="w-4 h-4" />
            <span>CDA AI Chatbot Specification • Phase 1 MVP (Extensible)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-100 mb-3">
            Cranes Varsity AI Architecture & Workflow
          </h1>
          <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
            Directly realizing the 4-layer architecture, dual workflows (Online RAG Retrieval and Offline Document Ingestion), 
            and 6 Learning Assistant Modes defined in the specification.
          </p>
        </div>

        {/* 4 Layers Breakdown */}
        <div className="space-y-4">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>The 4 System Layers</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Layer 1: Presentation */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full pointer-events-none" />
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 mb-2">
                <span className="px-2 py-0.5 rounded bg-blue-100 font-mono text-[10px]">LAYER 1</span>
                <span>PRESENTATION TIER</span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-2">
                React 18+ & TypeScript + Tailwind CSS
              </h3>
              <ul className="text-xs text-slate-600 space-y-1.5">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span><strong>Student Chat Interface:</strong> Multi-turn conversations, code formatting, citations</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span><strong>Course Selector:</strong> Dynamic dropdown mapping to active RAG context</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span><strong>Admin Dashboard:</strong> PDF knowledge upload, chunk inspection, status badges</span>
                </li>
              </ul>
            </div>

            {/* Layer 2: API Tier */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-bl-full pointer-events-none" />
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 mb-2">
                <span className="px-2 py-0.5 rounded bg-indigo-100 font-mono text-[10px]">LAYER 2</span>
                <span>API TIER</span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-2">
                Express / FastAPI REST Endpoints (/api/v1/*)
              </h3>
              <ul className="text-xs text-slate-600 space-y-1.5">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span><code>POST /api/v1/chat</code>: Message dispatch + RAG retrieval + LLM synthesis</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span><code>CRUD /api/v1/conversations</code>: Session tracking & persistence</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span><code>GET /api/v1/courses</code>: Cranes Varsity course catalog</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span><code>/api/v1/admin/documents</code>: PDF ingestion & status tracking</span>
                </li>
              </ul>
            </div>

            {/* Layer 3: Intelligence Tier */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full pointer-events-none" />
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600 mb-2">
                <span className="px-2 py-0.5 rounded bg-amber-100 font-mono text-[10px]">LAYER 3</span>
                <span>INTELLIGENCE TIER</span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-2">
                AI Service Factory & Provider Adapter
              </h3>
              <ul className="text-xs text-slate-600 space-y-1.5">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span><strong>LLM Service:</strong> Gemini 3.8 Flash (Server-Side @google/genai)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span><strong>RAG Pipeline:</strong> Top-K=5 retrieval, course_id metadata filter</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span><strong>Embedding Engine:</strong> Chunking (1,000 size / 200 overlap)</span>
                </li>
              </ul>
            </div>

            {/* Layer 4: Data Tier */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full pointer-events-none" />
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-2">
                <span className="px-2 py-0.5 rounded bg-emerald-100 font-mono text-[10px]">LAYER 4</span>
                <span>DATA TIER</span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-2">
                Vector Storage & Relational Schemas
              </h3>
              <ul className="text-xs text-slate-600 space-y-1.5">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span><strong>Vector Database:</strong> Qdrant / pgvector semantic embeddings</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span><strong>Document Storage:</strong> Prospectus, syllabus PDFs, lab manuals</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span><strong>Structured State:</strong> Conversations, messages, courses</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* The 6 Learning Assistant Modes */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              The 6 Learning Assistant Modes (Page 11 Specification)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {LEARNING_MODES.map((m, i) => (
              <div key={m.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-800 mb-1">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">
                    {i + 1}
                  </span>
                  <span>{m.label}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-normal">
                  {m.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Dual Workflows Diagrammatic Flow */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Workflow className="w-4 h-4 text-blue-600" />
              <span>Phase 1 Workflows in Action</span>
            </h2>
          </div>

          {/* Workflow 1: Online Retrieval */}
          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-blue-900">
                1. Chat Workflow (Online Retrieval & Generation)
              </span>
              <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                Sub-2s Latency Target
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 bg-white rounded-lg border border-blue-100">
                <div className="text-[10px] text-slate-400 font-bold">STEP 1</div>
                <div className="font-semibold text-slate-800">Student Query</div>
                <div className="text-[10px] text-slate-500">POST /api/v1/chat</div>
              </div>
              <div className="p-2 bg-white rounded-lg border border-blue-100">
                <div className="text-[10px] text-slate-400 font-bold">STEP 2</div>
                <div className="font-semibold text-slate-800">Vector Search</div>
                <div className="text-[10px] text-slate-500">Top-K=5 + Course Filter</div>
              </div>
              <div className="p-2 bg-white rounded-lg border border-blue-100">
                <div className="text-[10px] text-slate-400 font-bold">STEP 3</div>
                <div className="font-semibold text-slate-800">RAG Prompt</div>
                <div className="text-[10px] text-slate-500">Chunks + 6-Mode Directive</div>
              </div>
              <div className="p-2 bg-white rounded-lg border border-blue-100">
                <div className="text-[10px] text-slate-400 font-bold">STEP 4</div>
                <div className="font-semibold text-slate-800">LLM Response</div>
                <div className="text-[10px] text-slate-500">Grounded Answer + Citations</div>
              </div>
            </div>
          </div>

          {/* Workflow 2: Ingestion */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-800">
                2. Ingestion Workflow (Offline Admin Upload)
              </span>
              <span className="text-[10px] font-semibold text-slate-600 bg-slate-200 px-2 py-0.5 rounded">
                CHUNK_SIZE=1000 • OVERLAP=200
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-400 font-bold">STEP 1</div>
                <div className="font-semibold text-slate-800">Admin Upload</div>
                <div className="text-[10px] text-slate-500">PDF + Course Mapping</div>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-400 font-bold">STEP 2</div>
                <div className="font-semibold text-slate-800">Text Chunking</div>
                <div className="text-[10px] text-slate-500">Sliding Window Split</div>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-400 font-bold">STEP 3</div>
                <div className="font-semibold text-slate-800">Embedding</div>
                <div className="text-[10px] text-slate-500">Batch Vector Encoding</div>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-400 font-bold">STEP 4</div>
                <div className="font-semibold text-slate-800">Mark Indexed</div>
                <div className="text-[10px] text-slate-500">Ready for Live Query</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
