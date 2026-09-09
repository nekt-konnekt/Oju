import React from 'react';
import {
  Building2,
  FileText,
  MessageSquare,
  Plus,
  RefreshCw,
  FolderPlus,
  Home,
} from 'lucide-react';

export type ActiveNavTab = 'home' | 'project' | 'ask';

interface HeaderProps {
  activeTab: ActiveNavTab;
  setActiveTab: (tab: ActiveNavTab) => void;
  projectName: string;
  totalFindings: number;
  onOpenUpload: () => void;
  onOpenSiteReport: () => void;
  onResetDemo: () => void;
  onNewProject: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  projectName,
  totalFindings,
  onOpenUpload,
  onOpenSiteReport,
  onResetDemo,
  onNewProject,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white text-slate-900 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand Identity with #362486 and #00E96E */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab('home')}
              className="flex items-center space-x-2.5 text-left cursor-pointer focus:outline-hidden group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#362486] flex items-center justify-center text-[#00E96E] font-black text-xl shadow-xs group-hover:bg-[#2a1a6f] transition ring-2 ring-[#00E96E]/30">
                O
              </div>
              <div className="leading-tight">
                <div className="flex items-center space-x-1.5">
                  <span className="font-black tracking-tight text-[#362486] text-base">
                    Oju
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    by Agba
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium tracking-tight">
                  Construction intelligence
                </div>
              </div>
            </button>

            <div className="hidden sm:block h-6 w-px bg-slate-200 ml-1" />

            {/* Current Project Badge & New Project Trigger */}
            <div className="hidden sm:flex items-center space-x-1.5 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 text-xs">
              <Building2 className="w-3.5 h-3.5 text-[#362486]" />
              <span className="font-semibold text-slate-700 max-w-[130px] truncate">
                {projectName}
              </span>
              <button
                onClick={onNewProject}
                title="Create New Project"
                className="text-slate-400 hover:text-[#362486] ml-1 p-0.5 rounded transition cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Minimal 3-Tab Experience Navigation */}
          <nav className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              id="tab-home-btn"
              onClick={() => setActiveTab('home')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-white text-[#362486] shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Home className={`w-3.5 h-3.5 ${activeTab === 'home' ? 'text-[#362486]' : 'text-slate-400'}`} />
              <span>Home</span>
              {totalFindings > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-[#00E96E] text-[#362486] rounded-full text-[10px] font-black">
                  {totalFindings}
                </span>
              )}
            </button>

            <button
              id="tab-project-btn"
              onClick={() => setActiveTab('project')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'project'
                  ? 'bg-white text-[#362486] shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <FileText className={`w-3.5 h-3.5 ${activeTab === 'project' ? 'text-[#362486]' : 'text-slate-400'}`} />
              <span>Project</span>
            </button>

            <button
              id="tab-ask-btn"
              onClick={() => setActiveTab('ask')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'ask'
                  ? 'bg-white text-[#362486] shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <MessageSquare className={`w-3.5 h-3.5 ${activeTab === 'ask' ? 'text-[#00E96E]' : 'text-slate-400'}`} />
              <span>Ask Oju</span>
            </button>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center space-x-1.5">
            <button
              id="btn-upload-header"
              onClick={onOpenUpload}
              className="bg-[#362486] hover:bg-[#2a1a6f] text-white font-bold px-3 py-1.5 rounded-lg text-xs transition flex items-center space-x-1.5 cursor-pointer shadow-2xs ring-1 ring-[#00E96E]/20"
            >
              <Plus className="w-3.5 h-3.5 text-[#00E96E]" />
              <span className="hidden sm:inline">+ Add files</span>
              <span className="sm:hidden">+ Add</span>
            </button>

            <button
              id="btn-reset-demo"
              title="Reset to Sample Demo Construction Project"
              onClick={onResetDemo}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 transition text-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
