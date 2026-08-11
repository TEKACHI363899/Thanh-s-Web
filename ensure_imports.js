import fs from 'fs';
import path from 'path';

const componentsDir = 'e:/Thanh/src/components';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  if (content.includes('TYPOGRAPHY') && !content.includes('import { TYPOGRAPHY }')) {
    const relativePath = path.relative('e:/Thanh/src/components', filePath).replace(/\\/g, '/');
    const depth = relativePath.split('/').length - 1;
    let importPath = depth === 0 ? '../theme/typography' : '../../theme/typography';
    
    content = `import { TYPOGRAPHY } from '${importPath}';\n` + content;
  }
  
  if (content.includes('COLORS.') && !content.includes('import { COLORS }')) {
    const relativePath = path.relative('e:/Thanh/src/components', filePath).replace(/\\/g, '/');
    const depth = relativePath.split('/').length - 1;
    let importPath = depth === 0 ? '../theme/colors' : '../../theme/colors';
    content = `import { COLORS } from '${importPath}';\n` + content;
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Added missing imports in ${filePath}`);
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
console.log('Ensure imports complete.');
