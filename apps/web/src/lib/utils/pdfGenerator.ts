/**
 * PDF Generation Utilities
 * Functions to generate PDF reports for assessments
 * 
 * NOTE: These functions must only run on the client side as they use browser APIs
 */

import type { AssessmentResult, PillarScore } from '@/lib/api/assessments';

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
  // Dynamic imports for wellness data
  const { wellnessPillars } = await import('@/data/wellnessQuestionsReal');
  const { getWellnessInsightWithLocale, getScoreColorCode } = await import('@/data/wellnessInsights');
  
  // Try to get locale from browser or default to 'en'
  const locale = typeof window !== 'undefined' 
    ? (document.documentElement.lang || navigator.language?.split('-')[0] || 'en')
    : 'en';

  let yPos = 20;
  const results = assessment.detailedResult;
  if (!results?.scores) return;

  const scores = results.scores;
  const pillarScores = scores.pillar_scores || {};
  const percentage = typeof scores.percentage === 'number' ? scores.percentage : 0;
  const totalScore = scores.total_score || 0;
  const maxScore = scores.max_score || 150;

  // Helper to get pillar score
  const getPillarScore = (data: number | PillarScore | undefined): number => {
    if (typeof data === 'number') return data;
    if (typeof data === 'object' && data !== null && 'score' in data) {
      return typeof data.score === 'number' ? data.score : 0;
    }
    return 0;
  };

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(assessment.name, pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Completed: ${assessment.completedDate}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Overall Score Section - Title and percentage on same line
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Overall Score', 20, yPos);
  // Calculate position for percentage
  const titleWidth = doc.getTextWidth('Overall Score');
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`${percentage.toFixed(0)}%`, 20 + titleWidth + 5, yPos);
  yPos += 10;
  
  // Score category with full text
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  let scoreCategory = '';
  const isFrench = locale === 'fr' || locale.startsWith('fr');
  if (percentage < 60) {
    scoreCategory = isFrench 
      ? 'Nécessite une amélioration significative'
      : 'Needs significant improvement';
  } else if (percentage >= 60 && percentage <= 74) {
    scoreCategory = isFrench
      ? 'En développement, certaines bonnes habitudes mais incohérentes'
      : 'Developing, some good habits but inconsistent';
  } else if (percentage >= 75 && percentage <= 85) {
    scoreCategory = isFrench
      ? 'Habitudes solides, généralement cohérentes'
      : 'Strong habits, mostly consistent';
  } else {
    scoreCategory = isFrench
      ? 'Excellente gestion globale de la santé'
      : 'Excellent overall health management';
  }
  const categoryLines = doc.splitTextToSize(scoreCategory, pageWidth - 40);
  doc.text(categoryLines, 20, yPos);
  yPos += categoryLines.length * 6 + 5;
  doc.setFontSize(11);
  doc.text(`Points: ${totalScore} / ${maxScore}`, 20, yPos);
  yPos += 15;

  // Wellness Radar Chart - Draw actual radar/spider chart
  yPos = addSectionTitle(doc, 'ARISE Wellness Radar', yPos, pageHeight);
  
  // Prepare radar data
  const pillarOrder = [
    'sleep',
    'nutrition',
    'movement',
    'avoidance_of_risky_substances',
    'stress_management',
    'social_connection',
  ];
  
  const radarData: Array<{ name: string; score: number }> = [];
  for (const pillarId of pillarOrder) {
    const pillar = wellnessPillars.find(p => p.id === pillarId);
    if (!pillar) continue;
    
    const rawPillarData = pillarScores[pillar.id];
    const pillarScore = getPillarScore(rawPillarData);
    radarData.push({
      name: pillar.name,
      score: pillarScore
    });
  }

  if (radarData.length > 0) {
    yPos = checkNewPage(doc, yPos, pageHeight, 120);
    
    // Radar chart dimensions
    const chartCenterX = pageWidth / 2;
    const chartCenterY = yPos + 50;
    const chartRadius = 40; // Maximum radius for score of 25
    const numAxes = radarData.length;
    const angleStep = (2 * Math.PI) / numAxes;
    
    // Draw concentric circles (grid lines) for scores 0, 5, 10, 15, 20, 25
    doc.setDrawColor(229, 231, 235); // Light gray
    doc.setLineWidth(0.5);
    for (let level = 1; level <= 5; level++) {
      const radius = (chartRadius * level) / 5;
      // Draw hexagon
      const points: Array<{ x: number; y: number }> = [];
      for (let i = 0; i < numAxes; i++) {
        const angle = (i * angleStep) - (Math.PI / 2); // Start from top
        points.push({
          x: chartCenterX + radius * Math.cos(angle),
          y: chartCenterY + radius * Math.sin(angle)
        });
      }
      // Draw polygon
      for (let i = 0; i < points.length; i++) {
        const next = (i + 1) % points.length;
        const currentPoint = points[i];
        const nextPoint = points[next];
        if (currentPoint && nextPoint) {
          doc.line(currentPoint.x, currentPoint.y, nextPoint.x, nextPoint.y);
        }
      }
    }
    
    // Draw axes (lines from center to outer edge)
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    for (let i = 0; i < numAxes; i++) {
      const angle = (i * angleStep) - (Math.PI / 2);
      const endX = chartCenterX + chartRadius * Math.cos(angle);
      const endY = chartCenterY + chartRadius * Math.sin(angle);
      doc.line(chartCenterX, chartCenterY, endX, endY);
    }
    
    // Score labels on axes removed - not needed
    
    // Draw filled area (radar polygon) for scores
    const scorePoints: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < radarData.length; i++) {
      const dataPoint = radarData[i];
      if (!dataPoint) continue;
      const angle = (i * angleStep) - (Math.PI / 2);
      const score = dataPoint.score;
      const radius = (chartRadius * score) / 25;
      scorePoints.push({
        x: chartCenterX + radius * Math.cos(angle),
        y: chartCenterY + radius * Math.sin(angle)
      });
    }
    
    // Fill the polygon using path() function
    doc.setFillColor(15, 76, 86); // Teal color #0F4C56
    doc.setDrawColor(15, 76, 86);
    doc.setLineWidth(1.5);
    
    // Draw filled polygon using path() function
    if (scorePoints.length > 0 && scorePoints[0]) {
      // Build path array for jsPDF
      const firstPoint = scorePoints[0];
      const pathArray: Array<{ op: string; c: number[] }> = [
        { op: 'm', c: [firstPoint.x, firstPoint.y] } // Move to first point
      ];
      
      // Add lines to all other points
      for (let i = 1; i < scorePoints.length; i++) {
        const point = scorePoints[i];
        if (point) {
          pathArray.push({ op: 'l', c: [point.x, point.y] });
        }
      }
      
      // Close the path
      pathArray.push({ op: 'h', c: [] });
      
      // Draw and fill the path
      doc.path(pathArray);
      doc.fillStroke(); // Fill and stroke the polygon
    }
    
    // Draw axis labels (pillar names)
    doc.setFontSize(9);
    doc.setTextColor(75, 85, 99); // Dark gray
    doc.setFont('helvetica', 'normal');
    for (let i = 0; i < radarData.length; i++) {
      const dataPoint = radarData[i];
      if (!dataPoint) continue;
      const angle = (i * angleStep) - (Math.PI / 2);
      const labelRadius = chartRadius + 8; // Reduced from 15 to bring labels closer
      const labelX = chartCenterX + labelRadius * Math.cos(angle);
      const labelY = chartCenterY + labelRadius * Math.sin(angle);
      
      // Adjust text alignment based on angle
      let align: 'left' | 'center' | 'right' = 'center';
      if (Math.abs(Math.cos(angle)) < 0.1) {
        // Vertical alignment
        align = 'center';
      } else if (Math.cos(angle) > 0) {
        align = 'left';
      } else {
        align = 'right';
      }
      
      // Split long labels into multiple lines
      const label = dataPoint.name;
      const words = label.split(' ');
      const maxWordsPerLine = 2;
      const lines: string[] = [];
      for (let j = 0; j < words.length; j += maxWordsPerLine) {
        lines.push(words.slice(j, j + maxWordsPerLine).join(' '));
      }
      
      // Draw each line
      lines.forEach((line, lineIndex) => {
        const lineY = labelY + (lineIndex - (lines.length - 1) / 2) * 4;
        doc.text(line, labelX, lineY, { align });
      });
      
      // Draw score below the label (reduced spacing from 3 to 1.5)
      const scoreY = labelY + (lines.length * 4) + 1.5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 76, 86); // Teal color
      doc.text(`${dataPoint.score}`, labelX, scoreY, { align });
      doc.setTextColor(75, 85, 99); // Reset to dark gray
    }
    
    yPos = chartCenterY + chartRadius + 30;
  }

  // Pillar Scores Section - Detailed
  yPos = addSectionTitle(doc, 'Wellness Pillar Scores', yPos, pageHeight);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  // Process each pillar in order
  for (const pillar of wellnessPillars) {
    const rawPillarData = pillarScores[pillar.id];
    const pillarScore = getPillarScore(rawPillarData);
    if (pillarScore === 0 && !rawPillarData) continue; // Skip if no data

    yPos = checkNewPage(doc, yPos, pageHeight, 60);
    
    const pillarPercentage = (pillarScore / 25) * 100;
    const insightData = getWellnessInsightWithLocale(pillar.id, pillarScore, locale);

    // Pillar header with name (no emoji - jsPDF doesn't support emojis well with Helvetica)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    // Just use the name without emoji to avoid encoding issues
    doc.text(pillar.name, 20, yPos);
    yPos += 8;

    // Assessment/Description
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const assessmentText = insightData?.assessment || pillar.description;
    const assessmentLines = doc.splitTextToSize(assessmentText, pageWidth - 40);
    doc.text(assessmentLines, 20, yPos);
    yPos += assessmentLines.length * 5 + 5;

    // Score with visual bar representation
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Score: ${pillarScore} / 25 (${pillarPercentage.toFixed(0)}%)`, 20, yPos);
    yPos += 7;

    // Visual progress bar (simple rectangle)
    const barWidth = (pageWidth - 40) * (pillarPercentage / 100);
    const barHeight = 5;
    const colorCode = getScoreColorCode(pillarScore);
    // Convert hex to RGB
    const r = parseInt(colorCode.slice(1, 3), 16);
    const g = parseInt(colorCode.slice(3, 5), 16);
    const b = parseInt(colorCode.slice(5, 7), 16);
    doc.setFillColor(r, g, b);
    doc.rect(20, yPos, barWidth, barHeight, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, yPos, pageWidth - 40, barHeight, 'S');
    yPos += 10;

    // Recommendation
    if (insightData?.recommendation) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Recommendation:', 20, yPos);
      yPos += 7;
      doc.setFont('helvetica', 'normal');
      const recLines = doc.splitTextToSize(insightData.recommendation, pageWidth - 40);
      doc.text(recLines, 25, yPos);
      yPos += recLines.length * 5 + 5;
    }

      // Recommended Actions
      if (insightData?.actions && insightData.actions.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('Recommended Actions:', 20, yPos);
        yPos += 7;
        doc.setFont('helvetica', 'normal');
        insightData.actions.forEach((action) => {
          yPos = checkNewPage(doc, yPos, pageHeight, 20);
          const actionLines = doc.splitTextToSize(`• ${action}`, pageWidth - 50);
          doc.text(actionLines, 25, yPos);
          yPos += actionLines.length * 5 + 3;
        });
      }

    yPos += 10; // Space between pillars
  }

  // Key Insights Section - Strengths and Areas for Growth
  yPos = addSectionTitle(doc, 'Key Insights', yPos, pageHeight);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  // Separate pillars into strengths and growth areas
  const strengthPillars = wellnessPillars.filter(p => {
    const score = getPillarScore(pillarScores[p.id]);
    return score >= 16;
  });

  const growthPillars = wellnessPillars.filter(p => {
    const score = getPillarScore(pillarScores[p.id]);
    return score < 16;
  });

  // Strengths Section
  if (strengthPillars.length > 0) {
    yPos = checkNewPage(doc, yPos, pageHeight, 40);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(0, 128, 0); // Green
    doc.text('Strengths', 20, yPos);
    doc.setTextColor(0, 0, 0); // Black
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    strengthPillars.forEach(pillar => {
      yPos = checkNewPage(doc, yPos, pageHeight, 30);
      const score = getPillarScore(pillarScores[pillar.id]);
      const levelText = score >= 21 
        ? 'STRONG FOUNDATION - Healthy habits are established and practiced most of the time.'
        : 'CONSISTENCY STAGE - Good habits are in place and showing progress.';

      doc.setFont('helvetica', 'bold');
      // No emoji - just use the name
      doc.text(`${pillar.name} (${score}/25)`, 25, yPos);
      yPos += 7;
      doc.setFont('helvetica', 'normal');
      const levelLines = doc.splitTextToSize(levelText, pageWidth - 50);
      doc.text(levelLines, 25, yPos);
      yPos += levelLines.length * 5 + 5;
    });
  } else {
    yPos = checkNewPage(doc, yPos, pageHeight, 20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(0, 128, 0);
    doc.text('Strengths', 20, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('No strengths identified yet. Keep building your wellness habits!', 25, yPos);
    yPos += 10;
  }

  // Areas for Growth Section
  if (growthPillars.length > 0) {
    yPos = checkNewPage(doc, yPos, pageHeight, 40);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(255, 140, 0); // Orange
    doc.text('Areas for Growth', 20, yPos);
    doc.setTextColor(0, 0, 0); // Black
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    growthPillars.forEach(pillar => {
      yPos = checkNewPage(doc, yPos, pageHeight, 30);
      const score = getPillarScore(pillarScores[pillar.id]);
      const levelText = score >= 11
        ? 'EARLY DEVELOPMENT - Some positive habits are present, but they are irregular.'
        : 'SIGNIFICANT GROWTH OPPORTUNITY - Currently limited or inconsistent practices.';

      doc.setFont('helvetica', 'bold');
      // No emoji - just use the name
      doc.text(`${pillar.name} (${score}/25)`, 25, yPos);
      yPos += 7;
      doc.setFont('helvetica', 'normal');
      const levelLines = doc.splitTextToSize(levelText, pageWidth - 50);
      doc.text(levelLines, 25, yPos);
      yPos += levelLines.length * 5 + 5;
    });
  } else {
    yPos = checkNewPage(doc, yPos, pageHeight, 20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(255, 140, 0);
    doc.text('Areas for Growth', 20, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Great work! All pillars are showing strong performance.', 25, yPos);
    yPos += 10;
  }
};

/**
 * Generate 360° Feedback Assessment PDF
 * Matches the structure of ThreeSixtyResultContent component
 */
const generate360PDF = async (
  doc: any,
  assessment: AssessmentForPDF,
  pageWidth: number,
  pageHeight: number
): Promise<void> => {
  // Dynamic imports for 360 data
  const { feedback360Capabilities } = await import('@/data/feedback360Questions');
  const { getFeedback360InsightWithLocale, get360ScoreColorCode } = await import('@/data/feedback360Insights');
  const { getFeedback360GapInsightWithLocale } = await import('@/data/feedback360GapInsights');
  const { get360Evaluators, getAssessmentResults } = await import('@/lib/api/assessments');
  
  // Try to get locale from browser or default to 'en'
  const locale = typeof window !== 'undefined' 
    ? (document.documentElement.lang || navigator.language?.split('-')[0] || 'en')
    : 'en';

  let yPos = 20;
  const results = assessment.detailedResult;
  if (!results?.scores) return;

  const scores = results.scores;
  const capabilityScores = scores.capability_scores || {};
  const percentage = typeof scores.percentage === 'number' ? scores.percentage : 0;
  const totalScore = scores.total_score || 0;
  const maxScore = scores.max_score || 150;
  const comparisonData = results.comparison_data;

  // Helper to check if value is PillarScore
  const isPillarScore = (value: unknown): value is PillarScore => {
    return typeof value === 'object' && value !== null && 'score' in value;
  };

  // Map backend capability IDs to frontend IDs
  const capabilityIdMap: Record<string, string> = {
    'problem_solving': 'problem_solving_and_decision_making',
    'communication': 'communication',
    'team_culture': 'team_culture',
    'leadership_style': 'leadership_style',
    'change_management': 'change_management',
    'stress_management': 'stress_management',
  };

  // Load evaluators (same as ThreeSixtyResultContent)
  let evaluatorsList: any[] = [];
  try {
    const evaluatorsResponse = await get360Evaluators(assessment.id);
    evaluatorsList = evaluatorsResponse.evaluators || [];
  } catch (err) {
    console.warn('Failed to load evaluators for PDF:', err);
  }

  // Count completed evaluators
  const completedCount = evaluatorsList.filter(
    (e) => e.status === 'completed' || e.status === 'COMPLETED'
  ).length;

  const hasEvaluatorResponses = completedCount > 0;

  // Calculate others_avg_score from comparison_data if available, otherwise from evaluator assessments
  // (Same logic as ThreeSixtyResultContent)
  let othersAvgScores: Record<string, number> = {};
  
  // First, try to get from comparison_data
  if (comparisonData && typeof comparisonData === 'object') {
    if (comparisonData.capability_scores && typeof comparisonData.capability_scores === 'object') {
      Object.entries(comparisonData.capability_scores).forEach(([capability, score]) => {
        const rawScoreValue = isPillarScore(score) ? score.score : (typeof score === 'number' ? score : 0);
        const averageScore = rawScoreValue / 5;
        const mappedCapability = capabilityIdMap[capability] || capability;
        othersAvgScores[mappedCapability] = averageScore;
      });
    }
  }
  
  // If comparison_data doesn't have scores, calculate from evaluator assessments
  if (Object.keys(othersAvgScores).length === 0 && hasEvaluatorResponses) {
    try {
      // Get completed evaluators with their assessment IDs
      const completedEvaluators = evaluatorsList.filter(
        (e) => (e.status === 'completed' || e.status === 'COMPLETED') && e.evaluator_assessment_id
      );
      
      if (completedEvaluators.length > 0) {
        // Fetch results for each evaluator's assessment
        const evaluatorResultsPromises = completedEvaluators.map(async (evaluator) => {
          try {
            if (!evaluator.evaluator_assessment_id) {
              return null;
            }
            const evaluatorResults = await getAssessmentResults(evaluator.evaluator_assessment_id);
            return evaluatorResults;
          } catch (err) {
            console.warn(`Failed to load results for evaluator ${evaluator.id}:`, err);
            return null;
          }
        });
        
        const evaluatorResultsList = await Promise.all(evaluatorResultsPromises);
        const validResults = evaluatorResultsList.filter((r): r is AssessmentResult => r !== null && r !== undefined && r.scores !== undefined);
        
        if (validResults.length > 0) {
          // Calculate average scores across all evaluators for each capability
          const capabilityTotals: Record<string, number[]> = {};
          
          validResults.forEach((result) => {
            if (result && result.scores?.capability_scores) {
              Object.entries(result.scores.capability_scores).forEach(([capability, score]) => {
                const rawScoreValue = isPillarScore(score) ? score.score : (typeof score === 'number' ? score : 0);
                // Convert sum (max 25) to average (max 5.0) by dividing by 5
                const averageScore = rawScoreValue / 5;
                
                // Map backend capability ID to frontend format
                const mappedCapability = capabilityIdMap[capability] || capability;
                
                if (!capabilityTotals[mappedCapability]) {
                  capabilityTotals[mappedCapability] = [];
                }
                capabilityTotals[mappedCapability].push(averageScore);
              });
            }
          });
          
          // Calculate averages
          Object.entries(capabilityTotals).forEach(([capability, scores]) => {
            if (scores.length > 0) {
              const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
              othersAvgScores[capability] = average;
            }
          });
        }
      }
    } catch (err) {
      console.warn('Failed to calculate evaluator scores:', err);
    }
  }

  // Transform capability scores (same logic as ThreeSixtyResultContent)
  interface CapabilityScore {
    capability: string;
    self_score: number;
    others_avg_score: number;
    gap: number;
    level: string;
  }

  const transformedCapabilityScores: CapabilityScore[] = Object.entries(capabilityScores).map(([capability, score]) => {
    const rawScoreValue = isPillarScore(score) ? score.score : (typeof score === 'number' ? score : 0);
    const averageScore = rawScoreValue / 5;
    const mappedCapability = capabilityIdMap[capability] || capability;
    const othersAvgScore = othersAvgScores[mappedCapability] || 0;
    const gap = averageScore - othersAvgScore;
    
    return {
      capability: mappedCapability,
      self_score: averageScore,
      others_avg_score: othersAvgScore,
      gap: gap,
      level: averageScore >= 4 ? 'high' : averageScore >= 2.5 ? 'moderate' : 'low',
    };
  });

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(assessment.name, pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Completed: ${assessment.completedDate}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Header Info Section (same as ThreeSixtyResultContent)
  yPos = checkNewPage(doc, yPos, pageHeight, 100);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('360° Feedback Assessment Results', 20, yPos);
  yPos += 10;

  if (hasEvaluatorResponses) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Based on your self-assessment and feedback from ${completedCount} contributor(s)`, 20, yPos);
    yPos += 10;
  } else {
    // Note box with background
    const noteBoxY = yPos;
    const noteText = 'Note: These results are based solely on your self-assessment. Invite colleagues to get a complete 360° view.';
    const noteLines = doc.splitTextToSize(noteText, pageWidth - 50);
    const noteBoxHeight = noteLines.length * 5 + 15;
    doc.setFillColor(240, 248, 255); // Light blue background
    doc.rect(20, noteBoxY, pageWidth - 40, noteBoxHeight, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Note:', 25, noteBoxY + 8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(noteLines, 25, noteBoxY + 15);
    yPos = noteBoxY + noteBoxHeight + 10;
  }

  // Contributors Status Section (same as ThreeSixtyResultContent)
  if (evaluatorsList.length > 0) {
    yPos = checkNewPage(doc, yPos, pageHeight, 80);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Contributor Status', 20, yPos);
    yPos += 6;
    
    // Calculate uniform spacing (same for horizontal and vertical)
    const horizontalSpacing = 5; // Space between blocks horizontally
    const verticalSpacing = 5; // Space between rows (same as horizontal)
    const boxHeight = 18; // Further reduced height
    const boxWidth = ((pageWidth - 40) - (2 * horizontalSpacing)) / 3; // 3 columns with spacing
    
    evaluatorsList.forEach((evaluator, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      
      // Calculate position with uniform spacing
      const xPos = 20 + (col * (boxWidth + horizontalSpacing));
      const currentYPos = yPos + (row * (boxHeight + verticalSpacing));
      
      // Evaluator box - further reduced height
      doc.setDrawColor(200, 200, 200);
      doc.rect(xPos, currentYPos, boxWidth, boxHeight, 'S');
      
      // Name - even smaller font
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      const nameLines = doc.splitTextToSize(evaluator.name || 'Unknown', boxWidth - 8);
      doc.text(nameLines, xPos + 3, currentYPos + 4);
      
      // Email - even smaller font
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      const emailLines = doc.splitTextToSize(evaluator.email || '', boxWidth - 8);
      doc.text(emailLines, xPos + 3, currentYPos + 8);
      
      // Role - even smaller font
      doc.setFontSize(5);
      doc.setTextColor(150, 150, 150);
      doc.text(evaluator.role || '', xPos + 3, currentYPos + 12);
      doc.setTextColor(0, 0, 0);
      
      // Status icon (text representation) - smaller
      let statusText = '';
      if (evaluator.status === 'completed' || evaluator.status === 'COMPLETED') {
        statusText = '✓';
        doc.setTextColor(0, 150, 0);
      } else if (evaluator.status === 'in_progress' || evaluator.status === 'IN_PROGRESS') {
        statusText = '⏱';
        doc.setTextColor(15, 76, 86);
      } else if (evaluator.invitation_opened_at) {
        statusText = '✉';
        doc.setTextColor(200, 150, 0);
      } else if (evaluator.invitation_sent_at) {
        statusText = '✉';
        doc.setTextColor(150, 150, 150);
      } else {
        statusText = '✗';
        doc.setTextColor(150, 150, 150);
      }
      doc.setFontSize(7);
      doc.text(statusText, xPos + boxWidth - 6, currentYPos + 4);
      doc.setTextColor(0, 0, 0);
    });
    
    // Calculate final Y position based on number of rows
    const numRows = Math.ceil(evaluatorsList.length / 3);
    yPos = yPos + (numRows * (boxHeight + verticalSpacing)) - verticalSpacing + 5;
  }

  // Overall Score Section (with teal background simulation)
  yPos = checkNewPage(doc, yPos, pageHeight, 60);
  yPos += 10; // Add space above title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Overall Leadership Score', 20, yPos);
  yPos += 8;
  
  // Draw teal background rectangle - reduced size
  const scoreBoxHeight = 35; // Reduced from 50
  const scoreBoxY = yPos;
  doc.setFillColor(15, 76, 86); // Teal color #0F4C56
  doc.rect(20, scoreBoxY, pageWidth - 40, scoreBoxHeight, 'F');
  
  // Score text in white - full width layout
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28); // Reduced from 36
  doc.setFont('helvetica', 'bold');
  doc.text(`${percentage.toFixed(1)}%`, pageWidth / 2, scoreBoxY + 14, { align: 'center' });
  doc.setFontSize(10); // Reduced from 12
  doc.setFont('helvetica', 'normal');
  doc.text(`Points: ${totalScore} / ${maxScore}`, pageWidth / 2, scoreBoxY + 26, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  yPos = scoreBoxY + scoreBoxHeight + 12;

  // Leadership Capabilities Section - Start on new page
  yPos = checkNewPage(doc, yPos, pageHeight, 200);
  if (yPos > pageHeight - 200) {
    doc.addPage();
    yPos = 20;
  }
  yPos = addSectionTitle(doc, 'Leadership Capabilities', yPos, pageHeight);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  for (const capScore of transformedCapabilityScores) {
    yPos = checkNewPage(doc, yPos, pageHeight, 100);
    
    const capInfo = feedback360Capabilities.find(c => c.id === capScore.capability);
    const capabilityTitle = capInfo?.title || capScore.capability.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const capabilityDescription = capInfo?.description || '';
    
    // Capability Header (no emoji - just title)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(capabilityTitle, 20, yPos);
    yPos += 6; // Reduced spacing
    
    if (capabilityDescription) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const descLines = doc.splitTextToSize(capabilityDescription, pageWidth - 40);
      doc.text(descLines, 20, yPos);
      yPos += descLines.length * 5 + 5; // Reduced spacing
    }

    // Get insight based on score (use others_avg_score if available, otherwise self_score)
    const scoreForInsight = hasEvaluatorResponses && capScore.others_avg_score > 0
      ? capScore.others_avg_score
      : capScore.self_score;
    
    const insight = getFeedback360InsightWithLocale(
      capScore.capability,
      scoreForInsight,
      locale
    );

    if (insight) {
      // Analysis box with colored background
      yPos = checkNewPage(doc, yPos, pageHeight, 60);
      const colorCode = insight.colorCode;
      const r = parseInt(colorCode.slice(1, 3), 16);
      const g = parseInt(colorCode.slice(3, 5), 16);
      const b = parseInt(colorCode.slice(5, 7), 16);
      
      doc.setFillColor(r, g, b);
      const analysisBoxY = yPos;
      const analysisLines = doc.splitTextToSize(insight.analysis, pageWidth - 50);
      const analysisBoxHeight = analysisLines.length * 5 + 15;
      doc.rect(20, analysisBoxY, pageWidth - 40, analysisBoxHeight, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text('Analysis', 25, analysisBoxY + 8);
      yPos = analysisBoxY + 15;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0); // Ensure text is black and visible
      doc.text(analysisLines, 25, yPos);
      yPos += analysisLines.length * 5 + 6; // Reduced spacing

      // Recommendations box with colored background
      yPos = checkNewPage(doc, yPos, pageHeight, 60);
      const recBoxY = yPos;
      const recLines = doc.splitTextToSize(insight.recommendation, pageWidth - 50);
      const recBoxHeight = recLines.length * 5 + 15;
      doc.setFillColor(r, g, b); // Use same color as analysis
      doc.rect(20, recBoxY, pageWidth - 40, recBoxHeight, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0); // Ensure text is black and visible
      doc.text('Recommendations', 25, recBoxY + 8);
      yPos = recBoxY + 15;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0); // Ensure text is black and visible
      doc.text(recLines, 25, yPos);
      yPos += recLines.length * 5 + 6; // Reduced spacing
    }
    
    yPos += 3; // Reduced space between capabilities
  }

  // OVERALL RESULTS' STATEMENT Section - Start on new page
  yPos = checkNewPage(doc, yPos, pageHeight, 200);
  if (yPos > pageHeight - 200) {
    doc.addPage();
    yPos = 20;
  }
  yPos = addSectionTitle(doc, 'OVERALL RESULTS\' STATEMENT', yPos, pageHeight);
  
  // Calculate average score
  const avgScore = transformedCapabilityScores.length > 0
    ? transformedCapabilityScores.reduce((sum, cap) => {
        const score = hasEvaluatorResponses && cap.others_avg_score > 0
          ? cap.others_avg_score
          : cap.self_score;
        return sum + score;
      }, 0) / transformedCapabilityScores.length
    : 0;
  
  const roundedAvgScore = Math.round(avgScore);
  let statement = '';
  let statementColor = '';
  
  if (roundedAvgScore >= 4) {
    statement = 'The results demonstrate a high level of self-awareness, as self-perception closely aligns with the perspectives of others across most evaluated capabilities. This indicates a strong understanding of how personal behaviors, strengths, and development areas are perceived by others. It reflects maturity, emotional intelligence, and authenticity in leadership interactions. Individuals with this profile tend to be effective at maintaining trust, adapting feedback, and fostering positive team dynamics.';
    statementColor = '#C6EFCE';
  } else if (roundedAvgScore >= 3) {
    statement = 'The results indicate good self-awareness, showing that in several key areas there is alignment between self-perception and how others experience behaviors and impact. Some variations across capabilities suggest opportunities to deepen reflection and seek additional feedback to bridge minor perception gaps. This balanced profile highlights a generally accurate self-view, coupled with potential for further growth through targeted development and open dialogue.';
    statementColor = '#FFEB9C';
  } else {
    statement = 'The results suggest lower self-awareness, with noticeable differences between self-assessment and the perspectives provided by others. This may indicate that certain behaviors or leadership patterns are not fully recognized, or that expectations and impact are perceived differently by colleagues. This outcome represents an opportunity for constructive growth — encouraging deeper reflection, open discussion, and feedback-seeking to better understand and align internal perceptions with external observations. Increasing awareness in this way can significantly strengthen effectiveness, relationships, and overall leadership presence.';
    statementColor = '#FFC7CE';
  }

  // Statement box with colored background - aligned like other blocks, full width text
  yPos = checkNewPage(doc, yPos, pageHeight, 80);
  const statementBoxY = yPos;
  // Use same margins as other blocks (20px on each side)
  const statementWidth = pageWidth - 40; // Same width as other blocks
  const statementLines = doc.splitTextToSize(statement, statementWidth);
  const statementBoxHeight = statementLines.length * 5 + 8; // Reduced padding
  
  const stmtR = parseInt(statementColor.slice(1, 3), 16);
  const stmtG = parseInt(statementColor.slice(3, 5), 16);
  const stmtB = parseInt(statementColor.slice(5, 7), 16);
  doc.setFillColor(stmtR, stmtG, stmtB);
  // Frame the block aligned like other blocks (20px margin on each side)
  doc.rect(20, statementBoxY, statementWidth, statementBoxHeight, 'F');
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  // Text with padding inside the box - full width text within the block
  doc.text(statementLines, 25, statementBoxY + 5);
  yPos = statementBoxY + statementBoxHeight + 12;

  // Categorize capabilities: Areas for Growth (1-2), Neutral (3), Strengths (4-5)
  const growthCapabilities = transformedCapabilityScores.filter(cap => {
    const score = hasEvaluatorResponses && cap.others_avg_score > 0
      ? cap.others_avg_score
      : cap.self_score;
    return Math.round(score) >= 1 && Math.round(score) <= 2;
  });

  const neutralCapabilities = transformedCapabilityScores.filter(cap => {
    const score = hasEvaluatorResponses && cap.others_avg_score > 0
      ? cap.others_avg_score
      : cap.self_score;
    return Math.round(score) === 3;
  });

  const strengthCapabilities = transformedCapabilityScores.filter(cap => {
    const score = hasEvaluatorResponses && cap.others_avg_score > 0
      ? cap.others_avg_score
      : cap.self_score;
    return Math.round(score) >= 4;
  });

  // Display categorized capabilities
  const hasGrowth = growthCapabilities.length > 0;
  const hasNeutral = neutralCapabilities.length > 0;
  const hasStrengths = strengthCapabilities.length > 0;

  if (hasGrowth || hasNeutral || hasStrengths) {
    yPos = checkNewPage(doc, yPos, pageHeight, 100);
    
    // Areas for Growth
    if (hasGrowth) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(200, 0, 0); // Red
      doc.text('Areas for Growth', 20, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('Deepen self-reflection, actively seek feedback, and explore perception differences to strengthen impact and alignment.', 20, yPos);
      yPos += 10;
      
      growthCapabilities.forEach(cap => {
        yPos = checkNewPage(doc, yPos, pageHeight, 30);
        const capInfo = feedback360Capabilities.find(c => c.id === cap.capability);
        const capabilityTitle = capInfo?.title || cap.capability.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const score = hasEvaluatorResponses && cap.others_avg_score > 0
          ? cap.others_avg_score
          : cap.self_score;
        
        // Colored box
        doc.setFillColor(255, 199, 206); // #FFC7CE
        doc.rect(20, yPos - 5, pageWidth - 40, 15, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(capabilityTitle, 25, yPos + 3);
        doc.setFont('helvetica', 'normal');
        doc.text(`${score.toFixed(1)}/5.0`, pageWidth - 30, yPos + 3, { align: 'right' });
        yPos += 12;
      });
      yPos += 5;
    }

    // Neutral
    if (hasNeutral) {
      yPos = checkNewPage(doc, yPos, pageHeight, 50);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(200, 150, 0); // Yellow/Orange
      doc.text('Neutral', 20, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('Focus on areas of gap, engage in feedback discussions, and seek specific examples to calibrate perceptions.', 20, yPos);
      yPos += 10;
      
      neutralCapabilities.forEach(cap => {
        yPos = checkNewPage(doc, yPos, pageHeight, 30);
        const capInfo = feedback360Capabilities.find(c => c.id === cap.capability);
        const capabilityTitle = capInfo?.title || cap.capability.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const score = hasEvaluatorResponses && cap.others_avg_score > 0
          ? cap.others_avg_score
          : cap.self_score;
        
        // Colored box
        doc.setFillColor(255, 235, 156); // #FFEB9C
        doc.rect(20, yPos - 5, pageWidth - 40, 15, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(capabilityTitle, 25, yPos + 3);
        doc.setFont('helvetica', 'normal');
        doc.text(`${score.toFixed(1)}/5.0`, pageWidth - 30, yPos + 3, { align: 'right' });
        yPos += 12;
      });
      yPos += 5;
    }

    // Strengths
    if (hasStrengths) {
      yPos = checkNewPage(doc, yPos, pageHeight, 50);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(0, 150, 0); // Green
      doc.text('Strengths', 20, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('Continue leveraging strengths, use feedback as reinforcement for ongoing growth.', 20, yPos);
      yPos += 10;
      
      strengthCapabilities.forEach(cap => {
        yPos = checkNewPage(doc, yPos, pageHeight, 30);
        const capInfo = feedback360Capabilities.find(c => c.id === cap.capability);
        const capabilityTitle = capInfo?.title || cap.capability.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const score = hasEvaluatorResponses && cap.others_avg_score > 0
          ? cap.others_avg_score
          : cap.self_score;
        
        // Colored box
        doc.setFillColor(198, 239, 206); // #C6EFCE
        doc.rect(20, yPos - 5, pageWidth - 40, 15, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(capabilityTitle, 25, yPos + 3);
        doc.setFont('helvetica', 'normal');
        doc.text(`${score.toFixed(1)}/5.0`, pageWidth - 30, yPos + 3, { align: 'right' });
        yPos += 12;
      });
    }
  }

  // Results & Analysis: Self vs Contributors (if evaluators responded) - Start on new page
  if (hasEvaluatorResponses) {
    yPos = checkNewPage(doc, yPos, pageHeight, 200);
    if (yPos > pageHeight - 200) {
      doc.addPage();
      yPos = 20;
    }
    yPos = addSectionTitle(doc, 'Results & Analysis: Self vs Contributors', yPos, pageHeight);
    
    for (const capScore of transformedCapabilityScores) {
      yPos = checkNewPage(doc, yPos, pageHeight, 120);
      
      const capInfo = feedback360Capabilities.find(c => c.id === capScore.capability);
      const capabilityTitle = capInfo?.title || capScore.capability.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      // Capability title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(capabilityTitle, 20, yPos);
      
      // Gap label
      let gapLabel = '';
      if (capScore.gap > 0.5) gapLabel = 'Self-rating higher';
      else if (capScore.gap < -0.5) gapLabel = 'Others rate higher';
      else gapLabel = 'Aligned';
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(gapLabel, pageWidth - 25, yPos, { align: 'right' });
      yPos += 12;

      // Self Average and Others' Average on the same line
      const barHeight = 4;
      const halfWidth = (pageWidth - 40) / 2; // Half width for each section
      const middleX = pageWidth / 2; // Middle of the page
      
      // Self Average on the left side
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('Self Average', 20, yPos);
      const selfColorCode = get360ScoreColorCode(capScore.self_score);
      const selfR = parseInt(selfColorCode.slice(1, 3), 16);
      const selfG = parseInt(selfColorCode.slice(3, 5), 16);
      const selfB = parseInt(selfColorCode.slice(5, 7), 16);
      doc.setTextColor(selfR, selfG, selfB);
      doc.setFont('helvetica', 'bold');
      doc.text(`${capScore.self_score.toFixed(1)} / 5.0`, 20 + halfWidth - 25, yPos, { align: 'right' });
      doc.setTextColor(0, 0, 0);
      yPos += 4; // Reduced spacing between title and bar
      
      // Progress bar for self
      const selfBarWidth = ((capScore.self_score / 5) * 100) * (halfWidth / 100);
      doc.setFillColor(selfR, selfG, selfB);
      doc.rect(20, yPos, selfBarWidth, barHeight, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.rect(20, yPos, halfWidth, barHeight, 'S');
      
      // Others' Average on the right side (if available)
      if (capScore.others_avg_score > 0) {
        const othersColorCode = get360ScoreColorCode(capScore.others_avg_score);
        const othersR = parseInt(othersColorCode.slice(1, 3), 16);
        const othersG = parseInt(othersColorCode.slice(3, 5), 16);
        const othersB = parseInt(othersColorCode.slice(5, 7), 16);
        
        // Title and score for Others' Average
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text('Others\' Average', middleX + 10, yPos - 4); // Same yPos as Self Average title
        doc.setTextColor(othersR, othersG, othersB);
        doc.setFont('helvetica', 'bold');
        doc.text(`${capScore.others_avg_score.toFixed(1)} / 5.0`, pageWidth - 25, yPos - 4, { align: 'right' });
        doc.setTextColor(0, 0, 0);
        
        // Progress bar for others
        const othersBarWidth = ((capScore.others_avg_score / 5) * 100) * (halfWidth / 100);
        doc.setFillColor(othersR, othersG, othersB);
        doc.rect(middleX + 10, yPos, othersBarWidth, barHeight, 'F');
        doc.setDrawColor(200, 200, 200);
        doc.rect(middleX + 10, yPos, halfWidth, barHeight, 'S');
      }
      
      yPos += 12; // Space after both bars

      // Gap-based Overview and Recommendation
      const gapInsight = getFeedback360GapInsightWithLocale(
        capScore.capability,
        capScore.gap,
        locale
      );

      if (gapInsight) {
        const gapColorCode = gapInsight.colorCode;
        const gapR = parseInt(gapColorCode.slice(1, 3), 16);
        const gapG = parseInt(gapColorCode.slice(3, 5), 16);
        const gapB = parseInt(gapColorCode.slice(5, 7), 16);
        
        // Overview box
        yPos = checkNewPage(doc, yPos, pageHeight, 60);
        const overviewBoxY = yPos;
        const overviewLines = doc.splitTextToSize(gapInsight.overview, pageWidth - 50);
        const overviewBoxHeight = overviewLines.length * 5 + 15;
        doc.setFillColor(gapR, gapG, gapB);
        doc.rect(20, overviewBoxY, pageWidth - 40, overviewBoxHeight, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text('Overview', 25, overviewBoxY + 8);
        yPos = overviewBoxY + 15;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(overviewLines, 25, yPos);
        yPos += overviewLines.length * 5 + 10;

        // Recommendation box
        yPos = checkNewPage(doc, yPos, pageHeight, 60);
        const recBoxY = yPos;
        const recLines = doc.splitTextToSize(gapInsight.recommendation, pageWidth - 50);
        const recBoxHeight = recLines.length * 5 + 15;
        doc.setFillColor(gapR, gapG, gapB);
        doc.rect(20, recBoxY, pageWidth - 40, recBoxHeight, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('Recommendation', 25, recBoxY + 8);
        yPos = recBoxY + 15;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(recLines, 25, yPos);
        yPos += recLines.length * 5 + 10;
      }
      
      yPos += 5; // Space between capabilities
    }
  }
};

/**
 * Generate MBTI Assessment PDF
 * Matches the structure of MBTIResultsPage and MBTIResultContent components
 * Optimized to fit on a single page
 */
const generateMBTIPDF = async (
  doc: any,
  assessment: AssessmentForPDF,
  pageWidth: number,
  pageHeight: number
): Promise<void> => {
  // Dynamic imports for MBTI data
  const { mbtiPersonalities } = await import('@/data/mbtiPersonalities');
  const { mbtiTypes } = await import('@/data/mbtiQuestions');
  
  let yPos = 15; // Reduced from 20
  const results = assessment.detailedResult;
  if (!results?.scores) return;

  const scores = results.scores;
  const mbtiType = scores.mbti_type || 'XXXX';
  const insights = results.insights || {};
  const isFromOCR = scores.source === 'pdf_ocr';
  
  // Extract base type without variant (e.g., "ISFP-T" -> "ISFP")
  const baseType = mbtiType.substring(0, 4).toUpperCase() || 'XXXX';
  
  // Get personality data from comprehensive data structure
  const personalityData = mbtiPersonalities[baseType];
  
  // Fallback to old typeInfo if personality data not found
  const typeInfo = mbtiTypes[baseType] || {
    name: 'Unknown Type',
    description: 'Type description not available.',
    strengths: [],
  };

  // Use personality description from new data structure, or fallback
  const personalityDescription = personalityData?.descriptionOverall || 
                                  (scores as any)?.personality_description || 
                                  insights.description || 
                                  typeInfo.description;

  // Title - more compact
  doc.setFontSize(16); // Reduced from 20
  doc.setFont('helvetica', 'bold');
  doc.text(assessment.name, pageWidth / 2, yPos, { align: 'center' });
  yPos += 7; // Reduced from 10
  doc.setFontSize(10); // Reduced from 12
  doc.setFont('helvetica', 'normal');
  doc.text(`Completed: ${assessment.completedDate}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 10; // Reduced from 15

  // Personality Type Card Section - more compact
  const cardY = yPos;
  const cardHeight = 50; // Reduced from 80
  doc.setFillColor(240, 245, 255); // Light purple/indigo background
  doc.rect(20, cardY, pageWidth - 40, cardHeight, 'F');
  doc.setDrawColor(200, 200, 220); // Light border
  doc.rect(20, cardY, pageWidth - 40, cardHeight, 'S');
  
  // Draw circle for MBTI type - smaller
  const circleX = 25;
  const circleY = cardY + 10;
  const circleRadius = 15; // Reduced from 25
  doc.setFillColor(128, 0, 128); // Purple color
  doc.circle(circleX + circleRadius, circleY + circleRadius, circleRadius, 'F');
  
  // MBTI type text in circle
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12); // Reduced from 16
  doc.setFont('helvetica', 'bold');
  doc.text(baseType, circleX + circleRadius, circleY + circleRadius, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  
  // Personality name and description - more compact
  const textStartX = circleX + (circleRadius * 2) + 12;
  doc.setFontSize(14); // Reduced from 18
  doc.setFont('helvetica', 'bold');
  doc.text(personalityData?.name || typeInfo.name, textStartX, cardY + 10);
  
  doc.setFontSize(9); // Reduced from 11
  doc.setFont('helvetica', 'normal');
  const descLines = doc.splitTextToSize(personalityDescription, pageWidth - textStartX - 25);
  doc.text(descLines, textStartX, cardY + 18);
  
  // OCR Badge (if applicable) - smaller
  if (isFromOCR) {
    const badgeY = cardY + 18 + (descLines.length * 4) + 2;
    doc.setFillColor(255, 248, 220); // Gold background
    doc.rect(textStartX, badgeY, 60, 6, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('OCR', textStartX + 3, badgeY + 4.5);
  }
  
  // Tags (below description) - more compact
  if (personalityData?.tags && personalityData.tags.length > 0) {
    const tagsY = cardY + 18 + (descLines.length * 4) + (isFromOCR ? 10 : 2);
    doc.setFontSize(8); // Reduced from 9
    doc.setFont('helvetica', 'normal');
    const tagsText = personalityData.tags.join(' • ');
    const tagsLines = doc.splitTextToSize(tagsText, pageWidth - textStartX - 25);
    doc.text(tagsLines, textStartX, tagsY);
  }
  
  yPos = cardY + cardHeight + 8; // Reduced from 15

  // Your Personality Dimensions Section - two columns layout
  if (personalityData) {
    doc.setFontSize(12); // Reduced from 16
    doc.setFont('helvetica', 'bold');
    doc.text('Your Personality Dimensions', 20, yPos);
    yPos += 8; // Reduced spacing
    
    const dimensions = [
      { key: 'communication', num: 1, color: [59, 130, 246], bgColor: [239, 246, 255] },
      { key: 'problemSolving', num: 2, color: [147, 51, 234], bgColor: [250, 245, 255] },
      { key: 'leadershipStyle', num: 3, color: [59, 130, 246], bgColor: [239, 246, 255] },
      { key: 'teamCulture', num: 4, color: [147, 51, 234], bgColor: [250, 245, 255] },
      { key: 'change', num: 5, color: [59, 130, 246], bgColor: [239, 246, 255] },
      { key: 'stress', num: 6, color: [147, 51, 234], bgColor: [250, 245, 255] },
    ];
    
    // Two columns layout
    const colWidth = (pageWidth - 50) / 2; // Two columns with spacing
    const startX1 = 20;
    const startX2 = startX1 + colWidth + 10;
    let currentCol = 1;
    let currentX = startX1;
    let rowY = yPos;
    
    for (let i = 0; i < dimensions.length; i++) {
      const dim = dimensions[i];
      const capability = personalityData.capabilities[dim.key as keyof typeof personalityData.capabilities];
      if (!capability) continue;
      
      // Switch to second column after 3 items
      if (i === 3) {
        currentCol = 2;
        currentX = startX2;
        rowY = yPos;
      }
      
      // Draw background box - more compact
      const boxY = rowY;
      const boxHeight = 28; // Reduced from 40
      doc.setFillColor(dim.bgColor[0], dim.bgColor[1], dim.bgColor[2]);
      doc.setDrawColor(dim.color[0], dim.color[1], dim.color[2]);
      doc.setLineWidth(0.5);
      doc.rect(currentX, boxY, colWidth, boxHeight, 'FD');
      
      // Number circle - smaller
      const numCircleX = currentX + 3;
      const numCircleY = boxY + 5;
      const numCircleRadius = 4; // Reduced from 6
      doc.setFillColor(dim.color[0], dim.color[1], dim.color[2]);
      doc.circle(numCircleX + numCircleRadius, numCircleY + numCircleRadius, numCircleRadius, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8); // Reduced from 10
      doc.setFont('helvetica', 'bold');
      doc.text(String(dim.num), numCircleX, numCircleY + 3);
      doc.setTextColor(0, 0, 0);
      
      // Capability name and description - more compact
      const textX = numCircleX + (numCircleRadius * 2) + 5;
      doc.setFontSize(9); // Reduced from 12
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(dim.color[0], dim.color[1], dim.color[2]);
      doc.text(capability.name, textX, boxY + 6);
      doc.setTextColor(0, 0, 0);
      
      doc.setFontSize(7); // Reduced from 10
      doc.setFont('helvetica', 'normal');
      const capDescLines = doc.splitTextToSize(capability.description, colWidth - (textX - currentX) - 5);
      doc.text(capDescLines, textX, boxY + 12);
      
      // Move to next row in same column
      rowY = boxY + boxHeight + 4; // Reduced spacing
    }
    
    // Set yPos to the bottom of the right column
    yPos = rowY + 5;
  }

  // Recommendations Section - more compact, only if space allows
  if (results.recommendations && Array.isArray(results.recommendations) && results.recommendations.length > 0 && yPos < pageHeight - 40) {
    doc.setFontSize(12); // Reduced from 16
    doc.setFont('helvetica', 'bold');
    doc.text('Recommendations', 20, yPos);
    yPos += 6; // Reduced spacing
    
    doc.setFontSize(9); // Reduced from 11
    doc.setFont('helvetica', 'normal');
    
    // Only show first recommendation if space is limited
    const maxRecommendations = yPos < pageHeight - 60 ? results.recommendations.length : 1;
    
    results.recommendations.slice(0, maxRecommendations).forEach((rec: any, index: number) => {
      if (yPos > pageHeight - 20) return; // Stop if no space
      
      // Recommendation title
      if (rec.title) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10); // Reduced from 12
        doc.text(`${index + 1}. ${rec.title}`, 20, yPos);
        yPos += 5; // Reduced from 8
      }
      
      // Recommendation description - truncated if needed
      if (rec.description) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8); // Reduced from 10
        const maxDescLength = 150; // Limit description length
        const truncatedDesc = rec.description.length > maxDescLength 
          ? rec.description.substring(0, maxDescLength) + '...'
          : rec.description;
        const descLines = doc.splitTextToSize(truncatedDesc, pageWidth - 40);
        doc.text(descLines, 20, yPos);
        yPos += descLines.length * 4 + 3; // Reduced spacing
      }
      
      yPos += 3; // Space between recommendations
    });
  }
};

/**
 * Generate TKI Assessment PDF
 * Matches the structure of TKIResultContent component
 */
const generateTKIPDF = async (
  doc: any,
  assessment: AssessmentForPDF,
  pageWidth: number,
  pageHeight: number
): Promise<void> => {
  // Dynamic imports for TKI data
  const { tkiModes, tkiQuestions } = await import('@/data/tkiQuestions');
  
  // Load translations - we'll need to access them via a helper
  // For now, we'll use the mode data directly and add translations where needed
  let yPos = 20;
  const results = assessment.detailedResult;
  if (!results?.scores) return;

  const scores = results.scores;
  const scoresAny = scores as any;
  
  // Handle different possible score structures (same as TKIResultContent)
  let modeScores: Record<string, number> = {};
  
  if (scores.mode_scores) {
    modeScores = scores.mode_scores;
  } else if (scoresAny.mode_counts) {
    modeScores = scoresAny.mode_counts;
  } else {
    const possibleModes = ['competing', 'collaborating', 'avoiding', 'accommodating', 'compromising'];
    possibleModes.forEach(mode => {
      if (typeof scoresAny[mode] === 'number') {
        modeScores[mode] = scoresAny[mode];
      }
    });
  }

  // Find dominant and secondary modes
  const sortedModes = Object.entries(modeScores)
    .sort(([, a], [, b]) => (b as number) - (a as number));

  const dominantMode = scoresAny.dominant_mode || sortedModes[0]?.[0] || '';
  const secondaryMode = scoresAny.secondary_mode || sortedModes[1]?.[0] || '';

  // Helper functions (same as TKIResultContent)
  const getModeInfo = (modeId: string) => {
    return tkiModes.find(m => m.id === modeId) || null;
  };

  const getModePercentage = (count: number) => {
    const totalQuestions = tkiQuestions?.length || 30;
    return Math.round((count / totalQuestions) * 100);
  };

  const getModeLevel = (count: number): { label: string; color: string } => {
    const percentage = getModePercentage(count);
    if (percentage >= 40) {
      return { label: 'High', color: '#10B981' }; // success-600
    } else if (percentage >= 20) {
      return { label: 'Moderate', color: '#F59E0B' }; // yellow-600
    } else {
      return { label: 'Low', color: '#6B7280' }; // gray-500
    }
  };

  const getModeInsight = (modeId: string, count: number): string => {
    const percentage = getModePercentage(count);
    const level = percentage >= 40 ? 'high' : percentage >= 20 ? 'moderate' : 'low';
    
    // Map insights (simplified - in real implementation, these would come from translations)
    const insights: Record<string, Record<string, string>> = {
      competing: {
        high: 'You tend to pursue your own concerns assertively, which can be effective in emergencies or when quick decisions are needed.',
        moderate: 'You use competing when necessary, balancing it with other approaches.',
        low: 'You rarely use a competing approach, preferring more collaborative or accommodating styles.'
      },
      collaborating: {
        high: 'You excel at finding win-win solutions that fully satisfy both parties. This is ideal for complex issues requiring diverse perspectives.',
        moderate: 'You use collaboration when appropriate, though you may also rely on other conflict modes.',
        low: 'You may benefit from developing your collaborative skills to find more integrative solutions.'
      },
      compromising: {
        high: 'You frequently seek middle-ground solutions, which can be efficient when time is limited or when goals are moderately important.',
        moderate: 'You use compromise as one of several conflict management tools in your repertoire.',
        low: 'You tend to favor other approaches over compromise, which may mean you seek more complete solutions.'
      },
      avoiding: {
        high: 'You often postpone or withdraw from conflicts. While useful for trivial issues, overuse may leave important matters unresolved.',
        moderate: 'You strategically avoid conflicts when appropriate, such as when emotions are high or more information is needed.',
        low: 'You rarely avoid conflicts, preferring to address issues directly.'
      },
      accommodating: {
        high: 'You frequently yield to others\' concerns. This builds goodwill but may lead to your needs being overlooked if overused.',
        moderate: 'You accommodate others when it makes sense, balancing their needs with your own.',
        low: 'You rarely accommodate others, which may indicate a strong focus on your own goals.'
      }
    };
    
    return insights[modeId]?.[level] || '';
  };

  const dominantModeInfo = getModeInfo(dominantMode);
  const secondaryModeInfo = getModeInfo(secondaryMode);

  // Sort modes by count for display
  const sortedModesList = Object.entries(modeScores)
    .sort(([, a], [, b]) => b - a)
    .map(([modeId, count]) => ({ modeId, count }));

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(assessment.name, pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Completed: ${assessment.completedDate}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Dominant & Secondary Modes (two side-by-side cards)
  yPos = checkNewPage(doc, yPos, pageHeight, 100);
  
  // Dominant Mode Card (teal background)
  const cardWidth = (pageWidth - 50) / 2;
  const cardHeight = 60;
  const dominantCardX = 20;
  const dominantCardY = yPos;
  
  doc.setFillColor(15, 76, 86); // ARISE deep teal
  doc.rect(dominantCardX, dominantCardY, cardWidth, cardHeight, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'normal');
  // Icon as text (emoji won't work well, so we'll use text representation)
  const dominantIcon = dominantModeInfo?.icon || '⚔️';
  doc.text(dominantIcon, dominantCardX + cardWidth / 2, dominantCardY + 12, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Dominant Mode', dominantCardX + cardWidth / 2, dominantCardY + 20, { align: 'center' });
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(dominantModeInfo?.title || dominantMode, dominantCardX + cardWidth / 2, dominantCardY + 32, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const dominantCount = modeScores[dominantMode] || 0;
  doc.text(`${dominantCount} out of 30 responses`, dominantCardX + cardWidth / 2, dominantCardY + 42, { align: 'center' });
  
  // Secondary Mode Card (gold gradient - using gold color)
  const secondaryCardX = dominantCardX + cardWidth + 10;
  const secondaryCardY = yPos;
  
  doc.setFillColor(212, 175, 55); // Gold color approximation
  doc.rect(secondaryCardX, secondaryCardY, cardWidth, cardHeight, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'normal');
  const secondaryIcon = secondaryModeInfo?.icon || '⚖️';
  doc.text(secondaryIcon, secondaryCardX + cardWidth / 2, secondaryCardY + 12, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Secondary Mode', secondaryCardX + cardWidth / 2, secondaryCardY + 20, { align: 'center' });
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(secondaryModeInfo?.title || secondaryMode, secondaryCardX + cardWidth / 2, secondaryCardY + 32, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const secondaryCount = modeScores[secondaryMode] || 0;
  doc.text(`${secondaryCount} out of 30 responses`, secondaryCardX + cardWidth / 2, secondaryCardY + 42, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  yPos = dominantCardY + cardHeight + 15;

  // All Modes Breakdown
  yPos = addSectionTitle(doc, 'Your Conflict Management Profile', yPos, pageHeight);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  sortedModesList.forEach(({ modeId, count }) => {
    yPos = checkNewPage(doc, yPos, pageHeight, 80);
    
    const modeInfo = getModeInfo(modeId);
    const level = getModeLevel(count);
    const percentage = getModePercentage(count);
    const insight = getModeInsight(modeId, count);

    // Mode header with icon, title, description, and level
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    // Icon as text
    const modeIcon = modeInfo?.icon || '⚔️';
    doc.text(modeIcon, 20, yPos);
    doc.text(modeInfo?.title || modeId, 35, yPos);
    
    // Level on the right
    const levelColor = level.color;
    const levelR = parseInt(levelColor.slice(1, 3), 16);
    const levelG = parseInt(levelColor.slice(3, 5), 16);
    const levelB = parseInt(levelColor.slice(5, 7), 16);
    doc.setTextColor(levelR, levelG, levelB);
    doc.text(level.label, pageWidth - 25, yPos, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    yPos += 6;
    
    // Description
    if (modeInfo?.description) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const descLines = doc.splitTextToSize(modeInfo.description, pageWidth - 40);
      doc.text(descLines, 20, yPos);
      yPos += descLines.length * 5 + 5;
    }

    // Progress Bar
    yPos += 3;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`${count} responses`, 20, yPos);
    doc.text(`${percentage}%`, pageWidth - 25, yPos, { align: 'right' });
    yPos += 6;
    
    // Draw progress bar
    const barWidth = pageWidth - 40;
    const barHeight = 3;
    const filledWidth = (percentage / 100) * barWidth;
    doc.setFillColor(15, 76, 86); // ARISE teal
    doc.rect(20, yPos, filledWidth, barHeight, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, yPos, barWidth, barHeight, 'S');
    yPos += 8;

    // Insight (if available)
    if (insight) {
      yPos += 3;
      doc.setFillColor(245, 245, 220); // Beige color #F5F5DC
      const insightBoxY = yPos;
      const insightLines = doc.splitTextToSize(insight, pageWidth - 50);
      const insightBoxHeight = insightLines.length * 5 + 10;
      doc.rect(20, insightBoxY, pageWidth - 40, insightBoxHeight, 'F');
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text(insightLines, 25, insightBoxY + 6);
      yPos = insightBoxY + insightBoxHeight + 5;
    }
    
    yPos += 5; // Space between modes
  });

  // KEY Recommendations Section
  yPos = checkNewPage(doc, yPos, pageHeight, 100);
  yPos += 5;
  
  // Recommendations box with gold background
  const recBoxY = yPos;
  doc.setFillColor(255, 248, 220); // Gold/10 background
  doc.setDrawColor(212, 175, 55); // Gold border
  doc.setLineWidth(2);
  doc.rect(20, recBoxY, pageWidth - 40, 60, 'FD'); // Filled and drawn
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('KEY Recommendations', 25, recBoxY + 10);
  yPos = recBoxY + 20;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Leverage
  doc.setFont('helvetica', 'bold');
  doc.text('Leverage your strengths:', 25, yPos);
  yPos += 6;
  doc.setFont('helvetica', 'normal');
  const leverageText = `Your dominant ${dominantModeInfo?.title.toLowerCase() || dominantMode} style can be very effective in appropriate situations. Continue to use it when it serves you well.`;
  const leverageLines = doc.splitTextToSize(leverageText, pageWidth - 50);
  doc.text(leverageLines, 25, yPos);
  yPos += leverageLines.length * 5 + 8;
  
  // Flexibility
  doc.setFont('helvetica', 'bold');
  doc.text('Develop flexibility:', 25, yPos);
  yPos += 6;
  doc.setFont('helvetica', 'normal');
  const flexibilityText = 'Consider situations where your less-used modes might be more effective. Expanding your conflict management repertoire will make you a more adaptable leader.';
  const flexibilityLines = doc.splitTextToSize(flexibilityText, pageWidth - 50);
  doc.text(flexibilityLines, 25, yPos);
  yPos += flexibilityLines.length * 5 + 8;
  
  // Context
  doc.setFont('helvetica', 'bold');
  doc.text('Context matters:', 25, yPos);
  yPos += 6;
  doc.setFont('helvetica', 'normal');
  const contextText = 'No single conflict mode is best in all situations. The most effective leaders can flex between different approaches based on the context, relationship, and importance of the issue.';
  const contextLines = doc.splitTextToSize(contextText, pageWidth - 50);
  doc.text(contextLines, 25, yPos);
  yPos += contextLines.length * 5 + 10;
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
