import { OcrPipelineTrace } from '../types';

export const SAMPLE_OCR_TRACES: Record<string, OcrPipelineTrace> = {
  'DOC-CONTRACT-001': {
    preset: 'Agba-Hybrid',
    suryaLayout: {
      blocksDetected: 64,
      tablesFound: 2,
      readingOrderFidelity: '99.8% Strict (Left-to-Right Clauses)',
      boundingBoxConfidence: 99.4,
    },
    paddleOcr: {
      textLinesExtracted: 382,
      rotationDegreesAdjusted: 0,
      rawOcrConfidence: 97.8,
      engineVariant: 'PaddleOCR-v4',
    },
    llmAidedVerification: {
      applied: true,
      arithmeticValidated: true,
      correctionsCount: 2,
      corrections: [
        {
          original: 'Clause 14.3: Retention shall be deducted at 5.O%',
          corrected: 'Clause 14.3: Retention shall be deducted at 5.0%',
          field: 'Retention Percentage',
          reason: "Fixed OCR letter 'O' into numeric zero '0' matching contractual threshold standard",
          confidenceGain: '+1.6%',
        },
        {
          original: 'Contract Sum: ₦245,OOO,OOO.OO',
          corrected: 'Contract Sum: ₦245,000,000.00',
          field: 'Contract Sum',
          reason: "Normalized OCR capital 'O's in currency figure to zeros",
          confidenceGain: '+2.1%',
        },
      ],
    },
    overallConfidence: 99.6,
    latencyMs: 1420,
  },
  'DOC-BOQ-001': {
    preset: 'Agba-Hybrid',
    suryaLayout: {
      blocksDetected: 112,
      tablesFound: 14,
      readingOrderFidelity: '100% (surya.tables grid parser)',
      boundingBoxConfidence: 99.1,
    },
    paddleOcr: {
      textLinesExtracted: 840,
      rotationDegreesAdjusted: 0,
      rawOcrConfidence: 96.9,
      engineVariant: 'PaddleOCR-v4',
    },
    llmAidedVerification: {
      applied: true,
      arithmeticValidated: true,
      correctionsCount: 3,
      corrections: [
        {
          original: 'Item 02.14: 12.5O Tonnes @ ₦1,250,OOO = ₦15,625,OOO',
          corrected: 'Item 02.14: 12.50 Tonnes @ ₦1,250,000 = ₦15,625,000',
          field: 'BOQ Item 02.14',
          reason: 'Verified row arithmetic: 12.50 * 1,250,000 = 15,625,000. Cleaned OCR glyphs.',
          confidenceGain: '+2.8%',
        },
        {
          original: 'Item 04.02: 5OO.OO m² @ ₦18,500 = ₦9,25O,OOO',
          corrected: 'Item 04.02: 500.00 m² @ ₦18,500 = ₦9,250,000',
          field: 'BOQ Item 04.02 (Tiles)',
          reason: 'Verified row arithmetic: 500 * 18,500 = 9,250,000. Restored numbers.',
          confidenceGain: '+3.1%',
        },
      ],
    },
    overallConfidence: 99.4,
    latencyMs: 2310,
  },
  'DOC-PO-019': {
    preset: 'Agba-Hybrid',
    suryaLayout: {
      blocksDetected: 18,
      tablesFound: 1,
      readingOrderFidelity: '100% Header & Item Table',
      boundingBoxConfidence: 98.9,
    },
    paddleOcr: {
      textLinesExtracted: 46,
      rotationDegreesAdjusted: 0,
      rawOcrConfidence: 97.1,
      engineVariant: 'PaddleOCR-v4',
    },
    llmAidedVerification: {
      applied: true,
      arithmeticValidated: true,
      correctionsCount: 1,
      corrections: [
        {
          original: 'Quantity: l4.0 Tonnes @ ₦1,250,000 = ₦17,500,000',
          corrected: 'Quantity: 14.0 Tonnes @ ₦1,250,000 = ₦17,500,000',
          field: 'Line 1 Rebar Quantity',
          reason: "Corrected leading lowercase 'l' to numeric '1' based on product calculation",
          confidenceGain: '+2.4%',
        },
      ],
    },
    overallConfidence: 99.5,
    latencyMs: 680,
  },
  'DOC-DN-9912': {
    preset: 'Agba-Hybrid',
    suryaLayout: {
      blocksDetected: 14,
      tablesFound: 1,
      readingOrderFidelity: '98.5% (Carbon copy delivery docket)',
      boundingBoxConfidence: 96.8,
    },
    paddleOcr: {
      textLinesExtracted: 38,
      rotationDegreesAdjusted: -1.2,
      rawOcrConfidence: 94.5,
      engineVariant: 'Unlimited-OCR',
    },
    llmAidedVerification: {
      applied: true,
      arithmeticValidated: true,
      correctionsCount: 2,
      corrections: [
        {
          original: 'Dispatched: 45O.OO m² (313 cartons)',
          corrected: 'Dispatched: 450.00 m² (313 cartons)',
          field: 'Delivered Quantity',
          reason: 'Verified 313 cartons * 1.44 m²/ctn = 450.72 m² ≈ 450.00 m² net invoiced',
          confidenceGain: '+4.2%',
        },
      ],
    },
    overallConfidence: 98.8,
    latencyMs: 820,
  },
  'DOC-INV-114': {
    preset: 'Agba-Hybrid',
    suryaLayout: {
      blocksDetected: 22,
      tablesFound: 1,
      readingOrderFidelity: '99.5% Invoice Layout',
      boundingBoxConfidence: 98.7,
    },
    paddleOcr: {
      textLinesExtracted: 52,
      rotationDegreesAdjusted: 0,
      rawOcrConfidence: 98.2,
      engineVariant: 'PaddleOCR-v4',
    },
    llmAidedVerification: {
      applied: true,
      arithmeticValidated: true,
      correctionsCount: 1,
      corrections: [
        {
          original: 'Total Payable: ₦8,325,OOO.OO',
          corrected: 'Total Payable: ₦8,325,000.00',
          field: 'Invoice Total',
          reason: 'Validated line subtotal (450 * 18,500) equals ₦8,325,000.00',
          confidenceGain: '+1.5%',
        },
      ],
    },
    overallConfidence: 99.7,
    latencyMs: 740,
  },
  'DOC-SVR-018': {
    preset: 'Agba-Hybrid',
    suryaLayout: {
      blocksDetected: 28,
      tablesFound: 2,
      readingOrderFidelity: '99.1% Site Progress Form',
      boundingBoxConfidence: 97.9,
    },
    paddleOcr: {
      textLinesExtracted: 74,
      rotationDegreesAdjusted: 0.5,
      rawOcrConfidence: 96.4,
      engineVariant: 'PaddleOCR-v4',
    },
    llmAidedVerification: {
      applied: true,
      arithmeticValidated: true,
      correctionsCount: 1,
      corrections: [
        {
          original: 'Cumulative Floor Tiles Installed: 32O.OO m²',
          corrected: 'Cumulative Floor Tiles Installed: 320.00 m²',
          field: 'Work in Progress Quantity',
          reason: 'OCR glyph normalization of zero in installed square meter reading',
          confidenceGain: '+2.9%',
        },
      ],
    },
    overallConfidence: 99.2,
    latencyMs: 910,
  },
  'DOC-IPC-002': {
    preset: 'Agba-Hybrid',
    suryaLayout: {
      blocksDetected: 24,
      tablesFound: 1,
      readingOrderFidelity: '100% Valuation Schedule',
      boundingBoxConfidence: 99.5,
    },
    paddleOcr: {
      textLinesExtracted: 60,
      rotationDegreesAdjusted: 0,
      rawOcrConfidence: 98.6,
      engineVariant: 'PaddleOCR-v4',
    },
    llmAidedVerification: {
      applied: true,
      arithmeticValidated: true,
      correctionsCount: 2,
      corrections: [
        {
          original: 'Gross Valuation: ₦42,OOO,OOO.OO',
          corrected: 'Gross Valuation: ₦42,000,000.00',
          field: 'Gross Valuation',
          reason: 'Normalized currency string zeros',
          confidenceGain: '+1.2%',
        },
        {
          original: 'Retention @ 2.5%: ₦1,O5O,OOO.OO',
          corrected: 'Retention @ 2.5%: ₦1,050,000.00',
          field: 'Retention Deduction',
          reason: 'Verified 2.5% of ₦42M = ₦1,050,000 (Triggered contract discrepancy rule)',
          confidenceGain: '+2.0%',
        },
      ],
    },
    overallConfidence: 99.8,
    latencyMs: 810,
  },
};

export function getDefaultOcrTrace(docId: string, category: string): OcrPipelineTrace {
  if (SAMPLE_OCR_TRACES[docId]) {
    return SAMPLE_OCR_TRACES[docId];
  }
  return {
    preset: 'Agba-Hybrid',
    suryaLayout: {
      blocksDetected: 16,
      tablesFound: category === 'BOQ' || category === 'Invoice' ? 1 : 0,
      readingOrderFidelity: '99.0% High Fidelity',
      boundingBoxConfidence: 98.4,
    },
    paddleOcr: {
      textLinesExtracted: 42,
      rotationDegreesAdjusted: 0,
      rawOcrConfidence: 97.2,
      engineVariant: 'PaddleOCR-v4',
    },
    llmAidedVerification: {
      applied: true,
      arithmeticValidated: true,
      correctionsCount: 1,
      corrections: [
        {
          original: 'Auto-scanned digits',
          corrected: 'Verified against arithmetic constraints',
          field: 'Table Numbers',
          reason: 'LLM-aided mathematical validation passed',
          confidenceGain: '+1.8%',
        },
      ],
    },
    overallConfidence: 99.1,
    latencyMs: 760,
  };
}
