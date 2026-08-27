const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const API_CONST_VARIANTS = [
  'process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"',
  "process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'",
  'process.env.NEXT_PUBLIC_API_URL || `http://localhost:4000`',
  'process.env.NODE_ENV === \'development\' ? \'http://localhost:4000\' : baseUrl',
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // We want to replace fetch("http://localhost:4000...")
  // fetch('http://localhost:4000...')
  // fetch(`http://localhost:4000...`)
  
  // Replace double quotes
  content = content.replace(/"http:\/\/localhost:4000([^"]*)"/g, '`${API}$1`');
  // Replace single quotes
  content = content.replace(/'http:\/\/localhost:4000([^']*)'/g, '`${API}$1`');
  // Replace backticks
  content = content.replace(/`http:\/\/localhost:4000([^`]*)`/g, '`${API}$1`');

  // Fix up specific files that had a different base url var
  if (filePath.endsWith('src\\app\\[locale]\\services\\page.tsx') || filePath.endsWith('src/app/[locale]/services/page.tsx')) {
    content = content.replace(/const apiUrl = process\.env\.NODE_ENV === 'development' \? 'http:\/\/localhost:4000' : baseUrl;/, 'const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";\n    const apiUrl = API;');
  }

  // Ensure 'const API = ...' is in the file if we added ${API} (and it's not already there)
  if (content !== originalContent && content.includes('${API}')) {
    if (!content.includes('const API = process.env.NEXT_PUBLIC_API_URL') && !content.includes('const API_URL = process.env.NEXT_PUBLIC_API_URL') && !content.includes('const API_BASE = process.env.NEXT_PUBLIC_API_URL')) {
      // we need to inject `const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";`
      // For Next.js components, we can add it after imports.
      const importLastIndex = content.lastIndexOf('import ');
      if (importLastIndex !== -1) {
        const endOfImport = content.indexOf('\n', importLastIndex);
        content = content.slice(0, endOfImport + 1) + '\nconst API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";\n' + content.slice(endOfImport + 1);
      } else {
        content = 'const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";\n\n' + content;
      }
    }
  }

  // Restore the ones that were valid assignments
  content = content.replace(/const API = process\.env\.NEXT_PUBLIC_API_URL \|\| `\$\{API\}`/g, 'const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"');
  content = content.replace(/const API_URL = process\.env\.NEXT_PUBLIC_API_URL \|\| `\$\{API\}`/g, 'const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"');
  content = content.replace(/const API_BASE = process\.env\.NEXT_PUBLIC_API_URL \|\| `\$\{API\}`/g, 'const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      processFile(fullPath);
    }
  }
}

walkDir(srcDir);
console.log("Done.");
