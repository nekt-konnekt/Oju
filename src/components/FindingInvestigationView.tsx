import React, { useState } from 'react';
import {
  ArrowLeft,
  FileText,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  ExternalLink,
  Info,
  Calculator,
  PlusCircle,
} from 'lucide-react';
import { Finding, ProjectDocument } from '../types';

interface FindingInvestigationViewProps {
  finding: Finding;
  documents: ProjectDocument[];
  onBack: () => void;
  onOpenDocument: (docId: string, page?: number, highlightText?: string) => void;
  onAskAboutFinding: (question: string) => void;
  onResolveFinding: (findingId: string) => void;
  onCreateIssue: (finding: Finding) => void;
}

export const FindingInvestigationView: React.FC<FindingInvestigationViewProps> = ({
  finding,
  documents,
  onBack,
  onOpenDocument,
  onAskAboutFinding,
  onResolveFinding,
  onCreateIssue,
}) => {
  const [isResolved, setIsResolved] = useState(finding.status === 'RESOLVED');

  const handleResolve = () => {
    setIsResolved(true);
    onResolveFinding(finding.id);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Back button */}
      <button
        id="btn-back-from-finding"
        onClick={onBack}
        className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-[#362486] transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      {/* Main Investigation Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Header Bar */}
        <div className="p-6 sm:p-8 border-b border-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#362486]/10 text-[#362486] border border-[#362486]/20">
                {finding.category.replace('_', ' ')}
              </span>
              <span className="text-[11px] font-bold text-slate-500">
                Confidence: {finding.confidence}
              </span>
            </div>

            {isResolved ? (
              <span className="inline-flex items-center space-x-1 text-xs font-bold text-[#007a38] bg-[#e6fcf0] px-3 py-1 rounded-full border border-[#a3f7c7]">
                <CheckCircle className="w-3.5 h-3.5 text-[#00E96E]" />
                <span>Marked as Resolved</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#362486] bg-[#362486]/5 px-3 py-1 rounded-full border border-[#362486]/15">
                <span className="w-2 h-2 rounded-full bg-[#00E96E] animate-ping" />
                <span>Needs Your Review</span>
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {finding.title}
          </h1>

          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            {finding.description}
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-8 divide-y divide-slate-100">
          {/* Section: WHAT I FOUND */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              What I Found
            </h2>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 text-sm text-slate-800 leading-relaxed space-y-2">
              <p className="font-medium text-slate-900">
                {finding.description}
              </p>
              {finding.calculation && (
                <div className="mt-3 pt-3 border-t border-slate-200 flex items-start space-x-2.5">
                  <Calculator className="w-4 h-4 text-[#362486] mt-0.5 shrink-0" />
                  <div className="text-xs space-y-1">
                    <div className="font-mono text-slate-700 font-semibold">
                      Formula: {finding.calculation.formula}
                    </div>
                    <div className="font-bold text-[#362486]">
                      Discrepancy: {finding.calculation.result}
                    </div>
                    <div className="text-slate-600">
                      {finding.calculation.explanation}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Section: WHY THIS MATTERS */}
          <section className="pt-6 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Why This Matters
            </h2>
            <div className="flex items-start space-x-3 text-sm text-slate-700">
              <Info className="w-5 h-5 text-[#362486] mt-0.5 shrink-0" />
              <p className="leading-relaxed">
                {finding.whyItMatters}
              </p>
            </div>
          </section>

          {/* Section: WHY I'M FLAGGING THIS (EVIDENCE FIRST) */}
          <section className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Why I'm Flagging This (Document Evidence)
              </h2>
              <span className="text-xs text-slate-500">
                {finding.evidence.length} Source Document(s) Checked
              </span>
            </div>

            <div className="space-y-3">
              {finding.evidence.map((item, idx) => {
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-[#362486] hover:bg-[#f1effb]/20 hover:shadow-2xs transition group cursor-pointer"
                    onClick={() =>
                      onOpenDocument(item.sourceDocId, item.pageNumber, item.excerpt)
                    }
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-[#362486] shrink-0" />
                          <span className="font-bold text-sm text-slate-900 group-hover:text-[#362486] transition">
                            {item.sourceDocTitle}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-slate-500 font-mono">
                          <span>{item.documentCategory}</span>
                          {item.referenceNumber && (
                            <>
                              <span>•</span>
                              <span>Ref: {item.referenceNumber}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>Page {item.pageNumber}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 text-xs font-semibold text-[#362486] bg-[#362486]/10 px-2.5 py-1 rounded-lg border border-[#362486]/20 shrink-0">
                        <span>Review</span>
                        <ExternalLink className="w-3 h-3 text-[#00E96E]" />
                      </div>
                    </div>

                    <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs font-mono text-slate-700 leading-relaxed">
                      "{item.excerpt}"
                    </div>

                    <div className="mt-2 text-right">
                      <span className="text-[11px] font-semibold text-slate-500">
                        Extracted Value: <strong className="text-slate-900 font-bold">{item.value}</strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section: RECOMMENDED ACTION */}
          <section className="pt-6 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Oju's Recommended Action
            </h2>
            <p className="text-sm font-medium text-slate-800 bg-[#f1effb] p-4 rounded-xl border border-[#cdc6f2]">
              {finding.recommendedAction}
            </p>
          </section>

          {/* Section: WHAT YOU CAN DO (ACTIONS) */}
          <section className="pt-6 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              What You Can Do
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                id="btn-action-review-docs"
                onClick={() => {
                  if (finding.evidence.length > 0) {
                    const first = finding.evidence[0];
                    onOpenDocument(first.sourceDocId, first.pageNumber, first.excerpt);
                  }
                }}
                className="flex items-center justify-center space-x-2 bg-[#362486] hover:bg-[#2a1a6f] text-white font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer shadow-xs ring-1 ring-[#00E96E]/20"
              >
                <FileText className="w-4 h-4 text-[#00E96E]" />
                <span>Review Documents</span>
              </button>

              <button
                id="btn-action-ask-oju"
                onClick={() =>
                  onAskAboutFinding(
                    `Tell me more about this finding: "${finding.title}". Why does ${finding.evidence.map((e) => e.sourceDocTitle).join(' and ')} not match?`
                  )
                }
                className="flex items-center justify-center space-x-2 bg-white hover:bg-[#f1effb] text-[#362486] font-bold py-2.5 px-4 rounded-xl text-xs border border-slate-300 transition cursor-pointer shadow-2xs"
              >
                <MessageSquare className="w-4 h-4 text-[#00E96E]" />
                <span>Ask Oju About This</span>
              </button>

              <button
                id="btn-action-create-issue"
                onClick={() => onCreateIssue(finding)}
                className="flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 text-slate-800 font-bold py-2.5 px-4 rounded-xl text-xs border border-slate-300 transition cursor-pointer shadow-2xs"
              >
                <PlusCircle className="w-4 h-4 text-[#362486]" />
                <span>Create Project Issue / Task</span>
              </button>

              <button
                id="btn-action-resolve"
                onClick={handleResolve}
                disabled={isResolved}
                className={`flex items-center justify-center space-x-2 font-bold py-2.5 px-4 rounded-xl text-xs border transition cursor-pointer ${
                  isResolved
                    ? 'bg-[#e6fcf0] text-[#007a38] border-[#a3f7c7] opacity-80 cursor-default'
                    : 'bg-white hover:bg-[#e6fcf0] text-slate-700 hover:text-[#007a38] border-slate-300'
                }`}
              >
                <CheckCircle className="w-4 h-4 text-[#00E96E]" />
                <span>{isResolved ? 'Resolved' : 'Mark as Resolved'}</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
