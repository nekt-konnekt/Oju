import React, { useState, useEffect } from 'react';
import { X, Building2, ArrowRight } from 'lucide-react';
import { ConstructionProject } from '../types';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (project: ConstructionProject) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
}) => {
  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [contractor, setContractor] = useState('');
  const [location, setLocation] = useState('');

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProject: ConstructionProject = {
      id: `proj-${Date.now()}`,
      name: name.trim(),
      client: client.trim() || 'Client / Employer',
      contractor: contractor.trim() || 'Principal Contractor',
      location: location.trim() || 'Site Location',
      startDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      documents: [],
      findings: [],
      memory: {
        boqItems: [],
        purchaseOrders: [],
        deliveries: [],
        siteReports: [],
        invoices: [],
        paymentCertificates: [],
        variations: [],
        drawings: [],
        scheduleActivities: [],
        relationships: [],
      },
    };

    onCreateProject(newProject);
    setName('');
    setClient('');
    setContractor('');
    setLocation('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with #362486 and #00E96E */}
        <div className="p-5 bg-[#362486] text-white flex items-center justify-between border-b border-[#2a1a6f]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 ring-1 ring-[#00E96E]/50 text-[#00E96E] flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Create New Project</h3>
              <p className="text-xs text-slate-300">Start fresh and let Oju analyze its documents</p>
            </div>
          </div>
          <button
            id="close-create-project-modal"
            aria-label="Close create project modal"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Project Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ikoyi Luxury Apartments"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#362486] focus:border-[#362486]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Client / Employer
              </label>
              <input
                type="text"
                placeholder="e.g. Zenith Holdings"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#362486] focus:border-[#362486]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Contractor
              </label>
              <input
                type="text"
                placeholder="e.g. Apex Buildtech"
                value={contractor}
                onChange={(e) => setContractor(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#362486] focus:border-[#362486]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Site Location
            </label>
            <input
              type="text"
              placeholder="e.g. Victoria Island, Lagos"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#362486] focus:border-[#362486]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#362486] hover:bg-[#2a1a6f] text-white font-bold px-5 py-2.5 rounded-xl text-sm transition flex items-center space-x-2 cursor-pointer shadow-xs ring-1 ring-[#00E96E]/20"
            >
              <span>Create Project</span>
              <ArrowRight className="w-4 h-4 text-[#00E96E]" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
