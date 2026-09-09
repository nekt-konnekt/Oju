import React, { useState } from 'react';
import {
  FileText,
  TrendingUp,
  Plus,
  ExternalLink,
  Search,
  CheckCircle,
} from 'lucide-react';
import { ConstructionProject, Finding } from '../types';

type ProjectSection = 'documents' | 'memory' | 'reports' | 'issues';

interface ProjectViewProps {
  project: ConstructionProject;
  onOpenDocument: (documentId: string, pageNumber?: number, highlightText?: string) => void;
  onOpenUpload: () => void;
  onOpenSiteReport: () => void;
  onSelectFinding: (finding: Finding) => void;
}

export const ProjectView: React.FC<ProjectViewProps> = ({
  project,
  onOpenDocument,
  onOpenUpload,
  onOpenSiteReport,
  onSelectFinding,
}) => {
  const [activeSection, setActiveSection] = useState<ProjectSection>('documents');
  const [docCategoryFilter, setDocCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredDocs = project.documents.filter((d) => {
    const matchesCat = docCategoryFilter === 'ALL' || d.category === docCategoryFilter;
    const matchesSearch =
      searchQuery === '' ||
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.referenceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.issuerCompany?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const reportCount = project.memory.siteReports?.length || 0;
  const drawingCount = project.memory.drawings?.length || 0;
  const issues = project.issues || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Project Header Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#362486] bg-[#362486]/5 px-2.5 py-0.5 rounded-full border border-[#362486]/20 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E96E]" />
                <span>Active Project</span>
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Started {project.startDate}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {project.name}
            </h1>
            <p className="text-xs text-slate-500">
              {project.location} • Client: <strong className="text-slate-700">{project.client}</strong> • Contractor: <strong className="text-slate-700">{project.contractor}</strong>
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={onOpenUpload}
              className="bg-[#362486] hover:bg-[#2a1a6f] text-white font-bold px-3.5 py-2 rounded-xl text-xs transition cursor-pointer flex items-center space-x-1.5 shadow-xs ring-1 ring-[#00E96E]/20"
            >
              <Plus className="w-3.5 h-3.5 text-[#00E96E]" />
              <span>+ Add files</span>
            </button>
            <button
              onClick={onOpenSiteReport}
              className="bg-white hover:bg-[#f1effb]/50 text-[#362486] font-bold px-3.5 py-2 rounded-xl text-xs border border-slate-300 transition cursor-pointer flex items-center space-x-1.5 shadow-2xs"
            >
              <TrendingUp className="w-3.5 h-3.5 text-[#00E96E]" />
              <span>+ Site report</span>
            </button>
          </div>
        </div>

        {/* High-level stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 text-center">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-lg font-black text-[#362486]">{project.documents.length}</div>
            <div className="text-[11px] font-semibold text-slate-500">Source Documents</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-lg font-black text-[#362486]">{reportCount}</div>
            <div className="text-[11px] font-semibold text-slate-500">Daily Site Reports</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-lg font-black text-[#362486]">{drawingCount}</div>
            <div className="text-[11px] font-semibold text-slate-500">Approved Drawings</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-lg font-black text-[#362486] flex items-center justify-center space-x-1">
              <span>{project.findings.length}</span>
              <span className="w-2 h-2 rounded-full bg-[#00E96E]" />
            </div>
            <div className="text-[11px] font-semibold text-slate-500">Items Flagged</div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation for Project Area */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1 shadow-2xs">
        <button
          onClick={() => setActiveSection('documents')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
            activeSection === 'documents'
              ? 'bg-[#362486] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Documents ({project.documents.length})
        </button>

        <button
          onClick={() => setActiveSection('memory')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
            activeSection === 'memory'
              ? 'bg-[#362486] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Quantities & Reconciliation
        </button>

        <button
          onClick={() => setActiveSection('reports')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
            activeSection === 'reports'
              ? 'bg-[#362486] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Site Reports ({reportCount})
        </button>

        <button
          onClick={() => setActiveSection('issues')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
            activeSection === 'issues'
              ? 'bg-[#362486] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Action Log ({issues.length})
        </button>
      </div>

      {/* SECTION 1: ALL DOCUMENTS */}
      {activeSection === 'documents' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search documents or refs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#362486]"
              />
            </div>

            <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs font-semibold">
              {['ALL', 'Contract', 'BOQ', 'Drawing', 'Invoice', 'Delivery Note', 'Site Report'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setDocCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer whitespace-nowrap text-[11px] ${
                    docCategoryFilter === cat
                      ? 'bg-[#362486] text-[#00E96E] font-bold shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {filteredDocs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No documents found. Click "+ Add files" above to upload your first project documents.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => onOpenDocument(doc.id, 1, doc.rawTextExcerpt?.slice(0, 100))}
                  className="py-3 px-2 flex items-center justify-between hover:bg-slate-50 rounded-xl transition cursor-pointer group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-[#362486]/10 border border-[#362486]/20 flex items-center justify-center text-[#362486] shrink-0 group-hover:bg-[#362486] group-hover:text-[#00E96E] transition">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-[#362486] transition">
                        {doc.title}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center space-x-1.5 font-mono">
                        <span className="font-semibold text-slate-700">{doc.category}</span>
                        <span>•</span>
                        <span>{doc.referenceNumber || 'No Ref'}</span>
                        <span>•</span>
                        <span>{doc.date}</span>
                        <span>•</span>
                        <span>{doc.fileSize}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 group-hover:bg-[#362486] group-hover:text-[#00E96E] transition">
                      View Evidence
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#362486]" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: QUANTITIES & RECONCILIATION */}
      {activeSection === 'memory' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-slate-900">
              Material Reconciliation (BOQ vs Deliveries vs Site Installed)
            </h2>
            <p className="text-xs text-slate-500">
              Oju cross-references tender quantities against physical delivery waybills and daily site reports.
            </p>
          </div>

          <div className="space-y-4">
            {project.memory.boqItems.map((boq) => {
              const matchingDeliveries = project.memory.deliveries.filter(
                (d) => d.materialName.toLowerCase().includes(boq.itemDescription.slice(0, 8).toLowerCase())
              );
              const totalDelivered = matchingDeliveries.reduce((sum, d) => sum + d.quantityReceived, 0);

              return (
                <div key={boq.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{boq.itemDescription}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        BOQ Code: {boq.itemCode} • Rate: ₦{boq.unitRate.toLocaleString()} / {boq.unit}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#362486]">
                      Tender Total: ₦{boq.totalAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/80 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Tender BOQ</span>
                      <strong className="text-slate-800">{boq.quantity} {boq.unit}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Delivered on Site</span>
                      <strong className={totalDelivered > 0 ? 'text-slate-800' : 'text-[#362486]'}>
                        {totalDelivered > 0 ? `${totalDelivered} ${boq.unit}` : '0 recorded'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
                      <strong className="text-[#007a38] font-bold flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00E96E]" />
                        <span>Active</span>
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: SITE REPORTS */}
      {activeSection === 'reports' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Daily Site Reports History</h2>
              <p className="text-xs text-slate-500">
                Timeline of site activities, material arrivals, and site blockers.
              </p>
            </div>
            <button
              onClick={onOpenSiteReport}
              className="bg-[#362486] hover:bg-[#2a1a6f] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-[#00E96E]" />
              <span>+ Add Report</span>
            </button>
          </div>

          {project.memory.siteReports.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">
              No site reports recorded yet. Click "+ Add Report" to log today's progress.
            </div>
          ) : (
            <div className="space-y-4">
              {project.memory.siteReports.map((rep) => (
                <div key={rep.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-[#362486]" />
                      <span className="text-xs font-bold text-slate-900">
                        Daily Report — {rep.date || rep.reportNumber}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Weather: {rep.weather}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-bold text-slate-700">Work Completed / Activities:</span>
                      <ul className="list-disc pl-5 mt-1 text-slate-600 space-y-0.5">
                        {(rep.workCompleted || rep.activities?.map((a) => a.description) || ['Site work ongoing']).map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>

                    {rep.materialsReceived && rep.materialsReceived.length > 0 && (
                      <div>
                        <span className="font-bold text-slate-700">Materials Received:</span>
                        <ul className="list-disc pl-5 mt-1 text-slate-600 space-y-0.5">
                          {rep.materialsReceived.map((m, i) => (
                            <li key={i}>
                              {m.materialName} ({m.quantityReceived} {m.unit})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {rep.issuesFlagged && rep.issuesFlagged.length > 0 && (
                      <div className="p-2.5 rounded-lg bg-[#f1effb] border border-[#cdc6f2] text-slate-900">
                        <span className="font-bold text-[#362486]">Issues Flagged:</span> {rep.issuesFlagged.join('; ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 4: ACTION LOG & ISSUES */}
      {activeSection === 'issues' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-slate-900">Action & Decisions Audit Trail</h2>
            <p className="text-xs text-slate-500">
              Tasks created and decisions made regarding discrepancies and project items.
            </p>
          </div>

          {issues.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">
              No project issues or tasks created yet. Click on any finding in Home to create an issue.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {issues.map((iss) => (
                <div key={iss.id} className="py-3 px-2 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-900">{iss.title}</div>
                    <div className="text-[11px] text-slate-500 flex items-center space-x-2 font-mono">
                      <span>Assigned to: {iss.assignedTo}</span>
                      <span>•</span>
                      <span>Due: {iss.dueDate}</span>
                      <span>•</span>
                      <span className="text-[#007a38] font-bold">{iss.status}</span>
                    </div>
                  </div>
                  <CheckCircle className="w-4 h-4 text-[#00E96E]" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
