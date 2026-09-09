import React, { useState, useRef } from 'react';
import {
  AlertTriangle,
  Search,
  Plus,
  FileText,
  TrendingUp,
  Paperclip,
  CheckCircle,
  ChevronRight,
  Loader2,
  X,
} from 'lucide-react';
import { ConstructionProject, Finding } from '../types';

interface HomeAttentionViewProps {
  project: ConstructionProject;
  onSelectFinding: (finding: Finding) => void;
  onOpenUpload: () => void;
  onOpenSiteReport: () => void;
  onAskQuestion: (question: string) => void;
  onDirectFilesUploaded: (files: File[]) => Promise<void>;
  isUploadingFiles: boolean;
  uploadStatusMessage: string;
}

export const HomeAttentionView: React.FC<HomeAttentionViewProps> = ({
  project,
  onSelectFinding,
  onOpenUpload,
  onOpenSiteReport,
  onAskQuestion,
  onDirectFilesUploaded,
  isUploadingFiles,
  uploadStatusMessage,
}) => {
  const [askInput, setAskInput] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Dynamic time greeting
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? 'Good morning.'
      : currentHour < 17
      ? 'Good afternoon.'
      : 'Good evening.';

  const handleAskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (attachedFiles.length > 0) {
      await onDirectFilesUploaded(attachedFiles);
      setAttachedFiles([]);
    }
    if (askInput.trim()) {
      onAskQuestion(askInput.trim());
      setAskInput('');
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await onDirectFilesUploaded(Array.from(e.dataTransfer.files));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const totalReports = project.memory.siteReports?.length || 0;
  const totalDrawings = project.memory.drawings?.length || 0;
  const activeFindings = project.findings.filter((f) => f.status !== 'RESOLVED');

  return (
    <div
      ref={dropZoneRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-200"
    >
      {/* Uploading indicator overlay with #362486 and #00E96E */}
      {isUploadingFiles && (
        <div className="bg-[#362486] text-white p-4 rounded-2xl shadow-lg border border-[#00E96E]/40 flex items-center justify-between animate-pulse">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-5 h-5 text-[#00E96E] animate-spin" />
            <div className="text-xs font-bold text-slate-100">
              {uploadStatusMessage || 'Oju is reading and cross-referencing your documents...'}
            </div>
          </div>
          <span className="text-[11px] font-mono text-[#00E96E] font-bold">
            Ingesting
          </span>
        </div>
      )}

      {/* Hero Ask & Greeting Command Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs text-center space-y-6">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-[#362486] bg-[#362486]/5 px-3.5 py-1.2 rounded-full border border-[#362486]/15 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#00E96E] animate-ping" />
            <span>{greeting}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            What do you need?
          </h1>

          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Oju watches {project.name}. Ask any question or upload project files.
          </p>
        </div>

        {/* Central Search / Ask Box */}
        <form onSubmit={handleAskSubmit} className="max-w-xl mx-auto space-y-2">
          <div className="relative flex items-center bg-slate-50 hover:bg-slate-100/80 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#362486] focus-within:border-[#00E96E] border border-slate-300 rounded-2xl p-1.5 transition shadow-2xs">
            <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />

            <input
              id="input-ask-home"
              type="text"
              value={askInput}
              onChange={(e) => setAskInput(e.target.value)}
              placeholder="Ask Oju anything about this project..."
              className="w-full bg-transparent px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden font-medium"
            />

            {/* Paperclip attachment */}
            <label className="p-2 text-slate-400 hover:text-[#362486] rounded-xl hover:bg-slate-200/50 transition cursor-pointer shrink-0">
              <Paperclip className="w-4 h-4" />
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls,.csv,.docx,.txt"
                onChange={(e) => {
                  if (e.target.files) {
                    setAttachedFiles(Array.from(e.target.files));
                  }
                }}
                className="hidden"
              />
            </label>

            <button
              id="btn-submit-ask-home"
              type="submit"
              disabled={!askInput.trim() && attachedFiles.length === 0}
              className="bg-[#362486] hover:bg-[#2a1a6f] disabled:opacity-40 text-[#00E96E] font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer shrink-0 shadow-2xs"
            >
              Ask
            </button>
          </div>

          {/* Attached files previews */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-1.5 justify-center pt-1">
              {attachedFiles.map((f, i) => (
                <span
                  key={i}
                  className="inline-flex items-center space-x-1 bg-[#e6fcf0] text-[#007a38] border border-[#a3f7c7] px-2.5 py-0.5 rounded-md text-[11px] font-mono"
                >
                  <FileText className="w-3 h-3 text-[#007a38]" />
                  <span className="max-w-[120px] truncate">{f.name}</span>
                  <button
                    type="button"
                    onClick={() => setAttachedFiles((prev) => prev.filter((_, idx) => idx !== i))}
                    className="hover:text-black ml-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </form>

        {/* Primary Action Buttons */}
        <div className="flex items-center justify-center space-x-3 pt-1">
          <button
            id="btn-home-add-files"
            onClick={onOpenUpload}
            className="flex items-center space-x-2 bg-[#362486] hover:bg-[#2a1a6f] text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer shadow-xs ring-1 ring-[#00E96E]/20"
          >
            <Plus className="w-4 h-4 text-[#00E96E]" />
            <span>+ Add files</span>
          </button>

          <button
            id="btn-home-site-report"
            onClick={onOpenSiteReport}
            className="flex items-center space-x-2 bg-white hover:bg-slate-50 text-[#362486] font-bold px-4 py-2 rounded-xl text-xs border border-slate-300 transition cursor-pointer shadow-2xs"
          >
            <TrendingUp className="w-4 h-4 text-[#00E96E]" />
            <span>+ Site report</span>
          </button>
        </div>

        {/* Drag & drop indicator */}
        {isDragOver && (
          <div className="border-2 border-dashed border-[#00E96E] bg-[#e6fcf0] p-4 rounded-xl text-xs font-bold text-[#007a38] animate-bounce">
            Drop your construction files here to have Oju read them
          </div>
        )}
      </div>

      {/* NEEDS YOUR ATTENTION SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Needs Your Attention
            </h2>
            <div className="text-sm font-extrabold text-slate-900">
              {activeFindings.length > 0 ? (
                <span className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#00E96E]" />
                  <span>
                    {activeFindings.length} item{activeFindings.length > 1 ? 's' : ''} need review
                  </span>
                </span>
              ) : (
                <span className="text-[#007a38] flex items-center space-x-1.5">
                  <CheckCircle className="w-4 h-4 text-[#00E96E]" />
                  <span>Everything looks okay</span>
                </span>
              )}
            </div>
          </div>

          <span className="text-xs text-slate-400 font-medium">
            Click any item to investigate evidence
          </span>
        </div>

        {activeFindings.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#e6fcf0] text-[#007a38] flex items-center justify-center mx-auto border border-[#a3f7c7]">
              <CheckCircle className="w-5 h-5 text-[#00E96E]" />
            </div>
            <p className="text-sm font-bold text-slate-800">
              All {project.documents.length} documents reconcile cleanly.
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No quantity discrepancies, payment mismatches, or unapproved variations detected.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {activeFindings.map((finding) => (
              <div
                key={finding.id}
                id={`finding-card-${finding.id}`}
                onClick={() => onSelectFinding(finding)}
                className="p-5 sm:p-6 hover:bg-slate-50 transition cursor-pointer group flex items-start justify-between gap-4"
              >
                <div className="flex items-start space-x-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[#362486]/10 border border-[#362486]/20 text-[#362486] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#362486] group-hover:text-[#00E96E] transition">
                    <AlertTriangle className="w-4 h-4" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#362486] bg-[#362486]/5 px-2 py-0.5 rounded border border-[#362486]/15">
                        {finding.category.replace('_', ' ')}
                      </span>
                      {finding.confidence && (
                        <span className="text-[10px] text-slate-400 font-semibold font-mono">
                          {finding.confidence} confidence
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#362486] transition">
                      {finding.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                      {finding.description}
                    </p>

                    {/* Source documents preview tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {finding.evidence.map((ev, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200"
                        >
                          {ev.sourceDocTitle} (p. {ev.pageNumber})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-xs font-bold text-slate-400 group-hover:text-[#362486] shrink-0 mt-1 transition">
                  <span className="hidden sm:inline">Investigate</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PROJECT SNAPSHOT FOOTER */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="space-y-0.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Project Overview
          </div>
          <div className="font-bold text-[#362486]">
            {project.name}
          </div>
        </div>

        <div className="flex items-center space-x-4 text-slate-600 font-semibold">
          <span>
            <strong className="text-[#362486] font-black">{project.documents.length}</strong> documents
          </span>
          <span>•</span>
          <span>
            <strong className="text-[#362486] font-black">{totalReports}</strong> reports
          </span>
          <span>•</span>
          <span>
            <strong className="text-[#362486] font-black">{totalDrawings}</strong> drawings
          </span>
          <span>•</span>
          <span className="text-slate-400 font-normal">
            Last checked: Today
          </span>
        </div>
      </div>
    </div>
  );
};
