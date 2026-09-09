import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  X,
  FileUp,
  Loader2,
} from 'lucide-react';
import { DocumentCategory, ProjectDocument } from '../types';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadFile?: (file: File) => Promise<void>;
  onUploadFiles?: (files: File[]) => Promise<void>;
  onDocumentAdded?: (newDoc: ProjectDocument) => void;
  isProcessing?: boolean;
  uploadProgress?: string;
}

const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  'BOQ',
  'Drawing',
  'Site Report',
  'Delivery Note',
  'Invoice',
  'Contract',
  'Payment Certificate',
  'Variation',
  'Specification',
  'Other',
];

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  onUploadFile,
  onUploadFiles,
  onDocumentAdded,
  isProcessing = false,
  uploadProgress,
}) => {
  const [activeTab, setActiveTab] = useState<'file' | 'text'>('file');
  const [docTitle, setDocTitle] = useState<string>('');
  const [docCategory, setDocCategory] = useState<DocumentCategory>('Delivery Note');
  const [docRef, setDocRef] = useState<string>('');
  const [docIssuer, setDocIssuer] = useState<string>('');
  const [docContent, setDocContent] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [localProcessing, setLocalProcessing] = useState<boolean>(false);
  const [localProgress, setLocalProgress] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isProcessing && !localProcessing) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isProcessing, localProcessing]);

  if (!isOpen) return null;

  const currentProcessing = isProcessing || localProcessing;
  const currentProgress = uploadProgress || localProgress;

  const handleFileProcess = async (file: File) => {
    try {
      if (onUploadFiles) {
        await onUploadFiles([file]);
        onClose();
        return;
      }
      if (onUploadFile) {
        await onUploadFile(file);
        onClose();
        return;
      }
      if (onDocumentAdded) {
        setLocalProcessing(true);
        setLocalProgress(`Reading ${file.name}...`);
        const newDoc: ProjectDocument = {
          id: `doc-${Date.now()}`,
          title: docTitle.trim() || file.name.replace(/\.[^/.]+$/, ''),
          referenceNumber: docRef.trim() || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
          category: docCategory,
          date: new Date().toISOString().split('T')[0],
          uploadDate: new Date().toISOString().split('T')[0],
          fileSize: `${Math.round(file.size / 1024) || 85} KB`,
          pageCount: 1,
          issuerCompany: docIssuer.trim() || 'Uploaded Contractor',
          status: 'PROCESSED',
          rawTextExcerpt: docContent.slice(0, 300) || `Uploaded file: ${file.name}`,
          extractedEntitiesCount: {
            quantities: 1,
            financials: 1,
            references: 1,
            dates: 1,
          },
          pages: [
            {
              pageNumber: 1,
              content: docContent || `Ingested construction document: ${file.name}`,
              tables: [],
            },
          ],
        };
        onDocumentAdded(newDoc);
        setLocalProcessing(false);
        onClose();
        return;
      }
      onClose();
    } catch (err) {
      console.error('Error during document upload:', err);
      setLocalProcessing(false);
      onClose();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docContent.trim()) return;

    // Create File from text content
    const blob = new Blob([docContent], { type: 'text/plain' });
    const file = new File([blob], `${docTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}.txt`, {
      type: 'text/plain',
    });
    await handleFileProcess(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !currentProcessing) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl flex flex-col overflow-hidden animate-in fade-in duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with #362486 and #00E96E */}
        <div className="bg-[#362486] text-white p-4 sm:px-6 flex items-center justify-between border-b border-[#2a1a6f]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 ring-1 ring-[#00E96E]/50 flex items-center justify-center text-[#00E96E] font-black">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Upload Construction Document</h2>
              <p className="text-xs text-slate-300">
                Oju reads documents, extracts quantities and rates, and connects them.
              </p>
            </div>
          </div>

          <button
            id="close-upload-document-modal"
            aria-label="Close upload modal"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            disabled={currentProcessing}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold px-4 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('file')}
            className={`pb-2.5 px-3 border-b-2 transition cursor-pointer ${
              activeTab === 'file'
                ? 'border-[#362486] text-[#362486] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Upload File (PDF, Image, Excel, Word)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`pb-2.5 px-3 border-b-2 transition cursor-pointer ${
              activeTab === 'text'
                ? 'border-[#362486] text-[#362486] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Paste Text / Report
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {currentProcessing ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#f1effb] border border-[#cdc6f2] flex items-center justify-center text-[#362486] animate-bounce">
                <Loader2 className="w-7 h-7 animate-spin text-[#00E96E]" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900">Oju is reading your file...</p>
                <p className="text-xs text-slate-500 font-mono max-w-sm">
                  {currentProgress || 'Extracting structured quantities, amounts, and dates...'}
                </p>
              </div>
            </div>
          ) : activeTab === 'file' ? (
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition ${
                  isDragOver
                    ? 'border-[#00E96E] bg-[#e6fcf0] shadow-sm scale-[1.01]'
                    : 'border-slate-300 hover:border-[#362486] bg-slate-50/60 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls,.csv,.docx,.txt"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileProcess(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-xs text-[#362486] mx-auto flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <FileUp className="w-6 h-6 text-[#00E96E]" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  Select or drag & drop your construction document
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Supports PDF files, drawings, site reports, delivery waybills, invoices, or spreadsheets.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400">
                  Press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono text-[10px]">Esc</kbd> or click outside to dismiss
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Document Title *</label>
                  <input
                    type="text"
                    required
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="e.g. Site Delivery Note - Cement"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-[#362486]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Category *</label>
                  <select
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value as DocumentCategory)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-[#362486] bg-white"
                  >
                    {DOCUMENT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Reference Number</label>
                  <input
                    type="text"
                    value={docRef}
                    onChange={(e) => setDocRef(e.target.value)}
                    placeholder="e.g. DN-2024-884"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-[#362486] font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Issuer / Organization</label>
                  <input
                    type="text"
                    value={docIssuer}
                    onChange={(e) => setDocIssuer(e.target.value)}
                    placeholder="e.g. West Africa Cement Ltd"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-[#362486]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Document Text Content *</label>
                <textarea
                  required
                  rows={6}
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  placeholder="Paste the report, delivery breakdown, BOQ rates, or invoice lines here..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-[#362486] font-mono leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-400">
                  Press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono text-[10px]">Esc</kbd> to dismiss
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!docTitle.trim() || !docContent.trim()}
                    className="bg-[#362486] hover:bg-[#2a1a6f] disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg text-xs transition cursor-pointer flex items-center space-x-1.5 shadow-xs ring-1 ring-[#00E96E]/20"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#00E96E]" />
                    <span>Process Document</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
