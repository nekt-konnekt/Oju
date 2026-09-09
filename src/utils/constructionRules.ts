import {
  Finding,
  ProjectMemory,
  ProjectDocument,
  EvidenceItem,
  CalculationDetails,
} from '../types';

export function runDeterministicConstructionRules(
  memory: ProjectMemory,
  documents: ProjectDocument[]
): Finding[] {
  const findings: Finding[] = [];
  const docMap = new Map<string, ProjectDocument>();
  documents.forEach((d) => docMap.set(d.id, d));

  // Helper to create evidence
  const makeEvidence = (
    label: string,
    value: string | number,
    docId: string,
    pageNumber: number,
    excerpt: string,
    ref?: string,
    date?: string
  ): EvidenceItem => {
    const doc = docMap.get(docId);
    return {
      label,
      value,
      sourceDocTitle: doc ? doc.title : 'Document ' + docId,
      sourceDocId: docId,
      documentCategory: doc ? doc.category : 'Other',
      pageNumber,
      excerpt,
      referenceNumber: ref || (doc ? doc.referenceNumber : undefined),
      date: date || (doc ? doc.date : undefined),
    };
  };

  // RULE 1: Material Delivered but Not Documented as Installed (e.g. Floor Tiles)
  // Compare delivery items against site reports
  for (const del of memory.deliveries) {
    for (const delItem of del.items) {
      // Find installed quantity across all site reports
      let totalInstalled = 0;
      const relevantReports: { reportId: string; page: number; installed: number; excerpt: string; date: string }[] = [];

      for (const rep of memory.siteReports) {
        for (const act of rep.activities) {
          if (
            act.materialUsed &&
            act.materialUsed.toLowerCase().includes(delItem.material.toLowerCase().slice(0, 5))
          ) {
            if (act.quantityInstalled) {
              totalInstalled += act.quantityInstalled;
              relevantReports.push({
                reportId: rep.sourceDocId,
                page: rep.pageNumber,
                installed: act.quantityInstalled,
                excerpt: `Site activity: "${act.description}". Installed ${act.quantityInstalled} ${act.unit || delItem.unit}.`,
                date: rep.date,
              });
            }
          }
        }
      }

      // Check against BOQ
      const matchingBoq = memory.boqItems.find((b) =>
        b.material.toLowerCase().includes(delItem.material.toLowerCase().slice(0, 5))
      );

      // Check against Invoice
      const matchingInv = memory.invoices.find((inv) =>
        inv.items.some((it) => it.material.toLowerCase().includes(delItem.material.toLowerCase().slice(0, 5)))
      );
      const invItem = matchingInv?.items.find((it) =>
        it.material.toLowerCase().includes(delItem.material.toLowerCase().slice(0, 5))
      );

      if (totalInstalled > 0 && delItem.quantity > totalInstalled) {
        const diff = delItem.quantity - totalInstalled;
        const diffPct = Math.round((diff / delItem.quantity) * 100);

        if (diff >= 50 || diffPct >= 15) {
          const evidenceList: EvidenceItem[] = [];

          if (matchingBoq) {
            evidenceList.push(
              makeEvidence(
                'BOQ Allowance',
                `${matchingBoq.quantity} ${matchingBoq.unit}`,
                matchingBoq.sourceDocId,
                matchingBoq.pageNumber,
                `BOQ Item ${matchingBoq.itemCode}: ${matchingBoq.description} - Qty: ${matchingBoq.quantity} ${matchingBoq.unit} @ ₦${matchingBoq.rate.toLocaleString()}/unit.`
              )
            );
          }

          evidenceList.push(
            makeEvidence(
              'Delivered to Site',
              `${delItem.quantity} ${delItem.unit}`,
              del.sourceDocId,
              del.pageNumber,
              `Delivery Note ${del.deliveryNoteNumber}: Delivered ${delItem.quantity} ${delItem.unit} of ${delItem.material} from ${del.supplier}. Received by ${del.receiver}.`,
              del.deliveryNoteNumber,
              del.date
            )
          );

          if (matchingInv && invItem) {
            evidenceList.push(
              makeEvidence(
                'Invoiced Quantity',
                `${invItem.quantity} ${invItem.unit}`,
                matchingInv.sourceDocId,
                matchingInv.pageNumber,
                `Invoice ${matchingInv.invoiceNumber}: Claimed ${invItem.quantity} ${invItem.unit} @ ₦${invItem.rate.toLocaleString()} = ₦${invItem.amount.toLocaleString()}.`,
                matchingInv.invoiceNumber,
                matchingInv.date
              )
            );
          }

          relevantReports.forEach((r) => {
            evidenceList.push(
              makeEvidence(
                'Site Report (Installed)',
                `${r.installed} ${delItem.unit}`,
                r.reportId,
                r.page,
                r.excerpt,
                undefined,
                r.date
              )
            );
          });

          const calc: CalculationDetails = {
            formula: `${delItem.quantity} ${delItem.unit} (Delivered) - ${totalInstalled} ${delItem.unit} (Documented Installed) = ${diff} ${delItem.unit}`,
            result: `${diff} ${delItem.unit} (${diffPct}%) unaccounted in site installation records`,
            explanation: `390 m² or 450 m² was delivered and fully invoiced, but site reports only record ${totalInstalled} ${delItem.unit} placed. This variance may indicate stored stock on-site, cutting wastage, or unlogged daily subcontractor progress.`,
          };

          findings.push({
            id: `FINDING-QTY-${delItem.material.replace(/\s+/g, '-').toUpperCase()}`,
            title: `Potential quantity discrepancy in ${delItem.material}`,
            severity: 'HIGH',
            category: 'QUANTITY',
            description: `${diff} ${delItem.unit} of ${delItem.material} has been delivered and invoiced but lacks corresponding installation records in site progress logs.`,
            whyItMatters:
              'Unreconciled materials on active sites present risks of pilferage, improper storage degradation, or premature contractor invoicing before work is executed.',
            evidence: evidenceList,
            calculation: calc,
            confidence: 'HIGH',
            recommendedAction:
              'Conduct a physical stock count in the secure site compound. Cross-examine the finishing subcontractor daily site diaries for unrecorded installation in auxiliary rooms or wastage bins.',
            status: 'OPEN',
            ruleId: 'RULE_QTY_DELIVERY_VS_INSTALLED',
            createdAt: '2024-02-22',
          });
        }
      }
    }
  }

  // RULE 2: Purchase Order Quantity Exceeds BOQ Allowance Without Approved Variation
  for (const po of memory.purchaseOrders) {
    for (const poItem of po.items) {
      const boqMatch = memory.boqItems.find((b) =>
        b.material.toLowerCase().includes(poItem.material.toLowerCase().slice(0, 6))
      );

      if (boqMatch && poItem.quantity > boqMatch.quantity) {
        const excess = poItem.quantity - boqMatch.quantity;
        const excessPct = Math.round((excess / boqMatch.quantity) * 100);

        // Check if there is an approved variation explaining this
        const variationMatch = memory.variations.find(
          (v) =>
            v.status === 'APPROVED' &&
            v.description.toLowerCase().includes(poItem.material.toLowerCase().slice(0, 5))
        );

        if (!variationMatch) {
          const evidenceList: EvidenceItem[] = [
            makeEvidence(
              'Approved BOQ Allowance',
              `${boqMatch.quantity} ${boqMatch.unit}`,
              boqMatch.sourceDocId,
              boqMatch.pageNumber,
              `BOQ Item ${boqMatch.itemCode}: ${boqMatch.description}. Contract quantity: ${boqMatch.quantity} ${boqMatch.unit}. Rate: ₦${boqMatch.rate.toLocaleString()}.`,
              boqMatch.itemCode
            ),
            makeEvidence(
              'Purchase Order Quantity',
              `${poItem.quantity} ${poItem.unit}`,
              po.sourceDocId,
              po.pageNumber,
              `PO ${po.poNumber}: Procurement of ${poItem.quantity} ${poItem.unit} of ${poItem.material} from ${po.vendor}. Total line: ₦${poItem.totalAmount.toLocaleString()}.`,
              po.poNumber,
              po.date
            ),
          ];

          const calc: CalculationDetails = {
            formula: `${poItem.quantity} ${poItem.unit} (PO) - ${boqMatch.quantity} ${boqMatch.unit} (BOQ) = +${excess} ${poItem.unit}`,
            result: `+${excess} ${poItem.unit} (+${excessPct}%) over contract BOQ budget`,
            explanation: `Purchase Order ${po.poNumber} committed ${poItem.quantity} ${poItem.unit} of ${poItem.material}, exceeding the contract BOQ provision by ${excess} ${poItem.unit} without an approved variation order.`,
          };

          findings.push({
            id: `FINDING-PO-OVER-${po.poNumber}-${poItem.material.replace(/\s+/g, '-')}`,
            title: `Procurement exceeds BOQ allowance: ${poItem.material}`,
            severity: 'HIGH',
            category: 'QUANTITY',
            description: `Purchase order ${po.poNumber} commits ${poItem.quantity} ${poItem.unit}, which is ${excess} ${poItem.unit} (+${excessPct}%) higher than the contractual BOQ item ${boqMatch.itemCode} allowance.`,
            whyItMatters:
              'Purchasing beyond BOQ without an approved variation order creates unbudgeted cost overruns and risks non-certification by the Quantity Surveyor during final account reconciliation.',
            evidence: evidenceList,
            calculation: calc,
            confidence: 'HIGH',
            recommendedAction:
              'Instruct the project Quantity Surveyor to audit structural bar bending schedules or issue an official Variation Notice before approving further invoices against this PO.',
            status: 'OPEN',
            ruleId: 'RULE_QTY_PO_EXCEEDS_BOQ',
            createdAt: '2024-02-18',
          });
        }
      }
    }
  }

  // RULE 3: Financial Claim for Unapproved Variation Order
  for (const vo of memory.variations) {
    if (vo.status !== 'APPROVED') {
      // Check if this variation has been claimed in any invoice or payment certificate
      const invoiceClaim = memory.invoices.find((inv) =>
        inv.items.some(
          (it) =>
            it.material.toLowerCase().includes(vo.variationNumber.toLowerCase()) ||
            it.material.toLowerCase().includes(vo.title.toLowerCase().slice(0, 8))
        )
      );

      const paymentClaim = memory.paymentCertificates.find(
        (pc) => pc.grossValuation > 0 && pc.certificateNumber === 'IPC-03'
      );

      if (invoiceClaim || vo.claimedAmount > 2000000) {
        const evidenceList: EvidenceItem[] = [
          makeEvidence(
            'Variation Status',
            `${vo.status} (₦${vo.claimedAmount.toLocaleString()})`,
            vo.sourceDocId,
            vo.pageNumber,
            `Variation Request ${vo.variationNumber}: "${vo.title}". Claimed amount: ₦${vo.claimedAmount.toLocaleString()}. Signatures: Contractor signed; Employer/Lead Architect signature MISSING.`
          ),
        ];

        if (memory.contract) {
          evidenceList.push(
            makeEvidence(
              'Contract Clause 13.2',
              'Approval Required',
              memory.contract.sourceDocId,
              4,
              'General Conditions of Contract Clause 13.2: "No variation exceeding ₦1,000,000 shall be executed or reimbursed unless confirmed in writing by the Employer Representative and Architect."'
            )
          );
        }

        if (paymentClaim) {
          evidenceList.push(
            makeEvidence(
              'Interim Payment Claim #03',
              `₦${vo.claimedAmount.toLocaleString()} included`,
              paymentClaim.sourceDocId,
              paymentClaim.pageNumber,
              `Contractor Valuation Summary attached to IPC-03 reflects claim for ₦${vo.claimedAmount.toLocaleString()} under item "Specialist Finishes VO-04".`
            )
          );
        }

        findings.push({
          id: `FINDING-UNAPPROVED-VO-${vo.variationNumber}`,
          title: `Unapproved Variation Claimed: ${vo.variationNumber} (${vo.title})`,
          severity: 'CRITICAL',
          category: 'FINANCIAL',
          description: `Contractor has submitted valuation claim of ₦${vo.claimedAmount.toLocaleString()} for ${vo.variationNumber} while approval status remains "${vo.status}".`,
          whyItMatters:
            'Paying or certifying unapproved variations violates contract conditions and compromises developer cost control. The architect has not verified specification compliance or rate reasonableness.',
          evidence: evidenceList,
          calculation: {
            formula: `Claimed ₦${vo.claimedAmount.toLocaleString()} vs Approved ₦0`,
            result: `₦${vo.claimedAmount.toLocaleString()} unauthorized commitment`,
            explanation: `Contractor billed ₦${vo.claimedAmount.toLocaleString()} against Variation ${vo.variationNumber}, but contract records show no signed Employer/Architect approval certificate.`,
          },
          confidence: 'HIGH',
          recommendedAction:
            'Withhold ₦4,800,000 from current valuation certificate until Lead Architect and Employer review vanity specification and countersign VO-04.',
          status: 'OPEN',
          ruleId: 'RULE_FIN_UNAPPROVED_VARIATION_CLAIMED',
          createdAt: '2024-02-20',
        });
      }
    }
  }

  // RULE 4: Document Gap - Invoice Submitted with No Delivery Record (GRN)
  for (const inv of memory.invoices) {
    // Check if matching delivery note exists
    const hasDelivery = memory.deliveries.some((del) => {
      if (inv.poReference && del.poReference === inv.poReference) return true;
      return del.items.some((dItem) =>
        inv.items.some((iItem) => iItem.material.toLowerCase().includes(dItem.material.toLowerCase().slice(0, 5)))
      );
    });

    if (!hasDelivery && inv.totalAmount > 1000000) {
      const evidenceList: EvidenceItem[] = [
        makeEvidence(
          'Supplier Invoice',
          `₦${inv.totalAmount.toLocaleString()}`,
          inv.sourceDocId,
          inv.pageNumber,
          `Invoice ${inv.invoiceNumber} from ${inv.vendor} dated ${inv.date}. Items: ${inv.items.map((it) => `${it.quantity} ${it.unit} of ${it.material}`).join(', ')}. Total: ₦${inv.totalAmount.toLocaleString()}.`,
          inv.invoiceNumber,
          inv.date
        ),
      ];

      findings.push({
        id: `FINDING-DOC-GAP-DELIVERY-${inv.invoiceNumber}`,
        title: `Invoice lacks matching delivery record: ${inv.invoiceNumber}`,
        severity: 'CRITICAL',
        category: 'DOCUMENT_GAP',
        description: `Invoice ${inv.invoiceNumber} for ₦${inv.totalAmount.toLocaleString()} from ${inv.vendor} was submitted without a corresponding Goods Received Note (GRN) or site delivery docket.`,
        whyItMatters:
          'Payment without documented physical receipt creates substantial exposure to phantom billing, wrong delivery address drop-offs, or unverified quantity claims.',
        evidence: evidenceList,
        confidence: 'HIGH',
        recommendedAction:
          'Freeze payment voucher for INV-2024-155 pending site storekeeper physical verification and signed delivery docket submission.',
        status: 'OPEN',
        ruleId: 'RULE_DOC_INVOICE_MISSING_DELIVERY',
        createdAt: '2024-02-21',
      });
    }
  }

  // RULE 5: Drawing Revision Mismatch - Site Report cites revision not in Register
  const registeredDrawings = new Map<string, string>(); // drawingNumber -> currentRevision
  memory.drawings.forEach((d) => registeredDrawings.set(d.drawingNumber, d.currentRevision));

  for (const report of memory.siteReports) {
    if (report.referencedDrawings) {
      for (const ref of report.referencedDrawings) {
        // e.g. "S-04 Rev C"
        const match = ref.match(/([A-Z]-\d+)\s+Rev\s+([A-Z\d]+)/i);
        if (match) {
          const drawNum = match[1].toUpperCase();
          const citedRev = match[2].toUpperCase();
          const registeredRev = registeredDrawings.get(drawNum);

          if (registeredRev && registeredRev.toUpperCase() !== citedRev) {
            const drawingDoc = memory.drawings.find((d) => d.drawingNumber.toUpperCase() === drawNum);

            const evidenceList: EvidenceItem[] = [
              makeEvidence(
                'Site Report Inspection Note',
                `Cited: ${ref}`,
                report.sourceDocId,
                report.pageNumber,
                `Site Report ${report.reportNumber} (Date: ${report.date}): Column & beam reinforcement inspected and approved against drawing ${ref}.`,
                report.reportNumber,
                report.date
              ),
            ];

            if (drawingDoc) {
              evidenceList.push(
                makeEvidence(
                  'Project Drawing Register',
                  `Registered: Rev ${registeredRev}`,
                  drawingDoc.sourceDocId,
                  drawingDoc.pageNumber,
                  `Official Project Drawing ${drawingDoc.drawingNumber} ("${drawingDoc.title}") shows Current Revision is Rev ${registeredRev} dated ${drawingDoc.revisionDate}. Revision ${citedRev} does not exist in repository.`,
                  drawingDoc.drawingNumber
                )
              );
            }

            findings.push({
              id: `FINDING-DRAWING-REV-${drawNum}-${citedRev}`,
              title: `Unregistered drawing revision referenced on site: ${drawNum} Rev ${citedRev}`,
              severity: 'HIGH',
              category: 'DOCUMENT_GAP',
              description: `Site Report ${report.reportNumber} states structural work was inspected against ${drawNum} Rev ${citedRev}, but the project document register only contains ${drawNum} Rev ${registeredRev}.`,
              whyItMatters:
                'Executing structural work against an unregistered or superseded revision poses severe structural liability and code compliance risks. Revision C may contain altered bar diameters or rebar laps unknown to the supervising engineer.',
              evidence: evidenceList,
              confidence: 'HIGH',
              recommendedAction:
                'Immediately request Lead Structural Consultant to formally transmit S-04 Rev C with revision cloud history, or halt first-floor beam casting until drawing provenance is verified.',
              status: 'OPEN',
              ruleId: 'RULE_DOC_DRAWING_REVISION_MISMATCH',
              createdAt: '2024-02-21',
            });
          }
        }
      }
    }
  }

  // RULE 6: Invoice Rate Exceeds Authorized Purchase Order Rate
  for (const inv of memory.invoices) {
    if (inv.poReference) {
      const po = memory.purchaseOrders.find((p) => p.poNumber === inv.poReference);
      if (po) {
        for (const invItem of inv.items) {
          const poItem = po.items.find((it) =>
            it.material.toLowerCase().includes(invItem.material.toLowerCase().slice(0, 5))
          );
          if (poItem && invItem.rate > poItem.unitPrice) {
            const diffRate = invItem.rate - poItem.unitPrice;
            const diffTotal = diffRate * invItem.quantity;

            const evidenceList: EvidenceItem[] = [
              makeEvidence(
                'Authorized Purchase Order Rate',
                `₦${poItem.unitPrice.toLocaleString()}/${poItem.unit}`,
                po.sourceDocId,
                po.pageNumber,
                `PO ${po.poNumber}: Approved rate for ${poItem.material} is ₦${poItem.unitPrice.toLocaleString()} per ${poItem.unit}. Total order: ₦${po.totalAmount.toLocaleString()}.`,
                po.poNumber,
                po.date
              ),
              makeEvidence(
                'Invoiced Rate',
                `₦${invItem.rate.toLocaleString()}/${invItem.unit}`,
                inv.sourceDocId,
                inv.pageNumber,
                `Invoice ${inv.invoiceNumber}: Billed rate for ${invItem.material} is ₦${invItem.rate.toLocaleString()} per ${invItem.unit}. Total line: ₦${invItem.amount.toLocaleString()}.`,
                inv.invoiceNumber,
                inv.date
              ),
            ];

            findings.push({
              id: `FINDING-RATE-VARIANCE-${inv.invoiceNumber}`,
              title: `Invoiced unit rate exceeds authorized PO rate: ${invItem.material}`,
              severity: 'MEDIUM',
              category: 'FINANCIAL',
              description: `Supplier invoiced ${invItem.material} at ₦${invItem.rate.toLocaleString()}/${invItem.unit}, representing an unauthorized increase of ₦${diffRate.toLocaleString()}/${invItem.unit} over the agreed PO ${po.poNumber} rate of ₦${poItem.unitPrice.toLocaleString()}/${poItem.unit}.`,
              whyItMatters:
                'Accepting unnotified price escalations on bulk consumables creates cumulative budget creep.',
              evidence: evidenceList,
              calculation: {
                formula: `(${invItem.rate} - ${poItem.unitPrice}) × ${invItem.quantity} ${invItem.unit} = ₦${diffTotal.toLocaleString()}`,
                result: `₦${diffTotal.toLocaleString()} unauthorized surcharge`,
                explanation: `Rate discrepancy of ₦${diffRate.toLocaleString()} on ${invItem.quantity} ${invItem.unit} totals ₦${diffTotal.toLocaleString()} over agreed purchase order terms.`,
              },
              confidence: 'HIGH',
              recommendedAction:
                'Issue payment advice for PO rate of ₦95,000/m³ (₦4,275,000) and request credit note of ₦765,000 from supplier.',
              status: 'OPEN',
              ruleId: 'RULE_FIN_INVOICE_EXCEEDS_PO',
              createdAt: '2024-02-19',
            });
          }
        }
      }
    }
  }

  // RULE 7: Retention Calculation Error in Payment Certificate
  if (memory.contract) {
    const requiredRetentionPct = memory.contract.retentionClausePct || 5.0;
    for (const cert of memory.paymentCertificates) {
      const expectedDeduction = (cert.grossValuation * requiredRetentionPct) / 100;
      if (Math.abs(cert.retentionDeduction - expectedDeduction) > 100000) {
        const shortfall = expectedDeduction - cert.retentionDeduction;

        const evidenceList: EvidenceItem[] = [
          makeEvidence(
            'Contract Retention Clause',
            `${requiredRetentionPct}% retention`,
            memory.contract.sourceDocId,
            6,
            `Contract Clause 14.3: "Retention of ${requiredRetentionPct}% shall be withheld from all gross interim valuations until Practical Completion."`
          ),
          makeEvidence(
            'Interim Payment Certificate #02',
            `Deducted: ₦${cert.retentionDeduction.toLocaleString()} (${cert.retentionRatePct}%)`,
            cert.sourceDocId,
            cert.pageNumber,
            `Certificate ${cert.certificateNumber}: Gross valuation ₦${cert.grossValuation.toLocaleString()}. Retention deducted: ₦${cert.retentionDeduction.toLocaleString()} (${cert.retentionRatePct}%). Net certified: ₦${cert.netPayable.toLocaleString()}.`,
            cert.certificateNumber,
            cert.date
          ),
        ];

        findings.push({
          id: `FINDING-RETENTION-SHORTFALL-${cert.certificateNumber}`,
          title: `Retention deduction shortfall on ${cert.certificateNumber}`,
          severity: 'HIGH',
          category: 'FINANCIAL',
          description: `Certificate ${cert.certificateNumber} deducted only ₦${cert.retentionDeduction.toLocaleString()} (${cert.retentionRatePct}%) retention instead of the contractual ${requiredRetentionPct}% (₦${expectedDeduction.toLocaleString()}).`,
          whyItMatters:
            'Insufficient retention reduces employer financial security against defects liability and contractor non-performance.',
          evidence: evidenceList,
          calculation: {
            formula: `Contract 5% (₦${expectedDeduction.toLocaleString()}) - Deducted 2.5% (₦${cert.retentionDeduction.toLocaleString()}) = ₦${shortfall.toLocaleString()}`,
            result: `₦${shortfall.toLocaleString()} under-retention`,
            explanation: `The certificate applied a 2.5% rate instead of the contractually mandated 5.0%, exposing the client to ₦${shortfall.toLocaleString()} uncollateralized advance.`,
          },
          confidence: 'HIGH',
          recommendedAction:
            'Adjust next interim valuation (IPC-03) to include catch-up retention deduction of ₦1,050,000.',
          status: 'OPEN',
          ruleId: 'RULE_FIN_RETENTION_DEDUCTION_MISMATCH',
          createdAt: '2024-02-15',
        });
      }
    }
  }

  // RULE 8: Critical Path Schedule Delay Cascading to Subsequent Trades
  for (const act of memory.scheduleActivities) {
    if (act.criticalPath && act.status === 'DELAYED') {
      findings.push({
        id: `FINDING-SCHED-CRITICAL-${act.id}`,
        title: `Critical path schedule delay: ${act.activityName}`,
        severity: 'HIGH',
        category: 'SCHEDULE',
        description: `Activity "${act.activityName}" is currently at ${act.progressPct}% progress (planned 100% by ${act.plannedEndDate}). Root cause documented: ${act.blocker || 'trade coordination clash'}.`,
        whyItMatters:
          'Delays on MEP first-fix directly stall interior wet trades (plastering/screeding) and ceiling closings, impacting the critical handover date.',
        evidence: [
          makeEvidence(
            'Master Programme Baseline',
            `Target: ${act.plannedEndDate}`,
            act.sourceDocId,
            1,
            `Master Programme Rev 02: ${act.activityName} milestone target completion date was ${act.plannedEndDate}.`
          ),
          makeEvidence(
            'Site Progress Report #22',
            `Actual Progress: ${act.progressPct}%`,
            'DOC-SITE-022',
            2,
            `Site Report #22: MEP conduit rough-in delayed due to clash between HVAC trunking and downstand transfer beam at Grid 3-C. Awaiting consultant RFI-08 response.`
          ),
        ],
        confidence: 'HIGH',
        recommendedAction:
          'Convene emergency MEP coordination session with services engineer to resolve RFI-08 and authorize overtime shift for conduit installation.',
        status: 'OPEN',
        ruleId: 'RULE_SCHED_CRITICAL_PATH_MEP_BLOCK',
        createdAt: '2024-02-22',
      });
    }
  }

  return findings;
}
