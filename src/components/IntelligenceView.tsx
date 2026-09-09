import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  AlertCircle,
  Info,
  CheckCircle2,
  Calculator,
  FileSearch,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Bookmark,
} from 'lucide-react';
import { Finding, FindingSeverity, FindingCategory } from '../types';

interface IntelligenceViewProps {
  findings: Finding[];
  onOpenEvidenceDoc: (docId: string, pageNumber: number) => void;
  onAskAboutFinding: (finding: Finding) => void;
  onToggleStatus?: (findingId: string) => void;
}

export const IntelligenceView: React.FC<IntelligenceViewProps> = ({
  findings,
  onOpenEvidenceDoc,
  onAskAboutFinding,
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedFindingId, setExpandedFindingId] = useState<string | null>(
    findings[0]?.id || null
  );

  const filteredFindings = findings.filter((f) => {
    const matchesSev = selectedSeverity === 'ALL' || f.severity === selectedSeverity;
    const matchesCat = selectedCategory === 'ALL' || f.category === selectedCategory;
    return matchesSev && matchesCat;
  });

  const getSeverityBadge = (severity: FindingSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="flex items-center space-x-1 text-xs font-bold px-2.5 py-1 rounded bg-rose-600 text-white shadow-xs">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>CRITICAL</span>
          </span>
        );
      case 'HIGH':
        return (
          <span className="flex items-center space-x-1 text-xs font-bold px-2.5 py-1 rounded bg-[#362486] text-[#00E96E] shadow-xs">
            <AlertTriangle className="w-3.5 h-3.5 text-[#00E96E]" />
            <span>HIGH</span>
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="flex items-center space-x-1 text-xs font-bold px-2.5 py-1 rounded bg-yellow-100 text-yellow-800 border border-yellow-300">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>MEDIUM</span>
          </span>
        );
      case 'LOW':
        return (
          <span className="flex items-center space-x-1 text-xs font-medium px-2.5 py-1 rounded bg-blue-100 text-blue-800 border border-blue-200">
            <Info className="w-3.5 h-3.5" />
            <span>LOW</span>
          </span>
        );
      default:
        return (
          <span className="text-xs font-medium px-2.5 py-1 rounded bg-slate-100 text-slate-700">
            INFO
          </span>
        );
    }
  };

  const getCategoryBadge = (category: FindingCategory) => {
    const map: Record<FindingCategory, { label: string; bg: string }> = {
      QUANTITY: { label: 'Quantity Discrepancy', bg: 'bg-purple-100 text-purple-800 border-purple-200' },
      FINANCIAL: { label: 'Financial Discrepancy', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
      DOCUMENT_GAP: { label: 'Document Gap / Missing Record', bg: 'bg-rose-100 text-rose-800 border-rose-200' },
      PROGRESS: { label: 'Progress Variance', bg: 'bg-blue-100 text-blue-800 border-blue-200' },
      SCHEDULE: { label: 'Schedule Risk', bg: 'bg-orange-100 text-orange-800 border-orange-200' },
      SPECIFICATION: { label: 'Specification Conflict', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    };
    const info = map[category] || { label: category, bg: 'bg-slate-100 text-slate-700' };
    return (
      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${info.bg}`}>
        {info.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Executive Report Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold uppercase text-[#362486] tracking-wider">
                Audited Project Findings
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500">Cross-Document Evidence Engine</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-0.5">
              Project Intelligence Report
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              Oju's deterministic rules engine cross-references quantities, contractual commitments,
              procurement dockets, site diaries, and payment certificates to detect discrepancies with full mathematical proof and page citations.
            </p>
          </div>

          {/* Severity Breakdown Bar */}
          <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs">
            <div className="px-2 py-1 bg-rose-600 text-white font-bold rounded">
              {findings.filter((f) => f.severity === 'CRITICAL').length} Critical
            </div>
            <div className="px-2 py-1 bg-[#362486] text-[#00E96E] font-bold rounded">
              {findings.filter((f) => f.severity === 'HIGH').length} High
            </div>
            <div className="px-2 py-1 bg-yellow-100 text-yellow-800 font-bold rounded border border-yellow-300">
              {findings.filter((f) => f.severity === 'MEDIUM').length} Medium
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-4 border-t border-slate-100 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-500">Severity:</span>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-2.5 py-1 rounded font-medium transition cursor-pointer ${
                  selectedSeverity === sev
                    ? 'bg-[#362486] text-[#00E96E] font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-1">
            <span className="font-semibold text-slate-500">Category:</span>
            {['ALL', 'QUANTITY', 'FINANCIAL', 'DOCUMENT_GAP', 'SCHEDULE'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded font-medium whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#362486] text-[#00E96E] font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Findings List */}
      <div className="space-y-4">
        {filteredFindings.map((finding) => {
          const isExpanded = expandedFindingId === finding.id;

          return (
            <div
              key={finding.id}
              className={`bg-white rounded-xl border transition-all shadow-xs ${
                finding.severity === 'CRITICAL'
                  ? 'border-rose-300'
                  : finding.severity === 'HIGH'
                  ? 'border-[#362486]/40'
                  : 'border-slate-200'
              }`}
            >
              {/* Card Header: Click to expand / collapse */}
              <div
                onClick={() => setExpandedFindingId(isExpanded ? null : finding.id)}
                className="p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/70 transition rounded-t-xl"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getSeverityBadge(finding.severity)}
                    {getCategoryBadge(finding.category)}
                    <span className="text-[11px] font-mono text-slate-400">
                      Rule: {finding.ruleId}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      Confidence: {finding.confidence}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    {finding.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {finding.description}
                  </p>
                </div>

                <div className="flex items-center space-x-3 text-xs font-semibold text-slate-700">
                  <span className="text-slate-500 font-mono text-[11px]">
                    {finding.evidence.length} Evidence Records
                  </span>
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                    {isExpanded ? '−' : '+'}
                  </div>
                </div>
              </div>

              {/* Expanded Detail Panel */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-100 space-y-5 text-xs text-slate-800">
                  {/* Layer Distinction Callout */}
                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                    <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                      <Bookmark className="w-4 h-4 text-[#362486]" />
                      <span>Why This Finding Matters</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                      {finding.whyItMatters}
                    </p>
                  </div>

                  {/* Deterministic Calculation Box (if present) */}
                  {finding.calculation && (
                    <div className="bg-[#f1effb] p-4 rounded-lg border border-[#cdc6f2] space-y-2">
                      <div className="flex items-center space-x-2 text-[#362486] font-bold text-xs uppercase tracking-wide">
                        <Calculator className="w-4 h-4 text-[#362486]" />
                        <span>Deterministic Mathematical Reconciliation</span>
                      </div>

                      <div className="font-mono text-xs font-bold text-slate-900 bg-white/90 p-2.5 rounded border border-[#cdc6f2]">
                        {finding.calculation.formula}
                      </div>

                      <div className="text-slate-800 font-medium">
                        <span className="font-bold text-[#362486]">Computed Variance: </span>
                        {finding.calculation.result}
                      </div>

                      <p className="text-[11px] text-slate-600 italic">
                        {finding.calculation.explanation}
                      </p>
                    </div>
                  )}

                  {/* Traceable Evidence Grid */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                        <FileSearch className="w-4 h-4 text-slate-600" />
                        <span>Traceable Document Evidence ({finding.evidence.length} sources)</span>
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Click any document to inspect original source page & excerpt
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {finding.evidence.map((ev, idx) => (
                        <div
                          key={idx}
                          onClick={() => onOpenEvidenceDoc(ev.sourceDocId, ev.pageNumber)}
                          className="bg-white p-3.5 rounded-lg border border-slate-200 hover:border-[#362486] hover:shadow-xs transition cursor-pointer flex flex-col justify-between group"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                {ev.label}
                              </span>
                              <span className="text-[11px] font-mono font-bold text-[#362486]">
                                Page {ev.pageNumber}
                              </span>
                            </div>

                            <div className="font-bold text-slate-900 text-sm">
                              {ev.value}
                            </div>

                            <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded border border-slate-100 leading-relaxed">
                              "{ev.excerpt}"
                            </p>
                          </div>

                          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                            <span className="truncate font-medium">{ev.sourceDocTitle}</span>
                            <span className="flex items-center space-x-1 text-[#362486] font-semibold group-hover:underline flex-shrink-0 ml-2">
                              <span>Inspect</span>
                              <ExternalLink className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Action & Chat Trigger Footer */}
                  <div className="bg-[#362486] text-white p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div className="space-y-0.5">
                      <div className="text-[11px] font-mono text-[#00E96E] font-bold uppercase tracking-wider">
                        Recommended Action
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed max-w-2xl">
                        {finding.recommendedAction}
                      </p>
                    </div>

                    <button
                      id={`ask-about-finding-${finding.id}`}
                      onClick={() => onAskAboutFinding(finding)}
                      className="flex items-center space-x-1.5 bg-[#00E96E] hover:bg-[#00d062] text-slate-950 font-bold px-3.5 py-2 rounded-lg text-xs transition whitespace-nowrap cursor-pointer shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Investigate with Oju</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredFindings.length === 0 && (
          <div className="py-12 text-center bg-white rounded-xl border border-slate-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-800">No discrepancies match criteria</p>
            <p className="text-xs text-slate-500 mt-1">
              Reset your severity or category filters to view all audited issues.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
