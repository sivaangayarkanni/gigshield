import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory() && !fullPath.includes('node_modules') && !fullPath.includes('.git') && !fullPath.includes('dist')) {
            results = results.concat(walkDir(fullPath));
        } else if (stat.isFile() && (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.css') || fullPath.endsWith('.html') || fullPath.endsWith('.json'))) {
            results.push(fullPath);
        }
    });
    return results;
}

const srcDir = path.join(__dirname, 'src');
const backendDir = path.join(__dirname, 'backend');

const allFiles = [...walkDir(srcDir), ...walkDir(backendDir), path.join(__dirname, 'index.html')];

allFiles.forEach(file => {
  if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      
      let newContent = content
        .replace(/EarnSure/g, 'GigShield')
        .replace(/Earnsure/g, 'GigShield')
        .replace(/earnsure/g, 'gigshield')
        .replace(/Gig Insurance Platform/g, 'External Disruption Claims');
        
      if (content !== newContent) {
          fs.writeFileSync(file, newContent);
          console.log(`Updated ${file}`);
      }
  }
});
console.log("Global rebrand complete.");
