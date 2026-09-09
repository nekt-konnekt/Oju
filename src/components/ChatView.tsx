import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  ExternalLink,
  Loader2,
  FileText,
  Sparkles,
  Paperclip,
  X,
  ChevronRight,
  Upload,
} from 'lucide-react';
import { ConstructionProject, ChatMessage } from '../types';

interface ChatViewProps {
  project: ConstructionProject;
  messages: ChatMessage[];
  onSendMessage: (query: string, attachedFiles?: File[]) => Promise<void>;
  onOpenDocument: (documentId: string, pageNumber?: number) => void;
  isProcessing: boolean;
  onDirectFilesUploaded?: (files: File[]) => Promise<void>;
}

const SUGGESTED_QUESTIONS = [
  'What does not make sense in this project?',
  'Reconcile reinforcement steel delivery vs tender BOQ',
  'Check concrete strength tests against specifications',
  'Are there any unapproved variation claims?',
  'List all discrepancies in IPC 03',
];

export const ChatView: React.FC<ChatViewProps> = ({
  project,
  messages,
  onSendMessage,
  onOpenDocument,
  isProcessing,
  onDirectFilesUploaded,
}) => {
  const [input, setInput] = useState<string>('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && attachedFiles.length === 0) || isProcessing) return;

    const query = input.trim();
    const filesToSend = [...attachedFiles];
    setInput('');
    setAttachedFiles([]);
    await onSendMessage(query, filesToSend);
  };

  const handleSelectSuggested = (q: string) => {
    if (isProcessing) return;
    onSendMessage(q);
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setAttachedFiles((prev) => [...prev, ...files]);
    }
  };

  const removeAttached = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
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

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      if (onDirectFilesUploaded) {
        await onDirectFilesUploaded(files);
      } else {
        setAttachedFiles((prev) => [...prev, ...files]);
      }
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-[740px] relative transition-all ${
        isDragOver ? 'ring-4 ring-[#00E96E]/20 border-[#00E96E]' : ''
      }`}
    >
      {isDragOver && (
        <div className="absolute inset-0 bg-[#00E96E]/10 backdrop-blur-xs z-20 rounded-xl flex items-center justify-center border-2 border-dashed border-[#00E96E] pointer-events-none">
          <div className="bg-white px-6 py-4 rounded-2xl shadow-xl border border-[#a3f7c7] flex items-center space-x-3 text-[#007a38] font-bold text-sm">
            <Upload className="w-5 h-5 text-[#00E96E] animate-bounce" />
            <span>Drop construction file to attach directly to Oju</span>
          </div>
        </div>
      )}

      {/* Chat Header with #362486 and #00E96E */}
      <div className="p-4 border-b border-[#362486] bg-[#362486] text-white rounded-t-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 ring-1 ring-[#00E96E]/50 flex items-center justify-center text-[#00E96E] font-bold">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold flex items-center space-x-2">
              <span>Ask Oju</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/15 text-[#00E96E] font-semibold uppercase tracking-wider">
                by Agba
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-black/30 text-[#00E96E] font-mono">
                Grounded in Project Memory
              </span>
            </h2>
            <p className="text-[11px] text-slate-300">
              Investigate documents, verify calculations, and inspect discrepancy provenance for {project.name}.
            </p>
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-[10px] font-mono text-slate-300">
            {project.documents.length} Docs Indexed • {project.findings.length} Findings Active
          </span>
        </div>
      </div>

      {/* Suggested Quick Prompts Bar */}
      <div className="bg-slate-50 border-b border-slate-200 p-3 overflow-x-auto scrollbar-none flex items-center space-x-2 text-xs">
        <span className="text-[#362486] font-bold whitespace-nowrap flex items-center space-x-1">
          <Sparkles className="w-3.5 h-3.5 text-[#00E96E]" />
          <span>Quick Investigation:</span>
        </span>
        {SUGGESTED_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectSuggested(q)}
            disabled={isProcessing}
            className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-[#362486] hover:text-[#362486] hover:bg-[#f1effb] whitespace-nowrap transition cursor-pointer text-[11px] font-medium shadow-2xs disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-slate-800 text-white'
                    : 'bg-[#362486] text-[#00E96E] shadow-xs ring-1 ring-[#00E96E]/30'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`space-y-3 max-w-[85%] ${isUser ? 'text-right' : ''}`}>
                <div
                  className={`p-4 rounded-xl text-xs leading-relaxed ${
                    isUser
                      ? 'bg-[#362486] text-white font-medium rounded-tr-none'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none space-y-2'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans text-xs sm:text-[13px] leading-relaxed">
                    {msg.text}
                  </div>
                </div>

                {/* Evidence Citations (For Oju responses) */}
                {!isUser && msg.citations && msg.citations.length > 0 && (
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2 text-left">
                    <div className="text-[11px] font-bold text-[#362486] uppercase tracking-wider flex items-center space-x-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#00E96E]" />
                      <span>Cited Project Evidence ({msg.citations.length})</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.citations.map((cite, cIdx) => {
                        const matchingDoc = project.documents.find(
                          (d) =>
                            d.referenceNumber === cite.referenceNumber ||
                            d.title.toLowerCase().includes(cite.documentTitle.toLowerCase())
                        );
                        const docId = matchingDoc ? matchingDoc.id : project.documents[0].id;

                        return (
                          <div
                            key={cIdx}
                            onClick={() => onOpenDocument(docId, cite.pageNumber)}
                            className="bg-slate-50 p-2.5 rounded border border-slate-200 hover:border-[#362486] hover:bg-[#f1effb]/40 transition cursor-pointer text-xs group"
                          >
                            <div className="flex items-center justify-between font-semibold text-slate-900">
                              <span className="truncate">{cite.documentTitle}</span>
                              <span className="text-[10px] font-mono text-[#362486] font-bold ml-2">
                                Page {cite.pageNumber}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-600 italic line-clamp-2 mt-1">
                              "{cite.quoteExcerpt}"
                            </p>

                            <div className="mt-1.5 flex items-center justify-end text-[10px] font-bold text-[#362486] group-hover:underline">
                              <span>Inspect Document</span>
                              <ExternalLink className="w-3 h-3 ml-1 text-[#00E96E]" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Suggested followups */}
                {!isUser && msg.suggestedFollowups && msg.suggestedFollowups.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 text-left pt-1">
                    {msg.suggestedFollowups.map((fUp, fIdx) => (
                      <button
                        key={fIdx}
                        onClick={() => handleSelectSuggested(fUp)}
                        disabled={isProcessing}
                        className="text-[11px] bg-slate-100 hover:bg-[#f1effb] hover:text-[#362486] hover:border-[#cdc6f2] border border-transparent text-slate-700 px-2.5 py-1 rounded-full transition cursor-pointer flex items-center space-x-1"
                      >
                        <span>{fUp}</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="text-[10px] text-slate-400 font-mono">
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isProcessing && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-[#362486] text-[#00E96E] flex items-center justify-center font-bold ring-1 ring-[#00E96E]/30">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center space-x-2.5 text-xs text-slate-600">
              <Loader2 className="w-4 h-4 text-[#362486] animate-spin" />
              <span>Oju is cross-referencing project documents and running deterministic checks...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-xl space-y-2">
        {/* Attached Files Pills */}
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 p-2 bg-[#e6fcf0] rounded-lg border border-[#a3f7c7] text-xs">
            <span className="font-semibold text-[#007a38] text-[11px]">Attach to Oju:</span>
            {attachedFiles.map((f, idx) => (
              <span
                key={idx}
                className="inline-flex items-center space-x-1.5 bg-white px-2 py-0.5 rounded border border-[#a3f7c7] text-[#007a38] text-[11px] font-medium shadow-2xs"
              >
                <FileText className="w-3 h-3 text-[#00E96E]" />
                <span className="max-w-[140px] truncate">{f.name}</span>
                <button
                  type="button"
                  onClick={() => removeAttached(idx)}
                  className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls,.csv,.docx,.txt"
            onChange={handleFileAttach}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Attach construction document (PDF, Drawings, BOQ, Site Report, Invoice)"
            className="p-2.5 rounded-lg text-slate-500 hover:text-[#362486] hover:bg-[#f1effb] transition cursor-pointer border border-slate-300 bg-white"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            id="chat-query-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isProcessing}
            placeholder={
              attachedFiles.length > 0
                ? 'Ask Oju about attached document(s)...'
                : 'Ask about quantities, unapproved variations, drawing revisions, or "What does not make sense?"...'
            }
            className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#362486] focus:border-transparent transition"
          />

          <button
            id="chat-send-btn"
            type="submit"
            disabled={(!input.trim() && attachedFiles.length === 0) || isProcessing}
            className="bg-[#362486] hover:bg-[#2a1a6f] disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-lg text-xs transition cursor-pointer flex items-center space-x-1.5 shadow-xs ring-1 ring-[#00E96E]/20"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#00E96E]" />
            ) : (
              <>
                <span>Ask Oju</span>
                <Send className="w-3.5 h-3.5 text-[#00E96E]" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
