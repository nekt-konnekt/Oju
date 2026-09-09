import React, { useState } from 'react';
import {
  FileText,
  Search,
  Eye,
  Calendar,
  Building,
  CheckCircle,
  AlertCircle,
  Upload,
  ChevronRight,
  Hash,
  Cpu,
} from 'lucide-react';
import { ProjectDocument, DocumentCategory } from '../types';

interface DocumentsViewProps {
  documents: ProjectDocument[];
  onInspectDocument: (doc: ProjectDocument) => void;
  onOpenUpload: () => void;
  onOpenOcrArchitecture?: () => void;
}

const ALL_CATEGORIES: DocumentCategory[] = [
  'Contract',
  'BOQ',
  'Drawing',
  'Specification',
  'Invoice',
  'Purchase Order',
  'Delivery Note',
  'Site Report',
  'Payment Certificate',
  'Variation',
  'RFI',
  'Programme / Schedule',
  'Meeting Minutes',
  'Other',
];

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  onInspectDocument,
  onOpenUpload,
  onOpenOcrArchitecture,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocs = documents.filter((doc) => {
    const matchesCat = selectedCategory === 'ALL' || doc.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.issuerCompany && doc.issuerCompany.toLowerCase().includes(searchQuery.toLowerCase())) ||
      doc.rawTextExcerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const categoryCounts = documents.reduce((acc, doc) => {
    acc[doc.category] = (acc[doc.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-5">
      {/* OCR Engine Status Strip */}
      <div className="bg-[#362486] text-white rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-[#2a1a6f] shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 text-[#00E96E] border border-[#00E96E]/30 flex items-center justify-center font-bold">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center space-x-2">
              <span>Construction Document Ingestion Pipeline</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#00E96E]/20 text-[#00E96E] font-bold border border-[#00E96E]/40">
                100% Ingested
              </span>
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5">
              Powered by <strong>Surya</strong> (Layout/Tables) + <strong>PaddleOCR</strong> (Text) + <strong>LLM-Aided OCR</strong> (Numeric Guard) + <strong>Chandra</strong> (Markdown)
            </div>
          </div>
        </div>

        {onOpenOcrArchitecture && (
          <button
            onClick={onOpenOcrArchitecture}
            className="self-start sm:self-auto bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/20 transition flex items-center space-x-1.5 cursor-pointer"
          >
            <span>Inspect OCR Architecture</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#00E96E]" />
          </button>
        )}
      </div>

      {/* Header and Controls */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-[#362486]" />
              <span>Project Document Repository ({documents.length})</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              All indexed construction documents with extracted quantities, financials, and OCR verification traces.
            </p>
          </div>

          <button
            onClick={onOpenUpload}
            className="flex items-center space-x-1.5 bg-[#00E96E] hover:bg-[#00d062] text-slate-950 px-4 py-2 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Ingest Document</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-3 pt-2 border-t border-slate-100">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by title, reference number, contractor, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#362486] focus:bg-white transition font-sans"
            />
          </div>

          {/* Quick Category Selector */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-[#362486] text-[#00E96E] font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({documents.length})
            </button>
            {ALL_CATEGORIES.map((cat) => {
              const count = categoryCounts[cat] || 0;
              if (count === 0 && selectedCategory !== cat) return null;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition cursor-pointer flex items-center space-x-1 ${
                    selectedCategory === cat
                      ? 'bg-[#362486] text-[#00E96E] font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{cat}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => {
          const isFlagged = doc.status === 'FLAGGED';
          const ocrTrace = doc.ocrTrace;

          return (
            <div
              key={doc.id}
              className={`bg-white rounded-xl border transition-all flex flex-col justify-between hover:shadow-md hover:border-[#362486] ${
                isFlagged ? 'border-rose-300 ring-1 ring-rose-100' : 'border-slate-200'
              }`}
            >
              <div className="p-4 space-y-3">
                {/* Category & Status Header */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold tracking-wide uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {doc.category}
                  </span>

                  {isFlagged ? (
                    <span className="flex items-center space-x-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      <AlertCircle className="w-3 h-3 text-rose-600" />
                      <span>Has Findings</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-[11px] font-semibold text-[#007a38] bg-[#e6fcf0] px-2 py-0.5 rounded border border-[#a3f7c7]">
                      <CheckCircle className="w-3 h-3 text-[#00E96E]" />
                      <span>Reconciled</span>
                    </span>
                  )}
                </div>

                {/* Title & Ref */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                    {doc.title}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1 text-[11px] font-mono text-slate-500">
                    <Hash className="w-3 h-3 text-[#362486]" />
                    <span>{doc.referenceNumber}</span>
                  </div>
                </div>

                {/* Issuer / Dates */}
                <div className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-slate-100">
                  {doc.issuerCompany && (
                    <div className="flex items-center space-x-1.5 truncate">
                      <Building className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{doc.issuerCompany}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-slate-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{doc.date}</span>
                    </div>
                    <span>•</span>
                    <span>{doc.pageCount} {doc.pageCount === 1 ? 'page' : 'pages'}</span>
                    <span>•</span>
                    <span>{doc.fileSize}</span>
                  </div>
                </div>

                {/* OCR Provenance Badge */}
                {ocrTrace && (
                  <div className="bg-slate-50 rounded-lg p-2 border border-slate-200/80 text-[11px] font-mono flex items-center justify-between text-slate-700">
                    <div className="flex items-center space-x-1.5 truncate">
                      <Cpu className="w-3 h-3 text-[#362486] shrink-0" />
                      <span className="truncate">Surya + Paddle + LLM-Guard</span>
                    </div>
                    <span className="font-bold text-[#007a38] font-sans ml-2 shrink-0">
                      {ocrTrace.overallConfidence}%
                    </span>
                  </div>
                )}

                {/* Extracted Entities Counter */}
                <div className="grid grid-cols-4 gap-1 pt-1 text-center font-mono text-[10px]">
                  <div className="bg-slate-50 rounded p-1">
                    <div className="text-slate-400">Qty</div>
                    <div className="font-bold text-slate-800">
                      {doc.extractedEntitiesCount.quantities}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded p-1">
                    <div className="text-slate-400">Fin</div>
                    <div className="font-bold text-slate-800">
                      {doc.extractedEntitiesCount.financials}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded p-1">
                    <div className="text-slate-400">Ref</div>
                    <div className="font-bold text-slate-800">
                      {doc.extractedEntitiesCount.references}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded p-1">
                    <div className="text-slate-400">Date</div>
                    <div className="font-bold text-slate-800">
                      {doc.extractedEntitiesCount.dates}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 rounded-b-xl flex items-center justify-between">
                <button
                  onClick={() => onInspectDocument(doc)}
                  className="w-full flex items-center justify-center space-x-1.5 text-xs font-bold text-slate-700 hover:text-[#362486] bg-white hover:bg-slate-100 py-2 rounded-lg border border-slate-200 hover:border-[#362486] transition cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-[#362486]" />
                  <span>Inspect Document & OCR Trace</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
