import {
  DocumentCategory,
  ProjectDocument,
  ProjectMemory,
  DeliveryRecord,
  SiteReport,
  InvoiceRecord,
  PaymentCertificate,
  VariationOrder,
  BOQItem,
  DrawingItem,
} from '../types';
import { getDefaultOcrTrace } from '../data/ocrTraces';

export interface ProcessFileResult {
  document: ProjectDocument;
  updatedMemory: ProjectMemory;
}

export async function processConstructionFile(
  file: File,
  currentMemory: ProjectMemory
): Promise<ProcessFileResult> {
  const isBinary =
    file.type.includes('pdf') ||
    file.type.includes('image') ||
    file.name.toLowerCase().endsWith('.pdf') ||
    file.name.toLowerCase().endsWith('.png') ||
    file.name.toLowerCase().endsWith('.jpg') ||
    file.name.toLowerCase().endsWith('.jpeg');

  let fileContent = '';
  let fileBase64 = '';

  if (isBinary) {
    fileBase64 = await readFileAsDataURL(file);
  } else {
    fileContent = await readFileAsText(file);
  }

  // Call the server extraction API
  let extracted: any = null;
  try {
    const res = await fetch('/api/documents/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: file.name,
        fileContent: fileContent || undefined,
        fileBase64: fileBase64 || undefined,
        mimeType: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'text/plain'),
      }),
    });

    if (res.ok) {
      extracted = await res.json();
    }
  } catch (err) {
    console.warn('Backend extraction endpoint failed or timed out:', err);
  }

  // Determine category and details
  const category: DocumentCategory =
    (extracted?.category as DocumentCategory) ||
    guessConstructionCategory(file.name, fileContent);

  const docId = `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const refNumber =
    extracted?.referenceNumber ||
    extractRef(fileContent) ||
    `${category.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const title =
    extracted?.title ||
    file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

  const date =
    extracted?.date ||
    new Date().toISOString().split('T')[0];

  const excerpt =
    extracted?.summary ||
    fileContent.slice(0, 300) ||
    `Construction ${category} uploaded for Oju analysis.`;

  const newDoc: ProjectDocument = {
    id: docId,
    title,
    referenceNumber: refNumber,
    category,
    date,
    uploadDate: new Date().toISOString().split('T')[0],
    fileSize: formatFileSize(file.size),
    pageCount: extracted?.pages?.length || 1,
    issuerCompany: extracted?.issuerCompany || 'Project Partner',
    recipientCompany: extracted?.recipientCompany || 'Principal Contractor / Employer',
    signatory: extracted?.signatory,
    status: 'PROCESSED',
    rawTextExcerpt: excerpt,
    extractedEntitiesCount: {
      quantities: extracted?.extractedEntities?.quantities?.length || 1,
      financials: extracted?.extractedEntities?.financials?.length || 0,
      references: extracted?.extractedEntities?.referencedDocuments?.length || 1,
      dates: extracted?.extractedEntities?.dates?.length || 1,
    },
    extractedEntities: extracted?.extractedEntities || {
      quantities: [],
      financials: [],
      referencedDocuments: [refNumber],
      dates: [date],
    },
    pages: extracted?.pages || [
      {
        pageNumber: 1,
        content: fileContent || `Document content extracted for ${title}`,
      },
    ],
    ocrTrace: getDefaultOcrTrace(docId, category),
  };

  // Map into structured project memory for cross-document reconciliation
  const updatedMemory: ProjectMemory = {
    ...currentMemory,
    boqItems: [...currentMemory.boqItems],
    deliveries: [...currentMemory.deliveries],
    siteReports: [...currentMemory.siteReports],
    invoices: [...currentMemory.invoices],
    paymentCertificates: [...currentMemory.paymentCertificates],
    variations: [...currentMemory.variations],
    drawings: [...currentMemory.drawings],
  };

  if (category === 'Delivery Note') {
    const deliveryItems = (extracted?.extractedEntities?.quantities || []).map((q: any) => ({
      material: q.item || 'Building Material',
      quantity: Number(q.quantity) || 1,
      unit: q.unit || 'units',
    }));

    const newDelivery: DeliveryRecord = {
      id: `del-${Date.now()}`,
      deliveryNoteNumber: refNumber,
      date,
      supplier: extracted?.issuerCompany || 'Supplier',
      poReference: extracted?.extractedEntities?.referencedDocuments?.[0] || 'PO-GEN',
      items: deliveryItems.length > 0 ? deliveryItems : [{ material: title, quantity: 1, unit: 'sum' }],
      receiver: extracted?.signatory || 'Site Storekeeper',
      sourceDocId: docId,
      pageNumber: 1,
    };
    updatedMemory.deliveries.push(newDelivery);
  } else if (category === 'Site Report') {
    const activities = (extracted?.extractedEntities?.quantities || []).map((q: any) => ({
      description: `Installed ${q.item}`,
      trade: 'General Works',
      materialUsed: q.item,
      quantityInstalled: Number(q.quantity) || 0,
      unit: q.unit || 'units',
      percentageProgress: 100,
    }));

    const newReport: SiteReport = {
      id: `rep-${Date.now()}`,
      reportNumber: refNumber,
      date,
      author: extracted?.signatory || 'Site Engineer',
      weather: 'Fair',
      activities: activities.length > 0 ? activities : [{ description: 'Site works executed per plan', trade: 'General' }],
      referencedDrawings: extracted?.extractedEntities?.referencedDocuments,
      sourceDocId: docId,
      pageNumber: 1,
    };
    updatedMemory.siteReports.push(newReport);
  } else if (category === 'Invoice') {
    const totalAmount =
      extracted?.extractedEntities?.financials?.[0]?.amount ||
      Number(fileContent.match(/[₦$]\s?([\d,]+)/)?.[1]?.replace(/,/g, '')) ||
      0;

    const newInvoice: InvoiceRecord = {
      id: `inv-${Date.now()}`,
      invoiceNumber: refNumber,
      date,
      vendor: extracted?.issuerCompany || 'Vendor',
      poReference: extracted?.extractedEntities?.referencedDocuments?.[0],
      items: (extracted?.extractedEntities?.quantities || []).map((q: any) => ({
        material: q.item,
        quantity: Number(q.quantity) || 1,
        unit: q.unit || 'units',
        rate: 0,
        amount: 0,
      })),
      subtotal: totalAmount,
      tax: 0,
      totalAmount,
      paymentStatus: 'CLAIMED',
      sourceDocId: docId,
      pageNumber: 1,
    };
    updatedMemory.invoices.push(newInvoice);
  } else if (category === 'Payment Certificate') {
    const gross = extracted?.extractedEntities?.financials?.[0]?.amount || 0;
    const newCert: PaymentCertificate = {
      id: `ipc-${Date.now()}`,
      certificateNumber: refNumber,
      date,
      contractor: extracted?.recipientCompany || 'Main Contractor',
      grossValuation: gross,
      retentionDeduction: gross * 0.05,
      retentionRatePct: 5.0,
      netPayable: gross * 0.95,
      cumulativePaid: 0,
      status: 'CERTIFIED',
      sourceDocId: docId,
      pageNumber: 1,
    };
    updatedMemory.paymentCertificates.push(newCert);
  } else if (category === 'Variation') {
    const claimed = extracted?.extractedEntities?.financials?.[0]?.amount || 0;
    const newVar: VariationOrder = {
      id: `vo-${Date.now()}`,
      variationNumber: refNumber,
      title,
      description: excerpt,
      claimedAmount: claimed,
      timeImpactDays: 0,
      status: extracted?.signatory ? 'APPROVED' : 'PENDING_REVIEW',
      signedBy: extracted?.signatory,
      sourceDocId: docId,
      pageNumber: 1,
    };
    updatedMemory.variations.push(newVar);
  } else if (category === 'BOQ') {
    const boqItems: BOQItem[] = (extracted?.extractedEntities?.quantities || []).map(
      (q: any, i: number) => ({
        id: `boq-${Date.now()}-${i}`,
        itemCode: `BOQ-${i + 1}`,
        description: q.item,
        material: q.item,
        quantity: Number(q.quantity) || 1,
        unit: q.unit || 'units',
        rate: 0,
        amount: 0,
        sourceDocId: docId,
        pageNumber: 1,
      })
    );
    if (boqItems.length > 0) {
      updatedMemory.boqItems.push(...boqItems);
    }
  } else if (category === 'Drawing') {
    const newDwg: DrawingItem = {
      id: `dwg-${Date.now()}`,
      drawingNumber: refNumber,
      title,
      discipline: 'ARCHITECTURAL',
      currentRevision: 'Rev A',
      revisionDate: date,
      scale: '1:100',
      sourceDocId: docId,
      pageNumber: 1,
    };
    updatedMemory.drawings.push(newDwg);
  }

  return { document: newDoc, updatedMemory };
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function guessConstructionCategory(filename: string, content: string): DocumentCategory {
  const text = (filename + ' ' + content).toLowerCase();
  if (text.includes('boq') || text.includes('bill of quant') || text.includes('schedule of rates')) return 'BOQ';
  if (text.includes('delivery') || text.includes('waybill') || text.includes('grn') || text.includes('goods received')) return 'Delivery Note';
  if (text.includes('site report') || text.includes('progress report') || text.includes('daily diary') || text.includes('site log')) return 'Site Report';
  if (text.includes('invoice') || text.includes('tax invoice') || text.includes('bill to')) return 'Invoice';
  if (text.includes('certificate') || text.includes('ipc') || text.includes('valuation') || text.includes('interim payment')) return 'Payment Certificate';
  if (text.includes('variation') || text.includes('change order') || text.includes('change request')) return 'Variation';
  if (text.includes('drawing') || text.includes('plan') || text.includes('elevation') || text.includes('section') || text.includes('.dwg')) return 'Drawing';
  if (text.includes('contract') || text.includes('agreement') || text.includes('articles of agreement') || text.includes('gcc')) return 'Contract';
  if (text.includes('specification') || text.includes('spec') || text.includes('datasheet')) return 'Specification';
  if (text.includes('purchase order') || text.includes('p.o.')) return 'Purchase Order';
  if (text.includes('rfi') || text.includes('request for info')) return 'RFI';
  return 'Other';
}

function extractRef(content: string): string | null {
  const match = content.match(/\b([A-Z]{2,4}-[0-9]{3,6}(?:-[A-Z0-9]+)?)\b/);
  return match ? match[1] : null;
}
