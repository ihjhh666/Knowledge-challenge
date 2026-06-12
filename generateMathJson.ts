import fs from 'fs';

interface MathQ {
  text: string;
  correctAnswer: string;
  wrongOptions: string[];
  difficultyRank: number; // 0=easy, 1=medium, 2=hard
  type: string;
}

const questions: MathQ[] = [];
const seenTexts = new Set<string>();

function addQ(text: string, correct: number | string, wrongs: (number | string)[], diff: number, type: string) {
  const t = text.trim();
  if (seenTexts.has(t)) return;
  
  const wStr = wrongs.map(String);
  const cStr = String(correct);
  
  if (wStr.includes(cStr)) {
    // try to fix it by removing correct from wrong options, then add a random one
    const newWs = wStr.filter(w => w !== cStr);
    while (newWs.length < 3) {
      const nw = Number(cStr) + r(-10, 10);
      if (nw !== Number(cStr) && !newWs.includes(String(nw))) {
        newWs.push(String(nw));
      }
    }
    seenTexts.add(t);
    questions.push({ text: t, correctAnswer: cStr, wrongOptions: newWs, difficultyRank: diff, type });
    return;
  }
  
  seenTexts.add(t);
  questions.push({ text: t, correctAnswer: cStr, wrongOptions: wStr, difficultyRank: diff, type });
}

