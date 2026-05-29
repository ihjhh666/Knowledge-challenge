export const formatQ = (arr: any[][]) => arr.map(q => ({
  text: q[0],
  correctAnswer: q[1],
  wrongOptions: [q[2], q[3], q[4]]
}));
