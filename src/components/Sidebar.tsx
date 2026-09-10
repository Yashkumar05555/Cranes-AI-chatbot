import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Search, 
  MessageSquare, 
  BookOpen, 
  Building2, 
  CheckCircle2, 
  MapPin, 
  Cpu, 
  X,
  ChevronDown,
  Layers
} from 'lucide-react';
import { Course, Conversation } from '../types';

interface SidebarProps {
  courses: Course[];
  selectedCourseId: string;
  onSelectCourse: (id: string) => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string, e: React.MouseEvent) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  courses,
  selectedCourseId,
  onSelectCourse,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  isOpen,
  onClose,
}) => {
  const [convSearch, setConvSearch] = useState('');
  const [showCourseList, setShowCourseList] = useState(false);

  const filteredConversations = conversations.filter(c => 
    c.title.toLowerCase().includes(convSearch.toLowerCase())
  );

  const activeCourse = courses.find(c => c.id === selectedCourseId) || courses[0];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-72 sm:w-80 h-full max-h-full bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 overflow-hidden transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Header Close */}
        <div className="lg:hidden p-3.5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="font-bold text-white text-xs flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-400" />
            <span>Chat History & Track Selector</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action: Start New Chat */}
        <div className="p-3 border-b border-slate-800/80 shrink-0">
          <button
            id="sidebar-new-chat-btn"
            onClick={() => {
              onNewConversation();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-900/30 transition-all active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Start New Learning Chat</span>
          </button>
        </div>

        {/* Section 1: Compact Course / Track Selector (Clean accordion instead of double-scrollbar) */}
        <div className="p-3 border-b border-slate-800/80 shrink-0 bg-slate-900/40">
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3 h-3 text-blue-400" />
              Active Course Track
            </span>
            <button
              onClick={() => setShowCourseList(!showCourseList)}
              className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-0.5"
            >
              <span>{showCourseList ? 'Collapse' : 'Switch Track'}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showCourseList ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Current Active Course Card */}
          <div 
            onClick={() => setShowCourseList(!showCourseList)}
            className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/70 hover:border-slate-600 transition-all cursor-pointer flex items-center justify-between gap-2"
          >
            <div className="truncate">
              <div className="text-xs font-bold text-slate-100 truncate">{activeCourse.title}</div>
              <div className="text-[10px] text-slate-400">{activeCourse.code} • {activeCourse.duration}</div>
            </div>
            <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0 shadow-xs shadow-blue-400" />
          </div>

          {/* Expandable Course List */}
          {showCourseList && (
            <div className="mt-2 space-y-1 max-h-48 overflow-y-auto pr-0.5 pt-1 border-t border-slate-800">
              {courses.map(c => {
                const isSelected = c.id === selectedCourseId;
                return (
                  <button
                    key={c.id}
                    id={`sidebar-course-opt-${c.id}`}
                    onClick={() => {
                      onSelectCourse(c.id);
                      setShowCourseList(false);
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    <div className="truncate">
                      <div className="truncate text-[11px] font-medium">{c.title}</div>
                      <div className="text-[9px] text-slate-500">{c.code}</div>
                    </div>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 2: Chat History (Dominant, smoothly scrollable area) */}
        <div className="flex-1 flex flex-col min-h-0 p-3 overflow-hidden">
          <div className="flex items-center justify-between mb-2 px-0.5 shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3 h-3 text-indigo-400" />
              Chat History
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {conversations.length} saved
            </span>
          </div>

          {/* Search box if there are conversations */}
          {conversations.length > 2 && (
            <div className="relative mb-2 shrink-0">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={convSearch}
                onChange={e => setConvSearch(e.target.value)}
                placeholder="Search queries..."
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg pl-8 pr-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
              />
            </div>
          )}

          {/* Conversations list container */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1 min-h-0">
            {conversations.length === 0 ? (
              <div className="py-8 px-2 text-center text-slate-500 text-xs">
                <MessageSquare className="w-6 h-6 mx-auto mb-2 text-slate-600 opacity-60" />
                <p className="font-medium text-slate-400">No chat history yet</p>
                <p className="text-[11px] text-slate-600 mt-1">Your queries will automatically appear here</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="py-6 text-center text-slate-500 text-xs">
                No matching sessions found
              </div>
            ) : (
              filteredConversations.map(conv => {
                const isActive = conv.id === activeConversationId;
                return (
                  <div
                    key={conv.id}
                    id={`conversation-item-${conv.id}`}
                    onClick={() => {
                      onSelectConversation(conv.id);
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`group relative flex items-center justify-between px-2.5 py-2 rounded-xl text-xs cursor-pointer transition-all ${
                      isActive
                        ? 'bg-slate-800 text-white font-medium border border-slate-700 shadow-2xs'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    <div className="truncate pr-4">
                      <div className="truncate text-xs font-semibold text-slate-200">
                        {conv.title}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {new Date(conv.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {conv.messages.length} messages
                      </div>
                    </div>

                    <button
                      id={`delete-conv-btn-${conv.id}`}
                      onClick={e => onDeleteConversation(conv.id, e)}
                      title="Delete conversation"
                      className="opacity-0 group-hover:opacity-100 hover:text-rose-400 text-slate-500 p-1.5 hover:bg-slate-700/50 rounded-md transition-all shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Section 3: Cranes Varsity Institute Credentials (Always pinned at bottom) */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-xs text-slate-400 space-y-2 shrink-0">
          <div className="flex items-center justify-between text-slate-200 font-bold text-[11px]">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Cranes Varsity Factsheet</span>
            </span>
            <span className="text-[10px] text-amber-400 font-mono">1996 - Present</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800/90">
              <span className="text-amber-400 font-black block text-xs">28+ Years</span>
              <span className="text-slate-400 text-[9px]">Technical Training</span>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800/90">
              <span className="text-blue-400 font-black block text-xs">50,000+</span>
              <span className="text-slate-400 text-[9px]">Engineers Placed</span>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800/90">
              <span className="text-emerald-400 font-black block text-xs">2,000+</span>
              <span className="text-slate-400 text-[9px]">Hiring Partners</span>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800/90">
              <span className="text-purple-400 font-black block text-xs">100%</span>
              <span className="text-slate-400 text-[9px]">Placement Track</span>
            </div>
          </div>

          <div className="pt-1 text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-800/80">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              Rajajinagar & Jayanagar, BLR
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
