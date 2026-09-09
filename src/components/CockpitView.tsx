import React, { useState } from 'react';
import {
  Upload,
  ArrowRight,
  Search,
  ShieldAlert,
  Database,
  ArrowUpRight,
  Cpu,
  FileText,
  Calculator,
  CheckCircle2,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { ProjectDocument, Finding } from '../types';

interface CockpitViewProps {
  projectName: string;
  client: string;
  contractor: string;
  documents: ProjectDocument[];
  findings: Finding[];
  onOpenUpload: () => void;
  onAskQuestion: (question: string) => void;
  onNavigateTab: (tab: 'cockpit' | 'documents' | 'intelligence' | 'memory' | 'chat') => void;
  onOpenEvidenceDoc: (docId: string, pageNumber: number) => void;
  onOpenOcrArchitecture: () => void;
}

export const CockpitView: React.FC<CockpitViewProps> = ({
  projectName,
  client,
  contractor,
  documents,
  findings,
  onOpenUpload,
  onAskQuestion,
  onNavigateTab,
  onOpenEvidenceDoc,
  onOpenOcrArchitecture,
}) => {
  const [quickQuery, setQuickQuery] = useState('');

  const criticalFindings = findings.filter((f) => f.severity === 'CRITICAL');
  const highFindings = findings.filter((f) => f.severity === 'HIGH');
  const totalFinancialExposure = findings.reduce(
    (acc, f) => acc + (f.financialExposure || 0),
    0
  );

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickQuery.trim()) {
      onAskQuestion(quickQuery.trim());
      setQuickQuery('');
    }
  };

  const samplePrompts = [
    { label: "What doesn't make sense in this project?", query: "What doesn't make sense in this project?" },
    { label: 'Floor tiles 130m² gap', query: 'Explain the floor tiles quantity discrepancy with evidence.' },
    { label: 'Unapproved variation VO-04', query: 'Why is Variation VO-04 flagged as unauthorized?' },
    { label: 'Invoice missing delivery', query: 'Which invoices do not have matching delivery records?' },
    { label: 'Drawing revision conflicts', query: 'Are there any drawing revision conflicts on site?' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner: Brand #362486 and #00E96E */}
      <div className="bg-[#362486] rounded-2xl border border-[#2a1a6f] p-6 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-[#2a1a6f]">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[#00E96E] font-mono text-xs font-bold uppercase tracking-wider">
                Oju Cockpit
              </span>
              <span className="text-white/40">•</span>
              <span className="text-xs text-slate-300">Construction intelligence by Agba</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
              {projectName}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Employer: <strong className="text-white">{client}</strong> • Contractor:{' '}
              <strong className="text-white">{contractor}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenOcrArchitecture}
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 rounded-lg text-xs font-semibold border border-white/20 transition cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5 text-[#00E96E]" />
              <span>OCR Pipeline (Surya + Paddle)</span>
            </button>

            <button
              onClick={onOpenUpload}
              className="flex items-center space-x-2 bg-[#00E96E] hover:bg-[#00d062] text-slate-950 px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Ingest Document</span>
            </button>
          </div>
        </div>

        {/* 4 Core Vitals */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-5">
          <div
            onClick={() => onNavigateTab('documents')}
            className="bg-[#2a1a6f]/80 hover:bg-[#2a1a6f] border border-white/15 p-4 rounded-xl cursor-pointer transition group"
          >
            <div className="text-slate-300 text-xs font-medium flex items-center justify-between">
              <span>Ingested Documents</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#00E96E] transition" />
            </div>
            <div className="text-2xl font-black text-white mt-1.5">
              {documents.length}{' '}
              <span className="text-xs font-normal text-slate-300">files</span>
            </div>
            <div className="text-[11px] text-[#00E96E] mt-1 flex items-center space-x-1 font-mono font-semibold">
              <CheckCircle2 className="w-3 h-3" />
              <span>100% OCR verified</span>
            </div>
          </div>

          <div
            onClick={() => onNavigateTab('intelligence')}
            className="bg-[#2a1a6f]/80 hover:bg-[#2a1a6f] border border-white/15 p-4 rounded-xl cursor-pointer transition group"
          >
            <div className="text-slate-300 text-xs font-medium flex items-center justify-between">
              <span>Flagged Discrepancies</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-rose-300 transition" />
            </div>
            <div className="text-2xl font-black text-[#00E96E] mt-1.5">
              {findings.length}{' '}
              <span className="text-xs font-normal text-slate-300">issues</span>
            </div>
            <div className="text-[11px] text-slate-200 mt-1 flex items-center space-x-1">
              <ShieldAlert className="w-3 h-3 text-rose-400" />
              <span>{criticalFindings.length} Critical • {highFindings.length} High</span>
            </div>
          </div>

          <div
            onClick={() => onNavigateTab('memory')}
            className="bg-[#2a1a6f]/80 hover:bg-[#2a1a6f] border border-white/15 p-4 rounded-xl cursor-pointer transition group"
          >
            <div className="text-slate-300 text-xs font-medium flex items-center justify-between">
              <span>Identified Cost Leakage</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#00E96E] transition" />
            </div>
            <div className="text-2xl font-black text-white mt-1.5 font-mono">
              ₦{(totalFinancialExposure / 1000000).toFixed(2)}M
            </div>
            <div className="text-[11px] text-slate-300 mt-1">
              Unapproved claims & discrepancies
            </div>
          </div>

          <div
            onClick={onOpenOcrArchitecture}
            className="bg-[#2a1a6f]/80 hover:bg-[#2a1a6f] border border-white/15 p-4 rounded-xl cursor-pointer transition group"
          >
            <div className="text-slate-300 text-xs font-medium flex items-center justify-between">
              <span>OCR Pipeline Health</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#00E96E] transition" />
            </div>
            <div className="text-2xl font-black text-[#00E96E] mt-1.5 font-mono">
              99.4%
            </div>
            <div className="text-[11px] text-slate-300 mt-1">
              Surya Layout + LLM Number Guard
            </div>
          </div>
        </div>

        {/* Quick Question / Investigation Bar */}
        <div className="mt-5 pt-5 border-t border-[#2a1a6f]">
          <form onSubmit={handleAskSubmit} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                placeholder="Ask Oju: What doesn't make sense in this project?"
                className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#00E96E] font-sans"
              />
            </div>
            <button
              type="submit"
              className="bg-[#00E96E] hover:bg-[#00d062] text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs transition flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
            >
              <span>Investigate</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Prompt chips */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            <span className="text-[11px] text-slate-300 mr-1 font-medium">Quick investigations:</span>
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onAskQuestion(p.query)}
                className="text-[11px] bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white px-2.5 py-1 rounded-full border border-white/15 transition cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Cockpit Split: Left = Priority Discrepancies, Right = Quick Nav & OCR Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Priority Discrepancies needing attention */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <h2 className="text-base font-bold text-slate-900">
                Priority Discrepancies Requiring Action ({findings.length})
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('intelligence')}
              className="text-xs font-bold text-[#362486] hover:text-[#2a1a6f] flex items-center space-x-1 cursor-pointer"
            >
              <span>View Full Audit</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {findings.slice(0, 3).map((finding) => (
              <div
                key={finding.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        finding.severity === 'CRITICAL'
                          ? 'bg-rose-600 text-white'
                          : finding.severity === 'HIGH'
                          ? 'bg-[#362486] text-[#00E96E]'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {finding.severity}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 font-mono">
                      {finding.category}
                    </span>
                  </div>
                  {finding.financialExposure && (
                    <span className="text-xs font-bold text-rose-700 font-mono bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      ₦{finding.financialExposure.toLocaleString()} Exposure
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">{finding.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {finding.description}
                  </p>
                </div>

                {/* Mathematical Proof Box */}
                {finding.calculation && (
                  <div className="bg-[#f1effb] rounded-lg p-2.5 border border-[#cdc6f2] text-xs font-mono text-slate-800 flex items-center space-x-2">
                    <Calculator className="w-3.5 h-3.5 text-[#362486] shrink-0" />
                    <span>
                      <strong className="text-[#362486]">Formula:</strong> {finding.calculation.formula} ➔{' '}
                      <span className="text-rose-700 font-bold">{finding.calculation.result}</span>
                    </span>
                  </div>
                )}

                {/* Evidence & Action Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center space-x-1.5 text-slate-500">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{finding.evidence.length} Cited Documents</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {finding.evidence[0] && (
                      <button
                        onClick={() =>
                          onOpenEvidenceDoc(
                            finding.evidence[0].documentId,
                            finding.evidence[0].pageNumber
                          )
                        }
                        className="text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md transition cursor-pointer"
                      >
                        Inspect Evidence (p.{finding.evidence[0].pageNumber})
                      </button>
                    )}
                    <button
                      onClick={() =>
                        onAskQuestion(
                          `Explain the discrepancy: "${finding.title}". What is the exact mathematical calculation and document evidence?`
                        )
                      }
                      className="text-xs font-bold text-[#362486] hover:text-white bg-[#f1effb] hover:bg-[#362486] px-3 py-1.5 rounded-md border border-[#cdc6f2] transition cursor-pointer"
                    >
                      Ask Oju
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: OCR Engine Architecture Card & Quick Access */}
        <div className="space-y-4">
          {/* OCR Hybrid Engine Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-[#362486]" />
                <h3 className="text-sm font-bold text-slate-900">Oju OCR Ingestion Engine</h3>
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#e6fcf0] text-[#007a38] border border-[#a3f7c7]">
                ACTIVE
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Oju uses a hybrid pipeline designed for construction BOQs, delivery waybills, and legal contracts:
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between font-semibold text-slate-900">
                  <span>1. Layout & Tables</span>
                  <span className="font-mono text-[10px] text-[#362486] font-bold">surya</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Multi-column BOQs and drawing title blocks
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between font-semibold text-slate-900">
                  <span>2. Fast Text Recognition</span>
                  <span className="font-mono text-[10px] text-[#007a38] font-bold">PaddleOCR / Unlimited</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Angled site delivery slips and carbon copies
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#f1effb] border border-[#cdc6f2]">
                <div className="flex items-center justify-between font-bold text-[#362486]">
                  <span>3. Number Guard (Crucial)</span>
                  <span className="font-mono text-[10px] text-[#362486] bg-white px-1.5 py-0.5 rounded border border-[#cdc6f2]">llm_aided_ocr</span>
                </div>
                <div className="text-[11px] text-slate-700 mt-0.5">
                  Prevents "0" vs "O" typos & checks row totals
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between font-semibold text-slate-900">
                  <span>4. Semantic Markdown</span>
                  <span className="font-mono text-[10px] text-purple-700">chandra</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Contract clauses & specs with clean hierarchy
                </div>
              </div>
            </div>

            <button
              onClick={onOpenOcrArchitecture}
              className="w-full bg-[#362486] hover:bg-[#2a1a6f] text-white font-semibold py-2 px-3 rounded-lg text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5 text-[#00E96E]" />
              <span>Inspect Full OCR Architecture & Repos</span>
            </button>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2 text-xs">
            <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
              Project Navigation
            </span>

            <button
              onClick={() => onNavigateTab('documents')}
              className="w-full flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 hover:border-[#362486] hover:text-[#362486] transition cursor-pointer font-medium text-slate-700"
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Document Repository & OCR Traces</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigateTab('memory')}
              className="w-full flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 hover:border-[#362486] hover:text-[#362486] transition cursor-pointer font-medium text-slate-700"
            >
              <div className="flex items-center space-x-2">
                <Database className="w-3.5 h-3.5 text-slate-500" />
                <span>Reconciliation Ledger (Quantities / POs)</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigateTab('chat')}
              className="w-full flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 hover:border-[#362486] hover:text-[#362486] transition cursor-pointer font-medium text-slate-700"
            >
              <div className="flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-[#362486]" />
                <span>Ask Oju AI Forensic Assistant</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
