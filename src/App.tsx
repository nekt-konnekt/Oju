import React, { useState } from 'react';
import { runDeterministicConstructionRules } from './utils/constructionRules';
import { processConstructionFile } from './utils/fileUploader';
import {
  ConstructionProject,
  ProjectDocument,
  Finding,
  ChatMessage,
  ProjectMemory,
  SiteReport,
  ProjectIssue,
} from './types';
import { INITIAL_LEKKI_PROJECT } from './data/lekkiProjectData';
import { Header, ActiveNavTab } from './components/Header';
import { HomeAttentionView } from './components/HomeAttentionView';
import { FindingInvestigationView } from './components/FindingInvestigationView';
import { ProjectView } from './components/ProjectView';
import { ChatView } from './components/ChatView';
import { DocumentInspectorModal } from './components/DocumentInspectorModal';
import { UploadDocumentModal } from './components/UploadDocumentModal';
import { SiteReportModal } from './components/SiteReportModal';
import { CreateProjectModal } from './components/CreateProjectModal';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-init-1',
    sender: 'oju',
    text: `Good day! I'm **Oju**, your construction intelligence employee by Agba.

I'm watching your project by cross-referencing contracts, BOQ quantities, physical site delivery waybills, invoices, daily site reports, and approved drawings.

Ask me anything or upload new documents to get started.`,
    timestamp: 'Just now',
    suggestedFollowups: [
      "What's happening with this project?",
      'Find anything wrong.',
      "What's missing?",
      'What needs my attention?',
      'Which invoices do not match delivery notes?',
    ],
  },
];

