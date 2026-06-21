import fs from 'fs';

const solo = fs.readFileSync('src/pages/IceSolo.tsx', 'utf-8');
const lines = solo.split('\n');

const startIdx = lines.findIndex(l => l.includes('const draw = useCallback'));
const appendCode = lines.slice(startIdx).join('\n');

const room = fs.readFileSync('src/pages/IceRoom.tsx', 'utf-8');

fs.writeFileSync('src/pages/IceRoom.tsx', room + '\n' + appendCode);
