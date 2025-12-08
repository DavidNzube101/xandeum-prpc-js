import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function addJsExtensionsToEsmImports(directory) {
  const esmDir = path.join(directory, 'dist', 'esm');

  if (!fs.existsSync(esmDir)) {
    console.log('ESM directory does not exist:', esmDir);
    return;
  }

  const files = fs.readdirSync(esmDir).filter(file => file.endsWith('.js'));

  for (const file of files) {
    const filePath = path.join(esmDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Only replace local imports (starting with './' or '../'), not external packages
    let updatedContent = content
      // Replace local imports that don't already have .js extension
      .replace(/(from\s+["'])\.\/([^"']*?)(\.js)?(["'])/g, '$1./$2.js$4')
      .replace(/(from\s+["'])\.\.\/([^"']*?)(\.js)?(["'])/g, '$1../$2.js$4');

    // Also handle import statements in addition to from clauses
    updatedContent = updatedContent
      .replace(/(import\s+["'])\.\/([^"']*?)(\.js)?(["'])/g, '$1./$2.js$4')
      .replace(/(import\s+["'])\.\.\/([^"']*?)(\.js)?(["'])/g, '$1../$2.js$4');

    // Prevent adding .js to non-JS file extensions (like .json, etc.)
    updatedContent = updatedContent.replace(/\.js(\.json|\.css|\.svg)["']/g, '$1"');

    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent);
      console.log(`Updated local imports in: ${file}`);
    }
  }

  console.log('Completed adding .js extensions to local imports in ESM files');
}

// Run the function with the current directory
addJsExtensionsToEsmImports(__dirname);