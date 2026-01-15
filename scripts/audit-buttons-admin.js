const fs = require('fs');
const path = require('path');

// Variants avec background color
const BACKGROUND_VARIANTS = ['primary', 'secondary', 'danger', 'arise-primary'];
// Variants avec seulement border
const BORDER_ONLY_VARIANTS = ['outline'];
// Variants sans background ni border (ghost)
const GHOST_VARIANTS = ['ghost'];

// Patterns pour trouver les boutons
const BUTTON_PATTERNS = [
  /<Button[^>]*variant=["']([^"']+)["'][^>]*>/g,
  /<ButtonLink[^>]*variant=["']([^"']+)["'][^>]*>/g,
  /<button[^>]*className=["'][^"']*border[^"']*["'][^>]*>/g,
  /<button[^>]*style=["'][^"']*border[^"']*["'][^>]*>/g,
];

function findDashboardAndAdminFiles(dir = 'apps/web/src/app', files = []) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    // Ignorer node_modules et .next
    if (item.name === 'node_modules' || item.name === '.next' || item.name === '.git') {
      continue;
    }
    
    if (item.isDirectory()) {
      findDashboardAndAdminFiles(fullPath, files);
    } else if (item.isFile() && item.name.endsWith('.tsx')) {
      // Vérifier si le chemin contient dashboard ou admin
      if (fullPath.includes('/dashboard/') || fullPath.includes('/admin/') || 
          fullPath.includes('\\dashboard\\') || fullPath.includes('\\admin\\')) {
        files.push(fullPath);
      }
    }
  }
  
  return files;
}

function extractButtonsFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const buttons = [];
  
  // Extraire les boutons avec variant
  const variantPattern = /<Button[^>]*variant=["']([^"']+)["'][^>]*>[\s\S]*?<\/Button>/g;
  let match;
  while ((match = variantPattern.exec(content)) !== null) {
    const fullMatch = match[0];
    const variant = match[1];
    const lineNumber = content.substring(0, match.index).split('\n').length;
    
    // Extraire le texte du bouton
    const textMatch = fullMatch.match(/>([^<]+)</);
    const buttonText = textMatch ? textMatch[1].trim() : '';
    
    buttons.push({
      type: 'Button',
      variant,
      text: buttonText,
      line: lineNumber,
      fullMatch: fullMatch.substring(0, 200) // Limiter la longueur
    });
  }
  
  // Extraire les ButtonLink
  const buttonLinkPattern = /<ButtonLink[^>]*variant=["']([^"']+)["'][^>]*>[\s\S]*?<\/ButtonLink>/g;
  while ((match = buttonLinkPattern.exec(content)) !== null) {
    const fullMatch = match[0];
    const variant = match[1];
    const lineNumber = content.substring(0, match.index).split('\n').length;
    
    const textMatch = fullMatch.match(/>([^<]+)</);
    const buttonText = textMatch ? textMatch[1].trim() : '';
    
    buttons.push({
      type: 'ButtonLink',
      variant,
      text: buttonText,
      line: lineNumber,
      fullMatch: fullMatch.substring(0, 200)
    });
  }
  
  // Extraire les boutons HTML natifs avec border
  const nativeButtonPattern = /<button[^>]*>[\s\S]*?<\/button>/g;
  while ((match = nativeButtonPattern.exec(content)) !== null) {
    const fullMatch = match[0];
    const lineNumber = content.substring(0, match.index).split('\n').length;
    
    // Vérifier si le bouton a un border
    const hasBorder = /border|border-/.test(fullMatch) || /style=["'][^"']*border[^"']*["']/.test(fullMatch);
    const hasBackground = /bg-|background/.test(fullMatch) || /style=["'][^"']*background[^"']*["']/.test(fullMatch);
    
    if (hasBorder || hasBackground) {
      const textMatch = fullMatch.match(/>([^<]+)</);
      const buttonText = textMatch ? textMatch[1].trim() : '';
      
      buttons.push({
        type: 'button',
        variant: hasBorder && !hasBackground ? 'border-only' : hasBackground ? 'with-background' : 'unknown',
        text: buttonText,
        line: lineNumber,
        fullMatch: fullMatch.substring(0, 200)
      });
    }
  }
  
  return buttons;
}

function auditButtons() {
  console.log('🔍 Recherche des fichiers dashboard et admin...\n');
  
  const files = findDashboardAndAdminFiles();
  console.log(`📁 ${files.length} fichiers trouvés\n`);
  
  const results = {
    withBackground: [],
    borderOnly: [],
    ghost: [],
    unknown: [],
    summary: {
      total: 0,
      withBackground: 0,
      borderOnly: 0,
      ghost: 0,
      unknown: 0
    }
  };
  
  for (const file of files) {
    try {
      const buttons = extractButtonsFromFile(file);
      
      for (const button of buttons) {
        const relativePath = path.relative(process.cwd(), file);
        const buttonInfo = {
          ...button,
          file: relativePath
        };
        
        results.summary.total++;
        
        if (BACKGROUND_VARIANTS.includes(button.variant)) {
          results.withBackground.push(buttonInfo);
          results.summary.withBackground++;
        } else if (BORDER_ONLY_VARIANTS.includes(button.variant)) {
          results.borderOnly.push(buttonInfo);
          results.summary.borderOnly++;
        } else if (GHOST_VARIANTS.includes(button.variant)) {
          results.ghost.push(buttonInfo);
          results.summary.ghost++;
        } else if (button.variant === 'border-only' || button.variant === 'with-background') {
          if (button.variant === 'border-only') {
            results.borderOnly.push(buttonInfo);
            results.summary.borderOnly++;
          } else {
            results.withBackground.push(buttonInfo);
            results.summary.withBackground++;
          }
        } else {
          results.unknown.push(buttonInfo);
          results.summary.unknown++;
        }
      }
    } catch (error) {
      console.error(`❌ Erreur lors de l'analyse de ${file}:`, error.message);
    }
  }
  
  return results;
}

function generateReport(results) {
  let report = '# AUDIT DES BOUTONS - PAGES ADMIN/DASHBOARD\n\n';
  report += `Date: ${new Date().toLocaleString('fr-FR')}\n\n`;
  
  report += '## 📊 RÉSUMÉ\n\n';
  report += `- **Total de boutons trouvés**: ${results.summary.total}\n`;
  report += `- **Boutons avec background color**: ${results.summary.withBackground}\n`;
  report += `- **Boutons avec seulement border**: ${results.summary.borderOnly}\n`;
  report += `- **Boutons ghost (sans border ni background)**: ${results.summary.ghost}\n`;
  report += `- **Boutons non catégorisés**: ${results.summary.unknown}\n\n`;
  
  report += '---\n\n';
  
  // Boutons avec background
  report += '## 🎨 BOUTONS AVEC BACKGROUND COLOR\n\n';
  report += `**Total: ${results.withBackground.length}**\n\n`;
  
  if (results.withBackground.length > 0) {
    // Grouper par variant
    const byVariant = {};
    results.withBackground.forEach(btn => {
      if (!byVariant[btn.variant]) {
        byVariant[btn.variant] = [];
      }
      byVariant[btn.variant].push(btn);
    });
    
    Object.keys(byVariant).sort().forEach(variant => {
      report += `### Variant: \`${variant}\` (${byVariant[variant].length})\n\n`;
      byVariant[variant].forEach((btn, idx) => {
        report += `${idx + 1}. **${btn.text || '(sans texte)'}**\n`;
        report += `   - Fichier: \`${btn.file}\`\n`;
        report += `   - Ligne: ${btn.line}\n`;
        report += `   - Type: ${btn.type}\n\n`;
      });
    });
  } else {
    report += 'Aucun bouton avec background color trouvé.\n\n';
  }
  
  report += '---\n\n';
  
  // Boutons avec seulement border
  report += '## 🔲 BOUTONS AVEC SEULEMENT BORDER\n\n';
  report += `**Total: ${results.borderOnly.length}**\n\n`;
  
  if (results.borderOnly.length > 0) {
    // Grouper par variant
    const byVariant = {};
    results.borderOnly.forEach(btn => {
      if (!byVariant[btn.variant]) {
        byVariant[btn.variant] = [];
      }
      byVariant[btn.variant].push(btn);
    });
    
    Object.keys(byVariant).sort().forEach(variant => {
      report += `### Variant: \`${variant}\` (${byVariant[variant].length})\n\n`;
      byVariant[variant].forEach((btn, idx) => {
        report += `${idx + 1}. **${btn.text || '(sans texte)'}**\n`;
        report += `   - Fichier: \`${btn.file}\`\n`;
        report += `   - Ligne: ${btn.line}\n`;
        report += `   - Type: ${btn.type}\n\n`;
      });
    });
  } else {
    report += 'Aucun bouton avec seulement border trouvé.\n\n';
  }
  
  report += '---\n\n';
  
  // Boutons ghost
  if (results.ghost.length > 0) {
    report += '## 👻 BOUTONS GHOST (SANS BORDER NI BACKGROUND)\n\n';
    report += `**Total: ${results.ghost.length}**\n\n`;
    results.ghost.forEach((btn, idx) => {
      report += `${idx + 1}. **${btn.text || '(sans texte)'}**\n`;
      report += `   - Fichier: \`${btn.file}\`\n`;
      report += `   - Ligne: ${btn.line}\n`;
      report += `   - Type: ${btn.type}\n\n`;
    });
    report += '---\n\n';
  }
  
  // Boutons non catégorisés
  if (results.unknown.length > 0) {
    report += '## ❓ BOUTONS NON CATÉGORISÉS\n\n';
    report += `**Total: ${results.unknown.length}**\n\n`;
    results.unknown.forEach((btn, idx) => {
      report += `${idx + 1}. **${btn.text || '(sans texte)'}**\n`;
      report += `   - Fichier: \`${btn.file}\`\n`;
      report += `   - Ligne: ${btn.line}\n`;
      report += `   - Variant: \`${btn.variant || 'non spécifié'}\`\n`;
      report += `   - Type: ${btn.type}\n\n`;
    });
  }
  
  // Statistiques par fichier
  report += '---\n\n';
  report += '## 📁 STATISTIQUES PAR FICHIER\n\n';
  
  const fileStats = {};
  [...results.withBackground, ...results.borderOnly, ...results.ghost, ...results.unknown].forEach(btn => {
    if (!fileStats[btn.file]) {
      fileStats[btn.file] = { withBackground: 0, borderOnly: 0, ghost: 0, unknown: 0 };
    }
    if (BACKGROUND_VARIANTS.includes(btn.variant) || btn.variant === 'with-background') {
      fileStats[btn.file].withBackground++;
    } else if (BORDER_ONLY_VARIANTS.includes(btn.variant) || btn.variant === 'border-only') {
      fileStats[btn.file].borderOnly++;
    } else if (GHOST_VARIANTS.includes(btn.variant)) {
      fileStats[btn.file].ghost++;
    } else {
      fileStats[btn.file].unknown++;
    }
  });
  
  Object.keys(fileStats).sort().forEach(file => {
    const stats = fileStats[file];
    const total = stats.withBackground + stats.borderOnly + stats.ghost + stats.unknown;
    if (total > 0) {
      report += `### \`${file}\`\n`;
      report += `- Total: ${total}\n`;
      report += `- Avec background: ${stats.withBackground}\n`;
      report += `- Border seulement: ${stats.borderOnly}\n`;
      if (stats.ghost > 0) report += `- Ghost: ${stats.ghost}\n`;
      if (stats.unknown > 0) report += `- Non catégorisés: ${stats.unknown}\n`;
      report += '\n';
    }
  });
  
  return report;
}

function main() {
  try {
    console.log('🚀 Démarrage de l\'audit des boutons...\n');
    
    const results = auditButtons();
    const report = generateReport(results);
    
    const reportPath = path.join(process.cwd(), 'AUDIT_BOUTONS_ADMIN.md');
    fs.writeFileSync(reportPath, report, 'utf-8');
    
    console.log('✅ Audit terminé!\n');
    console.log('📊 Résumé:');
    console.log(`   - Total: ${results.summary.total}`);
    console.log(`   - Avec background: ${results.summary.withBackground}`);
    console.log(`   - Border seulement: ${results.summary.borderOnly}`);
    console.log(`   - Ghost: ${results.summary.ghost}`);
    console.log(`   - Non catégorisés: ${results.summary.unknown}\n`);
    console.log(`📄 Rapport généré: ${reportPath}\n`);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

main();
