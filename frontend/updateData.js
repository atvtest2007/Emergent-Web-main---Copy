const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, 'src', 'maxxplayer', 'screens');

function processDirectory(directory) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');

      if (content.includes('mockData')) {
        // 1. Replace the import statement
        // It could be from '../data/mockData' or '../../data/mockData'
        content = content.replace(
          /import\s+\{([^}]+)\}\s+from\s+['"]\.\.\/data\/mockData['"];?/g,
          "import { useMaxxData } from '../data/useMaxxData';"
        );
        content = content.replace(
          /import\s+\{([^}]+)\}\s+from\s+['"]\.\.\/\.\.\/data\/mockData['"];?/g,
          "import { useMaxxData } from '../../data/useMaxxData';"
        );

        // 2. Inject the hook call right after the export default function line
        // Some functions are `export default function Name({ onNavigate }: Props) {`
        // Some might not be exported as default immediately, but in projectmaxxplayer they all are.
        const hookCall = `\n  const { channels, movies, seriesData, playlists, epgData, epgCategories } = useMaxxData();\n`;
        
        content = content.replace(
          /(export\s+default\s+function\s+[A-Za-z0-9_]+\s*\([^)]*\)\s*\{)/g,
          `$1${hookCall}`
        );

        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(screensDir);
