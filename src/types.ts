export type DocumentCategory =
  | 'Contract'
  | 'BOQ'
  | 'Drawing'
  | 'Specification'
  | 'Invoice'
  | 'Purchase Order'
  | 'Delivery Note'
  | 'Site Report'
  | 'Payment Certificate'
  | 'Variation'
  | 'RFI'
  | 'Programme / Schedule'
  | 'Meeting Minutes'
  | 'Other';

export type FindingSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATION';

export type FindingCategory =
  | 'QUANTITY'
  | 'FINANCIAL'
  | 'DOCUMENT_GAP'
  | 'PROGRESS'
  | 'SCHEDULE'
  | 'SPECIFICATION';

export interface EvidenceItem {
  label: string;
  value: string | number;
  sourceDocTitle: string;
  sourceDocId: string;
  documentCategory: DocumentCategory;
  pageNumber: number;
  excerpt: string;
  referenceNumber?: string;
  date?: string;
}

export interface CalculationDetails {
  formula: string;
  result: string;
  explanation: string;
}

export interface Finding {
  id: string;
  title: string;
  severity: FindingSeverity;
  category: FindingCategory;
  description: string;
  whyItMatters: string;
  evidence: EvidenceItem[];
  calculation?: CalculationDetails;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedAction: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
  ruleId: string;
  createdAt: string;
}

export interface DocumentPage {
  pageNumber: number;
  content: string;
  tables?: Array<{
    title?: string;
    headers: string[];
    rows: string[][];
  }>;
}

export interface ProjectDocument {
  id: string;
  title: string;
  referenceNumber: string;
  category: DocumentCategory;
  date: string;
  uploadDate: string;
  fileSize: string;
  pageCount: number;
  issuerCompany?: string;
  recipientCompany?: string;
  signatory?: string;
  status: 'PROCESSED' | 'PARSED' | 'FLAGGED';
  pages: DocumentPage[];
  rawTextExcerpt: string;
  extractedEntitiesCount: {
    quantities: number;
    financials: number;
    references: number;
    dates: number;
  };
  extractedEntities?: {
    quantities?: Array<{ item: string; quantity: number; unit: string }>;
    financials?: Array<{ description: string; amount: number; currency: string }>;
    referencedDocuments?: string[];
    dates?: string[];
  };
  ocrTrace?: OcrPipelineTrace;
}

// OCR Engine Trace and Multi-Stage Pipeline Metrics
export interface OcrCorrection {
  original: string;
  corrected: string;
  field: string;
  reason: string;
  confidenceGain: string;
}

export interface OcrPipelineTrace {
  preset: 'Agba-Hybrid' | 'PaddleOCR-Fast' | 'Surya-Tables' | 'Chandra-Markdown' | 'LLM-Aided-Forensic';
  suryaLayout: {
    blocksDetected: number;
    tablesFound: number;
    readingOrderFidelity: string;
    boundingBoxConfidence: number;
  };
  paddleOcr: {
    textLinesExtracted: number;
    rotationDegreesAdjusted: number;
    rawOcrConfidence: number;
    engineVariant: 'PaddleOCR-v4' | 'Unlimited-OCR';
  };
  llmAidedVerification: {
    applied: boolean;
    arithmeticValidated: boolean;
    correctionsCount: number;
    corrections: OcrCorrection[];
  };
  overallConfidence: number;
  latencyMs: number;
}

// Structured Project Memory Entities
export interface BOQItem {
  id: string;
  itemCode: string;
  description: string;
  material: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  sourceDocId: string;
  pageNumber: number;
}

export interface PurchaseOrderItem {
  material: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalAmount: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendor: string;
  date: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: 'ISSUED' | 'FULFILLED' | 'PARTIAL';
  sourceDocId: string;
  pageNumber: number;
}

export interface DeliveryItem {
  material: string;
  quantity: number;
  unit: string;
}

export interface DeliveryRecord {
  id: string;
  deliveryNoteNumber: string;
  date: string;
  supplier: string;
  poReference: string;
  items: DeliveryItem[];
  receiver: string;
  sourceDocId: string;
  pageNumber: number;
}

