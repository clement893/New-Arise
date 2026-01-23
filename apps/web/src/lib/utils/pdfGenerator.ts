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

// Helper function to check if we need a new page
const checkNewPage = (doc: any, yPos: number, pageHeight: number, margin: number = 30): number => {
  if (yPos > pageHeight - margin) {
    doc.addPage();
    return 20;
  }
  return yPos;
};

// Helper function to add section title
const addSectionTitle = (doc: any, title: string, yPos: number, pageHeight: number): number => {
  yPos = checkNewPage(doc, yPos, pageHeight, 50);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 20, yPos);
  yPos += 10;
  return yPos;
};

/**
 * Generate Wellness Assessment PDF
 */
const generateWellnessPDF = async (
  doc: any,
  assessment: AssessmentForPDF,
  pageWidth: number,
  pageHeight: number
): Promise<void> => {
  let yPos = 20;
  const results = assessment.detailedResult;
  if (!results?.scores) return;

  const scores = results.scores;
  const pillarScores = scores.pillar_scores || {};
  const percentage = typeof scores.percentage === 'number' ? scores.percentage : 0;
  const totalScore = scores.total_score || 0;
  const maxScore = scores.max_score || 150;

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(assessment.name, pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Completed: ${assessment.completedDate}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Overall Score Section
  yPos = addSectionTitle(doc, 'Overall Score', yPos, pageHeight);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(`Score: ${percentage.toFixed(0)}%`, 20, yPos);
  yPos += 8;
  doc.text(`Points: ${totalScore} / ${maxScore}`, 20, yPos);
  yPos += 15;

  // Pillar Scores Section
  yPos = addSectionTitle(doc, 'Wellness Pillar Scores', yPos, pageHeight);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const pillarEntries = Object.entries(pillarScores).sort(([, a], [, b]) => {
    const aScore = typeof a === 'number' ? a : (a as any).score || 0;
    const bScore = typeof b === 'number' ? b : (b as any).score || 0;
    return bScore - aScore;
  });

  for (const [pillarId, pillarData] of pillarEntries) {
    yPos = checkNewPage(doc, yPos, pageHeight);
    const pillarScore = typeof pillarData === 'number' 
      ? pillarData 
      : (pillarData as any).score || 0;
    const pillarName = pillarId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const percentage = (pillarScore / 25) * 100;
    
    doc.setFont('helvetica', 'bold');
    doc.text(`${pillarName}:`, 20, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    doc.text(`  Score: ${pillarScore} / 25 (${percentage.toFixed(0)}%)`, 25, yPos);
    yPos += 10;
  }

  // Insights Section
  if (results.insights) {
    yPos = addSectionTitle(doc, 'Key Insights', yPos, pageHeight);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const insightsText = typeof results.insights === 'string' 
      ? results.insights 
      : JSON.stringify(results.insights, null, 2);
    const lines = doc.splitTextToSize(insightsText, pageWidth - 40);
    doc.text(lines, 20, yPos);
    yPos += lines.length * 6 + 10;
  }

  // Recommendations Section
  if (results.recommendations) {
    yPos = addSectionTitle(doc, 'Recommendations', yPos, pageHeight);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const recommendations = Array.isArray(results.recommendations)
      ? results.recommendations
      : typeof results.recommendations === 'object'
      ? Object.values(results.recommendations)
      : [];
    
    recommendations.forEach((rec, index) => {
      yPos = checkNewPage(doc, yPos, pageHeight);
      const text = typeof rec === 'string' ? `${index + 1}. ${rec}` : `${index + 1}. ${JSON.stringify(rec)}`;
      const lines = doc.splitTextToSize(text, pageWidth - 40);
      doc.text(lines, 20, yPos);
      yPos += lines.length * 6 + 3;
    });
  }
};

/**
 * Generate 360° Feedback Assessment PDF
 */
const generate360PDF = async (
  doc: any,
  assessment: AssessmentForPDF,
  pageWidth: number,
  pageHeight: number
): Promise<void> => {
  let yPos = 20;
  const results = assessment.detailedResult;
  if (!results?.scores) return;

  const scores = results.scores;
  const capabilityScores = scores.capability_scores || {};
  const percentage = typeof scores.percentage === 'number' ? scores.percentage : 0;
  const totalScore = scores.total_score || 0;
  const maxScore = scores.max_score || 150;
  const comparisonData = results.comparison_data;

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(assessment.name, pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Completed: ${assessment.completedDate}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Overall Score Section
  yPos = addSectionTitle(doc, 'Overall Score', yPos, pageHeight);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(`Score: ${percentage.toFixed(1)}%`, 20, yPos);
  yPos += 8;
  doc.text(`Points: ${totalScore} / ${maxScore}`, 20, yPos);
  yPos += 15;

  // Capability Breakdown
  yPos = addSectionTitle(doc, 'Leadership Capabilities', yPos, pageHeight);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const capabilityEntries = Object.entries(capabilityScores);
  for (const [capabilityId, capabilityData] of capabilityEntries) {
    yPos = checkNewPage(doc, yPos, pageHeight, 40);
    const capabilityName = capabilityId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    
    // Get self score
    let selfScore = 0;
    if (typeof capabilityData === 'number') {
      selfScore = capabilityData / 5; // Convert from sum (max 25) to average (max 5.0)
    } else if (typeof capabilityData === 'object' && capabilityData !== null) {
      selfScore = (capabilityData as any).self_score || ((capabilityData as any).score || 0) / 5;
    }

    // Get others average if available
    let othersAvg = 0;
    if (comparisonData && typeof comparisonData === 'object') {
      const compScores = (comparisonData as any).capability_scores;
      if (compScores && compScores[capabilityId]) {
        const compScore = compScores[capabilityId];
        othersAvg = typeof compScore === 'number' 
          ? compScore / 5 
          : (compScore as any).score ? (compScore as any).score / 5 : 0;
      }
    }

    doc.setFont('helvetica', 'bold');
    doc.text(`${capabilityName}:`, 20, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    doc.text(`  Self Assessment: ${selfScore.toFixed(1)} / 5.0`, 25, yPos);
    yPos += 7;
    if (othersAvg > 0) {
      doc.text(`  Others' Average: ${othersAvg.toFixed(1)} / 5.0`, 25, yPos);
      yPos += 7;
      const gap = selfScore - othersAvg;
      doc.text(`  Gap: ${gap > 0 ? '+' : ''}${gap.toFixed(1)}`, 25, yPos);
      yPos += 7;
    }
    yPos += 5;
  }

  // Insights Section
  if (results.insights) {
    yPos = addSectionTitle(doc, 'Insights', yPos, pageHeight);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const insightsText = typeof results.insights === 'string' 
      ? results.insights 
      : JSON.stringify(results.insights, null, 2);
    const lines = doc.splitTextToSize(insightsText, pageWidth - 40);
    doc.text(lines, 20, yPos);
    yPos += lines.length * 6 + 10;
  }

  // Recommendations Section
  if (results.recommendations) {
    yPos = addSectionTitle(doc, 'Recommendations', yPos, pageHeight);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const recommendations = Array.isArray(results.recommendations)
      ? results.recommendations
      : typeof results.recommendations === 'object'
      ? Object.values(results.recommendations)
      : [];
    
    recommendations.forEach((rec, index) => {
      yPos = checkNewPage(doc, yPos, pageHeight);
      const text = typeof rec === 'string' ? `${index + 1}. ${rec}` : `${index + 1}. ${JSON.stringify(rec)}`;
      const lines = doc.splitTextToSize(text, pageWidth - 40);
      doc.text(lines, 20, yPos);
      yPos += lines.length * 6 + 3;
    });
  }
};

/**
 * Generate MBTI Assessment PDF
 */
const generateMBTIPDF = async (
  doc: any,
  assessment: AssessmentForPDF,
  pageWidth: number,
  pageHeight: number
): Promise<void> => {
  let yPos = 20;
  const results = assessment.detailedResult;
  if (!results?.scores) return;

  const scores = results.scores;
  const mbtiType = scores.mbti_type || 'XXXX';
  const dimensionPreferences = scores.dimension_preferences || {};
  const insights = results.insights || {};

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(assessment.name, pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Completed: ${assessment.completedDate}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Personality Type Section
  yPos = addSectionTitle(doc, 'Personality Type', yPos, pageHeight);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(mbtiType, 20, yPos);
  yPos += 12;

  // Type Description
  if (insights.personality_type || insights.description) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const description = insights.personality_type || insights.description || '';
    const lines = doc.splitTextToSize(description, pageWidth - 40);
    doc.text(lines, 20, yPos);
    yPos += lines.length * 6 + 10;
  }

  // Dimension Breakdown
  if (Object.keys(dimensionPreferences).length > 0) {
    yPos = addSectionTitle(doc, 'Dimension Preferences', yPos, pageHeight);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    Object.entries(dimensionPreferences).forEach(([dimension, prefs]) => {
      yPos = checkNewPage(doc, yPos, pageHeight);
      if (typeof prefs === 'object' && prefs !== null) {
        const formattedPrefs = Object.entries(prefs)
          .map(([letter, value]) => `${letter}: ${value}%`)
          .join(', ');
        doc.text(`${dimension}: ${formattedPrefs}`, 25, yPos);
        yPos += 7;
      }
    });
    yPos += 5;
  }

  // Leadership Capabilities
  if (insights.leadership_capabilities && typeof insights.leadership_capabilities === 'object') {
    yPos = addSectionTitle(doc, 'Leadership Capabilities Analysis', yPos, pageHeight);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    Object.entries(insights.leadership_capabilities).forEach(([capKey, capValue]: [string, any]) => {
      yPos = checkNewPage(doc, yPos, pageHeight, 40);
      if (typeof capValue === 'object' && capValue !== null) {
        doc.setFont('helvetica', 'bold');
        doc.text(`${capKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}:`, 20, yPos);
        yPos += 7;
        if (capValue.title) {
          doc.setFont('helvetica', 'bold');
          doc.text(`  ${capValue.title}`, 25, yPos);
          yPos += 7;
        }
        if (capValue.description) {
          doc.setFont('helvetica', 'normal');
          const lines = doc.splitTextToSize(capValue.description, pageWidth - 50);
          doc.text(lines, 25, yPos);
          yPos += lines.length * 6 + 5;
        }
      }
    });
  }

  // Recommendations Section
  if (results.recommendations) {
    yPos = addSectionTitle(doc, 'Recommendations', yPos, pageHeight);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const recommendations = Array.isArray(results.recommendations)
      ? results.recommendations
      : typeof results.recommendations === 'object'
      ? Object.values(results.recommendations)
      : [];
    
    recommendations.forEach((rec, index) => {
      yPos = checkNewPage(doc, yPos, pageHeight);
      const text = typeof rec === 'string' ? `${index + 1}. ${rec}` : `${index + 1}. ${JSON.stringify(rec)}`;
      const lines = doc.splitTextToSize(text, pageWidth - 40);
      doc.text(lines, 20, yPos);
      yPos += lines.length * 6 + 3;
    });
  }
};

/**
 * Generate TKI Assessment PDF
 */
const generateTKIPDF = async (
  doc: any,
  assessment: AssessmentForPDF,
  pageWidth: number,
  pageHeight: number
): Promise<void> => {
  let yPos = 20;
  const results = assessment.detailedResult;
  if (!results?.scores) return;

  const scores = results.scores;
  const modeScores = scores.mode_scores || {};
  const insights = results.insights || {};

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(assessment.name, pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Completed: ${assessment.completedDate}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Find dominant and secondary modes
  const sortedModes = Object.entries(modeScores)
    .sort(([, a], [, b]) => (b as number) - (a as number));
  const dominantMode = sortedModes[0]?.[0] || '';
  const secondaryMode = sortedModes[1]?.[0] || '';

  // Dominant and Secondary Modes
  yPos = addSectionTitle(doc, 'Conflict Mode Profile', yPos, pageHeight);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Dominant Mode:', 20, yPos);
  yPos += 8;
  doc.setFont('helvetica', 'normal');
  doc.text(`  ${dominantMode.replace(/\b\w/g, c => c.toUpperCase())} (${modeScores[dominantMode] || 0} responses)`, 25, yPos);
  yPos += 10;
  if (secondaryMode) {
    doc.setFont('helvetica', 'bold');
    doc.text('Secondary Mode:', 20, yPos);
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(`  ${secondaryMode.replace(/\b\w/g, c => c.toUpperCase())} (${modeScores[secondaryMode] || 0} responses)`, 25, yPos);
    yPos += 10;
  }

  // All Modes Breakdown
  yPos = addSectionTitle(doc, 'All Conflict Modes', yPos, pageHeight);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  sortedModes.forEach(([mode, count]) => {
    yPos = checkNewPage(doc, yPos, pageHeight);
    const percentage = Math.round((count as number / 30) * 100);
    doc.setFont('helvetica', 'bold');
    doc.text(`${mode.replace(/\b\w/g, c => c.toUpperCase())}:`, 20, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    doc.text(`  Responses: ${count} (${percentage}%)`, 25, yPos);
    yPos += 10;
  });

  // Insights Section
  if (insights && Object.keys(insights).length > 0) {
    yPos = addSectionTitle(doc, 'Insights', yPos, pageHeight);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const insightsText = typeof insights === 'string' 
      ? insights 
      : JSON.stringify(insights, null, 2);
    const lines = doc.splitTextToSize(insightsText, pageWidth - 40);
    doc.text(lines, 20, yPos);
    yPos += lines.length * 6 + 10;
  }

  // Recommendations Section
  if (results.recommendations) {
    yPos = addSectionTitle(doc, 'Key Recommendations', yPos, pageHeight);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const recommendations = Array.isArray(results.recommendations)
      ? results.recommendations
      : typeof results.recommendations === 'object'
      ? Object.values(results.recommendations)
      : [];
    
    recommendations.forEach((rec, index) => {
      yPos = checkNewPage(doc, yPos, pageHeight);
      const text = typeof rec === 'string' ? `${index + 1}. ${rec}` : `${index + 1}. ${JSON.stringify(rec)}`;
      const lines = doc.splitTextToSize(text, pageWidth - 40);
      doc.text(lines, 20, yPos);
      yPos += lines.length * 6 + 3;
    });
  }
};

/**
 * Generate a PDF for a single assessment
 */
export const generateAssessmentPDF = async (assessment: AssessmentForPDF): Promise<Blob> => {
  await loadDependencies();
  ensureClientSide();
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Generate PDF based on assessment type
  switch (assessment.type) {
    case 'WELLNESS':
      await generateWellnessPDF(doc, assessment, pageWidth, pageHeight);
      break;
    case 'THREE_SIXTY_SELF':
      await generate360PDF(doc, assessment, pageWidth, pageHeight);
      break;
    case 'MBTI':
      await generateMBTIPDF(doc, assessment, pageWidth, pageHeight);
      break;
    case 'TKI':
      await generateTKIPDF(doc, assessment, pageWidth, pageHeight);
      break;
    default:
      // Fallback to basic PDF
      let yPos = 20;
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(assessment.name, pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Completed: ${assessment.completedDate}`, 20, yPos);
      yPos += 8;
      doc.text(`Score: ${assessment.score}`, 20, yPos);
      yPos += 8;
      doc.text(`Result: ${assessment.result}`, 20, yPos);
      break;
  }

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
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
        
        // Add dimension preferences if available
        if (scores.dimension_preferences) {
          const dimensionSummary = Object.entries(scores.dimension_preferences)
            .map(([_dimension, prefs]) => {
              if (typeof prefs === 'object' && prefs !== null) {
                const entries = Object.entries(prefs);
                if (entries.length === 2) {
                  const [pref1, pref2] = entries;
                  // Show the dominant preference
                  if (pref1 && pref2 && Number(pref1[1]) > Number(pref2[1])) {
                    return `${pref1[0]} ${pref1[1]}%`;
                  } else if (pref1 && pref2) {
                    return `${pref2[0]} ${pref2[1]}%`;
                  }
                }
              }
              return '';
            })
            .filter(Boolean)
            .join(', ');
          
          if (dimensionSummary) {
            doc.text(`Preferences: ${dimensionSummary}`, 25, yPos);
            yPos += 7;
          }
        }
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
