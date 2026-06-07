import fs from 'fs';

let content = fs.readFileSync('src/pages/ChickenSolo.tsx', 'utf-8');

// The file needs a series of transformations
// I'll make sure to output EXACTLY what we want
// Actually, it's safer to generate an independent file programmatically!
