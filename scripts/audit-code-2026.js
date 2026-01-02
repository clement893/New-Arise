#!/usr/bin/env node

/**
 * Audit Complet du Code - 2026
 * Analyse approfondie de la qualité, sécurité, architecture et tests
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = process.cwd();
const FRONTEND_DIR = path.join(ROOT_DIR, 'apps/web/src');
const BACKEND_DIR = path.join(ROOT_DIR, 'backend/app');

const auditResults = {
  security: { critical: [], high: [], medium: [], low: [], positives: [] },
  quality: { issues: [], positives: [] },
  performance: { issues: [], positives: [] },
  architecture: { issues: [], positives: [] },
  tests: { issues: [], positives: [] },
  maintainability: { issues: [], positives: [] },
};

const stats = {
  totalFiles: 0,
  totalLines: 0,
  consoleLogs: 0,
  todos: 0,
  anyTypes: 0,
  largeFiles: [],
  complexFunctions: [],
  duplicateCode: [],
};

/**
 * Récupérer tous les fichiers récursivement
 */
function getAllFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx', '.py'], excludeDirs = ['node_modules', '.next', '__pycache__', '.git']) {
  const files = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!excludeDirs.some(exclude => fullPath.includes(exclude))) {
        files.push(...getAllFiles(fullPath, extensions, excludeDirs));
      }
    } else if (extensions.some(ext => item.endsWith(ext))) {
      files.push(fullPath);
      stats.totalFiles++;
    }
  }
  
  return files;
}

/**
 * Analyser un fichier pour les problèmes de sécurité
 */
