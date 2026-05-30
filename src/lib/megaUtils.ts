export type RawQuestion = { text: string; correctAnswer: string; wrongOptions: string[] };

export function parseQ(raw: string): RawQuestion[] {
  return raw.trim().split('\n')
    .map(l => l.trim())
    .filter(l => l && l.includes('|'))
    .map(line => {
      const parts = line.split('|');
      if (parts.length < 3) return null;
      const [text, correct, wrongs] = parts;
      return {
        text: text.trim(),
        correctAnswer: correct.trim(),
        wrongOptions: wrongs.split(',').map(s => s.trim())
      };
    }).filter(q => q !== null) as RawQuestion[];
}

function shuffle<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

export function generateMappingQs(dataStr: string, qFormat: string | null, reverseQFormat: string | null = null, extraWrongs: string[] = []): RawQuestion[] {
  const qs: RawQuestion[] = [];
  const entries = dataStr.trim().split(',').filter(x=>x).map(i => i.split(':'));
  const vals1 = entries.map(e => e[0].trim());
  const vals2 = entries.map(e => e[1].trim()); 
  
  const uniqueVals1 = Array.from(new Set(vals1));
  const uniqueVals2 = Array.from(new Set(vals2));
  
  entries.forEach(([v1, v2]) => {
     // helper to parse any format dynamically based on what it asks for
     const processFormat = (fmt: string) => {
       const hasV1 = fmt.includes('{1}');
       const hasV2 = fmt.includes('{2}');
       
       let correct: string;
       let pool: string[];
       
       // If format gives {1} (e.g. "Capitol of {1}?"), it asks for {2}.
       if (hasV1 && !hasV2) { 
         correct = v2;
         pool = uniqueVals2;
       } 
       // If format gives {2} (e.g. "Who is called {2}?"), it asks for {1}.
       else if (hasV2 && !hasV1) {
         correct = v1;
         pool = uniqueVals1;
       } 
       // If it gives both or neither, just guess based on convention:
       else {
         // Default to asking for v2
         correct = v2;
         pool = uniqueVals2;
       }
       
       const text = fmt.replace('{1}', v1).replace('{2}', v2);
       
       let wrongs = pool.filter(v => v !== correct);
       wrongs = shuffle([...wrongs, ...extraWrongs]).slice(0, 3);
       while (wrongs.length < 3) wrongs.push('خيار بديل ' + wrongs.length);
       
       qs.push({
         text,
         correctAnswer: correct,
         wrongOptions: wrongs
       });
     };

     if (qFormat && typeof qFormat === 'string') {
       processFormat(qFormat);
     }
     if (reverseQFormat && typeof reverseQFormat === 'string') {
       processFormat(reverseQFormat);
     }
  });
  return qs;
}
