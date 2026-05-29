// Simple math generator
export function generateMathQuestions(count: number) {
  const result = [];
  for (let i = 0; i < count; i++) {
    const a = Math.floor(Math.random() * 50) + 1;
    const b = Math.floor(Math.random() * 50) + 1;
    const ans = a + b;
    result.push({
      text: `ما هو ناتج جمع ${a} + ${b}؟`,
      correctAnswer: ans.toString(),
      wrongOptions: [(ans + 1).toString(), (ans - 1).toString(), (ans + 10).toString()]
    });
  }
  return result;
}