function analyzeSecurity(filePath, content) {
  const relativePath = path.relative(ROOT_DIR, filePath);
  const isTestFile = filePath.includes('test') || filePath.includes('spec') || filePath.includes('__tests__');
  
  // 1. Secrets hardcodés
  const secretPatterns = [
    { pattern: /password\s*[:=]\s*['"][^'"]+['"]/gi, name: 'Hardcoded password' },
    { pattern: /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi, name: 'Hardcoded API key' },
    { pattern: /secret\s*[:=]\s*['"][^'"]+['"]/gi, name: 'Hardcoded secret' },
    { pattern: /token\s*[:=]\s*['"][^'"]{20,}['"]/gi, name: 'Hardcoded token' },
    { pattern: /(sk_live|pk_live|sk_test|pk_test)_[a-zA-Z0-9]{24,}/g, name: 'Stripe key detected' },
  ];
  
  secretPatterns.forEach(({ pattern, name }) => {
    const matches = content.match(pattern);
    if (matches && !isTestFile) {
      auditResults.security.critical.push({
        file: relativePath,
        issue: name,
        matches: matches.slice(0, 2),
      });
    }
  });
  
  // 2. XSS vulnerabilities
  const xssPatterns = [
    { pattern: /dangerouslySetInnerHTML/, name: 'dangerouslySetInnerHTML usage', checkSanitization: true },
    { pattern: /\.innerHTML\s*=/, name: 'innerHTML assignment', checkSanitization: false },
    { pattern: /eval\(/, name: 'eval() usage', checkSanitization: false },
  ];
  
  xssPatterns.forEach(({ pattern, name, checkSanitization }) => {
    if (content.match(pattern)) {
      const hasSanitization = checkSanitization && (content.includes('DOMPurify') || content.includes('sanitize'));
      if (!hasSanitization && !isTestFile) {
        auditResults.security.high.push({
          file: relativePath,
          issue: `Potential XSS: ${name}`,
        });
      } else if (hasSanitization) {
        auditResults.security.positives.push(`${name} found but properly sanitized in ${relativePath}`);
      }
    }
  });
  
  // 3. SQL Injection (Python only)
  if (filePath.endsWith('.py')) {
    const sqlPatterns = [
      /execute\(['"]\s*SELECT.*\+.*FROM/i,
      /execute\(['"]\s*INSERT.*\+.*INTO/i,
      /execute\(['"]\s*UPDATE.*\+.*SET/i,
      /f['"]\s*SELECT.*\{.*\}.*FROM/i,
    ];
    
    sqlPatterns.forEach(pattern => {
      if (content.match(pattern)) {
        auditResults.security.critical.push({
          file: relativePath,
          issue: 'Potential SQL injection: String concatenation in SQL',
        });
      }
    });
    
    // Positive: SQLAlchemy usage
    if (content.includes('from sqlalchemy') || content.includes('import sqlalchemy')) {
      auditResults.security.positives.push(`SQLAlchemy ORM used in ${relativePath}`);
    }
  }
  
  // 4. Input validation
  if (filePath.endsWith('.py')) {
    const hasValidation = content.includes('pydantic') || content.includes('BaseModel') || content.includes('Field(');
    if (hasValidation) {
      auditResults.security.positives.push(`Input validation present in ${relativePath}`);
    }
  }
  
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    const hasValidation = content.includes('zod') || content.includes('yup') || content.includes('joi');
    if (hasValidation) {
      auditResults.security.positives.push(`Input validation present in ${relativePath}`);
    }
  }
}

/**
 * Analyser la qualité du code
 */
function analyzeQuality(filePath, content) {
  const relativePath = path.relative(ROOT_DIR, filePath);
  const isTestFile = filePath.includes('test') || filePath.includes('spec') || filePath.includes('__tests__');
  const lines = content.split('\n');
  stats.totalLines += lines.length;
  
  // 1. Console.log en production
  const consoleMatches = content.match(/console\.(log|error|warn|debug|info)\(/g);
  if (consoleMatches && !isTestFile) {
    stats.consoleLogs += consoleMatches.length;
    auditResults.quality.issues.push({
      file: relativePath,
      issue: `${consoleMatches.length} console statement(s) found`,
      severity: 'medium',
    });
  }
  
  // 2. TODO/FIXME
  const todoMatches = content.match(/(TODO|FIXME|XXX|HACK|BUG):?\s*(.+)/gi);
  if (todoMatches) {
    stats.todos += todoMatches.length;
    auditResults.quality.issues.push({
      file: relativePath,
      issue: `${todoMatches.length} TODO/FIXME comment(s) found`,
      severity: 'low',
      details: todoMatches.slice(0, 3).map(t => t.trim()),
    });
  }
  
  // 3. TypeScript any types
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    const anyMatches = content.match(/: any|as any|<any>|any\[|any\||any&/g);
    if (anyMatches && !isTestFile) {
      stats.anyTypes += anyMatches.length;
      auditResults.quality.issues.push({
        file: relativePath,
        issue: `${anyMatches.length} 'any' type(s) found`,
        severity: 'medium',
      });
    }
  }
  
  // 4. Fichiers volumineux (>500 lignes)
  if (lines.length > 500 && !isTestFile) {
    stats.largeFiles.push({
      file: relativePath,
      lines: lines.length,
    });
    auditResults.maintainability.issues.push({
      file: relativePath,
      issue: `Large file: ${lines.length} lines`,
      severity: 'low',
    });
  }
  
  // 5. Complexité cyclomatique approximative (nombre de if/for/while)
  const complexity = (content.match(/\b(if|else|for|while|switch|catch)\b/g) || []).length;
  if (complexity > 20 && !isTestFile) {
    stats.complexFunctions.push({
      file: relativePath,
      complexity,
    });
    auditResults.maintainability.issues.push({
      file: relativePath,
      issue: `High complexity: ${complexity} control flow statements`,
      severity: 'medium',
    });
  }
  
  // 6. Code dupliqué (détection simple)
  const functions = content.match(/(function|const|export\s+(const|function))\s+\w+\s*[=\(]/g) || [];
  if (functions.length > 10) {
    // Potentiel code dupliqué si beaucoup de fonctions similaires
    // (détection simplifiée)
  }
}

/**
 * Analyser la performance
 */
function analyzePerformance(filePath, content) {
  const relativePath = path.relative(ROOT_DIR, filePath);
  
  // 1. Requêtes N+1 potentielles (backend)
  if (filePath.endsWith('.py')) {
    const hasQueryInLoop = content.match(/for\s+.*\s+in\s+.*:[\s\S]{0,200}db\.(query|execute)/i);
    if (hasQueryInLoop) {
      auditResults.performance.issues.push({
        file: relativePath,
        issue: 'Potential N+1 query pattern detected',
        severity: 'high',
      });
    }
    
    // Positive: joinedload/selectinload usage
    if (content.includes('joinedload') || content.includes('selectinload')) {
      auditResults.performance.positives.push(`Eager loading used in ${relativePath}`);
    }
  }
  
  // 2. Imports non optimisés (frontend)
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    // Import de toute une bibliothèque au lieu d'imports nommés
    const fullLibraryImports = content.match(/import\s+\*\s+as\s+\w+\s+from\s+['"]lodash['"]/g);
    if (fullLibraryImports) {
      auditResults.performance.issues.push({
        file: relativePath,
        issue: 'Full library import detected (use named imports)',
        severity: 'medium',
      });
    }
  }
}

/**
 * Analyser l'architecture
 */
function analyzeArchitecture(filePath, content) {
  const relativePath = path.relative(ROOT_DIR, filePath);
  
  // 1. Structure modulaire
  if (filePath.includes('/api/') && (filePath.endsWith('.py') || filePath.endsWith('.ts'))) {
    auditResults.architecture.positives.push(`API endpoint properly structured: ${relativePath}`);
  }
  
  // 2. Séparation des responsabilités
  if (filePath.includes('/services/') || filePath.includes('/lib/')) {
    auditResults.architecture.positives.push(`Service layer present: ${relativePath}`);
  }
  
  // 3. Types partagés
  if (filePath.includes('/types/') || filePath.includes('/schemas/')) {
    auditResults.architecture.positives.push(`Type definitions present: ${relativePath}`);
  }
}

/**
 * Analyser les tests
 */
function analyzeTests(filePath, content) {
  const relativePath = path.relative(ROOT_DIR, filePath);
  const isTestFile = filePath.includes('test') || filePath.includes('spec') || filePath.includes('__tests__');
  
  if (isTestFile) {
    // Vérifier la qualité des tests
    const hasAssertions = content.match(/(expect|assert|should)/i);
    if (hasAssertions) {
      auditResults.tests.positives.push(`Test file with assertions: ${relativePath}`);
    } else {
      auditResults.tests.issues.push({
        file: relativePath,
        issue: 'Test file without assertions',
        severity: 'medium',
      });
    }
  }
  
  // Vérifier la couverture (fichiers source sans tests correspondants)
  // (simplifié - vérifier si le fichier a un test correspondant)
}

/**
 * Générer le rapport
 */
function generateReport() {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: stats.totalFiles,
      totalLines: stats.totalLines,
      consoleLogs: stats.consoleLogs,
      todos: stats.todos,
      anyTypes: stats.anyTypes,
      largeFiles: stats.largeFiles.length,
      complexFunctions: stats.complexFunctions.length,
    },
    security: {
      critical: auditResults.security.critical.length,
      high: auditResults.security.high.length,
      medium: auditResults.security.medium.length,
      low: auditResults.security.low.length,
      positives: auditResults.security.positives.length,
      issues: [
        ...auditResults.security.critical.slice(0, 10),
        ...auditResults.security.high.slice(0, 10),
      ],
    },
    quality: {
      totalIssues: auditResults.quality.issues.length,
      issues: auditResults.quality.issues.slice(0, 20),
    },
    performance: {
      issues: auditResults.performance.issues,
      positives: auditResults.performance.positives.slice(0, 10),
    },
    maintainability: {
      issues: auditResults.maintainability.issues.slice(0, 20),
    },
    architecture: {
      positives: auditResults.architecture.positives.slice(0, 20),
    },
    tests: {
      issues: auditResults.tests.issues,
      positives: auditResults.tests.positives.slice(0, 10),
    },
  };
  
  return report;
}

/**
 * Générer le rapport markdown
 */
function generateMarkdownReport(report) {
  let md = `# 🔍 Audit Complet du Code - ${new Date().toLocaleDateString('fr-FR')}\n\n`;
  md += `**Date:** ${report.timestamp}\n`;
  md += `**Fichiers analysés:** ${report.summary.totalFiles}\n`;
  md += `**Lignes de code:** ${report.summary.totalLines.toLocaleString()}\n\n`;
  
  md += `## 📊 Résumé\n\n`;
  md += `- **console.log:** ${report.summary.consoleLogs} occurrences\n`;
  md += `- **TODO/FIXME:** ${report.summary.todos} occurrences\n`;
  md += `- **Types 'any':** ${report.summary.anyTypes} occurrences\n`;
  md += `- **Fichiers volumineux:** ${report.summary.largeFiles}\n`;
  md += `- **Fonctions complexes:** ${report.summary.complexFunctions}\n\n`;
  
  md += `## 🔒 Sécurité\n\n`;
  md += `### Critiques (${report.security.critical})\n`;
  if (report.security.issues.length > 0) {
    report.security.issues.slice(0, 10).forEach(issue => {
      md += `- **${issue.file}**: ${issue.issue}\n`;
    });
  } else {
    md += `✅ Aucun problème critique détecté\n`;
  }
  
  md += `\n### Points Positifs\n`;
  auditResults.security.positives.slice(0, 10).forEach(pos => {
    md += `- ✅ ${pos}\n`;
  });
  
  md += `\n## 📝 Qualité du Code\n\n`;
  md += `### Problèmes Détectés (${report.quality.totalIssues})\n`;
  report.quality.issues.slice(0, 20).forEach(issue => {
    md += `- **${issue.severity.toUpperCase()}** ${issue.file}: ${issue.issue}\n`;
  });
  
  md += `\n## ⚡ Performance\n\n`;
  if (report.performance.issues.length > 0) {
    report.performance.issues.forEach(issue => {
      md += `- **${issue.severity.toUpperCase()}** ${issue.file}: ${issue.issue}\n`;
    });
  } else {
    md += `✅ Aucun problème de performance détecté\n`;
  }
  
  md += `\n## 🏗️ Architecture\n\n`;
  report.architecture.positives.forEach(pos => {
    md += `- ✅ ${pos}\n`;
  });
  
  md += `\n## 🧪 Tests\n\n`;
  if (report.tests.issues.length > 0) {
    report.tests.issues.forEach(issue => {
      md += `- **${issue.severity.toUpperCase()}** ${issue.file}: ${issue.issue}\n`;
    });
  } else {
    md += `✅ Tests bien structurés\n`;
  }
  
  md += `\n## 📋 Recommandations\n\n`;
  md += `### 🔴 Priorité Haute\n`;
  md += `1. Corriger les problèmes de sécurité critiques\n`;
  md += `2. Remplacer les console.log par le système de logging\n`;
  md += `3. Réduire l'utilisation des types 'any'\n\n`;
  
  md += `### 🟡 Priorité Moyenne\n`;
  md += `1. Résoudre les TODO/FIXME critiques\n`;
  md += `2. Refactoriser les fichiers volumineux\n`;
  md += `3. Optimiser les requêtes N+1\n\n`;
  
  md += `### 🟢 Priorité Basse\n`;
  md += `1. Améliorer la documentation\n`;
  md += `2. Augmenter la couverture de tests\n`;
  md += `3. Réduire la complexité cyclomatique\n\n`;
  
  return md;
}

/**
 * Main
 */
function main() {
  console.log('🔍 Démarrage de l\'audit du code...\n');
  
  // Analyser le frontend
  console.log('📁 Analyse du frontend...');
  const frontendFiles = getAllFiles(FRONTEND_DIR, ['.ts', '.tsx', '.js', '.jsx']);
  frontendFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      analyzeSecurity(file, content);
      analyzeQuality(file, content);
      analyzePerformance(file, content);
      analyzeArchitecture(file, content);
      analyzeTests(file, content);
    } catch (err) {
      console.error(`Erreur lors de l'analyse de ${file}:`, err.message);
    }
  });
  
  // Analyser le backend
  console.log('📁 Analyse du backend...');
  const backendFiles = getAllFiles(BACKEND_DIR, ['.py']);
  backendFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      analyzeSecurity(file, content);
      analyzeQuality(file, content);
      analyzePerformance(file, content);
      analyzeArchitecture(file, content);
      analyzeTests(file, content);
    } catch (err) {
      console.error(`Erreur lors de l'analyse de ${file}:`, err.message);
    }
  });
  
  // Générer le rapport
  console.log('\n📊 Génération du rapport...');
  const report = generateReport();
  const markdownReport = generateMarkdownReport(report);
  
  // Sauvegarder le rapport JSON
  const jsonPath = path.join(ROOT_DIR, 'AUDIT_CODE_2026.json');
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  console.log(`✅ Rapport JSON sauvegardé: ${jsonPath}`);
  
  // Sauvegarder le rapport Markdown
  const mdPath = path.join(ROOT_DIR, 'AUDIT_CODE_2026.md');
  fs.writeFileSync(mdPath, markdownReport);
  console.log(`✅ Rapport Markdown sauvegardé: ${mdPath}`);
  
  // Afficher le résumé
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ DE L\'AUDIT');
  console.log('='.repeat(60));
  console.log(`Fichiers analysés: ${stats.totalFiles}`);
  console.log(`Lignes de code: ${stats.totalLines.toLocaleString()}`);
  console.log(`\n🔒 Sécurité:`);
  console.log(`  - Critiques: ${auditResults.security.critical.length}`);
  console.log(`  - Haute: ${auditResults.security.high.length}`);
  console.log(`\n📝 Qualité:`);
  console.log(`  - console.log: ${stats.consoleLogs}`);
  console.log(`  - TODO/FIXME: ${stats.todos}`);
  console.log(`  - Types 'any': ${stats.anyTypes}`);
  console.log(`\n📈 Performance:`);
  console.log(`  - Problèmes: ${auditResults.performance.issues.length}`);
  console.log(`\n✅ Points positifs:`);
  console.log(`  - Sécurité: ${auditResults.security.positives.length}`);
  console.log(`  - Architecture: ${auditResults.architecture.positives.length}`);
  console.log(`  - Tests: ${auditResults.tests.positives.length}`);
  console.log('\n' + '='.repeat(60));
}

// Exécuter l'audit
main();
