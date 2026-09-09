import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  Plus,
  Eye,
  Search,
  Loader2,
} from 'lucide-react';
import { ProjectDocument } from '../types';

interface AddFilesViewProps {
  documents: ProjectDocument[];
  projectName: string;
  onOpenUploadModal: () => void;
  onInspectDocument: (doc: ProjectDocument) => void;
  onDirectFilesUploaded?: (files: File[]) => Promise<void>;
  isUploadingFiles?: boolean;
}

const CATEGORIES: Array<{ key: string; label: string }> = [
  { key: 'ALL', label: 'All Documents' },
  { key: 'BOQ', label: 'BOQs' },
  { key: 'Delivery Note', label: 'Delivery Notes' },
  { key: 'Site Report', label: 'Site Reports' },
  { key: 'Invoice', label: 'Invoices' },
  { key: 'Payment Certificate', label: 'IPCs' },
  { key: 'Drawing', label: 'Drawings' },
  { key: 'Variation', label: 'Variations' },
  { key: 'Contract', label: 'Contracts' },
];

export const AddFilesView: React.FC<AddFilesViewProps> = ({
  documents,
  projectName,
  onInspectDocument,
  onDirectFilesUploaded,
  isUploadingFiles,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0 && onDirectFilesUploaded) {
      const filesArray = Array.from(e.dataTransfer.files);
      await onDirectFilesUploaded(filesArray);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && onDirectFilesUploaded) {
      const filesArray = Array.from(e.target.files);
      await onDirectFilesUploaded(filesArray);
      e.target.value = '';
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesCat = categoryFilter === 'ALL' || doc.category === categoryFilter;
    const matchesSearch =
      search.trim() === '' ||
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.referenceNumber.toLowerCase().includes(search.toLowerCase()) ||
      (doc.issuerCompany && doc.issuerCompany.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Top Direct Upload Dropzone Hero with #362486 and #00E96E */}
      <div className="bg-[#362486] text-white rounded-2xl p-6 sm:p-8 shadow-md border border-[#2a1a6f] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-white/15 text-[#00E96E] text-xs font-semibold">
              <span>Add Information to Oju</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Add Project Files
            </h2>
            <p className="text-sm text-slate-200 max-w-xl">
              Upload PDFs, drawings, BOQs, site progress reports, delivery waybills, invoices, or contracts. Oju reads them, extracts quantities and dates, and connects them.
            </p>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-[#00E96E] hover:bg-[#00d062] text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm transition flex items-center justify-center space-x-2 shadow-lg cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Select Files</span>
          </button>
        </div>

        {/* Direct Drag & Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition ${
            isDragOver
              ? 'border-[#00E96E] bg-[#00E96E]/15'
              : 'border-white/20 hover:border-[#00E96E] bg-white/5 hover:bg-white/10'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls,.csv,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />

          {isUploadingFiles ? (
            <div className="flex items-center justify-center space-x-3 py-2 text-[#00E96E]">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Oju is reading and indexing your files...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-[#00E96E]">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-white">
                Drag & drop construction files directly here, or click to browse
              </p>
              <p className="text-xs text-slate-300">
                Supported formats: PDF, Images, Excel spreadsheets, CSV, Word, Plain text
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Files Filter & List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
              <span>Files Oju has read</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#362486] text-[#00E96E] font-bold">
                {documents.length}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Knowledge base for {projectName}.
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-[#362486] w-52"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
          {CATEGORIES.map((cat) => {
            const count =
              cat.key === 'ALL'
                ? documents.length
                : documents.filter((d) => d.category === cat.key).length;

            return (
              <button
                key={cat.key}
                onClick={() => setCategoryFilter(cat.key)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition cursor-pointer ${
                  categoryFilter === cat.key
                    ? 'bg-[#362486] text-[#00E96E] font-bold shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>

        {filteredDocs.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 space-y-3 shadow-2xs">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">
              {documents.length === 0 ? 'No documents uploaded yet' : 'No matching documents found'}
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {documents.length === 0
                ? 'Drop your construction documents in the box above or click "Select Files" to begin.'
                : 'Try clearing your search query or selecting "All Documents".'}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="bg-white p-4 rounded-xl border border-slate-200 hover:border-[#362486] transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-2xs group"
              >
                <div className="flex items-start space-x-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-[#362486]/10 text-[#362486] border border-[#362486]/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#362486] group-hover:text-[#00E96E] transition">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {doc.category}
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                        {doc.referenceNumber}
                      </span>
                      <span className="text-[10px] text-[#007a38] bg-[#e6fcf0] px-1.5 py-0.2 rounded font-semibold border border-[#a3f7c7]">
                        Indexed
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#362486] mt-1 truncate">
                      {doc.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {doc.rawTextExcerpt}
                    </p>
                    <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-1 font-mono">
                      <span>Size: {doc.fileSize}</span>
                      <span>•</span>
                      <span>Pages: {doc.pageCount}</span>
                      {doc.signatory && (
                        <>
                          <span>•</span>
                          <span>Signed: {doc.signatory}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
                  <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                    {doc.date}
                  </span>
                  <button
                    onClick={() => onInspectDocument(doc)}
                    className="bg-slate-100 hover:bg-[#362486] hover:text-[#00E96E] text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View document</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