export interface InvoiceItem {
  material: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  date: string;
  vendor: string;
  poReference?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  paymentStatus: 'PAID' | 'CLAIMED' | 'DISPUTED';
  sourceDocId: string;
  pageNumber: number;
}

export interface SiteActivity {
  description: string;
  trade: string;
  materialUsed?: string;
  quantityInstalled?: number;
  unit?: string;
  percentageProgress?: number;
}

export interface SiteReport {
  id: string;
  reportNumber: string;
  date: string;
  author: string;
  weather: string;
  activities: SiteActivity[];
  referencedDrawings?: string[];
  workCompleted?: string[];
  materialsReceived?: Array<{ materialName: string; quantityReceived: number; unit: string; supplier?: string }>;
  issuesFlagged?: string[];
  sourceDocId: string;
  pageNumber: number;
}

export interface PaymentCertificate {
  id: string;
  certificateNumber: string;
  date: string;
  contractor: string;
  grossValuation: number;
  retentionDeduction: number;
  retentionRatePct: number;
  netPayable: number;
  cumulativePaid: number;
  status: 'CERTIFIED' | 'PAID' | 'UNDER_REVIEW';
  sourceDocId: string;
  pageNumber: number;
}

export interface VariationOrder {
  id: string;
  variationNumber: string;
  title: string;
  description: string;
  claimedAmount: number;
  approvedAmount?: number;
  timeImpactDays: number;
  status: 'APPROVED' | 'PENDING_REVIEW' | 'SUBMITTED' | 'REJECTED';
  signedBy?: string;
  sourceDocId: string;
  pageNumber: number;
}

export interface DrawingItem {
  id: string;
  drawingNumber: string;
  title: string;
  discipline: 'ARCHITECTURAL' | 'STRUCTURAL' | 'MEP' | 'CIVIL';
  currentRevision: string;
  revisionDate: string;
  scale: string;
  sourceDocId: string;
  pageNumber: number;
}

export interface ScheduleActivity {
  id: string;
  activityName: string;
  startDate: string;
  plannedEndDate: string;
  progressPct: number;
  criticalPath: boolean;
  status: 'ON_TRACK' | 'DELAYED' | 'COMPLETED' | 'BLOCKED';
  blocker?: string;
  sourceDocId: string;
}

export interface ContractDetails {
  contractNumber: string;
  employer: string;
  mainContractor: string;
  contractSum: number;
  currency: string;
  startDate: string;
  completionDate: string;
  retentionClausePct: number;
  sourceDocId: string;
}

export interface EntityRelationship {
  id: string;
  sourceType: string;
  sourceId: string;
  sourceLabel: string;
  targetType: string;
  targetId: string;
  targetLabel: string;
  relationType: string;
  status: 'MATCHED' | 'DISCREPANCY' | 'MISSING_LINK';
  notes: string;
}

export interface ProjectMemory {
  contract?: ContractDetails;
  boqItems: BOQItem[];
  purchaseOrders: PurchaseOrder[];
  deliveries: DeliveryRecord[];
  invoices: InvoiceRecord[];
  siteReports: SiteReport[];
  paymentCertificates: PaymentCertificate[];
  variations: VariationOrder[];
  drawings: DrawingItem[];
  scheduleActivities: ScheduleActivity[];
  relationships: EntityRelationship[];
}

export interface ProjectIssue {
  id: string;
  title: string;
  findingId?: string;
  severity: FindingSeverity;
  assignedTo: string;
  dueDate: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
  notes: string;
}

export interface ConstructionProject {
  id: string;
  name: string;
  client: string;
  contractor: string;
  location: string;
  startDate: string;
  status: 'ACTIVE' | 'ARCHIVED';
  documents: ProjectDocument[];
  memory: ProjectMemory;
  findings: Finding[];
  issues?: ProjectIssue[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agba' | 'oju';
  text: string;
  timestamp: string;
  citations?: Array<{
    documentTitle: string;
    documentCategory: DocumentCategory;
    referenceNumber: string;
    pageNumber: number;
    quoteExcerpt: string;
  }>;
  suggestedFollowups?: string[];
}
