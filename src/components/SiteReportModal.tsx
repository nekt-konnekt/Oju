import React, { useState, useEffect } from 'react';
import {
  X,
  FileCheck,
  Camera,
  Mic,
  MicOff,
  Loader2,
  Calendar,
  Sun,
} from 'lucide-react';
import { SiteReport, ProjectDocument } from '../types';

interface SiteReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSiteReport: (report: SiteReport, doc: ProjectDocument) => void;
}

export const SiteReportModal: React.FC<SiteReportModalProps> = ({
  isOpen,
  onClose,
  onSaveSiteReport,
}) => {
  const [reportDate, setReportDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [weather, setWeather] = useState<string>('Sunny, 29°C');
  const [siteNotes, setSiteNotes] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [photoCount, setPhotoCount] = useState<number>(0);
  const [isListening, setIsListening] = useState<boolean>(false);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isProcessing) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isProcessing]);

  if (!isOpen) return null;

  // Preset for quick demonstration
  const handleLoadDemoNotes = () => {
    setSiteNotes(
      `Work completed today:
- Blockwork on Level 2 completed (living room & corridor walls).
- Electrical first fix ongoing on Block A (conduit piping laid).

Materials received:
- 320 vibrated sandcrete blocks delivered by TopTier Blocks (Delivery Waybill #TT-881).
- 25 bags Dangote Portland cement delivered and stacked in dry store.

Issues & Blockers:
- Still waiting for architect signature on Electrical Drawing Revision 03 before second floor conduits can be cast into slab.
- Plumbing contractor delayed due to heavy rain in early morning.`
    );
    setPhotoCount(3);
  };

  const handleSpeechToggle = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser window. You can type your notes directly.');
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    if (!isListening) {
      setIsListening(true);
      recognition.start();
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSiteNotes((prev) => (prev ? `${prev}\n${transcript}` : transcript));
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    } else {
      setIsListening(false);
      recognition.stop();
    }
  };

  const handleGenerateAndSave = () => {
    if (!siteNotes.trim()) return;
    setIsProcessing(true);

    const reportId = `report-${Date.now()}`;
    const docId = `DOC-SR-${Date.now()}`;

    // Simple parsing of lines
    const lines = siteNotes.split('\n').filter((l) => l.trim().length > 0);
    const workItems: string[] = [];
    const materialItems: Array<{ materialName: string; quantityReceived: number; unit: string; supplier?: string }> = [];
    const issueItems: string[] = [];

    let currentSection = 'work';
    lines.forEach((l) => {
      const lower = l.toLowerCase();
      if (lower.includes('work') || lower.includes('completed')) {
        currentSection = 'work';
      } else if (lower.includes('material') || lower.includes('received') || lower.includes('delivered')) {
        currentSection = 'material';
      } else if (lower.includes('issue') || lower.includes('block') || lower.includes('waiting') || lower.includes('delay')) {
        currentSection = 'issue';
      } else {
        const clean = l.replace(/^[-•*]\s*/, '').trim();
        if (currentSection === 'work') {
          workItems.push(clean);
        } else if (currentSection === 'material') {
          const match = clean.match(/(\d+(?:\.\d+)?)\s*(blocks|bags|tonnes|m²|m³|units|bundles)/i);
          materialItems.push({
            materialName: clean,
            quantityReceived: match ? parseFloat(match[1]) : 1,
            unit: match ? match[2] : 'item',
            supplier: 'Site Supplier',
          });
        } else if (currentSection === 'issue') {
          issueItems.push(clean);
        }
      }
    });

    const structuredReport: SiteReport = {
      id: reportId,
      reportNumber: `DSR-${reportDate.replace(/-/g, '')}`,
      date: reportDate,
      author: 'Site Supervisor',
      weather,
      activities: (workItems.length > 0 ? workItems : [siteNotes.slice(0, 100)]).map((w) => ({
        description: w,
        trade: 'General',
        percentageProgress: 10,
      })),
      workCompleted: workItems.length > 0 ? workItems : [siteNotes.slice(0, 100)],
      materialsReceived: materialItems,
      issuesFlagged: issueItems.length > 0 ? issueItems : ['No critical delays noted today.'],
      sourceDocId: docId,
      pageNumber: 1,
    };

    const doc: ProjectDocument = {
      id: docId,
      title: `Daily Site Report - ${reportDate}`,
      referenceNumber: `DSR-${reportDate.replace(/-/g, '')}`,
      category: 'Site Report',
      date: reportDate,
      uploadDate: new Date().toISOString().split('T')[0],
      fileSize: '120 KB',
      pageCount: 1,
      issuerCompany: 'Site Supervisor',
      recipientCompany: 'Project Director',
      status: 'PROCESSED',
      rawTextExcerpt: siteNotes.slice(0, 300),
      pages: [
        {
          pageNumber: 1,
          content: `DAILY SITE REPORT - ${reportDate}\nWeather: ${weather}\n\n${siteNotes}`,
        },
      ],
      extractedEntitiesCount: {
        quantities: materialItems.length + 2,
        financials: 0,
        references: 1,
        dates: 1,
      },
    };

    setTimeout(() => {
      onSaveSiteReport(structuredReport, doc);
      setIsProcessing(false);
      onClose();
    }, 400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg flex flex-col overflow-hidden animate-in fade-in duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with #362486 and #00E96E */}
        <div className="bg-[#362486] text-white p-4 sm:px-6 flex items-center justify-between border-b border-[#2a1a6f]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 ring-1 ring-[#00E96E]/50 flex items-center justify-center text-[#00E96E] font-black">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Add Site Report</h2>
              <p className="text-xs text-slate-300">
                What happened on site today? Oju will structure it.
              </p>
            </div>
          </div>

          <button
            id="close-site-report-modal"
            aria-label="Close site report modal"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            disabled={isProcessing}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              What happened on site today?
            </label>
            <button
              type="button"
              onClick={handleLoadDemoNotes}
              className="text-[11px] font-semibold text-[#362486] hover:text-[#2a1a6f] bg-[#f1effb] hover:bg-[#e4dffa] px-2.5 py-1 rounded-md border border-[#cdc6f2] transition cursor-pointer"
            >
              Fill example report
            </button>
          </div>

          {/* Quick Date and Weather */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 flex items-center space-x-1">
                <Calendar className="w-3 h-3 text-[#362486]" />
                <span>Date</span>
              </span>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-[#362486] bg-white"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 flex items-center space-x-1">
                <Sun className="w-3 h-3 text-[#362486]" />
                <span>Weather / Conditions</span>
              </span>
              <input
                type="text"
                value={weather}
                onChange={(e) => setWeather(e.target.value)}
                placeholder="e.g. Clear, 30°C"
                className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-[#362486] bg-white"
              />
            </div>
          </div>

          {/* Notes Textarea */}
          <div className="relative">
            <textarea
              rows={6}
              value={siteNotes}
              onChange={(e) => setSiteNotes(e.target.value)}
              placeholder="Type or speak what happened... 
• Work completed (e.g. Blockwork on Level 2)
• Materials received (e.g. 320 blocks, 25 bags cement)
• Issues or blockers (e.g. Waiting on architect approval)"
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-[#362486] font-mono leading-relaxed"
            />

            {/* Voice dictate button */}
            <button
              type="button"
              onClick={handleSpeechToggle}
              title="Dictate with voice"
              className={`absolute bottom-3 right-3 p-1.5 rounded-lg border transition cursor-pointer flex items-center space-x-1 text-xs ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                  : 'bg-white text-slate-600 hover:text-[#362486] border-slate-200 hover:bg-slate-50'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold">Listening...</span>
                </>
              ) : (
                <Mic className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Photos Upload row */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center space-x-2">
              <Camera className="w-4 h-4 text-[#362486]" />
              <span className="text-slate-700 font-medium">
                {photoCount > 0 ? `${photoCount} photo(s) attached` : 'Attach site photos'}
              </span>
            </div>
            <label className="bg-white hover:bg-slate-100 text-[#362486] font-semibold px-2.5 py-1 rounded-lg border border-slate-300 transition cursor-pointer text-[11px]">
              <span>+ Add Photos</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files) {
                    setPhotoCount(e.target.files.length);
                  }
                }}
                className="hidden"
              />
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={!siteNotes.trim() || isProcessing}
              onClick={handleGenerateAndSave}
              className="bg-[#362486] hover:bg-[#2a1a6f] disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg text-xs transition cursor-pointer flex items-center space-x-1.5 shadow-xs ring-1 ring-[#00E96E]/20"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00E96E]" />
                  <span>Structuring Report...</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-3.5 h-3.5 text-[#00E96E]" />
                  <span>Save Site Report</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
