import React from 'react';
import { RAGSource } from '../types';
import { FileText, ExternalLink, X, BookOpen, Percent, Layers } from 'lucide-react';

interface SourceCitationModalProps {
  sources: RAGSource[];
  isOpen: boolean;
  onClose: () => void;
}

export const SourceCitationModal: React.FC<SourceCitationModalProps> = ({
  sources,
  isOpen,
  onClose
}) => {
  if (!isOpen || sources.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/30 text-blue-400 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <span>RAG Verified Source Documents</span>
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {sources.length} citations
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Grounding retrieved from Cranes Varsity knowledge base index
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-4 bg-slate-50 flex-1">
          {sources.map((source, index) => (
            <div
              key={source.id || index}
              className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="font-semibold text-xs text-slate-900">
                      {source.docName}
                    </h4>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-slate-400" />
                        Page {source.page}
                      </span>
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3 text-slate-400" />
                        Chunk #{source.chunkIndex}
                      </span>
                      <span className="text-slate-400">
                        {source.courseName}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold shrink-0">
                  <Percent className="w-3 h-3" />
                  <span>{Math.round(source.similarity * 100)}% Match</span>
                </div>
              </div>

              <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-700 leading-relaxed font-mono">
                "{source.excerpt}"
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Retrieved via vector similarity scoring (Top-K = 5)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
