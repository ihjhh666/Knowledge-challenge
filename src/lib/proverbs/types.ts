export interface ProverbData {
  text: string;
  completions: { correct: string; wrong: string[] };
  situation?: { text: string; wrongProverbs: string[] };
  type: 'proverb' | 'wisdom' | 'saying';
  difficulty: 0 | 1 | 2; // 0=easy, 1=medium, 2=hard
}
