import React, { useState } from 'react';
import {
  Upload,
  ArrowRight,
  Search,
  ShieldAlert,
  Database,
  ArrowUpRight,
} from 'lucide-react';
import { ProjectDocument, Finding } from '../types';

interface OverviewHeroProps {
  projectName: string;
  documents: ProjectDocument[];
  findings: Finding[];
  onOpenUpload: () => void;
  onAskQuestion: (question: string) => void;
  onSelectFinding: (findingId: string) => void;
  onNavigateTab: (tab: 'documents' | 'intelligence' | 'memory' | 'chat') => void;
}

export const OverviewHero: React.FC<OverviewHeroProps> = ({
  projectName,
  documents,
  findings,
  onOpenUpload,
  onAskQuestion,
  onNavigateTab,
}) => {
  const [quickQuery, setQuickQuery] = useState('');

  const docTypes = Array.from(new Set(documents.map((d) => d.category)));
  const criticalFindings = findings.filter((f) => f.severity === 'CRITICAL');
  const highFindings = findings.filter((f) => f.severity === 'HIGH');

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickQuery.trim()) {
      onAskQuestion(quickQuery.trim());
      setQuickQuery('');
    }
  };

  const samplePrompt = "What doesn't make sense in this project?";

  return (
    <div className="bg-[#362486] border-b border-[#2a1a6f] text-white py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Wireframe Box */}
        <div className="bg-[#2a1a6f] rounded-xl border border-white/15 p-5 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[#00E96E] font-mono text-xs font-bold uppercase tracking-wider">
                  Oju Construction Intelligence
                </span>
                <span className="text-white/40">•</span>
                <span className="text-xs text-slate-300">by Agba • Deterministic Cross-Document Audit</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white mt-0.5">
                Project: {projectName}
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Oju ingests project documents, builds a structured memory model, verifies deterministic
                construction rules, and provides evidence-backed reconciliation.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                id="hero-upload-btn"
                onClick={onOpenUpload}
                className="flex items-center space-x-2 bg-[#00E96E] hover:bg-[#00d062] text-slate-950 font-bold px-4 py-2.5 rounded-lg text-sm transition shadow-md cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Project Documents</span>
              </button>

              <button
                id="hero-inspect-intelligence-btn"
                onClick={() => onNavigateTab('intelligence')}
                className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 text-white px-3.5 py-2.5 rounded-lg text-xs font-medium border border-white/20 transition cursor-pointer"
              >
                <span>View Full Audit</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#00E96E]" />
              </button>
            </div>
          </div>

          {/* 3 Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
            <div
              onClick={() => onNavigateTab('documents')}
              className="bg-[#362486]/80 hover:bg-[#362486] border border-white/15 p-3.5 rounded-lg cursor-pointer transition group"
            >
              <div className="text-slate-300 text-xs font-medium flex items-center justify-between">
                <span>Ingested Documents</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#00E96E] transition" />
              </div>
              <div className="text-2xl font-black text-white mt-1">
                {documents.length} <span className="text-xs font-normal text-slate-300">documents</span>
              </div>
              <div className="text-[11px] text-[#00E96E] mt-0.5 font-semibold">
                100% structured & indexed
              </div>
            </div>

            <div
              onClick={() => onNavigateTab('documents')}
              className="bg-[#362486]/80 hover:bg-[#362486] border border-white/15 p-3.5 rounded-lg cursor-pointer transition group"
            >
              <div className="text-slate-300 text-xs font-medium flex items-center justify-between">
                <span>Document Categories</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#00E96E] transition" />
              </div>
              <div className="text-2xl font-black text-white mt-1">
                {docTypes.length} <span className="text-xs font-normal text-slate-300">categories</span>
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">
                Contract, BOQ, Invoices, Site...
              </div>
            </div>

            <div
              onClick={() => onNavigateTab('intelligence')}
              className="bg-[#362486]/80 hover:bg-[#362486] border border-white/15 p-3.5 rounded-lg cursor-pointer transition group"
            >
              <div className="text-slate-300 text-xs font-medium flex items-center justify-between">
                <span>Potential Discrepancies</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-rose-300 transition" />
              </div>
              <div className="text-2xl font-black text-[#00E96E] mt-1">
                {findings.length} <span className="text-xs font-normal text-slate-300">issues flagged</span>
              </div>
              <div className="text-[11px] text-slate-200 mt-0.5 flex items-center space-x-1">
                <ShieldAlert className="w-3 h-3 text-rose-400 inline" />
                <span>{criticalFindings.length} Critical, {highFindings.length} High</span>
              </div>
            </div>

            <div
              onClick={() => onNavigateTab('memory')}
              className="bg-[#362486]/80 hover:bg-[#362486] border border-white/15 p-3.5 rounded-lg cursor-pointer transition group"
            >
              <div className="text-slate-300 text-xs font-medium flex items-center justify-between">
                <span>Project Memory</span>
                <Database className="w-3.5 h-3.5 text-[#00E96E]" />
              </div>
              <div className="text-2xl font-black text-white mt-1">
                Active <span className="text-xs font-normal text-slate-300">entity graph</span>
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">
                Quantities, POs, Invoices cross-linked
              </div>
            </div>
          </div>

          {/* Ask Oju Box */}
          <div className="mt-5 pt-4 border-t border-white/10">
            <form onSubmit={handleAskSubmit} className="relative">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-4 h-4 text-[#00E96E]" />
                  </div>
                  <input
                    id="hero-quick-prompt-input"
                    type="text"
                    value={quickQuery}
                    onChange={(e) => setQuickQuery(e.target.value)}
                    placeholder={`Ask Oju: "${samplePrompt}"`}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00E96E] focus:border-transparent transition"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="submit"
                    className="bg-[#00E96E] hover:bg-[#00d062] text-slate-950 font-bold px-4 py-2.5 rounded-lg text-xs transition cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <span>Investigate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onAskQuestion(samplePrompt)}
                    className="bg-white/10 hover:bg-white/20 text-white px-3 py-2.5 rounded-lg text-xs border border-white/20 transition cursor-pointer"
                  >
                    Quick: "What doesn't make sense?"
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Pipeline Bar */}
        <div className="bg-[#2a1a6f] rounded-lg border border-white/15 px-4 py-3 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-slate-300">
          <div className="flex items-center space-x-2 font-mono text-[11px] text-white">
            <span className="w-2 h-2 rounded-full bg-[#00E96E] animate-pulse" />
            <span className="font-semibold">CORE PIPELINE:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
            <span className="px-2 py-0.5 rounded bg-white/10 text-white">DOCUMENTS</span>
            <span className="text-white/40">→</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white">UNDERSTANDING</span>
            <span className="text-white/40">→</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white">STRUCTURED DATA</span>
            <span className="text-white/40">→</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-[#00E96E] font-bold">PROJECT MEMORY</span>
            <span className="text-white/40">→</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white">RULES & REASONING</span>
            <span className="text-white/40">→</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-[#00E96E] border border-[#00E96E]/40 font-bold">
              FINDINGS ({findings.length})
            </span>
            <span className="text-white/40">→</span>
            <span className="px-2 py-0.5 rounded bg-[#00E96E] text-slate-950 font-bold">
              ACTIONABLE AUDIT
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
