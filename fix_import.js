import fs from 'fs';
import path from 'path';

const componentsDir = 'e:/Thanh/src/components';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace '../theme/' with '../../theme/'
  content = content.replace(/from '\.\.\/theme\/typography'/g, "from '../../theme/typography'");
  content = content.replace(/from '\.\.\/theme\/colors'/g, "from '../../theme/colors'");

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed imports in ${filePath}`);
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
console.log('Fix complete.');
