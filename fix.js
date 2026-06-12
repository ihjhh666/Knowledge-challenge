const fs = require('fs');
let content = fs.readFileSync('src/lib/sentencesData.ts', 'utf-8');
content = content.replace(/\\\\n/g, '\\n');
fs.writeFileSync('src/lib/sentencesData.ts', content);
