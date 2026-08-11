import fs from 'fs';
import path from 'path';

const componentsDir = 'e:/Thanh/src/components';

const fontMap = {
  10: 'caption2', 11: 'caption2',
  12: 'caption1',
  13: 'footnote',
  14: 'subhead',
  15: 'callout', 16: 'callout',
  17: 'headline', 18: 'headline',
  19: 'title3', 20: 'title3',
  21: 'title2', 22: 'title2', 24: 'title2',
  28: 'title1', 34: 'largeTitle'
};

const colorMap = {
  '#0f172a': 'COLORS.bgDark',
  '#1e293b': 'COLORS.cardDark',
  '#162032': 'COLORS.sidebarBg',
  '#172336': 'COLORS.sidebarBg',
  '#111c2e': 'COLORS.sidebarBg',
  '#334155': 'COLORS.surfaceHover',
  '#f8fafc': 'COLORS.textMain',
  '#94a3b8': 'COLORS.textMuted'
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Add TYPOGRAPHY import if needed and if it contains fontSize
  if (content.match(/fontSize:\s*['"]?\d+['"]?/)) {
    const depth = filePath.split('/').length - 'e:/Thanh/src/components/'.split('/').length;
    let importPath = depth === 1 ? '../theme/typography' : '../../theme/typography';
    if (!content.includes('TYPOGRAPHY')) {
      content = content.replace(/(import .*?['"];\n)/, `$1import { TYPOGRAPHY } from '${importPath}';\n`);
    }

    // Replace fontSize: XX
    content = content.replace(/fontSize:\s*['"]?(\d+)px['"]?,?/g, (match, size) => {
      const scale = fontMap[size] || 'body';
      return `...TYPOGRAPHY.${scale},`;
    });
    content = content.replace(/fontSize:\s*(\d+),?/g, (match, size) => {
      const scale = fontMap[size] || 'body';
      return `...TYPOGRAPHY.${scale},`;
    });
  }

  // Replace colors
  for (const [hex, variable] of Object.entries(colorMap)) {
    const regex = new RegExp(`['"]${hex}['"]`, 'gi');
    content = content.replace(regex, variable);
  }

  // Since we might be replacing inside styles, if COLORS is used, make sure it's imported
  if (content.includes('COLORS.') && !content.includes('import { COLORS }')) {
    const depth = filePath.split('/').length - 'e:/Thanh/src/components/'.split('/').length;
    let importPath = depth === 1 ? '../theme/colors' : '../../theme/colors';
    content = content.replace(/(import .*?['"];\n)/, `$1import { COLORS } from '${importPath}';\n`);
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file).replace(/\\/g, '/');
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      processFile(fullPath);
    }
  }
}

walk(componentsDir);
console.log('Refactoring complete.');
