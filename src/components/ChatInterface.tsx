import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { 
  Send, 
  Sparkles, 
  BookOpen, 
  Code2, 
  ListFilter, 
  Cpu, 
  HelpCircle, 
  Bot, 
  User, 
  Copy, 
  Check, 
  FileText, 
  RefreshCw, 
  ChevronRight,
  Info,
  Award,
  Zap,
  GraduationCap,
  ExternalLink
} from 'lucide-react';
import { ChatMessage, Course, LearningMode, RAGSource } from '../types';
import { LEARNING_MODES } from '../data/learningModes';
import { SourceCitationModal } from './SourceCitationModal';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (text: string, mode: LearningMode) => void;
  selectedCourse: Course;
  currentMode: LearningMode;
  onSelectMode: (mode: LearningMode) => void;
  onSelectCourse: (courseId: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isLoading,
  onSendMessage,
  selectedCourse,
  currentMode,
  onSelectMode,
}) => {
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeSources, setActiveSources] = useState<RAGSource[] | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of messages only within messages container
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Adjust textarea height dynamically
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim(), currentMode);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getModeIcon = (modeId: LearningMode) => {
    switch (modeId) {
      case 'explain_simply': return <Sparkles className="w-3.5 h-3.5 text-amber-500" />;
      case 'explain_detail': return <BookOpen className="w-3.5 h-3.5 text-blue-500" />;
      case 'give_example': return <Code2 className="w-3.5 h-3.5 text-emerald-500" />;
      case 'summarize': return <ListFilter className="w-3.5 h-3.5 text-purple-500" />;
      case 'practical_app': return <Cpu className="w-3.5 h-3.5 text-rose-500" />;
      case 'quiz_me': return <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />;
      default: return <Sparkles className="w-3.5 h-3.5" />;
    }
  };

  const activeModeMeta = LEARNING_MODES.find(m => m.id === currentMode) || LEARNING_MODES[0];

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden bg-slate-100">
      {/* 1. FIXED TOP HEADING & MODE BAR (Never moves or scrolls) */}
      <div className="bg-white border-b border-slate-200/90 px-4 sm:px-6 py-2.5 shadow-xs shrink-0 z-10 select-none">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          {/* Active Course Label */}
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
            </span>
            <div className="flex items-center gap-2 truncate">
              <span className="text-xs font-bold text-slate-900 tracking-tight truncate">
                {selectedCourse.title}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                {selectedCourse.code}
              </span>
            </div>
          </div>

          {/* 6 Learning Modes Pill Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 md:pb-0 scrollbar-none">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden lg:inline">
              Mode:
            </span>
            {LEARNING_MODES.map(mode => {
              const isActive = mode.id === currentMode;
              return (
                <button
                  key={mode.id}
                  id={`learning-mode-btn-${mode.id}`}
                  onClick={() => onSelectMode(mode.id)}
                  title={mode.description}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs ring-1 ring-slate-800 scale-102'
                      : 'bg-slate-100/90 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {getModeIcon(mode.id)}
                  <span>{mode.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Mode Description */}
        <div className="max-w-5xl mx-auto mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5 truncate">
            <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="font-bold text-slate-700 shrink-0">{activeModeMeta.label}:</span>
            <span className="truncate text-slate-600">{activeModeMeta.description}</span>
          </div>
          <span className="hidden sm:inline text-slate-400 text-[10px] shrink-0 ml-2">
            Switch modes anytime to adapt explanation depth
          </span>
        </div>
      </div>

      {/* 2. MESSAGES CONTAINER (The ONLY scrollable container) */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 overscroll-contain">
        <div className="max-w-4xl mx-auto space-y-5 pb-2">
          {messages.length === 0 ? (
            /* Compact, high-craft Welcome State */
            <div className="space-y-4">
              {/* Institute Greeting Card */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                      Cranes Varsity Technical Learning & Advisory Portal
                    </h2>
                    <p className="text-[11px] text-slate-500 font-medium">
                      28+ Years of Technical Excellence • Estd 1996, Bengaluru • 50,000+ Alumni
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mt-2">
                  Ask any question regarding syllabus, lab modules, placement assistance, or hardware kits for <strong>{selectedCourse.title}</strong>. 
                  Our assistant is grounded in verified curriculum documentation.
                </p>

                {/* Compact Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-100 text-[11px]">
                  <div className="px-2.5 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-900 block text-xs">50,000+</span>
                    <span className="text-slate-500 text-[10px]">Trained Engineers</span>
                  </div>
                  <div className="px-2.5 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-bold text-blue-600 block text-xs">2,000+</span>
                    <span className="text-slate-500 text-[10px]">Recruiting Partners</span>
                  </div>
                  <div className="px-2.5 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-bold text-emerald-600 block text-xs">100%</span>
                    <span className="text-slate-500 text-[10px]">Placement Support</span>
                  </div>
                  <div className="px-2.5 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-bold text-amber-600 block text-xs">2 Campuses</span>
                    <span className="text-slate-500 text-[10px]">Rajajinagar & Jayanagar</span>
                  </div>
                </div>
              </div>

              {/* Instant Prompt Recommendations for Selected Course */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Recommended Questions • {selectedCourse.title}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedCourse.sampleQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSendMessage(q, currentMode)}
                      className="text-left p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 text-xs text-slate-700 hover:text-blue-900 transition-all flex items-center justify-between group cursor-pointer shadow-2xs"
                    >
                      <span className="font-medium pr-2 truncate">{q}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Messages List */
            messages.map(msg => {
              const isAssistant = msg.role === 'assistant';
              const modeMeta = msg.mode ? LEARNING_MODES.find(m => m.id === msg.mode) : null;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isAssistant ? 'items-start' : 'items-start flex-row-reverse'}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                      isAssistant
                        ? 'bg-blue-600 text-white ring-2 ring-blue-100'
                        : 'bg-slate-800 text-white'
                    }`}
                  >
                    {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble */}
                  <div className={`max-w-[88%] sm:max-w-[82%] flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}>
                    {/* Role & Mode Badge */}
                    <div className="flex items-center gap-2 mb-1 px-1 text-[11px] text-slate-500">
                      <span className="font-bold text-slate-700">
                        {isAssistant ? 'Cranes Varsity AI' : 'You'}
                      </span>
                      {modeMeta && isAssistant && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-[10px] flex items-center gap-1">
                          {getModeIcon(modeMeta.id)}
                          {modeMeta.shortLabel}
                        </span>
                      )}
                      <span className="text-slate-400">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div
                      className={`p-4 sm:p-5 rounded-2xl text-sm leading-relaxed shadow-xs ${
                        isAssistant
                          ? 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs shadow-blue-500/10'
                      }`}
                    >
                      {isAssistant ? (
                        <div className="markdown-body">
                          <Markdown>{msg.content}</Markdown>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                      )}

                      {/* RAG Source Citations Box */}
                      {isAssistant && msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3.5 pt-3 border-t border-slate-100">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                              <FileText className="w-3.5 h-3.5 text-blue-600" />
                              <span>Grounded in {msg.sources.length} Syllabus Citations</span>
                            </div>
                            <button
                              onClick={() => setActiveSources(msg.sources!)}
                              className="text-xs text-blue-600 hover:text-blue-800 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <span>View Details</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Quick pills of top sources */}
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {msg.sources.slice(0, 3).map((src, i) => (
                              <button
                                key={src.id || i}
                                onClick={() => setActiveSources(msg.sources!)}
                                className="px-2 py-0.5 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 rounded-md text-[11px] text-slate-600 flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <span className="font-semibold text-slate-800 truncate max-w-[170px]">
                                  {src.docName}
                                </span>
                                <span className="text-slate-400">p.{src.page}</span>
                                <span className="text-emerald-700 font-bold bg-emerald-50 px-1 rounded">
                                  {Math.round(src.similarity * 100)}%
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {isAssistant && (
                      <div className="flex items-center gap-2 mt-1 px-1 text-xs text-slate-400">
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-slate-200/70 text-slate-500 font-medium transition-colors cursor-pointer"
                          title="Copy response"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-600 font-semibold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 text-slate-700 text-xs shadow-xs rounded-tl-xs flex items-center gap-2.5">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                <span>Searching Cranes Varsity syllabus & generating {activeModeMeta.label}...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 3. FIXED SEARCH / INPUT BOX AREA (Permanently visible at bottom, never pushed down) */}
      <div className="bg-white border-t border-slate-200/90 p-3 sm:p-4 shrink-0 shadow-lg z-20 select-none">
        <div className="max-w-4xl mx-auto">
          <form 
            onSubmit={handleSubmit} 
            className="relative flex flex-col bg-slate-50 rounded-2xl border border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all p-2 sm:p-2.5"
          >
            <textarea
              ref={textareaRef}
              id="chat-search-input"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={`Ask Cranes Varsity AI about ${selectedCourse.title}, syllabus, RTOS labs, placements...`}
              rows={1}
              className="w-full bg-transparent px-2 py-1 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden resize-none max-h-36 min-h-[38px] leading-relaxed"
            />

            <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60 mt-1">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="text-[11px] font-bold text-slate-800 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                  {activeModeMeta.label}
                </span>
                <span className="hidden sm:inline text-[11px] text-slate-400">
                  Enter to send • Shift+Enter for newline
                </span>
              </div>

              <button
                type="submit"
                id="chat-send-btn"
                disabled={!input.trim() || isLoading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all active:scale-95 cursor-pointer"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Send Query</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="text-[10px] sm:text-[11px] text-center text-slate-400 mt-2 flex items-center justify-center gap-2">
            <span>Cranes Varsity Technical Learning Portal</span>
            <span>•</span>
            <span>Estd 1996, Bengaluru</span>
            <span>•</span>
            <a 
              href="https://cranesvarsity.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:underline flex items-center gap-0.5"
            >
              cranesvarsity.com
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </p>
        </div>
      </div>

      {/* Source Citation Modal */}
      {activeSources && (
        <SourceCitationModal
          sources={activeSources}
          isOpen={Boolean(activeSources)}
          onClose={() => setActiveSources(null)}
        />
      )}
    </div>
  );
};
