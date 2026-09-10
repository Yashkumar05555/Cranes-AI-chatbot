import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { CRANES_COURSES } from './data/courses';
import { Course, Conversation, ChatMessage, LearningMode } from './types';

export default function App() {
  const [courses, setCourses] = useState<Course[]>(CRANES_COURSES);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('general');
  const [currentMode, setCurrentMode] = useState<LearningMode>('explain_simply');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Conversations and active messages
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch initial courses and conversations from backend
  useEffect(() => {
    async function initData() {
      try {
        const [coursesRes, convsRes] = await Promise.all([
          fetch('/api/v1/courses'),
          fetch('/api/v1/conversations')
        ]);

        if (coursesRes.ok) {
          const courseData = await coursesRes.json();
          if (Array.isArray(courseData) && courseData.length > 0) {
            setCourses(courseData);
          }
        }

        if (convsRes.ok) {
          const convsData = await convsRes.json();
          if (Array.isArray(convsData)) {
            setConversations(convsData);
          }
        }
      } catch (err) {
        console.warn('Backend sync failed, using client state:', err);
      }
    }

    initData();
  }, []);

  // Update messages when active conversation changes
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }
    const current = conversations.find(c => c.id === activeConversationId);
    if (current) {
      setMessages(current.messages || []);
      if (current.courseId) setSelectedCourseId(current.courseId);
      if (current.mode) setCurrentMode(current.mode);
    }
  }, [activeConversationId, conversations]);

  const selectedCourse = courses.find(c => c.id === selectedCourseId) || courses[0];

  // Handle Starting a new conversation
  const handleNewConversation = () => {
    setActiveConversationId(null);
    setMessages([]);
  };

  // Select existing conversation
  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
  };

  // Delete conversation
  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/v1/conversations/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Delete error', err);
    }
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(null);
      setMessages([]);
    }
  };

  // Send message
  const handleSendMessage = async (text: string, mode: LearningMode) => {
    const userMessage: ChatMessage = {
      id: 'msg-' + Date.now() + '-u',
      role: 'user',
      content: text,
      timestamp: Date.now(),
      mode,
      courseId: selectedCourseId
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationId: activeConversationId || undefined,
          courseId: selectedCourseId,
          mode,
          history: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || `Server returned status ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: 'msg-' + Date.now() + '-a',
        role: 'assistant',
        content: data.response,
        timestamp: Date.now(),
        mode: data.mode || mode,
        courseId: data.courseId || selectedCourseId,
        sources: data.sources || []
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      // Synchronize conversation record
      const returnedConvId = data.conversationId;
      setActiveConversationId(returnedConvId);

      setConversations(prev => {
        const index = prev.findIndex(c => c.id === returnedConvId);
        const updatedConv: Conversation = {
          id: returnedConvId,
          title: text.slice(0, 36) + (text.length > 36 ? '...' : ''),
          courseId: selectedCourseId,
          mode,
          createdAt: index >= 0 ? prev[index].createdAt : Date.now(),
          updatedAt: Date.now(),
          messages: finalMessages
        };

        if (index >= 0) {
          const cloned = [...prev];
          cloned[index] = updatedConv;
          return cloned.sort((a, b) => b.updatedAt - a.updatedAt);
        } else {
          return [updatedConv, ...prev];
        }
      });
    } catch (error: any) {
      console.error('Chat generation error:', error);
      const errorMessage: ChatMessage = {
        id: 'msg-' + Date.now() + '-err',
        role: 'assistant',
        content: `I encountered an issue processing your query against the knowledge base. Please try asking again or select a different learning mode.\n\n*Error details:* ${error?.message || 'Server connection error'}`,
        timestamp: Date.now(),
        error: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen h-[100dvh] max-h-screen w-full bg-slate-900 flex flex-col overflow-hidden antialiased">
      {/* Fixed Top Application Header (Never scrolls) */}
      <Header
        selectedCourse={selectedCourse}
        courses={courses}
        onSelectCourse={setSelectedCourseId}
        onNewChat={handleNewConversation}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Main Workspace Layout (Strictly 100% height minus header) */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Fixed Left Sidebar (Contains Chat History & Course Filter) */}
        <Sidebar
          courses={courses}
          selectedCourseId={selectedCourseId}
          onSelectCourse={setSelectedCourseId}
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Primary Chat Learning Interface */}
        <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-100">
          <ChatInterface
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            selectedCourse={selectedCourse}
            currentMode={currentMode}
            onSelectMode={setCurrentMode}
            onSelectCourse={setSelectedCourseId}
          />
        </main>
      </div>
    </div>
  );
}
