import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Link2,
  Table,
  AlertCircle,
} from 'lucide-react';
import { ProjectMemory, EntityRelationship } from '../types';

interface ProjectMemoryViewProps {
  memory: ProjectMemory;
  onOpenDocument?: (docId: string, pageNumber: number) => void;
}

export const ProjectMemoryView: React.FC<ProjectMemoryViewProps> = ({
  memory,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'relationships' | 'entities'>('relationships');
  const [activeEntityTab, setActiveEntityTab] = useState<
    'boq' | 'pos' | 'deliveries' | 'invoices' | 'site' | 'payments' | 'variations'
  >('boq');

  const getRelationshipStatusBadge = (status: EntityRelationship['status']) => {
    switch (status) {
      case 'MATCHED':
        return (
          <span className="flex items-center space-x-1 text-[11px] font-bold px-2 py-0.5 rounded bg-[#e6fcf0] text-[#007a38] border border-[#a3f7c7]">
            <CheckCircle className="w-3 h-3 text-[#00E96E]" />
            <span>RECONCILED</span>
          </span>
        );
      case 'DISCREPANCY':
        return (
          <span className="flex items-center space-x-1 text-[11px] font-bold px-2 py-0.5 rounded bg-[#f1effb] text-[#362486] border border-[#cdc6f2]">
            <AlertTriangle className="w-3 h-3 text-[#362486]" />
            <span>DISCREPANCY</span>
          </span>
        );
      case 'MISSING_LINK':
        return (
          <span className="flex items-center space-x-1 text-[11px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            <span>MISSING LINK</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold uppercase text-[#362486] tracking-wider">
                Structured Data Model
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500">Separation of Data from Reasoning</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              Structured Project Memory & Relationships
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              Project facts are normalized as relational entities rather than buried inside LLM prompts.
              Relationships across BOQs, POs, deliveries, invoices, and site diaries are rigorously mapped and tracked.
            </p>
          </div>

          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setActiveSubTab('relationships')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-semibold transition cursor-pointer ${
                activeSubTab === 'relationships'
                  ? 'bg-[#362486] text-[#00E96E] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Entity Relationships ({memory.relationships.length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('entities')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-semibold transition cursor-pointer ${
                activeSubTab === 'entities'
                  ? 'bg-[#362486] text-[#00E96E] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Entity Tables</span>
            </button>
          </div>
        </div>
      </div>

      {/* View 1: Relationships */}
      {activeSubTab === 'relationships' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {memory.relationships.map((rel) => (
              <div
                key={rel.id}
                className="bg-white p-4 rounded-xl border border-slate-200 hover:border-[#362486] hover:shadow-xs transition space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {rel.relationType.replace(/_/g, ' ')}
                  </span>
                  {getRelationshipStatusBadge(rel.status)}
                </div>

                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Source</span>
                    <div className="font-bold text-slate-900">{rel.sourceLabel}</div>
                    <span className="text-[10px] font-mono text-slate-500">{rel.sourceType}</span>
                  </div>

                  <ArrowRight className="w-4 h-4 text-[#362486] mx-2 shrink-0" />

                  <div className="space-y-0.5 text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Target</span>
                    <div className="font-bold text-slate-900">{rel.targetLabel}</div>
                    <span className="text-[10px] font-mono text-slate-500">{rel.targetType}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 italic bg-[#f1effb] p-2.5 rounded border border-[#cdc6f2]">
                  <span className="font-semibold text-[#362486]">Audit Observation: </span>
                  {rel.notes}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View 2: Entity Tables */}
      {activeSubTab === 'entities' && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 text-xs overflow-x-auto">
            {[
              { id: 'boq', label: `BOQ Items (${memory.boqItems.length})` },
              { id: 'pos', label: `Purchase Orders (${memory.purchaseOrders.length})` },
              { id: 'deliveries', label: `Deliveries (${memory.deliveries.length})` },
              { id: 'invoices', label: `Invoices (${memory.invoices.length})` },
              { id: 'site', label: `Site Reports (${memory.siteReports.length})` },
              { id: 'payments', label: `Payment Certs (${memory.paymentCertificates.length})` },
              { id: 'variations', label: `Variations (${memory.variations.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveEntityTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition cursor-pointer ${
                  activeEntityTab === tab.id
                    ? 'bg-[#362486] text-[#00E96E] font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Render Active Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            {activeEntityTab === 'boq' && (
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3">Item Code</th>
                    <th className="p-3">Material / Description</th>
                    <th className="p-3">Quantity</th>
                    <th className="p-3">Unit</th>
                    <th className="p-3">Rate (NGN)</th>
                    <th className="p-3">Amount (NGN)</th>
                    <th className="p-3">Page</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {memory.boqItems.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-mono font-bold text-[#362486]">{b.itemCode}</td>
                      <td className="p-3 font-medium text-slate-900">{b.description}</td>
                      <td className="p-3 font-bold">{b.quantity.toLocaleString()}</td>
                      <td className="p-3 text-slate-500">{b.unit}</td>
                      <td className="p-3 font-mono">₦{b.rate.toLocaleString()}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">
                        ₦{b.amount.toLocaleString()}
                      </td>
                      <td className="p-3 font-mono text-slate-500">Page {b.pageNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeEntityTab === 'pos' && (
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3">PO Number</th>
                    <th className="p-3">Vendor</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Items</th>
                    <th className="p-3">Total Value</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {memory.purchaseOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-mono font-bold text-slate-900">{po.poNumber}</td>
                      <td className="p-3 font-medium">{po.vendor}</td>
                      <td className="p-3 text-slate-500">{po.date}</td>
                      <td className="p-3">
                        {po.items.map((it, i) => (
                          <div key={i} className="text-slate-700">
                            {it.quantity} {it.unit} of {it.material}
                          </div>
                        ))}
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-900">
                        ₦{po.totalAmount.toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {po.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeEntityTab === 'deliveries' && (
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3">Delivery Docket</th>
                    <th className="p-3">Supplier</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">PO Reference</th>
                    <th className="p-3">Delivered Material</th>
                    <th className="p-3">Site Receiver</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {memory.deliveries.map((del) => (
                    <tr key={del.id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-mono font-bold text-slate-900">
                        {del.deliveryNoteNumber}
                      </td>
                      <td className="p-3 font-medium">{del.supplier}</td>
                      <td className="p-3 text-slate-500">{del.date}</td>
                      <td className="p-3 font-mono text-[#362486] font-bold">{del.poReference}</td>
                      <td className="p-3 font-bold text-slate-900">
                        {del.items.map((it) => `${it.quantity} ${it.unit} of ${it.material}`).join(', ')}
                      </td>
                      <td className="p-3 text-slate-600">{del.receiver}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeEntityTab === 'invoices' && (
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3">Invoice Number</th>
                    <th className="p-3">Vendor</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">PO Reference</th>
                    <th className="p-3">Total Amount (NGN)</th>
                    <th className="p-3">Payment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {memory.invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                      <td className="p-3 font-medium">{inv.vendor}</td>
                      <td className="p-3 text-slate-500">{inv.date}</td>
                      <td className="p-3 font-mono text-slate-500">{inv.poReference || 'None'}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">
                        ₦{inv.totalAmount.toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            inv.paymentStatus === 'DISPUTED'
                              ? 'bg-rose-100 text-rose-800'
                              : inv.paymentStatus === 'CLAIMED'
                              ? 'bg-[#f1effb] text-[#362486]'
                              : 'bg-[#e6fcf0] text-[#007a38]'
                          }`}
                        >
                          {inv.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeEntityTab === 'site' && (
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3">Report Number</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Author</th>
                    <th className="p-3">Trade / Activity</th>
                    <th className="p-3">Documented Installation</th>
                    <th className="p-3">Referenced Drawings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {memory.siteReports.map((sr) => (
                    <tr key={sr.id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-mono font-bold text-slate-900">{sr.reportNumber}</td>
                      <td className="p-3 text-slate-500">{sr.date}</td>
                      <td className="p-3 font-medium">{sr.author}</td>
                      <td className="p-3">
                        {sr.activities.map((a, i) => (
                          <div key={i} className="text-slate-800">
                            <span className="font-semibold text-slate-900">[{a.trade}]</span>{' '}
                            {a.description}
                          </div>
                        ))}
                      </td>
                      <td className="p-3 font-mono font-bold text-[#362486]">
                        {sr.activities
                          .filter((a) => a.quantityInstalled)
                          .map((a) => `${a.quantityInstalled} ${a.unit}`)
                          .join(', ') || 'N/A'}
                      </td>
                      <td className="p-3 font-mono text-slate-600">
                        {sr.referencedDrawings?.join(', ') || 'Standard'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeEntityTab === 'payments' && (
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3">Certificate</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Gross Valuation</th>
                    <th className="p-3">Retention Rate</th>
                    <th className="p-3">Retention Deducted</th>
                    <th className="p-3">Net Payable</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {memory.paymentCertificates.map((pc) => (
                    <tr key={pc.id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-mono font-bold text-slate-900">
                        {pc.certificateNumber}
                      </td>
                      <td className="p-3 text-slate-500">{pc.date}</td>
                      <td className="p-3 font-mono font-bold">
                        ₦{pc.grossValuation.toLocaleString()}
                      </td>
                      <td className="p-3 font-mono text-[#362486] font-bold">
                        {pc.retentionRatePct}%
                      </td>
                      <td className="p-3 font-mono">₦{pc.retentionDeduction.toLocaleString()}</td>
                      <td className="p-3 font-mono font-bold text-[#007a38]">
                        ₦{pc.netPayable.toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {pc.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeEntityTab === 'variations' && (
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3">Variation Ref</th>
                    <th className="p-3">Title & Scope</th>
                    <th className="p-3">Claimed Amount</th>
                    <th className="p-3">Approved Amount</th>
                    <th className="p-3">Time Impact</th>
                    <th className="p-3">Approval Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {memory.variations.map((vo) => (
                    <tr key={vo.id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-mono font-bold text-slate-900">
                        {vo.variationNumber}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{vo.title}</div>
                        <div className="text-[11px] text-slate-500">{vo.description}</div>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-900">
                        ₦{vo.claimedAmount.toLocaleString()}
                      </td>
                      <td className="p-3 font-mono font-bold text-[#007a38]">
                        {vo.approvedAmount ? `₦${vo.approvedAmount.toLocaleString()}` : '₦0'}
                      </td>
                      <td className="p-3 font-mono">{vo.timeImpactDays} days</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            vo.status === 'APPROVED'
                              ? 'bg-[#e6fcf0] text-[#007a38]'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {vo.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
