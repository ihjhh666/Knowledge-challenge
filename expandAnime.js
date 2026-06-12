const fs = require('fs');
let content = fs.readFileSync('src/lib/massiveDynamic.ts', 'utf-8');

const newAnimes = `
const ANIMES = [
  { a: 'One Piece', p: 'لوفي', c: 'قراصنة', ep: '1000+' }, { a: 'Naruto', p: 'ناروتو', c: 'نينجا', ep: '720' },
  { a: 'Attack on Titan', p: 'إيرين', c: 'عمالقة', ep: '89' }, { a: 'Death Note', p: 'لايت', c: 'الغموض والتحقيق', ep: '37' },
  { a: 'Demon Slayer', p: 'تانجيرو', c: 'قتلة شياطين', ep: '50+' }, { a: 'Dragon Ball', p: 'غوكو', c: 'فنون قتالية', ep: '800+' },
  { a: 'Hunter x Hunter', p: 'غون', c: 'صيادين', ep: '148' }, { a: 'Bleach', p: 'إيتشيغو', c: 'شينيغامي', ep: '366+' },
  { a: 'My Hero Academia', p: 'ميدوريا', c: 'أبطال خارقين', ep: '130+' }, { a: 'Fullmetal Alchemist', p: 'إدوارد', c: 'خيمياء', ep: '64' },
  { a: 'Tokyo Ghoul', p: 'كانيكي', c: 'غيلان', ep: '48' }, { a: 'Sword Art Online', p: 'كيريتو', c: 'عالم افتراضي', ep: '90+' },
  { a: 'Jujutsu Kaisen', p: 'يوجي إيتادوري', c: 'سحر ولعنات', ep: '47' }, { a: 'Black Clover', p: 'أستا', c: 'سحر وفرسان', ep: '170' },
  { a: 'Fairy Tail', p: 'ناتسو', c: 'نقابات السحر', ep: '328' }, { a: 'Tokyo Revengers', p: 'تاكيميتشي', c: 'عصابات وسفر بالزمن', ep: '50+' },
  { a: 'Detective Conan', p: 'كونان', c: 'تحقيق وجرائم', ep: '1100+' }, { a: 'Gintama', p: 'جينتوكي', c: 'كوميديا وساموراي', ep: '367' },
  { a: 'One Punch Man', p: 'سايتاما', c: 'أبطال خارقين ومحاكاة ساخرة', ep: '24' }, { a: 'Steins;Gate', p: 'أوكابي', c: 'خيال علمي وسفر بالزمن', ep: '24' },
  { a: 'Code Geass', p: 'لولوش', c: 'آلات وحروب (ميكا)', ep: '50' }, { a: 'Haikyuu', p: 'هيناتا', c: 'رياضة (كرة طائرة)', ep: '85' },
  { a: 'Kuroko no Basket', p: 'كوروكو', c: 'رياضة (كرة سلة)', ep: '75' }, { a: 'JoJo\\'s Bizarre Adventure', p: 'جوتارو', c: 'مغامرات وقوى خارقة', ep: '190+' },
  { a: 'Mob Psycho 100', p: 'موب', c: 'قوى نفسية', ep: '37' }, { a: 'Chainsaw Man', p: 'دينجي', c: 'شياطين وقتال', ep: '12' },
  { a: 'Spy x Family', p: 'لويد', c: 'جواسيس وكوميديا', ep: '25+' }, { a: 'Dr. Stone', p: 'سينكو', c: 'خيال علمي وابتكار', ep: '35+' },
  { a: 'Cyberpunk: Edgerunners', p: 'ديفيد', c: 'خيال علمي ومستقبل سايبربانك', ep: '10' }, { a: 'Neon Genesis Evangelion', p: 'شينجي', c: 'آلات وعمق نفسي', ep: '26' },
  { a: 'Cowboy Bebop', p: 'سبايك', c: 'فضاء وصائدي جوائز', ep: '26' }, { a: 'Vinland Saga', p: 'ثورفين', c: 'فايكنج وتاريخ', ep: '48' },
  { a: 'Erase', p: 'ساتورو', c: 'سفر بالزمن وتحقيق', ep: '12' }, { a: 'Psycho-Pass', p: 'أكاني', c: 'شرطة وخيال علمي', ep: '41' },
  { a: 'Re:Zero', p: 'سوبارو', c: 'عالم آخر وسفر بالزمن', ep: '50+' }, { a: 'No Game No Life', p: 'سورا', c: 'ألعاب وعالم آخر', ep: '12' },
  { a: 'Overlord', p: 'آينز', c: 'عالم افتراضي وسحر', ep: '52' }, { a: 'Tengen Toppa Gurren Lagann', p: 'سيمون', c: 'آلات ومغامرات فضائية', ep: '27' },
  { a: 'Clannad', p: 'تومويا', c: 'دراما ورومانسية', ep: '47' }, { a: 'Your Lie in April', p: 'كوسي', c: 'موسيقى ودراما', ep: '22' }
];

const animeTemplates = [
  () => {
    const item = ANIMES[rnd(0, ANIMES.length-1)];
    const wrongs = ANIMES.filter(a => a.p !== item.p).map(a => a.p);
    return { text: \`من هو بطل أنمي \${item.a}؟\`, correctAnswer: item.p, wrongOptions: wrongs.sort(()=>0.5-Math.random()).slice(0,3) };
  },
  () => {
    const item = ANIMES[rnd(0, ANIMES.length-1)];
    const wrongs = ANIMES.filter(a => a.c !== item.c).map(a => a.c);
    return { text: \`ما هو التصنيف الأساسي لعالم أنمي \${item.a}؟\`, correctAnswer: item.c, wrongOptions: wrongs.sort(()=>0.5-Math.random()).slice(0,3) };
  },
  () => {
    const item = ANIMES.filter(a => !a.ep.includes('+'))[rnd(0, 10)];
    return { text: \`كم تقريباً عدد حلقات الأنمي الأصلي \${item.a}؟\`, correctAnswer: item.ep, wrongOptions: [\`\${parseInt(item.ep)+20}\`, \`\${Math.max(12, parseInt(item.ep)-12)}\`, \`\${parseInt(item.ep)+50}\`] };
  }
];
`;

content = content.replace(/const ANIMES = \[[\s\S]*?\];\s*const animeTemplates = \[[\s\S]*?\];/m, newAnimes);
fs.writeFileSync('src/lib/massiveDynamic.ts', content);
console.log("Updated ANIMES");