function r(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randOffset(val: number, offsets: number[]) {
  const res: number[] = [];
  const startOffsets = [...offsets];
  while (res.length < 3 && startOffsets.length > 0) {
    const idx = r(0, startOffsets.length - 1);
    const o = startOffsets.splice(idx, 1)[0];
    const n = val + o;
    if (n !== val && n >= 0) {
      if (!res.includes(n)) {
        res.push(n);
      }
    }
  }
  while (res.length < 3) {
      const n = val + r(-10, 10);
      if (n !== val && n >= 0 && !res.includes(n)) res.push(n);
  }
  return res;
}

// 1. Addition
for (let i = 0; i < 200; i++) {
  // Easy
  const a1 = r(5, 50); const b1 = r(5, 50);
  addQ(`${a1} + ${b1} = ؟`, a1+b1, randOffset(a1+b1, [-2, -1, 1, 2, 10, -10]), 0, 'addition_e');
  
  // Medium
  const a2 = r(50, 500); const b2 = r(50, 500);
  addQ(`${a2} + ${b2} = ؟`, a2+b2, randOffset(a2+b2, [-10, 10, -100, 100, -2, 2]), 1, 'addition_m');
  
  // Hard
  const a3 = r(1000, 5000); const b3 = r(1000, 5000); const c3 = r(100, 999);
  addQ(`${a3} + ${b3} + ${c3} = ؟`, a3+b3+c3, randOffset(a3+b3+c3, [-10, 10, -100, 100, 1000]), 2, 'addition_h');
}

// 2. Subtraction
for (let i = 0; i < 200; i++) {
  // Easy
  const a1 = r(20, 100); const b1 = r(5, a1-1);
  addQ(`${a1} - ${b1} = ؟`, a1-b1, randOffset(a1-b1, [-2, -1, 1, 2, 10, -10]), 0, 'subtraction_e');
  
  // Medium
  const a2 = r(200, 900); const b2 = r(50, a2-1);
  addQ(`${a2} - ${b2} = ؟`, a2-b2, randOffset(a2-b2, [-10, 10, -100, 100, -2, 2]), 1, 'subtraction_m');
  
  // Hard
  const a3 = r(2000, 8000); const b3 = r(500, a3-1);
  addQ(`${a3} - ${b3} = ؟`, a3-b3, randOffset(a3-b3, [-10, 10, -100, 100, 1000]), 2, 'subtraction_h');
}

// 3. Multiplication
for (let i = 0; i < 200; i++) {
  // Easy
  const a1 = r(2, 12); const b1 = r(2, 12);
  addQ(`${a1} × ${b1} = ؟`, a1*b1, randOffset(a1*b1, [-a1, a1, -b1, b1, 1, -1]), 0, 'multiplication_e');
  
  // Medium
  const a2 = r(11, 40); const b2 = r(3, 15);
  addQ(`${a2} × ${b2} = ؟`, a2*b2, randOffset(a2*b2, [-a2, a2, -10, 10]), 1, 'multiplication_m');
  
  // Hard
  const a3 = r(20, 99); const b3 = r(15, 50);
  addQ(`${a3} × ${b3} = ؟`, a3*b3, randOffset(a3*b3, [-a3, a3, 100, -100]), 2, 'multiplication_h');
}

// 4. Division
for (let i = 0; i < 200; i++) {
  // Easy
  const b1 = r(2, 10); const res1 = r(2, 12); const a1 = b1 * res1;
  addQ(`${a1} ÷ ${b1} = ؟`, res1, randOffset(res1, [-1, 1, 2, -2, -3, 3]), 0, 'division_e');
  
  // Medium
  const b2 = r(5, 20); const res2 = r(10, 50); const a2 = b2 * res2;
  addQ(`${a2} ÷ ${b2} = ؟`, res2, randOffset(res2, [-1, 1, 2, -2, 10, -10]), 1, 'division_m');
  
  // Hard
  const b3 = r(12, 50); const res3 = r(20, 100); const a3 = b3 * res3;
  addQ(`${a3} ÷ ${b3} = ؟`, res3, randOffset(res3, [-1, 1, 2, -2, 10, -10]), 2, 'division_h');
}

// 5. Percentages
for (let i = 0; i < 80; i++) {
  // Easy
  const p1 = [10, 20, 25, 50, 75][r(0,4)]; const val1 = r(1, 20) * 10;
  const res1 = (p1 / 100) * val1;
  addQ(`${p1}% من ${val1} يساوي؟`, res1, randOffset(res1, [-1, 1, 10, -10, 5, -5]), 0, 'percentage_e');
  
  // Medium
  const p2 = r(2, 19) * 5; const val2 = r(10, 100) * 10;
  const res2 = (p2 / 100) * val2;
  addQ(`${p2}% من ${val2} يساوي؟`, res2, randOffset(res2, [-10, 10, -res2/10, res2/10]), 1, 'percentage_m');
  
  // Hard
  const p3 = r(5, 95); const val3 = r(10, 50) * 20; 
  const res3 = (p3 / 100) * val3;
  if (Number.isInteger(res3)) {
      addQ(`${p3}% من ${val3} يساوي؟`, res3, randOffset(res3, [-1, 1, 10, -10]), 2, 'percentage_h');
  }
}

// 6. Simple Equations
for (let i = 0; i < 150; i++) {
  // Easy
  const x1 = r(2, 20); const n1 = r(1, 20); const res1 = x1 + n1;
  addQ(`إذا كان x + ${n1} = ${res1} فما قيمة x ؟`, x1, randOffset(x1, [-1, 1, -2, 2]), 0, 'equation_e');
  
  // Medium
  const x2 = r(3, 15); const mul2 = r(2, 8); const res2 = x2 * mul2;
  addQ(`إذا كان ${mul2}x = ${res2} فما قيمة x ؟`, x2, randOffset(x2, [-1, 1, -2, 2]), 1, 'equation_m');
  
  // Hard
  const x3 = r(2, 15); const a3 = r(2, 6); const b3 = r(2, 15); const res3 = (a3 * x3) + b3;
  addQ(`ما قيمة x في المعادلة: ${a3}x + ${b3} = ${res3} ؟`, x3, randOffset(x3, [-1, 1, -2, 2]), 2, 'equation_h');
}

// 7. Order of Operations
for (let i = 0; i < 150; i++) {
  // Easy: a + b * c
  const a1 = r(2, 10); const b1 = r(2, 6); const c1 = r(2, 10);
  const correct1 = a1 + (b1 * c1);
  const wrong1 = (a1 + b1) * c1; // Common mistake
  addQ(`${a1} + ${b1} × ${c1} = ؟`, correct1, [wrong1, correct1+1, correct1-1], 1, 'order_m');
  
  // Hard: (a + b) * c - d
  const a2 = r(2, 8); const b2 = r(2, 8); const c2 = r(2, 5); const d2 = r(1, 10);
  const correct2 = ((a2 + b2) * c2) - d2;
  const wrong2 = a2 + (b2 * c2) - d2;
  addQ(`(${a2} + ${b2}) × ${c2} - ${d2} = ؟`, correct2, [wrong2, correct2+2, correct2-2], 2, 'order_h');
}

// 8. Geometry (Area/Perimeter)
for(let i=0; i<80; i++) {
    // Square Area
    const a1 = r(3, 20);
    addQ(`ما مساحة مربع طول ضلعه ${a1} ؟`, a1*a1, [a1*4, a1*a1+1, a1*a1-1], 0, 'geometry_e');
    
    // Rectangle Area
    const w = r(3, 15); const h = r(4, 20);
    if (w !== h) {
        addQ(`مستطيل طوله ${h} وعرضه ${w}، ما مساحته؟`, w*h, [w*h+w, w*h-w, 2*(w+h)], 1, 'geometry_m');
        // Perimeter
        addQ(`مستطيل طوله ${h} وعرضه ${w}، ما محيطه؟`, 2*(w+h), [w*h, 2*(w+h)+2, 2*(w+h)-2], 1, 'geometry_m');
    }
}

// 9. Number Sequences
for(let i=0; i<150; i++) {
    // Easy (+n)
    if (i < 80) {
        const start = r(2, 10); const step = r(2, 5);
        addQ(`ما العدد التالي: ${start} - ${start+step} - ${start+step*2} - ${start+step*3} - ؟`, start+step*4, randOffset(start+step*4, [-1, 1, -step, step]), 0, 'sequence_e');
    }
    
    // Medium (*n)
    const st2 = r(2, 5); const ml2 = r(2, 3);
    addQ(`ما العدد التالي: ${st2} - ${st2*ml2} - ${st2*ml2*ml2} - ؟`, st2*ml2*ml2*ml2, randOffset(st2*ml2*ml2*ml2, [-1, 1, 2, -2]), 1, 'sequence_m');
    
    // Hard (*n + m)
    const st3 = r(2, 4); const mul3 = r(2, 3); const add3 = r(1, 3);
    const v1 = st3; const v2 = v1*mul3+add3; const v3 = v2*mul3+add3; const v4 = v3*mul3+add3;
    addQ(`ما العدد التالي: ${v1} - ${v2} - ${v3} - ؟`, v4, randOffset(v4, [-1, 1, 2, -2]), 2, 'sequence_h');
}

// 10. Word Problems
const items = ['دجاجة', 'تفاحة', 'سيارة', 'كتاب', 'قلم'];
for(let i=0; i<40; i++) {
    const it = items[r(0, items.length-1)];
    const price = r(5, 50);
    const count = r(3, 12);
    addQ(`إذا كان سعر الـ ${it} الواحدة ${price} ريال، فكم سعر ${count}؟`, price*count, randOffset(price*count, [-10, 10, -price, price]), 0, 'word_e');
    // Harder word
    const startMani = r(50, 200); const spend = price * r(2, 4);
    if (startMani > spend) {
        addQ(`مع أحمد ${startMani} ريال، واشترى قلماً بـ ${spend} ريال. كم تبقى معه؟`, startMani-spend, randOffset(startMani-spend, [-1, 1, 10, -10]), 1, 'word_m');
    }
}

// 11. Roots & Exponents
for(let i=1; i<=25; i++) {
    addQ(`ما هو الجذر التربيعي للعدد ${i*i} ؟`, i, randOffset(i, [-1, 1, -2, 2]), 1, 'roots_m');
    if (i <= 15) {
        addQ(`ما هي قيمة ${i}² ؟`, i*i, randOffset(i*i, [-1, 1, -i, i]), 0, 'exponents_e');
        if (i <= 6) addQ(`ما هي قيمة ${i}³ ؟`, i*i*i, randOffset(i*i*i, [-1, 1, -i, i]), 2, 'exponents_h');
    }
}

// 12. Arithmetic Mean
for(let i=0; i<100; i++) {
    const v1 = r(5, 20); const v2 = r(5, 20); const v3 = r(5, 20);
    const total = v1 + v2 + v3;
    if (total % 3 === 0) {
        addQ(`ما المتوسط الحسابي للأعداد: ${v1} ، ${v2} ، ${v3} ؟`, total/3, randOffset(total/3, [-1, 1, -2, 2]), 1, 'mean_m');
    }
}

// Balance Difficulties to roughly 40/40/20
const easyAll = questions.filter(q => q.difficultyRank === 0).sort(()=>0.5-Math.random());
const mediumAll = questions.filter(q => q.difficultyRank === 1).sort(()=>0.5-Math.random());
const hardAll = questions.filter(q => q.difficultyRank === 2).sort(()=>0.5-Math.random());

const easy = easyAll.slice(0, 600);
const medium = mediumAll.slice(0, 600);
const hard = hardAll.slice(0, 300);

const finalQuestions = [...easy, ...medium, ...hard].sort(()=>0.5-Math.random());

console.log(`Final generated: Easy: ${easy.length}, Medium: ${medium.length}, Hard: ${hard.length}, Total: ${finalQuestions.length}`);

let out = "export const MATH_GENERATED = [\n";
finalQuestions.forEach((q) => {
    out += `  { text: ${JSON.stringify(q.text)}, correctAnswer: ${JSON.stringify(q.correctAnswer)}, wrongOptions: ${JSON.stringify(q.wrongOptions)}, difficultyRank: ${q.difficultyRank}, type: "${q.type.split('_')[0]}" },\n`;
});
out += "];\n";

fs.writeFileSync('src/lib/questions/math_generated.ts', out);
console.log('Wrote to math_generated.ts.');
