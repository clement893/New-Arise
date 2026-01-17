/**
 * PDF Generation Utilities
 * Functions to generate PDF reports for assessments
 * 
 * NOTE: These functions must only run on the client side as they use browser APIs
 */

import type { AssessmentResult } from '@/lib/api/assessments';

// Dynamic imports to ensure these only load on client side
let jsPDF: any;
let JSZip: any;

const ensureClientSide = () => {
  if (typeof window === 'undefined') {
    throw new Error('PDF generation can only be performed on the client side');
  }
};

const loadDependencies = async () => {
  ensureClientSide();
  if (!jsPDF) {
    const jsPDFModule = await import('jspdf');
    jsPDF = jsPDFModule.jsPDF;
  }
  if (!JSZip) {
    const JSZipModule = await import('jszip');
    JSZip = JSZipModule.default;
  }
};

interface AssessmentForPDF {
  id: number;
  name: string;
  type: string;
  completedDate: string;
  score: string;
  result: string;
  detailedResult?: AssessmentResult;
}

/**
 * Generate a PDF for a single assessment
 */
export const generateAssessmentPDF = async (assessment: AssessmentForPDF): Promise<Blob> => {
  await loadDependencies();
  ensureClientSide();
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(assessment.name, pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Assessment Info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Completed: ${assessment.completedDate}`, 20, yPos);
  yPos += 8;
  doc.text(`Score: ${assessment.score}`, 20, yPos);
  yPos += 8;
  doc.text(`Result: ${assessment.result}`, 20, yPos);
  yPos += 15;

  // Detailed Results Section
  if (assessment.detailedResult?.scores) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Detailed Results', 20, yPos);
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const scores = assessment.detailedResult.scores;

    // MBTI Results
    if (assessment.type === 'MBTI' && scores.mbti_type) {
      doc.text(`Personality Type: ${scores.mbti_type}`, 20, yPos);
      yPos += 7;
      if (scores.dimension_preferences) {
        doc.text('Dimension Preferences:', 20, yPos);
        yPos += 7;
        Object.entries(scores.dimension_preferences).forEach(([key, value]) => {
          doc.text(`  ${key}: ${value}`, 25, yPos);
          yPos += 6;
        });
      }
    }

    // TKI Results
    if (assessment.type === 'TKI' && scores.mode_scores) {
      doc.text('Conflict Mode Scores:', 20, yPos);
      yPos += 7;
      Object.entries(scores.mode_scores)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .forEach(([mode, score]) => {
          doc.text(`  ${mode}: ${score}`, 25, yPos);
          yPos += 6;
        });
    }

    // Wellness Results
    if (assessment.type === 'WELLNESS' && scores.pillar_scores) {
      doc.text('Wellness Pillar Scores:', 20, yPos);
      yPos += 7;
      Object.entries(scores.pillar_scores).forEach(([pillar, score]) => {
        const scoreValue = typeof score === 'number' 
          ? score 
          : (score as any).score || (score as any).percentage || 0;
        doc.text(`  ${pillar.replace(/_/g, ' ')}: ${scoreValue}`, 25, yPos);
        yPos += 6;
      });
    }

    // 360° Feedback Results
    if (assessment.type === 'THREE_SIXTY_SELF' && scores.capability_scores) {
      doc.text('Capability Scores:', 20, yPos);
      yPos += 7;
      Object.entries(scores.capability_scores).forEach(([capability, score]) => {
        const scoreValue = typeof score === 'number'
          ? score
          : (score as any).self_score || (score as any).percentage || 0;
        doc.text(`  ${capability.replace(/_/g, ' ')}: ${scoreValue}`, 25, yPos);
        yPos += 6;
      });
    }

    // Add new page if needed
    if (yPos > pageHeight - 30) {
      doc.addPage();
      yPos = 20;
    }
  }

  // Insights Section
  if (assessment.detailedResult?.insights) {
    if (yPos > pageHeight - 50) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Insights', 20, yPos);
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const insights = assessment.detailedResult.insights;
    if (typeof insights === 'object') {
      Object.entries(insights).forEach(([key, value]) => {
        const text = `${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}`;
        const lines = doc.splitTextToSize(text, pageWidth - 40);
        doc.text(lines, 20, yPos);
        yPos += lines.length * 6;
        if (yPos > pageHeight - 30) {
          doc.addPage();
          yPos = 20;
        }
      });
    }
  }

  // Recommendations Section
  if (assessment.detailedResult?.recommendations) {
    if (yPos > pageHeight - 50) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Recommendations', 20, yPos);
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const recommendations = assessment.detailedResult.recommendations;
    if (Array.isArray(recommendations)) {
      recommendations.forEach((rec, index) => {
        const text = typeof rec === 'string' ? `${index + 1}. ${rec}` : `${index + 1}. ${JSON.stringify(rec)}`;
        const lines = doc.splitTextToSize(text, pageWidth - 40);
        doc.text(lines, 20, yPos);
        yPos += lines.length * 6;
        if (yPos > pageHeight - 30) {
          doc.addPage();
          yPos = 20;
        }
      });
    } else if (typeof recommendations === 'object') {
      Object.entries(recommendations).forEach(([key, value]) => {
        const text = `${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}`;
        const lines = doc.splitTextToSize(text, pageWidth - 40);
        doc.text(lines, 20, yPos);
        yPos += lines.length * 6;
        if (yPos > pageHeight - 30) {
          doc.addPage();
          yPos = 20;
        }
      });
    }
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.text('ARISE Leadership Assessment', pageWidth / 2, pageHeight - 5, { align: 'center' });
  }

  return doc.output('blob');
};

/**
 * Generate a ZIP file containing all assessment PDFs
 */
export const generateAllAssessmentsZip = async (assessments: AssessmentForPDF[]): Promise<Blob> => {
  await loadDependencies();
  ensureClientSide();
  
  const zip = new JSZip();
  
  // Generate PDF for each assessment
  for (const assessment of assessments) {
    try {
      const pdfBlob = await generateAssessmentPDF(assessment);
      const fileName = `${assessment.name.replace(/\s+/g, '_')}_${assessment.id}.pdf`;
      zip.file(fileName, pdfBlob);
    } catch (err) {
      console.error(`Failed to generate PDF for assessment ${assessment.id}:`, err);
    }
  }

  // Generate the ZIP file
  return await zip.generateAsync({ type: 'blob' });
};

/**
 * Generate a complete leadership profile PDF with all assessments
 */
export const generateCompleteLeadershipProfilePDF = async (
  assessments: AssessmentForPDF[]
): Promise<Blob> => {
  await loadDependencies();
  ensureClientSide();
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  // Cover Page
  doc.setFillColor(15, 69, 77); // ARISE deep teal
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('Leadership Profile', pageWidth / 2, pageHeight / 2 - 20, { align: 'center' });
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'normal');
  doc.text('Comprehensive Assessment Results', pageWidth / 2, pageHeight / 2, { align: 'center' });
  
  doc.setFontSize(12);
  const currentDate = new Date().toLocaleDateString('en-US');
  doc.text(`Generated: ${currentDate}`, pageWidth / 2, pageHeight / 2 + 30, { align: 'center' });
  doc.text('ARISE Leadership Development Platform', pageWidth / 2, pageHeight / 2 + 40, { align: 'center' });

  // Introduction Page
  doc.addPage();
  doc.setTextColor(0, 0, 0);
  yPos = 20;
  
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Introduction', 20, yPos);
  yPos += 15;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const introText = `This comprehensive leadership profile combines insights from ${assessments.length} assessment(s) to provide a holistic view of your leadership capabilities, strengths, and development opportunities.

The following sections detail your results from each assessment, along with personalized insights and recommendations for continued growth.`;
  
  const introLines = doc.splitTextToSize(introText, pageWidth - 40);
  doc.text(introLines, 20, yPos);
  yPos += introLines.length * 7 + 15;

  // Summary Statistics
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary Statistics', 20, yPos);
  yPos += 12;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const scores = assessments
    .map((a) => parseFloat(a.score.replace('%', '')))
    .filter((s) => !isNaN(s) && s > 0);
  const avgScore = scores.length > 0 
    ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
    : 0;

  doc.text(`Total Assessments Completed: ${assessments.length}`, 20, yPos);
  yPos += 8;
  doc.text(`Average Score: ${avgScore}%`, 20, yPos);
  yPos += 15;

  // Individual Assessment Sections
  let isFirstAssessment = true;
  for (const assessment of assessments) {
    // Add new page for each assessment (always for first, then check space for others)
    if (isFirstAssessment || yPos > pageHeight - 50) {
      doc.addPage();
      yPos = 20;
      isFirstAssessment = false;
    }

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(assessment.name, 20, yPos);
    yPos += 12;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Completed: ${assessment.completedDate}`, 20, yPos);
    yPos += 7;
    doc.text(`Score: ${assessment.score}`, 20, yPos);
    yPos += 7;
    doc.text(`Result: ${assessment.result}`, 20, yPos);
    yPos += 12;

    // Detailed results
    if (assessment.detailedResult?.scores) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Results', 20, yPos);
      yPos += 10;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      const scores = assessment.detailedResult.scores;

      if (assessment.type === 'MBTI' && scores.mbti_type) {
        doc.text(`Personality Type: ${scores.mbti_type}`, 25, yPos);
        yPos += 7;
      }

      if (assessment.type === 'TKI' && scores.mode_scores) {
        const sorted = Object.entries(scores.mode_scores)
          .sort(([, a], [, b]) => (b as number) - (a as number));
        const dominantEntry = sorted[0];
        if (dominantEntry) {
          doc.text(`Dominant Mode: ${dominantEntry[0]}`, 25, yPos);
          yPos += 7;
        }
      }

      if (assessment.type === 'WELLNESS' && scores.pillar_scores) {
        const sorted = Object.entries(scores.pillar_scores)
          .sort(([, a], [, b]) => {
            const aScore = typeof a === 'number' ? a : (a as any).score || (a as any).percentage || 0;
            const bScore = typeof b === 'number' ? b : (b as any).score || (b as any).percentage || 0;
            return bScore - aScore;
          });
        const strongestEntry = sorted[0];
        if (strongestEntry) {
          doc.text(`Strongest Pillar: ${strongestEntry[0].replace(/_/g, ' ')}`, 25, yPos);
          yPos += 7;
        }
      }

      if (assessment.type === 'THREE_SIXTY_SELF' && scores.capability_scores) {
        doc.text('Key Capabilities:', 25, yPos);
        yPos += 7;
        Object.entries(scores.capability_scores).slice(0, 3).forEach(([capability, score]) => {
          const scoreValue = typeof score === 'number'
            ? score
            : (score as any).self_score || (score as any).percentage || 0;
          doc.text(`  • ${capability.replace(/_/g, ' ')}: ${scoreValue}`, 30, yPos);
          yPos += 6;
        });
      }

      yPos += 10;
    }

    // Key recommendations
    if (assessment.detailedResult?.recommendations) {
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Key Recommendations', 20, yPos);
      yPos += 10;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      const recommendations = assessment.detailedResult.recommendations;
      const recs = Array.isArray(recommendations) 
        ? recommendations.slice(0, 3)
        : (typeof recommendations === 'object' ? Object.values(recommendations).slice(0, 3) : []);

      recs.forEach((rec, index) => {
        const text = typeof rec === 'string' ? `${index + 1}. ${rec}` : `${index + 1}. ${JSON.stringify(rec)}`;
        const lines = doc.splitTextToSize(text, pageWidth - 50);
        doc.text(lines, 25, yPos);
        yPos += lines.length * 6;
        if (yPos > pageHeight - 30) {
          doc.addPage();
          yPos = 20;
        }
      });

      yPos += 15;
    }
  }

  // Personal Growth Plan Page
  doc.addPage();
  yPos = 20;

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Personal Growth Plan', 20, yPos);
  yPos += 15;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const planText = `Based on your assessment results, focus on the following areas for continued leadership development:

1. Leverage your identified strengths in leadership and communication
2. Address areas with development opportunities identified in your assessments
3. Set specific, measurable goals aligned with your assessment insights
4. Regularly review and update your personal growth plan
5. Seek feedback from colleagues and mentors

Consider working with an ARISE coach to create a personalized growth plan tailored to your specific results and career goals.`;
  
  const planLines = doc.splitTextToSize(planText, pageWidth - 40);
  doc.text(planLines, 20, yPos);

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.text('ARISE Leadership Development Platform', pageWidth / 2, pageHeight - 5, { align: 'center' });
  }

  return doc.output('blob');
};

/**
 * Download a blob as a file
 */
export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
