const fs = require('fs');
let text = fs.readFileSync('src/lib/sentencesData.ts', 'utf8');
text = text.replace(/\\\\n/g, '\\n');
fs.writeFileSync('src/lib/sentencesData.ts', text);
