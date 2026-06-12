const fs = require('fs');
let content = fs.readFileSync('src/lib/massiveDynamic.ts', 'utf-8');

const newMovies = `
const MOVIES = [
  { m: 'Inception', d: 'كريستوفر نولان', y: 2010, s: 'ليوناردو دي كابريو' }, { m: 'Titanic', d: 'جيمس كاميرون', y: 1997, s: 'ليوناردو دي كابريو' },
  { m: 'Avatar', d: 'جيمس كاميرون', y: 2009, s: 'سام ورذينجتن' }, { m: 'The Godfather', d: 'فرانسيس فورد كوبولا', y: 1972, s: 'مارلون براندو' },
  { m: 'Pulp Fiction', d: 'كوينتن تارانتينو', y: 1994, s: 'جون ترافولتا' }, { m: 'Interstellar', d: 'كريستوفر نولان', y: 2014, s: 'ماثيو ماكونهي' },
  { m: 'The Dark Knight', d: 'كريستوفر نولان', y: 2008, s: 'كريستيان بيل' }, { m: 'Forrest Gump', d: 'روبرت زيميكس', y: 1994, s: 'توم هانكس' },
  { m: 'The Matrix', d: 'الأخوات واشوسكي', y: 1999, s: 'كيانو ريفز' }, { m: 'Goodfellas', d: 'مارتن سكورسيزي', y: 1990, s: 'روبرت دي نيرو' },
  { m: "Schindler's List", d: 'ستيفن سبيلبرغ', y: 1993, s: 'ليام نيسون' }, { m: 'Fight Club', d: 'ديفيد فينشر', y: 1999, s: 'براد بيت' },
  { m: 'The Lord of the Rings: The Return of the King', d: 'بيتر جاكسون', y: 2003, s: 'إليجاه وود' },
  { m: 'Star Wars: Episode IV', d: 'جورج لوكاس', y: 1977, s: 'مارك هاميل' }, { m: 'Gladiator', d: 'ريدلي سكوت', y: 2000, s: 'راسل كرو' },
  { m: 'The Shawshank Redemption', d: 'فرانك دارابونت', y: 1994, s: 'تيم روبنز' }, { m: 'Jurassic Park', d: 'ستيفن سبيلبرغ', y: 1993, s: 'سام نيل' },
  { m: 'Inglourious Basterds', d: 'كوينتن تارانتينو', y: 2009, s: 'براد بيت' }, { m: 'Se7en', d: 'ديفيد فينشر', y: 1995, s: 'مورغان فريمان' },
  { m: 'The Lion King', d: 'روجر أليرس', y: 1994, s: 'ماثيو برودريك' }, { m: 'Back to the Future', d: 'روبرت زيميكس', y: 1985, s: 'مايكل جي فوكس' },
  { m: 'Joker', d: 'تود فيليبس', y: 2019, s: 'واكين فينكس' }, { m: 'Oppenheimer', d: 'كريستوفر نولان', y: 2023, s: 'كيليان مورفي' },
  { m: 'The Avengers', d: 'جوس ويدون', y: 2012, s: 'روبرت داوني جونيور' }, { m: 'Avengers: Endgame', d: 'الأخوان روسو', y: 2019, s: 'روبرت داوني جونيور' },
  { m: 'Spider-Man: No Way Home', d: 'جون واتس', y: 2021, s: 'توم هولاند' }, { m: 'Black Panther', d: 'رايان كوغلر', y: 2018, s: 'تشادويك بوزمان' },
  { m: 'Mad Max: Fury Road', d: 'جورج ميلر', y: 2015, s: 'توم هاردي' }, { m: 'Dune', d: 'دينيس فيلنوف', y: 2021, s: 'تيموثي شالاماي' },
  { m: 'Blade Runner 2049', d: 'دينيس فيلنوف', y: 2017, s: 'رايان غوسلينغ' }, { m: 'John Wick', d: 'تشاد ستاهيلسكي', y: 2014, s: 'كيانو ريفز' },
  { m: 'The Terminator', d: 'جيمس كاميرون', y: 1984, s: 'أرنولد شوارزنيجر' }, { m: 'Terminator 2: Judgment Day', d: 'جيمس كاميرون', y: 1991, s: 'أرنولد شوارزنيجر' },
  { m: 'Alien', d: 'ريدلي سكوت', y: 1979, s: 'سيغورني ويفر' }, { m: 'Die Hard', d: 'جون مكتيرنان', y: 1988, s: 'بروس ويليس' },
  { m: 'Indiana Jones: Raiders of the Lost Ark', d: 'ستيفن سبيلبرغ', y: 1981, s: 'هاريسون فورد' }, { m: 'Rocky', d: 'جون أفليدسن', y: 1976, s: 'سيلفستر ستالون' },
  { m: 'The Silence of the Lambs', d: 'جوناثان ديم', y: 1991, s: 'أنتوني هوبكنز' }, { m: 'Braveheart', d: 'ميل غيبسون', y: 1995, s: 'ميل غيبسون' },
  { m: 'Saving Private Ryan', d: 'ستيفن سبيلبرغ', y: 1998, s: 'توم هانكس' }
];

const moviesTemplates = [
  () => {
    const item = MOVIES[rnd(0, MOVIES.length-1)];
    const wrongs = [...new Set(MOVIES.filter(m => m.d !== item.d).map(m => m.d))];
    return { text: \`من هو مخرج فيلم \${item.m}؟\`, correctAnswer: item.d, wrongOptions: wrongs.sort(()=>0.5-Math.random()).slice(0,3) };
  },
  () => {
    const item = MOVIES[rnd(0, MOVIES.length-1)];
    return { text: \`في أي عام صدر فيلم \${item.m}؟\`, correctAnswer: \`\${item.y}\`, wrongOptions: [\`\${item.y+1}\`, \`\${item.y-2}\`, \`\${item.y+5}\`] };
  },
  () => {
    const item = MOVIES[rnd(0, MOVIES.length-1)];
    const wrongs = [...new Set(MOVIES.filter(m => m.s !== item.s).map(m => m.s))];
    return { text: \`من هو الممثل الذي أدى دور البطولة (أو من الأدوار الرئيسية) في فيلم \${item.m}؟\`, correctAnswer: item.s, wrongOptions: wrongs.sort(()=>0.5-Math.random()).slice(0,3) };
  }
];
`;

content = content.replace(/const MOVIES = \[[\s\S]*?\];\s*const moviesTemplates = \[[\s\S]*?\];/m, newMovies);
fs.writeFileSync('src/lib/massiveDynamic.ts', content);
console.log("Updated MOVIES");
