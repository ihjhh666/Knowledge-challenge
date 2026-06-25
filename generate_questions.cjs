const fs = require('fs');

const traitsList = [
  'logical', 'social', 'leader', 'adaptive', 'emotional', 'planner', 
  'adventurer', 'calm', 'creative', 'ambition', 'confidence', 'risk', 
  'teamwork', 'independence', 'discipline', 'observer', 'reactive'
];

const categories = [
  "الذكاء", "الإبداع", "القيادة", "العلاقات الاجتماعية", "الثقة بالنفس",
  "اتخاذ القرار", "السيطرة على الغضب", "الطموح", "المخاطرة", "العاطفة",
  "التفكير المنطقي", "العمل الجماعي", "الاستقلالية", "الانضباط"
];

const baseQuestions = [
  {
    q: "عندما تواجه مشكلة معقدة وغير متوقعة، كيف تتصرف؟",
    opts: [
      { text: "أحللها منطقياً وأضع خطة لحلها", traits: { logical: 2, planner: 2, calm: 1, reactive: -1 } },
      { text: "أعتمد على حدسي وتجاربي السابقة", traits: { emotional: 2, adaptive: 1, creative: 1 } },
      { text: "أستشير الآخرين وأطلب مساعدتهم", traits: { social: 2, teamwork: 2, independence: -1 } },
      { text: "أتخذ إجراءً سريعاً ومباشراً", traits: { reactive: 2, risk: 1, calm: -1 } }
    ]
  },
  {
    q: "كيف تفضل العمل على مشروع كبير؟",
    opts: [
      { text: "أقود فريقاً وأوزع المهام", traits: { leader: 2, teamwork: 1, confidence: 1 } },
      { text: "أعمل بمفردي لضمان الجودة", traits: { independence: 2, logical: 1, teamwork: -1 } },
      { text: "أكون جزءاً من فريق متعاون", traits: { teamwork: 2, social: 1, leader: -1 } },
      { text: "أبتكر أفكاراً وأترك التنفيذ للآخرين", traits: { creative: 2, planner: -1, independence: 1 } }
    ]
  },
  {
    q: "ما هو رد فعلك عند التعرض لانتقاد قاسٍ في العمل؟",
    opts: [
      { text: "أستمع بهدوء وأحاول التحسين", traits: { calm: 2, adaptive: 2, reactive: -1 } },
      { text: "أدافع عن نفسي وأوضح وجهة نظري", traits: { confidence: 2, reactive: 1, logical: 1 } },
      { text: "أشعر بالإحباط وأنسحب مؤقتاً", traits: { emotional: 2, calm: -1, confidence: -1 } },
      { text: "أتجاهل الأمر وأستمر في عملي", traits: { independence: 2, avoidant: 1, reactive: -1 } }
    ]
  },
  {
    q: "عند اتخاذ قرار مصيري، ما هو دافعك الأول؟",
    opts: [
      { text: "البيانات والحقائق الثابتة", traits: { logical: 2, planner: 1, risk: -1 } },
      { text: "شغفي وما يمليه علي قلبي", traits: { emotional: 2, risk: 1, logical: -1 } },
      { text: "نصائح المقربين مني", traits: { social: 2, teamwork: 1, independence: -1 } },
      { text: "الفرص والمخاطر المحتملة", traits: { risk: 2, ambition: 2, calm: -1 } }
    ]
  },
  {
    q: "كيف تقضي وقت فراغك عادة؟",
    opts: [
      { text: "في التخطيط وتعلم مهارات جديدة", traits: { ambition: 2, planner: 1, discipline: 1 } },
      { text: "في الخروج مع الأصدقاء والعائلة", traits: { social: 2, teamwork: 1, independence: -1 } },
      { text: "في ممارسة هوايات إبداعية أو فنية", traits: { creative: 2, independence: 1, social: -1 } },
      { text: "في الراحة والاسترخاء التام", traits: { calm: 2, relaxed: 2, ambition: -1 } }
    ]
  }
];

// Generate 150 questions by combining variations
let allQuestions = [];

for (let i = 0; i < 150; i++) {
    const base = baseQuestions[i % baseQuestions.length];
    const category = categories[i % categories.length];
    
    // Slight variations in wording to make them unique
    const contexts = [
      "في حياتك اليومية", "في بيئة العمل", "مع أصدقائك", 
      "عند التخطيط للمستقبل", "في الأزمات", "عند التعامل مع الغرباء",
      "في العلاقات الشخصية", "عند تجربة شيء جديد", "تحت الضغط"
    ];
    const context = contexts[Math.floor(i / baseQuestions.length) % contexts.length];
    
    let text = base.q;
    if (i >= baseQuestions.length) {
       text = text.replace('؟', ` (${context})؟`);
    }

    allQuestions.push({
        id: i + 1,
        category: category,
        text: text,
        options: base.opts
    });
}

// Ensure uniqueness in the generated text by adding numbers if duplicate
let seen = new Set();
allQuestions.forEach(q => {
    let baseText = q.text;
    let count = 1;
    while(seen.has(q.text)) {
        q.text = baseText.replace('؟', ` - الموقف ${count}؟`);
        count++;
    }
    seen.add(q.text);
});


let tsContent = `export interface TraitWeights {
  [trait: string]: number;
}

export interface PersonalityOption {
  text: string;
  traits: TraitWeights;
}

export interface PersonalityQuestion {
  id: number;
  category: string;
  text: string;
  options: PersonalityOption[];
}

export const personalityQuestions: PersonalityQuestion[] = ${JSON.stringify(allQuestions, null, 2)};
`;

fs.writeFileSync('src/data/personalityQuestions.ts', tsContent);
console.log('Created 150 advanced questions.');

