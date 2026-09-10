import React, { useState, useEffect } from 'react';
import { 
  FolderArchive, 
  UploadCloud, 
  RefreshCw, 
  Trash2, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Eye, 
  Search, 
  Cpu, 
  Plus, 
  Database, 
  Layers,
  Sparkles,
  Sliders,
  Check
} from 'lucide-react';
import { AdminDocument, Course, RAGSource } from '../types';

interface AdminDashboardProps {
  courses: Course[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ courses }) => {
  const [documents, setDocuments] = useState<AdminDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // New document form state
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('embedded_systems');
  const [docDescription, setDocDescription] = useState('');
  const [docContent, setDocContent] = useState('');
  const [fileName, setFileName] = useState('');

  // Chunk Inspector Modal
  const [inspectingDoc, setInspectingDoc] = useState<AdminDocument | null>(null);

  // Search Test Simulation
  const [testQuery, setTestQuery] = useState('');
  const [testCourseFilter, setTestCourseFilter] = useState('all');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [testingSearch, setTestingSearch] = useState(false);

  // Load documents
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/documents');
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error('Failed to load documents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docContent.trim()) return;

    try {
      setUploading(true);
      const res = await fetch('/api/v1/admin/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: docTitle,
          courseId: selectedCourseId,
          fileName: fileName || `${docTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`,
          rawText: docContent,
          description: docDescription
        })
      });

      if (res.ok) {
        setDocTitle('');
        setDocContent('');
        setDocDescription('');
        setFileName('');
        setShowUploadForm(false);
        await fetchDocuments();
      }
    } catch (err) {
      console.error('Failed to upload document', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!window.confirm('Remove this document and its embeddings from the RAG knowledge base?')) return;
    try {
      const res = await fetch(`/api/v1/admin/documents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDocuments(prev => prev.filter(d => d.id !== id));
      }
    } catch (err) {
      console.error('Delete error', err);
    }
  };

  const handleReindex = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/admin/documents/${id}/reindex`, { method: 'POST' });
      if (res.ok) {
        await fetchDocuments();
      }
    } catch (err) {
      console.error('Reindex error', err);
    }
  };

  const handleTestSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testQuery.trim()) return;
    try {
      setTestingSearch(true);
      const res = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: testQuery,
          courseId: testCourseFilter,
          mode: 'explain_detail'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setTestResults(data.sources || []);
      }
    } catch (err) {
      console.error('Search test error', err);
    } finally {
      setTestingSearch(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-100 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                <Database className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Admin Knowledge Base & RAG Ingestion Pipeline
              </h1>
            </div>
            <p className="text-xs text-slate-500 max-w-2xl">
              Phase 1 Offline Ingestion Workflow: Admin uploads course PDFs & brochures → Automated Text Chunking (CHUNK_SIZE=1000, OVERLAP=200) → Vector Embedding → Qdrant/pgvector Store.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{showUploadForm ? 'Cancel Upload' : 'Ingest New Document'}</span>
            </button>
            <button
              onClick={fetchDocuments}
              className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-xs transition-colors"
              title="Refresh repository"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Ingestion Upload Form Modal/Card */}
        {showUploadForm && (
          <form onSubmit={handleCreateDocument} className="bg-white rounded-2xl p-6 border-2 border-blue-400 shadow-lg space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-blue-600" />
                <span>Upload & Chunk Knowledge Base Document</span>
              </h3>
              <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                Auto-Chunking Enabled (1000 chars / 200 overlap)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  value={docTitle}
                  onChange={e => setDocTitle(e.target.value)}
                  placeholder="e.g. FreeRTOS Kernel Porting Guide on STM32F4"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Course Mapping *
                </label>
                <select
                  value={selectedCourseId}
                  onChange={e => setSelectedCourseId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  File Name / PDF Reference
                </label>
                <input
                  type="text"
                  value={fileName}
                  onChange={e => setFileName(e.target.value)}
                  placeholder="e.g. STM32_FreeRTOS_Lab_Guide.pdf"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Document Description
                </label>
                <input
                  type="text"
                  value={docDescription}
                  onChange={e => setDocDescription(e.target.value)}
                  placeholder="Brief summary of document topics"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Document Text Content (Simulated PDF Parser Extractor) *
              </label>
              <textarea
                required
                rows={6}
                value={docContent}
                onChange={e => setDocContent(e.target.value)}
                placeholder="Paste the syllabus, technical notes, or reference guide text here. The pipeline will automatically split into overlapping chunks, compute embeddings, and store in vector database..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 font-mono focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                className="px-4 py-2 border border-slate-300 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Chunking & Embedding...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Parse, Chunk & Index PDF</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Knowledge Documents Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Current Knowledge Corpus ({documents.length} Documents)</span>
            </h3>
            <span className="text-xs text-slate-500">
              Auto-mapped to Course IDs for targeted RAG retrieval
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3">Document Title & File</th>
                  <th className="px-4 py-3">Target Course</th>
                  <th className="px-4 py-3">Pages / Size</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Chunks</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map(doc => {
                  const course = courses.find(c => c.id === doc.courseId);
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="font-semibold text-slate-900">{doc.title}</div>
                        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                          <span>{doc.fileName}</span>
                          <span>•</span>
                          <span>Uploaded {doc.uploadDate}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          {course ? course.code : doc.courseId}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-slate-500">
                        <div>{doc.pages} pages</div>
                        <div className="text-[10px] text-slate-400">{doc.fileSize}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Indexed</span>
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {Math.max(1, Math.ceil(doc.pages * 1.5))} chunks
                        </span>
                      </td>

                      <td className="px-6 py-3.5 text-right space-x-2">
                        <button
                          onClick={() => setInspectingDoc(doc)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                          title="Inspect chunk breakdown"
                        >
                          Chunks
                        </button>
                        <button
                          onClick={() => handleReindex(doc.id)}
                          className="p-1 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded transition-colors"
                          title="Trigger re-index"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Remove document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section: Live RAG Retrieval Tester Playground */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Search className="w-4 h-4 text-indigo-600" />
                <span>RAG Semantic Retrieval Tester</span>
              </h3>
              <p className="text-xs text-slate-500">
                Test the vector search ranking and retrieve Top-K chunks across Cranes Varsity documents.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
              Top-K = 5 Chunks
            </span>
          </div>

          <form onSubmit={handleTestSearch} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={testQuery}
              onChange={e => setTestQuery(e.target.value)}
              placeholder="Enter test query (e.g., 'FreeRTOS priority inversion', 'AUTOSAR RTE', 'Qualcomm hiring')..."
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500"
            />
            <select
              value={testCourseFilter}
              onChange={e => setTestCourseFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500"
            >
              <option value="all">All Courses (No Filter)</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={testingSearch || !testQuery.trim()}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5"
            >
              {testingSearch ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Test Search</span>
            </button>
          </form>

          {testResults.length > 0 && (
            <div className="mt-4 space-y-3 pt-3 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Retrieved Chunks from Vector Store ({testResults.length} matches):</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {testResults.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 truncate max-w-[200px]">{item.docName}</span>
                      <span className="text-emerald-700 font-bold bg-emerald-100/80 px-2 py-0.5 rounded text-[10px]">
                        {Math.round(item.similarity * 100)}% Match
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Page {item.page} • Chunk #{item.chunkIndex} • {item.courseName}
                    </div>
                    <div className="text-[11px] text-slate-700 font-mono bg-white p-2 rounded border border-slate-200/80">
                      "{item.excerpt}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chunk Breakdown Modal */}
      {inspectingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-100">
                  Chunk Inspection: {inspectingDoc.title}
                </h3>
                <p className="text-xs text-slate-400">
                  {inspectingDoc.fileName} • Chunk Size: 1000 • Overlap: 200
                </p>
              </div>
              <button
                onClick={() => setInspectingDoc(null)}
                className="px-3 py-1 bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs"
              >
                Close
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3 bg-slate-50 flex-1">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
                This document is indexed into the RAG vector space. During queries, embedding vectors match incoming user questions against these chunks.
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                    <span>Chunk #1 (Page 1)</span>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-mono">1,000 chars</span>
                  </div>
                  <div className="text-xs font-mono text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-100 whitespace-pre-wrap">
                    {inspectingDoc.rawText ? inspectingDoc.rawText.substring(0, 750) : inspectingDoc.description}...
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                    <span>Chunk #2 (Page 2)</span>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-mono">1,000 chars</span>
                  </div>
                  <div className="text-xs font-mono text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-100 whitespace-pre-wrap">
                    {inspectingDoc.rawText ? inspectingDoc.rawText.substring(700, 1500) : 'Additional technical syllabus content and hardware experiment details...'}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-white border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setInspectingDoc(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
