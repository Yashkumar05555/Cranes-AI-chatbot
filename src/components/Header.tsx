import React from 'react';
import { 
  GraduationCap, 
  Menu, 
  ChevronDown,
  Cpu,
  Plus,
  ShieldCheck,
  Building2,
  Sparkles
} from 'lucide-react';
import { Course } from '../types';

interface HeaderProps {
  selectedCourse: Course;
  courses: Course[];
  onSelectCourse: (courseId: string) => void;
  onNewChat: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  selectedCourse,
  courses,
  onSelectCourse,
  onNewChat,
  onToggleSidebar,
}) => {
  const [courseDropdownOpen, setCourseDropdownOpen] = React.useState(false);

  return (
    <header className="h-16 shrink-0 z-30 bg-slate-900 border-b border-slate-800/90 text-white shadow-md select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand & Mobile Menu */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-sidebar-toggle-btn"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 flex items-center justify-center text-white shadow-lg shadow-blue-900/30 ring-1 ring-white/10">
              <GraduationCap className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base tracking-wider bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent">
                  CRANES VARSITY
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded">
                  ESTD 1996
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                <span className="text-slate-300">Technical Learning & Career Assistant</span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="text-slate-400 text-[11px] hidden sm:inline">Bengaluru</span>
              </p>
            </div>
          </div>
        </div>

        {/* Center: Course Switcher Selector */}
        <div className="hidden md:flex items-center">
          <div className="relative">
            <button
              id="course-selector-header-btn"
              onClick={() => setCourseDropdownOpen(!courseDropdownOpen)}
              className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-200 shadow-xs transition-all hover:border-slate-600"
            >
              <div className="p-1 rounded-md bg-blue-500/10 text-blue-400">
                <Cpu className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block font-medium">Active Domain Track</span>
                <span className="font-bold text-slate-100 max-w-[210px] truncate block text-xs">
                  {selectedCourse.title}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            {courseDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setCourseDropdownOpen(false)} 
                />
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-84 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3.5 py-2 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Select Engineering Discipline</span>
                    <span className="text-blue-400 font-mono">{courses.length} tracks</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto py-1">
                    {courses.map((course) => (
                      <button
                        key={course.id}
                        id={`header-course-opt-${course.id}`}
                        onClick={() => {
                          onSelectCourse(course.id);
                          setCourseDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between gap-3 hover:bg-slate-800/90 transition-colors ${
                          course.id === selectedCourse.id 
                            ? 'bg-blue-600/15 text-blue-300 font-semibold border-l-2 border-blue-500' 
                            : 'text-slate-300'
                        }`}
                      >
                        <div className="truncate">
                          <div className="truncate font-medium">{course.title}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{course.code} • {course.duration}</div>
                        </div>
                        {course.id === selectedCourse.id && (
                          <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0 shadow-sm shadow-blue-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Actions & Live Grounding Badge */}
        <div className="flex items-center gap-3">
          {/* New Chat Button */}
          <button
            id="header-new-chat-btn"
            onClick={onNewChat}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-900/30 transition-all active:scale-95"
            title="Start a fresh consultation"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Query</span>
          </button>

          {/* Institute Grounding Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-semibold text-[11px]">Institute Knowledge Grounded</span>
          </div>
        </div>
      </div>
    </header>
  );
};