export default function App() {
  const [project, setProject] = useState<ConstructionProject>(INITIAL_LEKKI_PROJECT);
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('home');
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);

  // Direct File Upload State
  const [isUploadingFiles, setIsUploadingFiles] = useState<boolean>(false);
  const [uploadStatusMessage, setUploadStatusMessage] = useState<string>('');

  // Modals state
  const [inspectorDoc, setInspectorDoc] = useState<ProjectDocument | null>(null);
  const [inspectorPage, setInspectorPage] = useState<number>(1);
  const [inspectorExcerpt, setInspectorExcerpt] = useState<string | undefined>(undefined);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isSiteReportOpen, setIsSiteReportOpen] = useState<boolean>(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState<boolean>(false);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isChatProcessing, setIsChatProcessing] = useState<boolean>(false);

  // Handle Finding selection
  const handleSelectFinding = (finding: Finding) => {
    setSelectedFinding(finding);
  };

  const handleBackFromInvestigation = () => {
    setSelectedFinding(null);
  };

  // Direct Multi-File Upload Pipeline
  const handleDirectFilesUploaded = async (files: File[]) => {
    if (!files || files.length === 0) return;
    setIsUploadingFiles(true);

    let currentMemory: ProjectMemory = { ...project.memory };
    let currentDocs: ProjectDocument[] = [...project.documents];
    const newDocsAdded: ProjectDocument[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadStatusMessage(`Reading file ${i + 1} of ${files.length}: "${file.name}"...`);
      try {
        const result = await processConstructionFile(file, currentMemory);
        currentDocs = [result.document, ...currentDocs];
        currentMemory = result.updatedMemory;
        newDocsAdded.push(result.document);
      } catch (err) {
        console.error('Error processing file:', file.name, err);
      }
    }

    setUploadStatusMessage('Running construction reconciliation audit across all documents...');
    const newFindings = runDeterministicConstructionRules(currentMemory, currentDocs);

    setProject((prev) => ({
      ...prev,
      documents: currentDocs,
      memory: currentMemory,
      findings: newFindings,
    }));

    setIsUploadingFiles(false);
    setUploadStatusMessage('');

    // Add informative notification message in chat
    const docList = newDocsAdded
      .map((d) => `• **${d.title}** (${d.category} - Ref: ${d.referenceNumber})`)
      .join('\n');
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-upload-${Date.now()}`,
        sender: 'agba',
        text: `I've read and indexed **${newDocsAdded.length} construction document(s)**:
${docList}

${
  newFindings.length > 0
    ? `I've highlighted **${newFindings.length} item(s) that need your attention** on your home dashboard.`
    : 'All documents reconcile cleanly. No quantity discrepancies or unapproved variations were detected.'
}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowups: [
          "What's happening with this project?",
          'Find anything wrong.',
          'What needs my attention?',
          'Compare these documents.',
        ],
      },
    ]);
  };

  // Open Document Inspector helper
  const handleOpenDocument = (docId: string, pageNumber: number = 1, excerpt?: string) => {
    const foundDoc = project.documents.find((d) => d.id === docId);
    if (foundDoc) {
      setInspectorDoc(foundDoc);
      setInspectorPage(pageNumber);
      setInspectorExcerpt(excerpt);
      setIsInspectorOpen(true);
    }
  };

  // Reset to initial demo project
  const handleResetDemo = () => {
    setProject({
      ...INITIAL_LEKKI_PROJECT,
      findings: runDeterministicConstructionRules(
        INITIAL_LEKKI_PROJECT.memory,
        INITIAL_LEKKI_PROJECT.documents
      ),
    });
    setSelectedFinding(null);
    setMessages(INITIAL_MESSAGES);
    setActiveTab('home');
  };

  // Create new project
  const handleCreateProject = (newProject: ConstructionProject) => {
    setProject(newProject);
    setSelectedFinding(null);
    setMessages([
      {
        id: `msg-welcome-${Date.now()}`,
        sender: 'agba',
        text: `I've set up **${newProject.name}**. I'm ready to read your project documents whenever you upload them. Drop your files into the box above or click **+ Add files** to begin!`,
        timestamp: 'Just now',
      },
    ]);
    setActiveTab('home');
  };

  // Document Added Handler from manual upload modal
  const handleDocumentAdded = (newDoc: ProjectDocument) => {
    const updatedDocs = [newDoc, ...project.documents];
    const updatedMemory: ProjectMemory = { ...project.memory };

    // Re-run rules engine on new project state
    const newFindings = runDeterministicConstructionRules(updatedMemory, updatedDocs);

    setProject((prev) => ({
      ...prev,
      documents: updatedDocs,
      memory: updatedMemory,
      findings: newFindings,
    }));
  };

  // Save new Site Report
  const handleSaveSiteReport = (report: SiteReport, doc: ProjectDocument) => {
    const updatedReports = [report, ...(project.memory.siteReports || [])];
    const updatedDocs = [doc, ...project.documents];
    const updatedMemory: ProjectMemory = {
      ...project.memory,
      siteReports: updatedReports,
    };

    const newFindings = runDeterministicConstructionRules(updatedMemory, updatedDocs);

    setProject((prev) => ({
      ...prev,
      documents: updatedDocs,
      memory: updatedMemory,
      findings: newFindings,
    }));

    // Post update message in chat
    const workSummary = report.workCompleted ? report.workCompleted.join(', ') : 'Progress logged';
    const matSummary = report.materialsReceived
      ? report.materialsReceived.map((m) => `${m.quantityReceived} ${m.unit} of ${m.materialName}`).join(', ')
      : 'None recorded';

    setMessages((prev) => [
      ...prev,
      {
        id: `msg-sr-${Date.now()}`,
        sender: 'agba',
        text: `I've recorded the **Daily Site Report for ${report.date}** (Ref: ${report.reportNumber}).\n\nWork recorded: ${workSummary}.\nMaterials received: ${matSummary}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Resolve finding
  const handleResolveFinding = (findingId: string) => {
    setProject((prev) => ({
      ...prev,
      findings: prev.findings.map((f) =>
        f.id === findingId ? { ...f, status: 'RESOLVED' } : f
      ),
    }));
    if (selectedFinding && selectedFinding.id === findingId) {
      setSelectedFinding((prev) => (prev ? { ...prev, status: 'RESOLVED' } : null));
    }
  };

  // Create issue from finding
  const handleCreateIssue = (finding: Finding) => {
    const newIssue: ProjectIssue = {
      id: `issue-${Date.now()}`,
      title: `Resolve: ${finding.title}`,
      findingId: finding.id,
      severity: finding.severity,
      assignedTo: 'Project Quantity Surveyor / PM',
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: 'OPEN',
      createdAt: new Date().toISOString().split('T')[0],
      notes: finding.recommendedAction,
    };

    setProject((prev) => ({
      ...prev,
      issues: [newIssue, ...(prev.issues || [])],
    }));

    setActiveTab('project');
    setSelectedFinding(null);
  };

  // Chat message submission
  const handleSendMessage = async (query: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsChatProcessing(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          projectContext: {
            name: project.name,
            client: project.client,
            contractor: project.contractor,
            location: project.location,
          },
          documents: project.documents,
          findings: project.findings,
        }),
      });

      if (!response.ok) {
        throw new Error('Chat API returned error status');
      }

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        sender: 'agba',
        text: data.text || 'Analysis completed.',
        citations: data.citations || [],
        suggestedFollowups: data.suggestedFollowups || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error('Chat error:', error);

      // Clean dynamic response strictly based on actual uploaded documents and findings
      let responseText = '';
      if (project.documents.length === 0) {
        responseText = `You currently have **0 documents uploaded** for **${project.name}**.\n\nDrop your construction files (PDFs, BOQs, delivery notes, site reports, invoices, or drawings) into the dropzone above or click **+ Add files** so I can audit them and answer your questions.`;
      } else if (project.findings.length === 0) {
        responseText = `I have read and indexed all **${project.documents.length} project documents** for **${project.name}**.\n\nAll quantities, deliveries, and payment claims currently reconcile cleanly with no discrepancies found.`;
      } else {
        const topFindings = project.findings
          .filter((f) => f.status !== 'RESOLVED')
          .slice(0, 3)
          .map((f, idx) => `${idx + 1}. **${f.title}**: ${f.description}`)
          .join('\n\n');
        responseText = `Here is what currently needs your attention for **${project.name}**:\n\n${topFindings}\n\nWould you like me to walk through the evidence for any of these?`;
      }

      const fallbackMsg: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        sender: 'agba',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowups: [
          "What's happening with this project?",
          'Find anything wrong.',
          'What needs my attention?',
          'Compare these documents.',
        ],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsChatProcessing(false);
    }
  };

  // Ask question from Home screen
  const handleAskQuestion = (question: string) => {
    setActiveTab('ask');
    setSelectedFinding(null);
    handleSendMessage(question);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-[#362486]/20 selection:text-[#362486]">
      {/* Clean Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedFinding(null);
        }}
        projectName={project.name}
        totalFindings={project.findings.filter((f) => f.status !== 'RESOLVED').length}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenSiteReport={() => setIsSiteReportOpen(true)}
        onResetDemo={handleResetDemo}
        onNewProject={() => setIsCreateProjectOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full px-4 sm:px-6 py-6 sm:py-8">
        {/* If user clicked a finding, show the dedicated Investigation View */}
        {selectedFinding ? (
          <FindingInvestigationView
            finding={selectedFinding}
            documents={project.documents}
            onBack={handleBackFromInvestigation}
            onOpenDocument={handleOpenDocument}
            onAskAboutFinding={handleAskQuestion}
            onResolveFinding={handleResolveFinding}
            onCreateIssue={handleCreateIssue}
          />
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeAttentionView
                project={project}
                onSelectFinding={handleSelectFinding}
                onOpenUpload={() => setIsUploadOpen(true)}
                onOpenSiteReport={() => setIsSiteReportOpen(true)}
                onAskQuestion={handleAskQuestion}
                onDirectFilesUploaded={handleDirectFilesUploaded}
                isUploadingFiles={isUploadingFiles}
                uploadStatusMessage={uploadStatusMessage}
              />
            )}

            {activeTab === 'project' && (
              <ProjectView
                project={project}
                onOpenDocument={handleOpenDocument}
                onOpenUpload={() => setIsUploadOpen(true)}
                onOpenSiteReport={() => setIsSiteReportOpen(true)}
                onSelectFinding={handleSelectFinding}
              />
            )}

            {activeTab === 'ask' && (
              <div className="max-w-4xl mx-auto">
                <ChatView
                  project={project}
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isProcessing={isChatProcessing}
                  onOpenDocument={handleOpenDocument}
                  onDirectFilesUploaded={handleDirectFilesUploaded}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-slate-900">Oju</span>
            <span className="text-slate-400">•</span>
            <span className="font-medium text-slate-600">Construction intelligence</span>
            <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">by Agba</span>
          </div>
          <div className="text-slate-400 font-medium">
            Read • Connect • Review
          </div>
        </div>
      </footer>

      {/* Document Inspector Modal (for reviewing cited evidence) */}
      <DocumentInspectorModal
        document={inspectorDoc}
        initialPage={inspectorPage}
        highlightExcerpt={inspectorExcerpt}
        isOpen={isInspectorOpen}
        onClose={() => {
          setIsInspectorOpen(false);
          setInspectorDoc(null);
        }}
      />

      {/* Upload Document Modal */}
      <UploadDocumentModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadFiles={handleDirectFilesUploaded}
        onDocumentAdded={handleDocumentAdded}
        isProcessing={isUploadingFiles}
        uploadProgress={uploadStatusMessage}
      />

      {/* Site Report Modal */}
      <SiteReportModal
        isOpen={isSiteReportOpen}
        onClose={() => setIsSiteReportOpen(false)}
        onSaveSiteReport={handleSaveSiteReport}
      />

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
}
