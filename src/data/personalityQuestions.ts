export interface TraitWeights {
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

export const personalityQuestions: PersonalityQuestion[] = [
  {
    "id": 1,
    "category": "الذكاء",
    "text": "عندما تواجه مشكلة معقدة وغير متوقعة، كيف تتصرف؟",
    "options": [
      {
        "text": "أحللها منطقياً وأضع خطة لحلها",
        "traits": {
          "logical": 2,
          "planner": 2,
          "calm": 1,
          "reactive": -1
        }
      },
      {
        "text": "أعتمد على حدسي وتجاربي السابقة",
        "traits": {
          "emotional": 2,
          "adaptive": 1,
          "creative": 1
        }
      },
      {
        "text": "أستشير الآخرين وأطلب مساعدتهم",
        "traits": {
          "social": 2,
          "teamwork": 2,
          "independence": -1
        }
      },
      {
        "text": "أتخذ إجراءً سريعاً ومباشراً",
        "traits": {
          "reactive": 2,
          "risk": 1,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 2,
    "category": "الإبداع",
    "text": "كيف تفضل العمل على مشروع كبير؟",
    "options": [
      {
        "text": "أقود فريقاً وأوزع المهام",
        "traits": {
          "leader": 2,
          "teamwork": 1,
          "confidence": 1
        }
      },
      {
        "text": "أعمل بمفردي لضمان الجودة",
        "traits": {
          "independence": 2,
          "logical": 1,
          "teamwork": -1
        }
      },
      {
        "text": "أكون جزءاً من فريق متعاون",
        "traits": {
          "teamwork": 2,
          "social": 1,
          "leader": -1
        }
      },
      {
        "text": "أبتكر أفكاراً وأترك التنفيذ للآخرين",
        "traits": {
          "creative": 2,
          "planner": -1,
          "independence": 1
        }
      }
    ]
  },
  {
    "id": 3,
    "category": "القيادة",
    "text": "ما هو رد فعلك عند التعرض لانتقاد قاسٍ في العمل؟",
    "options": [
      {
        "text": "أستمع بهدوء وأحاول التحسين",
        "traits": {
          "calm": 2,
          "adaptive": 2,
          "reactive": -1
        }
      },
      {
        "text": "أدافع عن نفسي وأوضح وجهة نظري",
        "traits": {
          "confidence": 2,
          "reactive": 1,
          "logical": 1
        }
      },
      {
        "text": "أشعر بالإحباط وأنسحب مؤقتاً",
        "traits": {
          "emotional": 2,
          "calm": -1,
          "confidence": -1
        }
      },
      {
        "text": "أتجاهل الأمر وأستمر في عملي",
        "traits": {
          "independence": 2,
          "avoidant": 1,
          "reactive": -1
        }
      }
    ]
  },
  {
    "id": 4,
    "category": "العلاقات الاجتماعية",
    "text": "عند اتخاذ قرار مصيري، ما هو دافعك الأول؟",
    "options": [
      {
        "text": "البيانات والحقائق الثابتة",
        "traits": {
          "logical": 2,
          "planner": 1,
          "risk": -1
        }
      },
      {
        "text": "شغفي وما يمليه علي قلبي",
        "traits": {
          "emotional": 2,
          "risk": 1,
          "logical": -1
        }
      },
      {
        "text": "نصائح المقربين مني",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "الفرص والمخاطر المحتملة",
        "traits": {
          "risk": 2,
          "ambition": 2,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 5,
    "category": "الثقة بالنفس",
    "text": "كيف تقضي وقت فراغك عادة؟",
    "options": [
      {
        "text": "في التخطيط وتعلم مهارات جديدة",
        "traits": {
          "ambition": 2,
          "planner": 1,
          "discipline": 1
        }
      },
      {
        "text": "في الخروج مع الأصدقاء والعائلة",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "في ممارسة هوايات إبداعية أو فنية",
        "traits": {
          "creative": 2,
          "independence": 1,
          "social": -1
        }
      },
      {
        "text": "في الراحة والاسترخاء التام",
        "traits": {
          "calm": 2,
          "relaxed": 2,
          "ambition": -1
        }
      }
    ]
  },
  {
    "id": 6,
    "category": "اتخاذ القرار",
    "text": "عندما تواجه مشكلة معقدة وغير متوقعة، كيف تتصرف (في بيئة العمل)؟",
    "options": [
      {
        "text": "أحللها منطقياً وأضع خطة لحلها",
        "traits": {
          "logical": 2,
          "planner": 2,
          "calm": 1,
          "reactive": -1
        }
      },
      {
        "text": "أعتمد على حدسي وتجاربي السابقة",
        "traits": {
          "emotional": 2,
          "adaptive": 1,
          "creative": 1
        }
      },
      {
        "text": "أستشير الآخرين وأطلب مساعدتهم",
        "traits": {
          "social": 2,
          "teamwork": 2,
          "independence": -1
        }
      },
      {
        "text": "أتخذ إجراءً سريعاً ومباشراً",
        "traits": {
          "reactive": 2,
          "risk": 1,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 7,
    "category": "السيطرة على الغضب",
    "text": "كيف تفضل العمل على مشروع كبير (في بيئة العمل)؟",
    "options": [
      {
        "text": "أقود فريقاً وأوزع المهام",
        "traits": {
          "leader": 2,
          "teamwork": 1,
          "confidence": 1
        }
      },
      {
        "text": "أعمل بمفردي لضمان الجودة",
        "traits": {
          "independence": 2,
          "logical": 1,
          "teamwork": -1
        }
      },
      {
        "text": "أكون جزءاً من فريق متعاون",
        "traits": {
          "teamwork": 2,
          "social": 1,
          "leader": -1
        }
      },
      {
        "text": "أبتكر أفكاراً وأترك التنفيذ للآخرين",
        "traits": {
          "creative": 2,
          "planner": -1,
          "independence": 1
        }
      }
    ]
  },
  {
    "id": 8,
    "category": "الطموح",
    "text": "ما هو رد فعلك عند التعرض لانتقاد قاسٍ في العمل (في بيئة العمل)؟",
    "options": [
      {
        "text": "أستمع بهدوء وأحاول التحسين",
        "traits": {
          "calm": 2,
          "adaptive": 2,
          "reactive": -1
        }
      },
      {
        "text": "أدافع عن نفسي وأوضح وجهة نظري",
        "traits": {
          "confidence": 2,
          "reactive": 1,
          "logical": 1
        }
      },
      {
        "text": "أشعر بالإحباط وأنسحب مؤقتاً",
        "traits": {
          "emotional": 2,
          "calm": -1,
          "confidence": -1
        }
      },
      {
        "text": "أتجاهل الأمر وأستمر في عملي",
        "traits": {
          "independence": 2,
          "avoidant": 1,
          "reactive": -1
        }
      }
    ]
  },
  {
    "id": 9,
    "category": "المخاطرة",
    "text": "عند اتخاذ قرار مصيري، ما هو دافعك الأول (في بيئة العمل)؟",
    "options": [
      {
        "text": "البيانات والحقائق الثابتة",
        "traits": {
          "logical": 2,
          "planner": 1,
          "risk": -1
        }
      },
      {
        "text": "شغفي وما يمليه علي قلبي",
        "traits": {
          "emotional": 2,
          "risk": 1,
          "logical": -1
        }
      },
      {
        "text": "نصائح المقربين مني",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "الفرص والمخاطر المحتملة",
        "traits": {
          "risk": 2,
          "ambition": 2,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 10,
    "category": "العاطفة",
    "text": "كيف تقضي وقت فراغك عادة (في بيئة العمل)؟",
    "options": [
      {
        "text": "في التخطيط وتعلم مهارات جديدة",
        "traits": {
          "ambition": 2,
          "planner": 1,
          "discipline": 1
        }
      },
      {
        "text": "في الخروج مع الأصدقاء والعائلة",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "في ممارسة هوايات إبداعية أو فنية",
        "traits": {
          "creative": 2,
          "independence": 1,
          "social": -1
        }
      },
      {
        "text": "في الراحة والاسترخاء التام",
        "traits": {
          "calm": 2,
          "relaxed": 2,
          "ambition": -1
        }
      }
    ]
  },
  {
    "id": 11,
    "category": "التفكير المنطقي",
    "text": "عندما تواجه مشكلة معقدة وغير متوقعة، كيف تتصرف (مع أصدقائك)؟",
    "options": [
      {
        "text": "أحللها منطقياً وأضع خطة لحلها",
        "traits": {
          "logical": 2,
          "planner": 2,
          "calm": 1,
          "reactive": -1
        }
      },
      {
        "text": "أعتمد على حدسي وتجاربي السابقة",
        "traits": {
          "emotional": 2,
          "adaptive": 1,
          "creative": 1
        }
      },
      {
        "text": "أستشير الآخرين وأطلب مساعدتهم",
        "traits": {
          "social": 2,
          "teamwork": 2,
          "independence": -1
        }
      },
      {
        "text": "أتخذ إجراءً سريعاً ومباشراً",
        "traits": {
          "reactive": 2,
          "risk": 1,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 12,
    "category": "العمل الجماعي",
    "text": "كيف تفضل العمل على مشروع كبير (مع أصدقائك)؟",
    "options": [
      {
        "text": "أقود فريقاً وأوزع المهام",
        "traits": {
          "leader": 2,
          "teamwork": 1,
          "confidence": 1
        }
      },
      {
        "text": "أعمل بمفردي لضمان الجودة",
        "traits": {
          "independence": 2,
          "logical": 1,
          "teamwork": -1
        }
      },
      {
        "text": "أكون جزءاً من فريق متعاون",
        "traits": {
          "teamwork": 2,
          "social": 1,
          "leader": -1
        }
      },
      {
        "text": "أبتكر أفكاراً وأترك التنفيذ للآخرين",
        "traits": {
          "creative": 2,
          "planner": -1,
          "independence": 1
        }
      }
    ]
  },
  {
    "id": 13,
    "category": "الاستقلالية",
    "text": "ما هو رد فعلك عند التعرض لانتقاد قاسٍ في العمل (مع أصدقائك)؟",
    "options": [
      {
        "text": "أستمع بهدوء وأحاول التحسين",
        "traits": {
          "calm": 2,
          "adaptive": 2,
          "reactive": -1
        }
      },
      {
        "text": "أدافع عن نفسي وأوضح وجهة نظري",
        "traits": {
          "confidence": 2,
          "reactive": 1,
          "logical": 1
        }
      },
      {
        "text": "أشعر بالإحباط وأنسحب مؤقتاً",
        "traits": {
          "emotional": 2,
          "calm": -1,
          "confidence": -1
        }
      },
      {
        "text": "أتجاهل الأمر وأستمر في عملي",
        "traits": {
          "independence": 2,
          "avoidant": 1,
          "reactive": -1
        }
      }
    ]
  },
  {
    "id": 14,
    "category": "الانضباط",
    "text": "عند اتخاذ قرار مصيري، ما هو دافعك الأول (مع أصدقائك)؟",
    "options": [
      {
        "text": "البيانات والحقائق الثابتة",
        "traits": {
          "logical": 2,
          "planner": 1,
          "risk": -1
        }
      },
      {
        "text": "شغفي وما يمليه علي قلبي",
        "traits": {
          "emotional": 2,
          "risk": 1,
          "logical": -1
        }
      },
      {
        "text": "نصائح المقربين مني",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "الفرص والمخاطر المحتملة",
        "traits": {
          "risk": 2,
          "ambition": 2,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 15,
    "category": "الذكاء",
    "text": "كيف تقضي وقت فراغك عادة (مع أصدقائك)؟",
    "options": [
      {
        "text": "في التخطيط وتعلم مهارات جديدة",
        "traits": {
          "ambition": 2,
          "planner": 1,
          "discipline": 1
        }
      },
      {
        "text": "في الخروج مع الأصدقاء والعائلة",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "في ممارسة هوايات إبداعية أو فنية",
        "traits": {
          "creative": 2,
          "independence": 1,
          "social": -1
        }
      },
      {
        "text": "في الراحة والاسترخاء التام",
        "traits": {
          "calm": 2,
          "relaxed": 2,
          "ambition": -1
        }
      }
    ]
  },
  {
    "id": 16,
    "category": "الإبداع",
    "text": "عندما تواجه مشكلة معقدة وغير متوقعة، كيف تتصرف (عند التخطيط للمستقبل)؟",
    "options": [
      {
        "text": "أحللها منطقياً وأضع خطة لحلها",
        "traits": {
          "logical": 2,
          "planner": 2,
          "calm": 1,
          "reactive": -1
        }
      },
      {
        "text": "أعتمد على حدسي وتجاربي السابقة",
        "traits": {
          "emotional": 2,
          "adaptive": 1,
          "creative": 1
        }
      },
      {
        "text": "أستشير الآخرين وأطلب مساعدتهم",
        "traits": {
          "social": 2,
          "teamwork": 2,
          "independence": -1
        }
      },
      {
        "text": "أتخذ إجراءً سريعاً ومباشراً",
        "traits": {
          "reactive": 2,
          "risk": 1,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 17,
    "category": "القيادة",
    "text": "كيف تفضل العمل على مشروع كبير (عند التخطيط للمستقبل)؟",
    "options": [
      {
        "text": "أقود فريقاً وأوزع المهام",
        "traits": {
          "leader": 2,
          "teamwork": 1,
          "confidence": 1
        }
      },
      {
        "text": "أعمل بمفردي لضمان الجودة",
        "traits": {
          "independence": 2,
          "logical": 1,
          "teamwork": -1
        }
      },
      {
        "text": "أكون جزءاً من فريق متعاون",
        "traits": {
          "teamwork": 2,
          "social": 1,
          "leader": -1
        }
      },
      {
        "text": "أبتكر أفكاراً وأترك التنفيذ للآخرين",
        "traits": {
          "creative": 2,
          "planner": -1,
          "independence": 1
        }
      }
    ]
  },
  {
    "id": 18,
    "category": "العلاقات الاجتماعية",
    "text": "ما هو رد فعلك عند التعرض لانتقاد قاسٍ في العمل (عند التخطيط للمستقبل)؟",
    "options": [
      {
        "text": "أستمع بهدوء وأحاول التحسين",
        "traits": {
          "calm": 2,
          "adaptive": 2,
          "reactive": -1
        }
      },
      {
        "text": "أدافع عن نفسي وأوضح وجهة نظري",
        "traits": {
          "confidence": 2,
          "reactive": 1,
          "logical": 1
        }
      },
      {
        "text": "أشعر بالإحباط وأنسحب مؤقتاً",
        "traits": {
          "emotional": 2,
          "calm": -1,
          "confidence": -1
        }
      },
      {
        "text": "أتجاهل الأمر وأستمر في عملي",
        "traits": {
          "independence": 2,
          "avoidant": 1,
          "reactive": -1
        }
      }
    ]
  },
  {
    "id": 19,
    "category": "الثقة بالنفس",
    "text": "عند اتخاذ قرار مصيري، ما هو دافعك الأول (عند التخطيط للمستقبل)؟",
    "options": [
      {
        "text": "البيانات والحقائق الثابتة",
        "traits": {
          "logical": 2,
          "planner": 1,
          "risk": -1
        }
      },
      {
        "text": "شغفي وما يمليه علي قلبي",
        "traits": {
          "emotional": 2,
          "risk": 1,
          "logical": -1
        }
      },
      {
        "text": "نصائح المقربين مني",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "الفرص والمخاطر المحتملة",
        "traits": {
          "risk": 2,
          "ambition": 2,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 20,
    "category": "اتخاذ القرار",
    "text": "كيف تقضي وقت فراغك عادة (عند التخطيط للمستقبل)؟",
    "options": [
      {
        "text": "في التخطيط وتعلم مهارات جديدة",
        "traits": {
          "ambition": 2,
          "planner": 1,
          "discipline": 1
        }
      },
      {
        "text": "في الخروج مع الأصدقاء والعائلة",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "في ممارسة هوايات إبداعية أو فنية",
        "traits": {
          "creative": 2,
          "independence": 1,
          "social": -1
        }
      },
      {
        "text": "في الراحة والاسترخاء التام",
        "traits": {
          "calm": 2,
          "relaxed": 2,
          "ambition": -1
        }
      }
    ]
  },
  {
    "id": 21,
    "category": "السيطرة على الغضب",
    "text": "عندما تواجه مشكلة معقدة وغير متوقعة، كيف تتصرف (في الأزمات)؟",
    "options": [
      {
        "text": "أحللها منطقياً وأضع خطة لحلها",
        "traits": {
          "logical": 2,
          "planner": 2,
          "calm": 1,
          "reactive": -1
        }
      },
      {
        "text": "أعتمد على حدسي وتجاربي السابقة",
        "traits": {
          "emotional": 2,
          "adaptive": 1,
          "creative": 1
        }
      },
      {
        "text": "أستشير الآخرين وأطلب مساعدتهم",
        "traits": {
          "social": 2,
          "teamwork": 2,
          "independence": -1
        }
      },
      {
        "text": "أتخذ إجراءً سريعاً ومباشراً",
        "traits": {
          "reactive": 2,
          "risk": 1,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 22,
    "category": "الطموح",
    "text": "كيف تفضل العمل على مشروع كبير (في الأزمات)؟",
    "options": [
      {
        "text": "أقود فريقاً وأوزع المهام",
        "traits": {
          "leader": 2,
          "teamwork": 1,
          "confidence": 1
        }
      },
      {
        "text": "أعمل بمفردي لضمان الجودة",
        "traits": {
          "independence": 2,
          "logical": 1,
          "teamwork": -1
        }
      },
      {
        "text": "أكون جزءاً من فريق متعاون",
        "traits": {
          "teamwork": 2,
          "social": 1,
          "leader": -1
        }
      },
      {
        "text": "أبتكر أفكاراً وأترك التنفيذ للآخرين",
        "traits": {
          "creative": 2,
          "planner": -1,
          "independence": 1
        }
      }
    ]
  },
  {
    "id": 23,
    "category": "المخاطرة",
    "text": "ما هو رد فعلك عند التعرض لانتقاد قاسٍ في العمل (في الأزمات)؟",
    "options": [
      {
        "text": "أستمع بهدوء وأحاول التحسين",
        "traits": {
          "calm": 2,
          "adaptive": 2,
          "reactive": -1
        }
      },
      {
        "text": "أدافع عن نفسي وأوضح وجهة نظري",
        "traits": {
          "confidence": 2,
          "reactive": 1,
          "logical": 1
        }
      },
      {
        "text": "أشعر بالإحباط وأنسحب مؤقتاً",
        "traits": {
          "emotional": 2,
          "calm": -1,
          "confidence": -1
        }
      },
      {
        "text": "أتجاهل الأمر وأستمر في عملي",
        "traits": {
          "independence": 2,
          "avoidant": 1,
          "reactive": -1
        }
      }
    ]
  },
  {
    "id": 24,
    "category": "العاطفة",
    "text": "عند اتخاذ قرار مصيري، ما هو دافعك الأول (في الأزمات)؟",
    "options": [
      {
        "text": "البيانات والحقائق الثابتة",
        "traits": {
          "logical": 2,
          "planner": 1,
          "risk": -1
        }
      },
      {
        "text": "شغفي وما يمليه علي قلبي",
        "traits": {
          "emotional": 2,
          "risk": 1,
          "logical": -1
        }
      },
      {
        "text": "نصائح المقربين مني",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "الفرص والمخاطر المحتملة",
        "traits": {
          "risk": 2,
          "ambition": 2,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 25,
    "category": "التفكير المنطقي",
    "text": "كيف تقضي وقت فراغك عادة (في الأزمات)؟",
    "options": [
      {
        "text": "في التخطيط وتعلم مهارات جديدة",
        "traits": {
          "ambition": 2,
          "planner": 1,
          "discipline": 1
        }
      },
      {
        "text": "في الخروج مع الأصدقاء والعائلة",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "في ممارسة هوايات إبداعية أو فنية",
        "traits": {
          "creative": 2,
          "independence": 1,
          "social": -1
        }
      },
      {
        "text": "في الراحة والاسترخاء التام",
        "traits": {
          "calm": 2,
          "relaxed": 2,
          "ambition": -1
        }
      }
    ]
  },
  {
    "id": 26,
    "category": "العمل الجماعي",
    "text": "عندما تواجه مشكلة معقدة وغير متوقعة، كيف تتصرف (عند التعامل مع الغرباء)؟",
    "options": [
      {
        "text": "أحللها منطقياً وأضع خطة لحلها",
        "traits": {
          "logical": 2,
          "planner": 2,
          "calm": 1,
          "reactive": -1
        }
      },
      {
        "text": "أعتمد على حدسي وتجاربي السابقة",
        "traits": {
          "emotional": 2,
          "adaptive": 1,
          "creative": 1
        }
      },
      {
        "text": "أستشير الآخرين وأطلب مساعدتهم",
        "traits": {
          "social": 2,
          "teamwork": 2,
          "independence": -1
        }
      },
      {
        "text": "أتخذ إجراءً سريعاً ومباشراً",
        "traits": {
          "reactive": 2,
          "risk": 1,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 27,
    "category": "الاستقلالية",
    "text": "كيف تفضل العمل على مشروع كبير (عند التعامل مع الغرباء)؟",
    "options": [
      {
        "text": "أقود فريقاً وأوزع المهام",
        "traits": {
          "leader": 2,
          "teamwork": 1,
          "confidence": 1
        }
      },
      {
        "text": "أعمل بمفردي لضمان الجودة",
        "traits": {
          "independence": 2,
          "logical": 1,
          "teamwork": -1
        }
      },
      {
        "text": "أكون جزءاً من فريق متعاون",
        "traits": {
          "teamwork": 2,
          "social": 1,
          "leader": -1
        }
      },
      {
        "text": "أبتكر أفكاراً وأترك التنفيذ للآخرين",
        "traits": {
          "creative": 2,
          "planner": -1,
          "independence": 1
        }
      }
    ]
  },
  {
    "id": 28,
    "category": "الانضباط",
    "text": "ما هو رد فعلك عند التعرض لانتقاد قاسٍ في العمل (عند التعامل مع الغرباء)؟",
    "options": [
      {
        "text": "أستمع بهدوء وأحاول التحسين",
        "traits": {
          "calm": 2,
          "adaptive": 2,
          "reactive": -1
        }
      },
      {
        "text": "أدافع عن نفسي وأوضح وجهة نظري",
        "traits": {
          "confidence": 2,
          "reactive": 1,
          "logical": 1
        }
      },
      {
        "text": "أشعر بالإحباط وأنسحب مؤقتاً",
        "traits": {
          "emotional": 2,
          "calm": -1,
          "confidence": -1
        }
      },
      {
        "text": "أتجاهل الأمر وأستمر في عملي",
        "traits": {
          "independence": 2,
          "avoidant": 1,
          "reactive": -1
        }
      }
    ]
  },
  {
    "id": 29,
    "category": "الذكاء",
    "text": "عند اتخاذ قرار مصيري، ما هو دافعك الأول (عند التعامل مع الغرباء)؟",
    "options": [
      {
        "text": "البيانات والحقائق الثابتة",
        "traits": {
          "logical": 2,
          "planner": 1,
          "risk": -1
        }
      },
      {
        "text": "شغفي وما يمليه علي قلبي",
        "traits": {
          "emotional": 2,
          "risk": 1,
          "logical": -1
        }
      },
      {
        "text": "نصائح المقربين مني",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "الفرص والمخاطر المحتملة",
        "traits": {
          "risk": 2,
          "ambition": 2,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 30,
    "category": "الإبداع",
    "text": "كيف تقضي وقت فراغك عادة (عند التعامل مع الغرباء)؟",
    "options": [
      {
        "text": "في التخطيط وتعلم مهارات جديدة",
        "traits": {
          "ambition": 2,
          "planner": 1,
          "discipline": 1
        }
      },
      {
        "text": "في الخروج مع الأصدقاء والعائلة",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "في ممارسة هوايات إبداعية أو فنية",
        "traits": {
          "creative": 2,
          "independence": 1,
          "social": -1
        }
      },
      {
        "text": "في الراحة والاسترخاء التام",
        "traits": {
          "calm": 2,
          "relaxed": 2,
          "ambition": -1
        }
      }
    ]
  },
  {
    "id": 31,
    "category": "القيادة",
    "text": "عندما تواجه مشكلة معقدة وغير متوقعة، كيف تتصرف (في العلاقات الشخصية)؟",
    "options": [
      {
        "text": "أحللها منطقياً وأضع خطة لحلها",
        "traits": {
          "logical": 2,
          "planner": 2,
          "calm": 1,
          "reactive": -1
        }
      },
      {
        "text": "أعتمد على حدسي وتجاربي السابقة",
        "traits": {
          "emotional": 2,
          "adaptive": 1,
          "creative": 1
        }
      },
      {
        "text": "أستشير الآخرين وأطلب مساعدتهم",
        "traits": {
          "social": 2,
          "teamwork": 2,
          "independence": -1
        }
      },
      {
        "text": "أتخذ إجراءً سريعاً ومباشراً",
        "traits": {
          "reactive": 2,
          "risk": 1,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 32,
    "category": "العلاقات الاجتماعية",
    "text": "كيف تفضل العمل على مشروع كبير (في العلاقات الشخصية)؟",
    "options": [
      {
        "text": "أقود فريقاً وأوزع المهام",
        "traits": {
          "leader": 2,
          "teamwork": 1,
          "confidence": 1
        }
      },
      {
        "text": "أعمل بمفردي لضمان الجودة",
        "traits": {
          "independence": 2,
          "logical": 1,
          "teamwork": -1
        }
      },
      {
        "text": "أكون جزءاً من فريق متعاون",
        "traits": {
          "teamwork": 2,
          "social": 1,
          "leader": -1
        }
      },
      {
        "text": "أبتكر أفكاراً وأترك التنفيذ للآخرين",
        "traits": {
          "creative": 2,
          "planner": -1,
          "independence": 1
        }
      }
    ]
  },
  {
    "id": 33,
    "category": "الثقة بالنفس",
    "text": "ما هو رد فعلك عند التعرض لانتقاد قاسٍ في العمل (في العلاقات الشخصية)؟",
    "options": [
      {
        "text": "أستمع بهدوء وأحاول التحسين",
        "traits": {
          "calm": 2,
          "adaptive": 2,
          "reactive": -1
        }
      },
      {
        "text": "أدافع عن نفسي وأوضح وجهة نظري",
        "traits": {
          "confidence": 2,
          "reactive": 1,
          "logical": 1
        }
      },
      {
        "text": "أشعر بالإحباط وأنسحب مؤقتاً",
        "traits": {
          "emotional": 2,
          "calm": -1,
          "confidence": -1
        }
      },
      {
        "text": "أتجاهل الأمر وأستمر في عملي",
        "traits": {
          "independence": 2,
          "avoidant": 1,
          "reactive": -1
        }
      }
    ]
  },
  {
    "id": 34,
    "category": "اتخاذ القرار",
    "text": "عند اتخاذ قرار مصيري، ما هو دافعك الأول (في العلاقات الشخصية)؟",
    "options": [
      {
        "text": "البيانات والحقائق الثابتة",
        "traits": {
          "logical": 2,
          "planner": 1,
          "risk": -1
        }
      },
      {
        "text": "شغفي وما يمليه علي قلبي",
        "traits": {
          "emotional": 2,
          "risk": 1,
          "logical": -1
        }
      },
      {
        "text": "نصائح المقربين مني",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "الفرص والمخاطر المحتملة",
        "traits": {
          "risk": 2,
          "ambition": 2,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 35,
    "category": "السيطرة على الغضب",
    "text": "كيف تقضي وقت فراغك عادة (في العلاقات الشخصية)؟",
    "options": [
      {
        "text": "في التخطيط وتعلم مهارات جديدة",
        "traits": {
          "ambition": 2,
          "planner": 1,
          "discipline": 1
        }
      },
      {
        "text": "في الخروج مع الأصدقاء والعائلة",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "في ممارسة هوايات إبداعية أو فنية",
        "traits": {
          "creative": 2,
          "independence": 1,
          "social": -1
        }
      },
      {
        "text": "في الراحة والاسترخاء التام",
        "traits": {
          "calm": 2,
          "relaxed": 2,
          "ambition": -1
        }
      }
    ]
  },
  {
    "id": 36,
    "category": "الطموح",
    "text": "عندما تواجه مشكلة معقدة وغير متوقعة، كيف تتصرف (عند تجربة شيء جديد)؟",
    "options": [
      {
        "text": "أحللها منطقياً وأضع خطة لحلها",
        "traits": {
          "logical": 2,
          "planner": 2,
          "calm": 1,
          "reactive": -1
        }
      },
      {
        "text": "أعتمد على حدسي وتجاربي السابقة",
        "traits": {
          "emotional": 2,
          "adaptive": 1,
          "creative": 1
        }
      },
      {
        "text": "أستشير الآخرين وأطلب مساعدتهم",
        "traits": {
          "social": 2,
          "teamwork": 2,
          "independence": -1
        }
      },
      {
        "text": "أتخذ إجراءً سريعاً ومباشراً",
        "traits": {
          "reactive": 2,
          "risk": 1,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 37,
    "category": "المخاطرة",
    "text": "كيف تفضل العمل على مشروع كبير (عند تجربة شيء جديد)؟",
    "options": [
      {
        "text": "أقود فريقاً وأوزع المهام",
        "traits": {
          "leader": 2,
          "teamwork": 1,
          "confidence": 1
        }
      },
      {
        "text": "أعمل بمفردي لضمان الجودة",
        "traits": {
          "independence": 2,
          "logical": 1,
          "teamwork": -1
        }
      },
      {
        "text": "أكون جزءاً من فريق متعاون",
        "traits": {
          "teamwork": 2,
          "social": 1,
          "leader": -1
        }
      },
      {
        "text": "أبتكر أفكاراً وأترك التنفيذ للآخرين",
        "traits": {
          "creative": 2,
          "planner": -1,
          "independence": 1
        }
      }
    ]
  },
  {
    "id": 38,
    "category": "العاطفة",
    "text": "ما هو رد فعلك عند التعرض لانتقاد قاسٍ في العمل (عند تجربة شيء جديد)؟",
    "options": [
      {
        "text": "أستمع بهدوء وأحاول التحسين",
        "traits": {
          "calm": 2,
          "adaptive": 2,
          "reactive": -1
        }
      },
      {
        "text": "أدافع عن نفسي وأوضح وجهة نظري",
        "traits": {
          "confidence": 2,
          "reactive": 1,
          "logical": 1
        }
      },
      {
        "text": "أشعر بالإحباط وأنسحب مؤقتاً",
        "traits": {
          "emotional": 2,
          "calm": -1,
          "confidence": -1
        }
      },
      {
        "text": "أتجاهل الأمر وأستمر في عملي",
        "traits": {
          "independence": 2,
          "avoidant": 1,
          "reactive": -1
        }
      }
    ]
  },
  {
    "id": 39,
    "category": "التفكير المنطقي",
    "text": "عند اتخاذ قرار مصيري، ما هو دافعك الأول (عند تجربة شيء جديد)؟",
    "options": [
      {
        "text": "البيانات والحقائق الثابتة",
        "traits": {
          "logical": 2,
          "planner": 1,
          "risk": -1
        }
      },
      {
        "text": "شغفي وما يمليه علي قلبي",
        "traits": {
          "emotional": 2,
          "risk": 1,
          "logical": -1
        }
      },
      {
        "text": "نصائح المقربين مني",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "الفرص والمخاطر المحتملة",
        "traits": {
          "risk": 2,
          "ambition": 2,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 40,
    "category": "العمل الجماعي",
    "text": "كيف تقضي وقت فراغك عادة (عند تجربة شيء جديد)؟",
    "options": [
      {
        "text": "في التخطيط وتعلم مهارات جديدة",
        "traits": {
          "ambition": 2,
          "planner": 1,
          "discipline": 1
        }
      },
      {
        "text": "في الخروج مع الأصدقاء والعائلة",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "في ممارسة هوايات إبداعية أو فنية",
        "traits": {
          "creative": 2,
          "independence": 1,
          "social": -1
        }
      },
      {
        "text": "في الراحة والاسترخاء التام",
        "traits": {
          "calm": 2,
          "relaxed": 2,
          "ambition": -1
        }
      }
    ]
  },
  {
    "id": 41,
    "category": "الاستقلالية",
    "text": "عندما تواجه مشكلة معقدة وغير متوقعة، كيف تتصرف (تحت الضغط)؟",
    "options": [
      {
        "text": "أحللها منطقياً وأضع خطة لحلها",
        "traits": {
          "logical": 2,
          "planner": 2,
          "calm": 1,
          "reactive": -1
        }
      },
      {
        "text": "أعتمد على حدسي وتجاربي السابقة",
        "traits": {
          "emotional": 2,
          "adaptive": 1,
          "creative": 1
        }
      },
      {
        "text": "أستشير الآخرين وأطلب مساعدتهم",
        "traits": {
          "social": 2,
          "teamwork": 2,
          "independence": -1
        }
      },
      {
        "text": "أتخذ إجراءً سريعاً ومباشراً",
        "traits": {
          "reactive": 2,
          "risk": 1,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 42,
    "category": "الانضباط",
    "text": "كيف تفضل العمل على مشروع كبير (تحت الضغط)؟",
    "options": [
      {
        "text": "أقود فريقاً وأوزع المهام",
        "traits": {
          "leader": 2,
          "teamwork": 1,
          "confidence": 1
        }
      },
      {
        "text": "أعمل بمفردي لضمان الجودة",
        "traits": {
          "independence": 2,
          "logical": 1,
          "teamwork": -1
        }
      },
      {
        "text": "أكون جزءاً من فريق متعاون",
        "traits": {
          "teamwork": 2,
          "social": 1,
          "leader": -1
        }
      },
      {
        "text": "أبتكر أفكاراً وأترك التنفيذ للآخرين",
        "traits": {
          "creative": 2,
          "planner": -1,
          "independence": 1
        }
      }
    ]
  },
  {
    "id": 43,
    "category": "الذكاء",
    "text": "ما هو رد فعلك عند التعرض لانتقاد قاسٍ في العمل (تحت الضغط)؟",
    "options": [
      {
        "text": "أستمع بهدوء وأحاول التحسين",
        "traits": {
          "calm": 2,
          "adaptive": 2,
          "reactive": -1
        }
      },
      {
        "text": "أدافع عن نفسي وأوضح وجهة نظري",
        "traits": {
          "confidence": 2,
          "reactive": 1,
          "logical": 1
        }
      },
      {
        "text": "أشعر بالإحباط وأنسحب مؤقتاً",
        "traits": {
          "emotional": 2,
          "calm": -1,
          "confidence": -1
        }
      },
      {
        "text": "أتجاهل الأمر وأستمر في عملي",
        "traits": {
          "independence": 2,
          "avoidant": 1,
          "reactive": -1
        }
      }
    ]
  },
  {
    "id": 44,
    "category": "الإبداع",
    "text": "عند اتخاذ قرار مصيري، ما هو دافعك الأول (تحت الضغط)؟",
    "options": [
      {
        "text": "البيانات والحقائق الثابتة",
        "traits": {
          "logical": 2,
          "planner": 1,
          "risk": -1
        }
      },
      {
        "text": "شغفي وما يمليه علي قلبي",
        "traits": {
          "emotional": 2,
          "risk": 1,
          "logical": -1
        }
      },
      {
        "text": "نصائح المقربين مني",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "الفرص والمخاطر المحتملة",
        "traits": {
          "risk": 2,
          "ambition": 2,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 45,
    "category": "القيادة",
    "text": "كيف تقضي وقت فراغك عادة (تحت الضغط)؟",
    "options": [
      {
        "text": "في التخطيط وتعلم مهارات جديدة",
        "traits": {
          "ambition": 2,
          "planner": 1,
          "discipline": 1
        }
      },
      {
        "text": "في الخروج مع الأصدقاء والعائلة",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "في ممارسة هوايات إبداعية أو فنية",
        "traits": {
          "creative": 2,
          "independence": 1,
          "social": -1
        }
      },
      {
        "text": "في الراحة والاسترخاء التام",
        "traits": {
          "calm": 2,
          "relaxed": 2,
          "ambition": -1
        }
      }
    ]
  },
  {
    "id": 46,
    "category": "العلاقات الاجتماعية",
    "text": "عندما تواجه مشكلة معقدة وغير متوقعة، كيف تتصرف (في حياتك اليومية)؟",
    "options": [
      {
        "text": "أحللها منطقياً وأضع خطة لحلها",
        "traits": {
          "logical": 2,
          "planner": 2,
          "calm": 1,
          "reactive": -1
        }
      },
      {
        "text": "أعتمد على حدسي وتجاربي السابقة",
        "traits": {
          "emotional": 2,
          "adaptive": 1,
          "creative": 1
        }
      },
      {
        "text": "أستشير الآخرين وأطلب مساعدتهم",
        "traits": {
          "social": 2,
          "teamwork": 2,
          "independence": -1
        }
      },
      {
        "text": "أتخذ إجراءً سريعاً ومباشراً",
        "traits": {
          "reactive": 2,
          "risk": 1,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 47,
    "category": "الثقة بالنفس",
    "text": "كيف تفضل العمل على مشروع كبير (في حياتك اليومية)؟",
    "options": [
      {
        "text": "أقود فريقاً وأوزع المهام",
        "traits": {
          "leader": 2,
          "teamwork": 1,
          "confidence": 1
        }
      },
      {
        "text": "أعمل بمفردي لضمان الجودة",
        "traits": {
          "independence": 2,
          "logical": 1,
          "teamwork": -1
        }
      },
      {
        "text": "أكون جزءاً من فريق متعاون",
        "traits": {
          "teamwork": 2,
          "social": 1,
          "leader": -1
        }
      },
      {
        "text": "أبتكر أفكاراً وأترك التنفيذ للآخرين",
        "traits": {
          "creative": 2,
          "planner": -1,
          "independence": 1
        }
      }
    ]
  },
  {
    "id": 48,
    "category": "اتخاذ القرار",
    "text": "ما هو رد فعلك عند التعرض لانتقاد قاسٍ في العمل (في حياتك اليومية)؟",
    "options": [
      {
        "text": "أستمع بهدوء وأحاول التحسين",
        "traits": {
          "calm": 2,
          "adaptive": 2,
          "reactive": -1
        }
      },
      {
        "text": "أدافع عن نفسي وأوضح وجهة نظري",
        "traits": {
          "confidence": 2,
          "reactive": 1,
          "logical": 1
        }
      },
      {
        "text": "أشعر بالإحباط وأنسحب مؤقتاً",
        "traits": {
          "emotional": 2,
          "calm": -1,
          "confidence": -1
        }
      },
      {
        "text": "أتجاهل الأمر وأستمر في عملي",
        "traits": {
          "independence": 2,
          "avoidant": 1,
          "reactive": -1
        }
      }
    ]
  },
  {
    "id": 49,
    "category": "السيطرة على الغضب",
    "text": "عند اتخاذ قرار مصيري، ما هو دافعك الأول (في حياتك اليومية)؟",
    "options": [
      {
        "text": "البيانات والحقائق الثابتة",
        "traits": {
          "logical": 2,
          "planner": 1,
          "risk": -1
        }
      },
      {
        "text": "شغفي وما يمليه علي قلبي",
        "traits": {
          "emotional": 2,
          "risk": 1,
          "logical": -1
        }
      },
      {
        "text": "نصائح المقربين مني",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "الفرص والمخاطر المحتملة",
        "traits": {
          "risk": 2,
          "ambition": 2,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 50,
    "category": "الطموح",
    "text": "كيف تقضي وقت فراغك عادة (في حياتك اليومية)؟",
    "options": [
      {
        "text": "في التخطيط وتعلم مهارات جديدة",
        "traits": {
          "ambition": 2,
          "planner": 1,
          "discipline": 1
        }
      },
      {
        "text": "في الخروج مع الأصدقاء والعائلة",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "في ممارسة هوايات إبداعية أو فنية",
        "traits": {
          "creative": 2,
          "independence": 1,
          "social": -1
        }
      },
      {
        "text": "في الراحة والاسترخاء التام",
        "traits": {
          "calm": 2,
          "relaxed": 2,
          "ambition": -1
        }
      }
    ]
  },
  {
    "id": 51,
    "category": "المخاطرة",
    "text": "عندما تواجه مشكلة معقدة وغير متوقعة، كيف تتصرف (في بيئة العمل) - الموقف 1؟",
    "options": [
      {
        "text": "أحللها منطقياً وأضع خطة لحلها",
        "traits": {
          "logical": 2,
          "planner": 2,
          "calm": 1,
          "reactive": -1
        }
      },
      {
        "text": "أعتمد على حدسي وتجاربي السابقة",
        "traits": {
          "emotional": 2,
          "adaptive": 1,
          "creative": 1
        }
      },
      {
        "text": "أستشير الآخرين وأطلب مساعدتهم",
        "traits": {
          "social": 2,
          "teamwork": 2,
          "independence": -1
        }
      },
      {
        "text": "أتخذ إجراءً سريعاً ومباشراً",
        "traits": {
          "reactive": 2,
          "risk": 1,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 52,
    "category": "العاطفة",
    "text": "كيف تفضل العمل على مشروع كبير (في بيئة العمل) - الموقف 1؟",
    "options": [
      {
        "text": "أقود فريقاً وأوزع المهام",
        "traits": {
          "leader": 2,
          "teamwork": 1,
          "confidence": 1
        }
      },
      {
        "text": "أعمل بمفردي لضمان الجودة",
        "traits": {
          "independence": 2,
          "logical": 1,
          "teamwork": -1
        }
      },
      {
        "text": "أكون جزءاً من فريق متعاون",
        "traits": {
          "teamwork": 2,
          "social": 1,
          "leader": -1
        }
      },
      {
        "text": "أبتكر أفكاراً وأترك التنفيذ للآخرين",
        "traits": {
          "creative": 2,
          "planner": -1,
          "independence": 1
        }
      }
    ]
  },
  {
    "id": 53,
    "category": "التفكير المنطقي",
    "text": "ما هو رد فعلك عند التعرض لانتقاد قاسٍ في العمل (في بيئة العمل) - الموقف 1؟",
    "options": [
      {
        "text": "أستمع بهدوء وأحاول التحسين",
        "traits": {
          "calm": 2,
          "adaptive": 2,
          "reactive": -1
        }
      },
      {
        "text": "أدافع عن نفسي وأوضح وجهة نظري",
        "traits": {
          "confidence": 2,
          "reactive": 1,
          "logical": 1
        }
      },
      {
        "text": "أشعر بالإحباط وأنسحب مؤقتاً",
        "traits": {
          "emotional": 2,
          "calm": -1,
          "confidence": -1
        }
      },
      {
        "text": "أتجاهل الأمر وأستمر في عملي",
        "traits": {
          "independence": 2,
          "avoidant": 1,
          "reactive": -1
        }
      }
    ]
  },
  {
    "id": 54,
    "category": "العمل الجماعي",
    "text": "عند اتخاذ قرار مصيري، ما هو دافعك الأول (في بيئة العمل) - الموقف 1؟",
    "options": [
      {
        "text": "البيانات والحقائق الثابتة",
        "traits": {
          "logical": 2,
          "planner": 1,
          "risk": -1
        }
      },
      {
        "text": "شغفي وما يمليه علي قلبي",
        "traits": {
          "emotional": 2,
          "risk": 1,
          "logical": -1
        }
      },
      {
        "text": "نصائح المقربين مني",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "الفرص والمخاطر المحتملة",
        "traits": {
          "risk": 2,
          "ambition": 2,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 55,
    "category": "الاستقلالية",
    "text": "كيف تقضي وقت فراغك عادة (في بيئة العمل) - الموقف 1؟",
    "options": [
      {
        "text": "في التخطيط وتعلم مهارات جديدة",
        "traits": {
          "ambition": 2,
          "planner": 1,
          "discipline": 1
        }
      },
      {
        "text": "في الخروج مع الأصدقاء والعائلة",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "في ممارسة هوايات إبداعية أو فنية",
        "traits": {
          "creative": 2,
          "independence": 1,
          "social": -1
        }
      },
      {
        "text": "في الراحة والاسترخاء التام",
        "traits": {
          "calm": 2,
          "relaxed": 2,
          "ambition": -1
        }
      }
    ]
  },
  {
    "id": 56,
    "category": "الانضباط",
    "text": "عندما تواجه مشكلة معقدة وغير متوقعة، كيف تتصرف (مع أصدقائك) - الموقف 1؟",
    "options": [
      {
        "text": "أحللها منطقياً وأضع خطة لحلها",
        "traits": {
          "logical": 2,
          "planner": 2,
          "calm": 1,
          "reactive": -1
        }
      },
      {
        "text": "أعتمد على حدسي وتجاربي السابقة",
        "traits": {
          "emotional": 2,
          "adaptive": 1,
          "creative": 1
        }
      },
      {
        "text": "أستشير الآخرين وأطلب مساعدتهم",
        "traits": {
          "social": 2,
          "teamwork": 2,
          "independence": -1
        }
      },
      {
        "text": "أتخذ إجراءً سريعاً ومباشراً",
        "traits": {
          "reactive": 2,
          "risk": 1,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 57,
    "category": "الذكاء",
    "text": "كيف تفضل العمل على مشروع كبير (مع أصدقائك) - الموقف 1؟",
    "options": [
      {
        "text": "أقود فريقاً وأوزع المهام",
        "traits": {
          "leader": 2,
          "teamwork": 1,
          "confidence": 1
        }
      },
      {
        "text": "أعمل بمفردي لضمان الجودة",
        "traits": {
          "independence": 2,
          "logical": 1,
          "teamwork": -1
        }
      },
      {
        "text": "أكون جزءاً من فريق متعاون",
        "traits": {
          "teamwork": 2,
          "social": 1,
          "leader": -1
        }
      },
      {
        "text": "أبتكر أفكاراً وأترك التنفيذ للآخرين",
        "traits": {
          "creative": 2,
          "planner": -1,
          "independence": 1
        }
      }
    ]
  },
  {
    "id": 58,
    "category": "الإبداع",
    "text": "ما هو رد فعلك عند التعرض لانتقاد قاسٍ في العمل (مع أصدقائك) - الموقف 1؟",
    "options": [
      {
        "text": "أستمع بهدوء وأحاول التحسين",
        "traits": {
          "calm": 2,
          "adaptive": 2,
          "reactive": -1
        }
      },
      {
        "text": "أدافع عن نفسي وأوضح وجهة نظري",
        "traits": {
          "confidence": 2,
          "reactive": 1,
          "logical": 1
        }
      },
      {
        "text": "أشعر بالإحباط وأنسحب مؤقتاً",
        "traits": {
          "emotional": 2,
          "calm": -1,
          "confidence": -1
        }
      },
      {
        "text": "أتجاهل الأمر وأستمر في عملي",
        "traits": {
          "independence": 2,
          "avoidant": 1,
          "reactive": -1
        }
      }
    ]
  },
  {
    "id": 59,
    "category": "القيادة",
    "text": "عند اتخاذ قرار مصيري، ما هو دافعك الأول (مع أصدقائك) - الموقف 1؟",
    "options": [
      {
        "text": "البيانات والحقائق الثابتة",
        "traits": {
          "logical": 2,
          "planner": 1,
          "risk": -1
        }
      },
      {
        "text": "شغفي وما يمليه علي قلبي",
        "traits": {
          "emotional": 2,
          "risk": 1,
          "logical": -1
        }
      },
      {
        "text": "نصائح المقربين مني",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "الفرص والمخاطر المحتملة",
        "traits": {
          "risk": 2,
          "ambition": 2,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 60,
    "category": "العلاقات الاجتماعية",
    "text": "كيف تقضي وقت فراغك عادة (مع أصدقائك) - الموقف 1؟",
    "options": [
      {
        "text": "في التخطيط وتعلم مهارات جديدة",
        "traits": {
          "ambition": 2,
          "planner": 1,
          "discipline": 1
        }
      },
      {
        "text": "في الخروج مع الأصدقاء والعائلة",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "في ممارسة هوايات إبداعية أو فنية",
        "traits": {
          "creative": 2,
          "independence": 1,
          "social": -1
        }
      },
      {
        "text": "في الراحة والاسترخاء التام",
        "traits": {
          "calm": 2,
          "relaxed": 2,
          "ambition": -1
        }
      }
    ]
  },
  {
    "id": 61,
    "category": "الثقة بالنفس",
    "text": "عندما تواجه مشكلة معقدة وغير متوقعة، كيف تتصرف (عند التخطيط للمستقبل) - الموقف 1؟",
    "options": [
      {
        "text": "أحللها منطقياً وأضع خطة لحلها",
        "traits": {
          "logical": 2,
          "planner": 2,
          "calm": 1,
          "reactive": -1
        }
      },
      {
        "text": "أعتمد على حدسي وتجاربي السابقة",
        "traits": {
          "emotional": 2,
          "adaptive": 1,
          "creative": 1
        }
      },
      {
        "text": "أستشير الآخرين وأطلب مساعدتهم",
        "traits": {
          "social": 2,
          "teamwork": 2,
          "independence": -1
        }
      },
      {
        "text": "أتخذ إجراءً سريعاً ومباشراً",
        "traits": {
          "reactive": 2,
          "risk": 1,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 62,
    "category": "اتخاذ القرار",
    "text": "كيف تفضل العمل على مشروع كبير (عند التخطيط للمستقبل) - الموقف 1؟",
    "options": [
      {
        "text": "أقود فريقاً وأوزع المهام",
        "traits": {
          "leader": 2,
          "teamwork": 1,
          "confidence": 1
        }
      },
      {
        "text": "أعمل بمفردي لضمان الجودة",
        "traits": {
          "independence": 2,
          "logical": 1,
          "teamwork": -1
        }
      },
      {
        "text": "أكون جزءاً من فريق متعاون",
        "traits": {
          "teamwork": 2,
          "social": 1,
          "leader": -1
        }
      },
      {
        "text": "أبتكر أفكاراً وأترك التنفيذ للآخرين",
        "traits": {
          "creative": 2,
          "planner": -1,
          "independence": 1
        }
      }
    ]
  },
  {
    "id": 63,
    "category": "السيطرة على الغضب",
    "text": "ما هو رد فعلك عند التعرض لانتقاد قاسٍ في العمل (عند التخطيط للمستقبل) - الموقف 1؟",
    "options": [
      {
        "text": "أستمع بهدوء وأحاول التحسين",
        "traits": {
          "calm": 2,
          "adaptive": 2,
          "reactive": -1
        }
      },
      {
        "text": "أدافع عن نفسي وأوضح وجهة نظري",
        "traits": {
          "confidence": 2,
          "reactive": 1,
          "logical": 1
        }
      },
      {
        "text": "أشعر بالإحباط وأنسحب مؤقتاً",
        "traits": {
          "emotional": 2,
          "calm": -1,
          "confidence": -1
        }
      },
      {
        "text": "أتجاهل الأمر وأستمر في عملي",
        "traits": {
          "independence": 2,
          "avoidant": 1,
          "reactive": -1
        }
      }
    ]
  },
  {
    "id": 64,
    "category": "الطموح",
    "text": "عند اتخاذ قرار مصيري، ما هو دافعك الأول (عند التخطيط للمستقبل) - الموقف 1؟",
    "options": [
      {
        "text": "البيانات والحقائق الثابتة",
        "traits": {
          "logical": 2,
          "planner": 1,
          "risk": -1
        }
      },
      {
        "text": "شغفي وما يمليه علي قلبي",
        "traits": {
          "emotional": 2,
          "risk": 1,
          "logical": -1
        }
      },
      {
        "text": "نصائح المقربين مني",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "الفرص والمخاطر المحتملة",
        "traits": {
          "risk": 2,
          "ambition": 2,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 65,
    "category": "المخاطرة",
    "text": "كيف تقضي وقت فراغك عادة (عند التخطيط للمستقبل) - الموقف 1؟",
    "options": [
      {
        "text": "في التخطيط وتعلم مهارات جديدة",
        "traits": {
          "ambition": 2,
          "planner": 1,
          "discipline": 1
        }
      },
      {
        "text": "في الخروج مع الأصدقاء والعائلة",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "في ممارسة هوايات إبداعية أو فنية",
        "traits": {
          "creative": 2,
          "independence": 1,
          "social": -1
        }
      },
      {
        "text": "في الراحة والاسترخاء التام",
        "traits": {
          "calm": 2,
          "relaxed": 2,
          "ambition": -1
        }
      }
    ]
  },
  {
    "id": 66,
    "category": "العاطفة",
    "text": "عندما تواجه مشكلة معقدة وغير متوقعة، كيف تتصرف (في الأزمات) - الموقف 1؟",
    "options": [
      {
        "text": "أحللها منطقياً وأضع خطة لحلها",
        "traits": {
          "logical": 2,
          "planner": 2,
          "calm": 1,
          "reactive": -1
        }
      },
      {
        "text": "أعتمد على حدسي وتجاربي السابقة",
        "traits": {
          "emotional": 2,
          "adaptive": 1,
          "creative": 1
        }
      },
      {
        "text": "أستشير الآخرين وأطلب مساعدتهم",
        "traits": {
          "social": 2,
          "teamwork": 2,
          "independence": -1
        }
      },
      {
        "text": "أتخذ إجراءً سريعاً ومباشراً",
        "traits": {
          "reactive": 2,
          "risk": 1,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 67,
    "category": "التفكير المنطقي",
    "text": "كيف تفضل العمل على مشروع كبير (في الأزمات) - الموقف 1؟",
    "options": [
      {
        "text": "أقود فريقاً وأوزع المهام",
        "traits": {
          "leader": 2,
          "teamwork": 1,
          "confidence": 1
        }
      },
      {
        "text": "أعمل بمفردي لضمان الجودة",
        "traits": {
          "independence": 2,
          "logical": 1,
          "teamwork": -1
        }
      },
      {
        "text": "أكون جزءاً من فريق متعاون",
        "traits": {
          "teamwork": 2,
          "social": 1,
          "leader": -1
        }
      },
      {
        "text": "أبتكر أفكاراً وأترك التنفيذ للآخرين",
        "traits": {
          "creative": 2,
          "planner": -1,
          "independence": 1
        }
      }
    ]
  },
  {
    "id": 68,
    "category": "العمل الجماعي",
    "text": "ما هو رد فعلك عند التعرض لانتقاد قاسٍ في العمل (في الأزمات) - الموقف 1؟",
    "options": [
      {
        "text": "أستمع بهدوء وأحاول التحسين",
        "traits": {
          "calm": 2,
          "adaptive": 2,
          "reactive": -1
        }
      },
      {
        "text": "أدافع عن نفسي وأوضح وجهة نظري",
        "traits": {
          "confidence": 2,
          "reactive": 1,
          "logical": 1
        }
      },
      {
        "text": "أشعر بالإحباط وأنسحب مؤقتاً",
        "traits": {
          "emotional": 2,
          "calm": -1,
          "confidence": -1
        }
      },
      {
        "text": "أتجاهل الأمر وأستمر في عملي",
        "traits": {
          "independence": 2,
          "avoidant": 1,
          "reactive": -1
        }
      }
    ]
  },
  {
    "id": 69,
    "category": "الاستقلالية",
    "text": "عند اتخاذ قرار مصيري، ما هو دافعك الأول (في الأزمات) - الموقف 1؟",
    "options": [
      {
        "text": "البيانات والحقائق الثابتة",
        "traits": {
          "logical": 2,
          "planner": 1,
          "risk": -1
        }
      },
      {
        "text": "شغفي وما يمليه علي قلبي",
        "traits": {
          "emotional": 2,
          "risk": 1,
          "logical": -1
        }
      },
      {
        "text": "نصائح المقربين مني",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "الفرص والمخاطر المحتملة",
        "traits": {
          "risk": 2,
          "ambition": 2,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 70,
    "category": "الانضباط",
    "text": "كيف تقضي وقت فراغك عادة (في الأزمات) - الموقف 1؟",
    "options": [
      {
        "text": "في التخطيط وتعلم مهارات جديدة",
        "traits": {
          "ambition": 2,
          "planner": 1,
          "discipline": 1
        }
      },
      {
        "text": "في الخروج مع الأصدقاء والعائلة",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "في ممارسة هوايات إبداعية أو فنية",
        "traits": {
          "creative": 2,
          "independence": 1,
          "social": -1
        }
      },
      {
        "text": "في الراحة والاسترخاء التام",
        "traits": {
          "calm": 2,
          "relaxed": 2,
          "ambition": -1
        }
      }
    ]
  },
  {
    "id": 71,
    "category": "الذكاء",
    "text": "عندما تواجه مشكلة معقدة وغير متوقعة، كيف تتصرف (عند التعامل مع الغرباء) - الموقف 1؟",
    "options": [
      {
        "text": "أحللها منطقياً وأضع خطة لحلها",
        "traits": {
          "logical": 2,
          "planner": 2,
          "calm": 1,
          "reactive": -1
        }
      },
      {
        "text": "أعتمد على حدسي وتجاربي السابقة",
        "traits": {
          "emotional": 2,
          "adaptive": 1,
          "creative": 1
        }
      },
      {
        "text": "أستشير الآخرين وأطلب مساعدتهم",
        "traits": {
          "social": 2,
          "teamwork": 2,
          "independence": -1
        }
      },
      {
        "text": "أتخذ إجراءً سريعاً ومباشراً",
        "traits": {
          "reactive": 2,
          "risk": 1,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 72,
    "category": "الإبداع",
    "text": "كيف تفضل العمل على مشروع كبير (عند التعامل مع الغرباء) - الموقف 1؟",
    "options": [
      {
        "text": "أقود فريقاً وأوزع المهام",
        "traits": {
          "leader": 2,
          "teamwork": 1,
          "confidence": 1
        }
      },
      {
        "text": "أعمل بمفردي لضمان الجودة",
        "traits": {
          "independence": 2,
          "logical": 1,
          "teamwork": -1
        }
      },
      {
        "text": "أكون جزءاً من فريق متعاون",
        "traits": {
          "teamwork": 2,
          "social": 1,
          "leader": -1
        }
      },
      {
        "text": "أبتكر أفكاراً وأترك التنفيذ للآخرين",
        "traits": {
          "creative": 2,
          "planner": -1,
          "independence": 1
        }
      }
    ]
  },
  {
    "id": 73,
    "category": "القيادة",
    "text": "ما هو رد فعلك عند التعرض لانتقاد قاسٍ في العمل (عند التعامل مع الغرباء) - الموقف 1؟",
    "options": [
      {
        "text": "أستمع بهدوء وأحاول التحسين",
        "traits": {
          "calm": 2,
          "adaptive": 2,
          "reactive": -1
        }
      },
      {
        "text": "أدافع عن نفسي وأوضح وجهة نظري",
        "traits": {
          "confidence": 2,
          "reactive": 1,
          "logical": 1
        }
      },
      {
        "text": "أشعر بالإحباط وأنسحب مؤقتاً",
        "traits": {
          "emotional": 2,
          "calm": -1,
          "confidence": -1
        }
      },
      {
        "text": "أتجاهل الأمر وأستمر في عملي",
        "traits": {
          "independence": 2,
          "avoidant": 1,
          "reactive": -1
        }
      }
    ]
  },
  {
    "id": 74,
    "category": "العلاقات الاجتماعية",
    "text": "عند اتخاذ قرار مصيري، ما هو دافعك الأول (عند التعامل مع الغرباء) - الموقف 1؟",
    "options": [
      {
        "text": "البيانات والحقائق الثابتة",
        "traits": {
          "logical": 2,
          "planner": 1,
          "risk": -1
        }
      },
      {
        "text": "شغفي وما يمليه علي قلبي",
        "traits": {
          "emotional": 2,
          "risk": 1,
          "logical": -1
        }
      },
      {
        "text": "نصائح المقربين مني",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "الفرص والمخاطر المحتملة",
        "traits": {
          "risk": 2,
          "ambition": 2,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 75,
    "category": "الثقة بالنفس",
    "text": "كيف تقضي وقت فراغك عادة (عند التعامل مع الغرباء) - الموقف 1؟",
    "options": [
      {
        "text": "في التخطيط وتعلم مهارات جديدة",
        "traits": {
          "ambition": 2,
          "planner": 1,
          "discipline": 1
        }
      },
      {
        "text": "في الخروج مع الأصدقاء والعائلة",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "في ممارسة هوايات إبداعية أو فنية",
        "traits": {
          "creative": 2,
          "independence": 1,
          "social": -1
        }
      },
      {
        "text": "في الراحة والاسترخاء التام",
        "traits": {
          "calm": 2,
          "relaxed": 2,
          "ambition": -1
        }
      }
    ]
  },
  {
    "id": 76,
    "category": "اتخاذ القرار",
    "text": "عندما تواجه مشكلة معقدة وغير متوقعة، كيف تتصرف (في العلاقات الشخصية) - الموقف 1؟",
    "options": [
      {
        "text": "أحللها منطقياً وأضع خطة لحلها",
        "traits": {
          "logical": 2,
          "planner": 2,
          "calm": 1,
          "reactive": -1
        }
      },
      {
        "text": "أعتمد على حدسي وتجاربي السابقة",
        "traits": {
          "emotional": 2,
          "adaptive": 1,
          "creative": 1
        }
      },
      {
        "text": "أستشير الآخرين وأطلب مساعدتهم",
        "traits": {
          "social": 2,
          "teamwork": 2,
          "independence": -1
        }
      },
      {
        "text": "أتخذ إجراءً سريعاً ومباشراً",
        "traits": {
          "reactive": 2,
          "risk": 1,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 77,
    "category": "السيطرة على الغضب",
    "text": "كيف تفضل العمل على مشروع كبير (في العلاقات الشخصية) - الموقف 1؟",
    "options": [
      {
        "text": "أقود فريقاً وأوزع المهام",
        "traits": {
          "leader": 2,
          "teamwork": 1,
          "confidence": 1
        }
      },
      {
        "text": "أعمل بمفردي لضمان الجودة",
        "traits": {
          "independence": 2,
          "logical": 1,
          "teamwork": -1
        }
      },
      {
        "text": "أكون جزءاً من فريق متعاون",
        "traits": {
          "teamwork": 2,
          "social": 1,
          "leader": -1
        }
      },
      {
        "text": "أبتكر أفكاراً وأترك التنفيذ للآخرين",
        "traits": {
          "creative": 2,
          "planner": -1,
          "independence": 1
        }
      }
    ]
  },
  {
    "id": 78,
    "category": "الطموح",
    "text": "ما هو رد فعلك عند التعرض لانتقاد قاسٍ في العمل (في العلاقات الشخصية) - الموقف 1؟",
    "options": [
      {
        "text": "أستمع بهدوء وأحاول التحسين",
        "traits": {
          "calm": 2,
          "adaptive": 2,
          "reactive": -1
        }
      },
      {
        "text": "أدافع عن نفسي وأوضح وجهة نظري",
        "traits": {
          "confidence": 2,
          "reactive": 1,
          "logical": 1
        }
      },
      {
        "text": "أشعر بالإحباط وأنسحب مؤقتاً",
        "traits": {
          "emotional": 2,
          "calm": -1,
          "confidence": -1
        }
      },
      {
        "text": "أتجاهل الأمر وأستمر في عملي",
        "traits": {
          "independence": 2,
          "avoidant": 1,
          "reactive": -1
        }
      }
    ]
  },
  {
    "id": 79,
    "category": "المخاطرة",
    "text": "عند اتخاذ قرار مصيري، ما هو دافعك الأول (في العلاقات الشخصية) - الموقف 1؟",
    "options": [
      {
        "text": "البيانات والحقائق الثابتة",
        "traits": {
          "logical": 2,
          "planner": 1,
          "risk": -1
        }
      },
      {
        "text": "شغفي وما يمليه علي قلبي",
        "traits": {
          "emotional": 2,
          "risk": 1,
          "logical": -1
        }
      },
      {
        "text": "نصائح المقربين مني",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "الفرص والمخاطر المحتملة",
        "traits": {
          "risk": 2,
          "ambition": 2,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 80,
    "category": "العاطفة",
    "text": "كيف تقضي وقت فراغك عادة (في العلاقات الشخصية) - الموقف 1؟",
    "options": [
      {
        "text": "في التخطيط وتعلم مهارات جديدة",
        "traits": {
          "ambition": 2,
          "planner": 1,
          "discipline": 1
        }
      },
      {
        "text": "في الخروج مع الأصدقاء والعائلة",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "في ممارسة هوايات إبداعية أو فنية",
        "traits": {
          "creative": 2,
          "independence": 1,
          "social": -1
        }
      },
      {
        "text": "في الراحة والاسترخاء التام",
        "traits": {
          "calm": 2,
          "relaxed": 2,
          "ambition": -1
        }
      }
    ]
  },
  {
    "id": 81,
    "category": "التفكير المنطقي",
    "text": "عندما تواجه مشكلة معقدة وغير متوقعة، كيف تتصرف (عند تجربة شيء جديد) - الموقف 1؟",
    "options": [
      {
        "text": "أحللها منطقياً وأضع خطة لحلها",
        "traits": {
          "logical": 2,
          "planner": 2,
          "calm": 1,
          "reactive": -1
        }
      },
      {
        "text": "أعتمد على حدسي وتجاربي السابقة",
        "traits": {
          "emotional": 2,
          "adaptive": 1,
          "creative": 1
        }
      },
      {
        "text": "أستشير الآخرين وأطلب مساعدتهم",
        "traits": {
          "social": 2,
          "teamwork": 2,
          "independence": -1
        }
      },
      {
        "text": "أتخذ إجراءً سريعاً ومباشراً",
        "traits": {
          "reactive": 2,
          "risk": 1,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 82,
    "category": "العمل الجماعي",
    "text": "كيف تفضل العمل على مشروع كبير (عند تجربة شيء جديد) - الموقف 1؟",
    "options": [
      {
        "text": "أقود فريقاً وأوزع المهام",
        "traits": {
          "leader": 2,
          "teamwork": 1,
          "confidence": 1
        }
      },
      {
        "text": "أعمل بمفردي لضمان الجودة",
        "traits": {
          "independence": 2,
          "logical": 1,
          "teamwork": -1
        }
      },
      {
        "text": "أكون جزءاً من فريق متعاون",
        "traits": {
          "teamwork": 2,
          "social": 1,
          "leader": -1
        }
      },
      {
        "text": "أبتكر أفكاراً وأترك التنفيذ للآخرين",
        "traits": {
          "creative": 2,
          "planner": -1,
          "independence": 1
        }
      }
    ]
  },
  {
    "id": 83,
    "category": "الاستقلالية",
    "text": "ما هو رد فعلك عند التعرض لانتقاد قاسٍ في العمل (عند تجربة شيء جديد) - الموقف 1؟",
    "options": [
      {
        "text": "أستمع بهدوء وأحاول التحسين",
        "traits": {
          "calm": 2,
          "adaptive": 2,
          "reactive": -1
        }
      },
      {
        "text": "أدافع عن نفسي وأوضح وجهة نظري",
        "traits": {
          "confidence": 2,
          "reactive": 1,
          "logical": 1
        }
      },
      {
        "text": "أشعر بالإحباط وأنسحب مؤقتاً",
        "traits": {
          "emotional": 2,
          "calm": -1,
          "confidence": -1
        }
      },
      {
        "text": "أتجاهل الأمر وأستمر في عملي",
        "traits": {
          "independence": 2,
          "avoidant": 1,
          "reactive": -1
        }
      }
    ]
  },
  {
    "id": 84,
    "category": "الانضباط",
    "text": "عند اتخاذ قرار مصيري، ما هو دافعك الأول (عند تجربة شيء جديد) - الموقف 1؟",
    "options": [
      {
        "text": "البيانات والحقائق الثابتة",
        "traits": {
          "logical": 2,
          "planner": 1,
          "risk": -1
        }
      },
      {
        "text": "شغفي وما يمليه علي قلبي",
        "traits": {
          "emotional": 2,
          "risk": 1,
          "logical": -1
        }
      },
      {
        "text": "نصائح المقربين مني",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "الفرص والمخاطر المحتملة",
        "traits": {
          "risk": 2,
          "ambition": 2,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 85,
    "category": "الذكاء",
    "text": "كيف تقضي وقت فراغك عادة (عند تجربة شيء جديد) - الموقف 1؟",
    "options": [
      {
        "text": "في التخطيط وتعلم مهارات جديدة",
        "traits": {
          "ambition": 2,
          "planner": 1,
          "discipline": 1
        }
      },
      {
        "text": "في الخروج مع الأصدقاء والعائلة",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "في ممارسة هوايات إبداعية أو فنية",
        "traits": {
          "creative": 2,
          "independence": 1,
          "social": -1
        }
      },
      {
        "text": "في الراحة والاسترخاء التام",
        "traits": {
          "calm": 2,
          "relaxed": 2,
          "ambition": -1
        }
      }
    ]
  },
  {
    "id": 86,
    "category": "الإبداع",
    "text": "عندما تواجه مشكلة معقدة وغير متوقعة، كيف تتصرف (تحت الضغط) - الموقف 1؟",
    "options": [
      {
        "text": "أحللها منطقياً وأضع خطة لحلها",
        "traits": {
          "logical": 2,
          "planner": 2,
          "calm": 1,
          "reactive": -1
        }
      },
      {
        "text": "أعتمد على حدسي وتجاربي السابقة",
        "traits": {
          "emotional": 2,
          "adaptive": 1,
          "creative": 1
        }
      },
      {
        "text": "أستشير الآخرين وأطلب مساعدتهم",
        "traits": {
          "social": 2,
          "teamwork": 2,
          "independence": -1
        }
      },
      {
        "text": "أتخذ إجراءً سريعاً ومباشراً",
        "traits": {
          "reactive": 2,
          "risk": 1,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 87,
    "category": "القيادة",
    "text": "كيف تفضل العمل على مشروع كبير (تحت الضغط) - الموقف 1؟",
    "options": [
      {
        "text": "أقود فريقاً وأوزع المهام",
        "traits": {
          "leader": 2,
          "teamwork": 1,
          "confidence": 1
        }
      },
      {
        "text": "أعمل بمفردي لضمان الجودة",
        "traits": {
          "independence": 2,
          "logical": 1,
          "teamwork": -1
        }
      },
      {
        "text": "أكون جزءاً من فريق متعاون",
        "traits": {
          "teamwork": 2,
          "social": 1,
          "leader": -1
        }
      },
      {
        "text": "أبتكر أفكاراً وأترك التنفيذ للآخرين",
        "traits": {
          "creative": 2,
          "planner": -1,
          "independence": 1
        }
      }
    ]
  },
  {
    "id": 88,
    "category": "العلاقات الاجتماعية",
    "text": "ما هو رد فعلك عند التعرض لانتقاد قاسٍ في العمل (تحت الضغط) - الموقف 1؟",
    "options": [
      {
        "text": "أستمع بهدوء وأحاول التحسين",
        "traits": {
          "calm": 2,
          "adaptive": 2,
          "reactive": -1
        }
      },
      {
        "text": "أدافع عن نفسي وأوضح وجهة نظري",
        "traits": {
          "confidence": 2,
          "reactive": 1,
          "logical": 1
        }
      },
      {
        "text": "أشعر بالإحباط وأنسحب مؤقتاً",
        "traits": {
          "emotional": 2,
          "calm": -1,
          "confidence": -1
        }
      },
      {
        "text": "أتجاهل الأمر وأستمر في عملي",
        "traits": {
          "independence": 2,
          "avoidant": 1,
          "reactive": -1
        }
      }
    ]
  },
  {
    "id": 89,
    "category": "الثقة بالنفس",
    "text": "عند اتخاذ قرار مصيري، ما هو دافعك الأول (تحت الضغط) - الموقف 1؟",
    "options": [
      {
        "text": "البيانات والحقائق الثابتة",
        "traits": {
          "logical": 2,
          "planner": 1,
          "risk": -1
        }
      },
      {
        "text": "شغفي وما يمليه علي قلبي",
        "traits": {
          "emotional": 2,
          "risk": 1,
          "logical": -1
        }
      },
      {
        "text": "نصائح المقربين مني",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "الفرص والمخاطر المحتملة",
        "traits": {
          "risk": 2,
          "ambition": 2,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 90,
    "category": "اتخاذ القرار",
    "text": "كيف تقضي وقت فراغك عادة (تحت الضغط) - الموقف 1؟",
    "options": [
      {
        "text": "في التخطيط وتعلم مهارات جديدة",
        "traits": {
          "ambition": 2,
          "planner": 1,
          "discipline": 1
        }
      },
      {
        "text": "في الخروج مع الأصدقاء والعائلة",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "في ممارسة هوايات إبداعية أو فنية",
        "traits": {
          "creative": 2,
          "independence": 1,
          "social": -1
        }
      },
      {
        "text": "في الراحة والاسترخاء التام",
        "traits": {
          "calm": 2,
          "relaxed": 2,
          "ambition": -1
        }
      }
    ]
  },
  {
    "id": 91,
    "category": "السيطرة على الغضب",
    "text": "عندما تواجه مشكلة معقدة وغير متوقعة، كيف تتصرف (في حياتك اليومية) - الموقف 1؟",
    "options": [
      {
        "text": "أحللها منطقياً وأضع خطة لحلها",
        "traits": {
          "logical": 2,
          "planner": 2,
          "calm": 1,
          "reactive": -1
        }
      },
      {
        "text": "أعتمد على حدسي وتجاربي السابقة",
        "traits": {
          "emotional": 2,
          "adaptive": 1,
          "creative": 1
        }
      },
      {
        "text": "أستشير الآخرين وأطلب مساعدتهم",
        "traits": {
          "social": 2,
          "teamwork": 2,
          "independence": -1
        }
      },
      {
        "text": "أتخذ إجراءً سريعاً ومباشراً",
        "traits": {
          "reactive": 2,
          "risk": 1,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 92,
    "category": "الطموح",
    "text": "كيف تفضل العمل على مشروع كبير (في حياتك اليومية) - الموقف 1؟",
    "options": [
      {
        "text": "أقود فريقاً وأوزع المهام",
        "traits": {
          "leader": 2,
          "teamwork": 1,
          "confidence": 1
        }
      },
      {
        "text": "أعمل بمفردي لضمان الجودة",
        "traits": {
          "independence": 2,
          "logical": 1,
          "teamwork": -1
        }
      },
      {
        "text": "أكون جزءاً من فريق متعاون",
        "traits": {
          "teamwork": 2,
          "social": 1,
          "leader": -1
        }
      },
      {
        "text": "أبتكر أفكاراً وأترك التنفيذ للآخرين",
        "traits": {
          "creative": 2,
          "planner": -1,
          "independence": 1
        }
      }
    ]
  },
  {
    "id": 93,
    "category": "المخاطرة",
    "text": "ما هو رد فعلك عند التعرض لانتقاد قاسٍ في العمل (في حياتك اليومية) - الموقف 1؟",
    "options": [
      {
        "text": "أستمع بهدوء وأحاول التحسين",
        "traits": {
          "calm": 2,
          "adaptive": 2,
          "reactive": -1
        }
      },
      {
        "text": "أدافع عن نفسي وأوضح وجهة نظري",
        "traits": {
          "confidence": 2,
          "reactive": 1,
          "logical": 1
        }
      },
      {
        "text": "أشعر بالإحباط وأنسحب مؤقتاً",
        "traits": {
          "emotional": 2,
          "calm": -1,
          "confidence": -1
        }
      },
      {
        "text": "أتجاهل الأمر وأستمر في عملي",
        "traits": {
          "independence": 2,
          "avoidant": 1,
          "reactive": -1
        }
      }
    ]
  },
  {
    "id": 94,
    "category": "العاطفة",
    "text": "عند اتخاذ قرار مصيري، ما هو دافعك الأول (في حياتك اليومية) - الموقف 1؟",
    "options": [
      {
        "text": "البيانات والحقائق الثابتة",
        "traits": {
          "logical": 2,
          "planner": 1,
          "risk": -1
        }
      },
      {
        "text": "شغفي وما يمليه علي قلبي",
        "traits": {
          "emotional": 2,
          "risk": 1,
          "logical": -1
        }
      },
      {
        "text": "نصائح المقربين مني",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "الفرص والمخاطر المحتملة",
        "traits": {
          "risk": 2,
          "ambition": 2,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 95,
    "category": "التفكير المنطقي",
    "text": "كيف تقضي وقت فراغك عادة (في حياتك اليومية) - الموقف 1؟",
    "options": [
      {
        "text": "في التخطيط وتعلم مهارات جديدة",
        "traits": {
          "ambition": 2,
          "planner": 1,
          "discipline": 1
        }
      },
      {
        "text": "في الخروج مع الأصدقاء والعائلة",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "في ممارسة هوايات إبداعية أو فنية",
        "traits": {
          "creative": 2,
          "independence": 1,
          "social": -1
        }
      },
      {
        "text": "في الراحة والاسترخاء التام",
        "traits": {
          "calm": 2,
          "relaxed": 2,
          "ambition": -1
        }
      }
    ]
  },
  {
    "id": 96,
    "category": "العمل الجماعي",
    "text": "عندما تواجه مشكلة معقدة وغير متوقعة، كيف تتصرف (في بيئة العمل) - الموقف 2؟",
    "options": [
      {
        "text": "أحللها منطقياً وأضع خطة لحلها",
        "traits": {
          "logical": 2,
          "planner": 2,
          "calm": 1,
          "reactive": -1
        }
      },
      {
        "text": "أعتمد على حدسي وتجاربي السابقة",
        "traits": {
          "emotional": 2,
          "adaptive": 1,
          "creative": 1
        }
      },
      {
        "text": "أستشير الآخرين وأطلب مساعدتهم",
        "traits": {
          "social": 2,
          "teamwork": 2,
          "independence": -1
        }
      },
      {
        "text": "أتخذ إجراءً سريعاً ومباشراً",
        "traits": {
          "reactive": 2,
          "risk": 1,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 97,
    "category": "الاستقلالية",
    "text": "كيف تفضل العمل على مشروع كبير (في بيئة العمل) - الموقف 2؟",
    "options": [
      {
        "text": "أقود فريقاً وأوزع المهام",
        "traits": {
          "leader": 2,
          "teamwork": 1,
          "confidence": 1
        }
      },
      {
        "text": "أعمل بمفردي لضمان الجودة",
        "traits": {
          "independence": 2,
          "logical": 1,
          "teamwork": -1
        }
      },
      {
        "text": "أكون جزءاً من فريق متعاون",
        "traits": {
          "teamwork": 2,
          "social": 1,
          "leader": -1
        }
      },
      {
        "text": "أبتكر أفكاراً وأترك التنفيذ للآخرين",
        "traits": {
          "creative": 2,
          "planner": -1,
          "independence": 1
        }
      }
    ]
  },
  {
    "id": 98,
    "category": "الانضباط",
    "text": "ما هو رد فعلك عند التعرض لانتقاد قاسٍ في العمل (في بيئة العمل) - الموقف 2؟",
    "options": [
      {
        "text": "أستمع بهدوء وأحاول التحسين",
        "traits": {
          "calm": 2,
          "adaptive": 2,
          "reactive": -1
        }
      },
      {
        "text": "أدافع عن نفسي وأوضح وجهة نظري",
        "traits": {
          "confidence": 2,
          "reactive": 1,
          "logical": 1
        }
      },
      {
        "text": "أشعر بالإحباط وأنسحب مؤقتاً",
        "traits": {
          "emotional": 2,
          "calm": -1,
          "confidence": -1
        }
      },
      {
        "text": "أتجاهل الأمر وأستمر في عملي",
        "traits": {
          "independence": 2,
          "avoidant": 1,
          "reactive": -1
        }
      }
    ]
  },
  {
    "id": 99,
    "category": "الذكاء",
    "text": "عند اتخاذ قرار مصيري، ما هو دافعك الأول (في بيئة العمل) - الموقف 2؟",
    "options": [
      {
        "text": "البيانات والحقائق الثابتة",
        "traits": {
          "logical": 2,
          "planner": 1,
          "risk": -1
        }
      },
      {
        "text": "شغفي وما يمليه علي قلبي",
        "traits": {
          "emotional": 2,
          "risk": 1,
          "logical": -1
        }
      },
      {
        "text": "نصائح المقربين مني",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "الفرص والمخاطر المحتملة",
        "traits": {
          "risk": 2,
          "ambition": 2,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 100,
    "category": "الإبداع",
    "text": "كيف تقضي وقت فراغك عادة (في بيئة العمل) - الموقف 2؟",
    "options": [
      {
        "text": "في التخطيط وتعلم مهارات جديدة",
        "traits": {
          "ambition": 2,
          "planner": 1,
          "discipline": 1
        }
      },
      {
        "text": "في الخروج مع الأصدقاء والعائلة",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "في ممارسة هوايات إبداعية أو فنية",
        "traits": {
          "creative": 2,
          "independence": 1,
          "social": -1
        }
      },
      {
        "text": "في الراحة والاسترخاء التام",
        "traits": {
          "calm": 2,
          "relaxed": 2,
          "ambition": -1
        }
      }
    ]
  },
  {
    "id": 101,
    "category": "القيادة",
    "text": "عندما تواجه مشكلة معقدة وغير متوقعة، كيف تتصرف (مع أصدقائك) - الموقف 2؟",
    "options": [
      {
        "text": "أحللها منطقياً وأضع خطة لحلها",
        "traits": {
          "logical": 2,
          "planner": 2,
          "calm": 1,
          "reactive": -1
        }
      },
      {
        "text": "أعتمد على حدسي وتجاربي السابقة",
        "traits": {
          "emotional": 2,
          "adaptive": 1,
          "creative": 1
        }
      },
      {
        "text": "أستشير الآخرين وأطلب مساعدتهم",
        "traits": {
          "social": 2,
          "teamwork": 2,
          "independence": -1
        }
      },
      {
        "text": "أتخذ إجراءً سريعاً ومباشراً",
        "traits": {
          "reactive": 2,
          "risk": 1,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 102,
    "category": "العلاقات الاجتماعية",
    "text": "كيف تفضل العمل على مشروع كبير (مع أصدقائك) - الموقف 2؟",
    "options": [
      {
        "text": "أقود فريقاً وأوزع المهام",
        "traits": {
          "leader": 2,
          "teamwork": 1,
          "confidence": 1
        }
      },
      {
        "text": "أعمل بمفردي لضمان الجودة",
        "traits": {
          "independence": 2,
          "logical": 1,
          "teamwork": -1
        }
      },
      {
        "text": "أكون جزءاً من فريق متعاون",
        "traits": {
          "teamwork": 2,
          "social": 1,
          "leader": -1
        }
      },
      {
        "text": "أبتكر أفكاراً وأترك التنفيذ للآخرين",
        "traits": {
          "creative": 2,
          "planner": -1,
          "independence": 1
        }
      }
    ]
  },
  {
    "id": 103,
    "category": "الثقة بالنفس",
    "text": "ما هو رد فعلك عند التعرض لانتقاد قاسٍ في العمل (مع أصدقائك) - الموقف 2؟",
    "options": [
      {
        "text": "أستمع بهدوء وأحاول التحسين",
        "traits": {
          "calm": 2,
          "adaptive": 2,
          "reactive": -1
        }
      },
      {
        "text": "أدافع عن نفسي وأوضح وجهة نظري",
        "traits": {
          "confidence": 2,
          "reactive": 1,
          "logical": 1
        }
      },
      {
        "text": "أشعر بالإحباط وأنسحب مؤقتاً",
        "traits": {
          "emotional": 2,
          "calm": -1,
          "confidence": -1
        }
      },
      {
        "text": "أتجاهل الأمر وأستمر في عملي",
        "traits": {
          "independence": 2,
          "avoidant": 1,
          "reactive": -1
        }
      }
    ]
  },
  {
    "id": 104,
    "category": "اتخاذ القرار",
    "text": "عند اتخاذ قرار مصيري، ما هو دافعك الأول (مع أصدقائك) - الموقف 2؟",
    "options": [
      {
        "text": "البيانات والحقائق الثابتة",
        "traits": {
          "logical": 2,
          "planner": 1,
          "risk": -1
        }
      },
      {
        "text": "شغفي وما يمليه علي قلبي",
        "traits": {
          "emotional": 2,
          "risk": 1,
          "logical": -1
        }
      },
      {
        "text": "نصائح المقربين مني",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "الفرص والمخاطر المحتملة",
        "traits": {
          "risk": 2,
          "ambition": 2,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 105,
    "category": "السيطرة على الغضب",
    "text": "كيف تقضي وقت فراغك عادة (مع أصدقائك) - الموقف 2؟",
    "options": [
      {
        "text": "في التخطيط وتعلم مهارات جديدة",
        "traits": {
          "ambition": 2,
          "planner": 1,
          "discipline": 1
        }
      },
      {
        "text": "في الخروج مع الأصدقاء والعائلة",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "في ممارسة هوايات إبداعية أو فنية",
        "traits": {
          "creative": 2,
          "independence": 1,
          "social": -1
        }
      },
      {
        "text": "في الراحة والاسترخاء التام",
        "traits": {
          "calm": 2,
          "relaxed": 2,
          "ambition": -1
        }
      }
    ]
  },
  {
    "id": 106,
    "category": "الطموح",
    "text": "عندما تواجه مشكلة معقدة وغير متوقعة، كيف تتصرف (عند التخطيط للمستقبل) - الموقف 2؟",
    "options": [
      {
        "text": "أحللها منطقياً وأضع خطة لحلها",
        "traits": {
          "logical": 2,
          "planner": 2,
          "calm": 1,
          "reactive": -1
        }
      },
      {
        "text": "أعتمد على حدسي وتجاربي السابقة",
        "traits": {
          "emotional": 2,
          "adaptive": 1,
          "creative": 1
        }
      },
      {
        "text": "أستشير الآخرين وأطلب مساعدتهم",
        "traits": {
          "social": 2,
          "teamwork": 2,
          "independence": -1
        }
      },
      {
        "text": "أتخذ إجراءً سريعاً ومباشراً",
        "traits": {
          "reactive": 2,
          "risk": 1,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 107,
    "category": "المخاطرة",
    "text": "كيف تفضل العمل على مشروع كبير (عند التخطيط للمستقبل) - الموقف 2؟",
    "options": [
      {
        "text": "أقود فريقاً وأوزع المهام",
        "traits": {
          "leader": 2,
          "teamwork": 1,
          "confidence": 1
        }
      },
      {
        "text": "أعمل بمفردي لضمان الجودة",
        "traits": {
          "independence": 2,
          "logical": 1,
          "teamwork": -1
        }
      },
      {
        "text": "أكون جزءاً من فريق متعاون",
        "traits": {
          "teamwork": 2,
          "social": 1,
          "leader": -1
        }
      },
      {
        "text": "أبتكر أفكاراً وأترك التنفيذ للآخرين",
        "traits": {
          "creative": 2,
          "planner": -1,
          "independence": 1
        }
      }
    ]
  },
  {
    "id": 108,
    "category": "العاطفة",
    "text": "ما هو رد فعلك عند التعرض لانتقاد قاسٍ في العمل (عند التخطيط للمستقبل) - الموقف 2؟",
    "options": [
      {
        "text": "أستمع بهدوء وأحاول التحسين",
        "traits": {
          "calm": 2,
          "adaptive": 2,
          "reactive": -1
        }
      },
      {
        "text": "أدافع عن نفسي وأوضح وجهة نظري",
        "traits": {
          "confidence": 2,
          "reactive": 1,
          "logical": 1
        }
      },
      {
        "text": "أشعر بالإحباط وأنسحب مؤقتاً",
        "traits": {
          "emotional": 2,
          "calm": -1,
          "confidence": -1
        }
      },
      {
        "text": "أتجاهل الأمر وأستمر في عملي",
        "traits": {
          "independence": 2,
          "avoidant": 1,
          "reactive": -1
        }
      }
    ]
  },
  {
    "id": 109,
    "category": "التفكير المنطقي",
    "text": "عند اتخاذ قرار مصيري، ما هو دافعك الأول (عند التخطيط للمستقبل) - الموقف 2؟",
    "options": [
      {
        "text": "البيانات والحقائق الثابتة",
        "traits": {
          "logical": 2,
          "planner": 1,
          "risk": -1
        }
      },
      {
        "text": "شغفي وما يمليه علي قلبي",
        "traits": {
          "emotional": 2,
          "risk": 1,
          "logical": -1
        }
      },
      {
        "text": "نصائح المقربين مني",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "الفرص والمخاطر المحتملة",
        "traits": {
          "risk": 2,
          "ambition": 2,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 110,
    "category": "العمل الجماعي",
    "text": "كيف تقضي وقت فراغك عادة (عند التخطيط للمستقبل) - الموقف 2؟",
    "options": [
      {
        "text": "في التخطيط وتعلم مهارات جديدة",
        "traits": {
          "ambition": 2,
          "planner": 1,
          "discipline": 1
        }
      },
      {
        "text": "في الخروج مع الأصدقاء والعائلة",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "في ممارسة هوايات إبداعية أو فنية",
        "traits": {
          "creative": 2,
          "independence": 1,
          "social": -1
        }
      },
      {
        "text": "في الراحة والاسترخاء التام",
        "traits": {
          "calm": 2,
          "relaxed": 2,
          "ambition": -1
        }
      }
    ]
  },
  {
    "id": 111,
    "category": "الاستقلالية",
    "text": "عندما تواجه مشكلة معقدة وغير متوقعة، كيف تتصرف (في الأزمات) - الموقف 2؟",
    "options": [
      {
        "text": "أحللها منطقياً وأضع خطة لحلها",
        "traits": {
          "logical": 2,
          "planner": 2,
          "calm": 1,
          "reactive": -1
        }
      },
      {
        "text": "أعتمد على حدسي وتجاربي السابقة",
        "traits": {
          "emotional": 2,
          "adaptive": 1,
          "creative": 1
        }
      },
      {
        "text": "أستشير الآخرين وأطلب مساعدتهم",
        "traits": {
          "social": 2,
          "teamwork": 2,
          "independence": -1
        }
      },
      {
        "text": "أتخذ إجراءً سريعاً ومباشراً",
        "traits": {
          "reactive": 2,
          "risk": 1,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 112,
    "category": "الانضباط",
    "text": "كيف تفضل العمل على مشروع كبير (في الأزمات) - الموقف 2؟",
    "options": [
      {
        "text": "أقود فريقاً وأوزع المهام",
        "traits": {
          "leader": 2,
          "teamwork": 1,
          "confidence": 1
        }
      },
      {
        "text": "أعمل بمفردي لضمان الجودة",
        "traits": {
          "independence": 2,
          "logical": 1,
          "teamwork": -1
        }
      },
      {
        "text": "أكون جزءاً من فريق متعاون",
        "traits": {
          "teamwork": 2,
          "social": 1,
          "leader": -1
        }
      },
      {
        "text": "أبتكر أفكاراً وأترك التنفيذ للآخرين",
        "traits": {
          "creative": 2,
          "planner": -1,
          "independence": 1
        }
      }
    ]
  },
  {
    "id": 113,
    "category": "الذكاء",
    "text": "ما هو رد فعلك عند التعرض لانتقاد قاسٍ في العمل (في الأزمات) - الموقف 2؟",
    "options": [
      {
        "text": "أستمع بهدوء وأحاول التحسين",
        "traits": {
          "calm": 2,
          "adaptive": 2,
          "reactive": -1
        }
      },
      {
        "text": "أدافع عن نفسي وأوضح وجهة نظري",
        "traits": {
          "confidence": 2,
          "reactive": 1,
          "logical": 1
        }
      },
      {
        "text": "أشعر بالإحباط وأنسحب مؤقتاً",
        "traits": {
          "emotional": 2,
          "calm": -1,
          "confidence": -1
        }
      },
      {
        "text": "أتجاهل الأمر وأستمر في عملي",
        "traits": {
          "independence": 2,
          "avoidant": 1,
          "reactive": -1
        }
      }
    ]
  },
  {
    "id": 114,
    "category": "الإبداع",
    "text": "عند اتخاذ قرار مصيري، ما هو دافعك الأول (في الأزمات) - الموقف 2؟",
    "options": [
      {
        "text": "البيانات والحقائق الثابتة",
        "traits": {
          "logical": 2,
          "planner": 1,
          "risk": -1
        }
      },
      {
        "text": "شغفي وما يمليه علي قلبي",
        "traits": {
          "emotional": 2,
          "risk": 1,
          "logical": -1
        }
      },
      {
        "text": "نصائح المقربين مني",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "الفرص والمخاطر المحتملة",
        "traits": {
          "risk": 2,
          "ambition": 2,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 115,
    "category": "القيادة",
    "text": "كيف تقضي وقت فراغك عادة (في الأزمات) - الموقف 2؟",
    "options": [
      {
        "text": "في التخطيط وتعلم مهارات جديدة",
        "traits": {
          "ambition": 2,
          "planner": 1,
          "discipline": 1
        }
      },
      {
        "text": "في الخروج مع الأصدقاء والعائلة",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "في ممارسة هوايات إبداعية أو فنية",
        "traits": {
          "creative": 2,
          "independence": 1,
          "social": -1
        }
      },
      {
        "text": "في الراحة والاسترخاء التام",
        "traits": {
          "calm": 2,
          "relaxed": 2,
          "ambition": -1
        }
      }
    ]
  },
  {
    "id": 116,
    "category": "العلاقات الاجتماعية",
    "text": "عندما تواجه مشكلة معقدة وغير متوقعة، كيف تتصرف (عند التعامل مع الغرباء) - الموقف 2؟",
    "options": [
      {
        "text": "أحللها منطقياً وأضع خطة لحلها",
        "traits": {
          "logical": 2,
          "planner": 2,
          "calm": 1,
          "reactive": -1
        }
      },
      {
        "text": "أعتمد على حدسي وتجاربي السابقة",
        "traits": {
          "emotional": 2,
          "adaptive": 1,
          "creative": 1
        }
      },
      {
        "text": "أستشير الآخرين وأطلب مساعدتهم",
        "traits": {
          "social": 2,
          "teamwork": 2,
          "independence": -1
        }
      },
      {
        "text": "أتخذ إجراءً سريعاً ومباشراً",
        "traits": {
          "reactive": 2,
          "risk": 1,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 117,
    "category": "الثقة بالنفس",
    "text": "كيف تفضل العمل على مشروع كبير (عند التعامل مع الغرباء) - الموقف 2؟",
    "options": [
      {
        "text": "أقود فريقاً وأوزع المهام",
        "traits": {
          "leader": 2,
          "teamwork": 1,
          "confidence": 1
        }
      },
      {
        "text": "أعمل بمفردي لضمان الجودة",
        "traits": {
          "independence": 2,
          "logical": 1,
          "teamwork": -1
        }
      },
      {
        "text": "أكون جزءاً من فريق متعاون",
        "traits": {
          "teamwork": 2,
          "social": 1,
          "leader": -1
        }
      },
      {
        "text": "أبتكر أفكاراً وأترك التنفيذ للآخرين",
        "traits": {
          "creative": 2,
          "planner": -1,
          "independence": 1
        }
      }
    ]
  },
  {
    "id": 118,
    "category": "اتخاذ القرار",
    "text": "ما هو رد فعلك عند التعرض لانتقاد قاسٍ في العمل (عند التعامل مع الغرباء) - الموقف 2؟",
    "options": [
      {
        "text": "أستمع بهدوء وأحاول التحسين",
        "traits": {
          "calm": 2,
          "adaptive": 2,
          "reactive": -1
        }
      },
      {
        "text": "أدافع عن نفسي وأوضح وجهة نظري",
        "traits": {
          "confidence": 2,
          "reactive": 1,
          "logical": 1
        }
      },
      {
        "text": "أشعر بالإحباط وأنسحب مؤقتاً",
        "traits": {
          "emotional": 2,
          "calm": -1,
          "confidence": -1
        }
      },
      {
        "text": "أتجاهل الأمر وأستمر في عملي",
        "traits": {
          "independence": 2,
          "avoidant": 1,
          "reactive": -1
        }
      }
    ]
  },
  {
    "id": 119,
    "category": "السيطرة على الغضب",
    "text": "عند اتخاذ قرار مصيري، ما هو دافعك الأول (عند التعامل مع الغرباء) - الموقف 2؟",
    "options": [
      {
        "text": "البيانات والحقائق الثابتة",
        "traits": {
          "logical": 2,
          "planner": 1,
          "risk": -1
        }
      },
      {
        "text": "شغفي وما يمليه علي قلبي",
        "traits": {
          "emotional": 2,
          "risk": 1,
          "logical": -1
        }
      },
      {
        "text": "نصائح المقربين مني",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "الفرص والمخاطر المحتملة",
        "traits": {
          "risk": 2,
          "ambition": 2,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 120,
    "category": "الطموح",
    "text": "كيف تقضي وقت فراغك عادة (عند التعامل مع الغرباء) - الموقف 2؟",
    "options": [
      {
        "text": "في التخطيط وتعلم مهارات جديدة",
        "traits": {
          "ambition": 2,
          "planner": 1,
          "discipline": 1
        }
      },
      {
        "text": "في الخروج مع الأصدقاء والعائلة",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "في ممارسة هوايات إبداعية أو فنية",
        "traits": {
          "creative": 2,
          "independence": 1,
          "social": -1
        }
      },
      {
        "text": "في الراحة والاسترخاء التام",
        "traits": {
          "calm": 2,
          "relaxed": 2,
          "ambition": -1
        }
      }
    ]
  },
  {
    "id": 121,
    "category": "المخاطرة",
    "text": "عندما تواجه مشكلة معقدة وغير متوقعة، كيف تتصرف (في العلاقات الشخصية) - الموقف 2؟",
    "options": [
      {
        "text": "أحللها منطقياً وأضع خطة لحلها",
        "traits": {
          "logical": 2,
          "planner": 2,
          "calm": 1,
          "reactive": -1
        }
      },
      {
        "text": "أعتمد على حدسي وتجاربي السابقة",
        "traits": {
          "emotional": 2,
          "adaptive": 1,
          "creative": 1
        }
      },
      {
        "text": "أستشير الآخرين وأطلب مساعدتهم",
        "traits": {
          "social": 2,
          "teamwork": 2,
          "independence": -1
        }
      },
      {
        "text": "أتخذ إجراءً سريعاً ومباشراً",
        "traits": {
          "reactive": 2,
          "risk": 1,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 122,
    "category": "العاطفة",
    "text": "كيف تفضل العمل على مشروع كبير (في العلاقات الشخصية) - الموقف 2؟",
    "options": [
      {
        "text": "أقود فريقاً وأوزع المهام",
        "traits": {
          "leader": 2,
          "teamwork": 1,
          "confidence": 1
        }
      },
      {
        "text": "أعمل بمفردي لضمان الجودة",
        "traits": {
          "independence": 2,
          "logical": 1,
          "teamwork": -1
        }
      },
      {
        "text": "أكون جزءاً من فريق متعاون",
        "traits": {
          "teamwork": 2,
          "social": 1,
          "leader": -1
        }
      },
      {
        "text": "أبتكر أفكاراً وأترك التنفيذ للآخرين",
        "traits": {
          "creative": 2,
          "planner": -1,
          "independence": 1
        }
      }
    ]
  },
  {
    "id": 123,
    "category": "التفكير المنطقي",
    "text": "ما هو رد فعلك عند التعرض لانتقاد قاسٍ في العمل (في العلاقات الشخصية) - الموقف 2؟",
    "options": [
      {
        "text": "أستمع بهدوء وأحاول التحسين",
        "traits": {
          "calm": 2,
          "adaptive": 2,
          "reactive": -1
        }
      },
      {
        "text": "أدافع عن نفسي وأوضح وجهة نظري",
        "traits": {
          "confidence": 2,
          "reactive": 1,
          "logical": 1
        }
      },
      {
        "text": "أشعر بالإحباط وأنسحب مؤقتاً",
        "traits": {
          "emotional": 2,
          "calm": -1,
          "confidence": -1
        }
      },
      {
        "text": "أتجاهل الأمر وأستمر في عملي",
        "traits": {
          "independence": 2,
          "avoidant": 1,
          "reactive": -1
        }
      }
    ]
  },
  {
    "id": 124,
    "category": "العمل الجماعي",
    "text": "عند اتخاذ قرار مصيري، ما هو دافعك الأول (في العلاقات الشخصية) - الموقف 2؟",
    "options": [
      {
        "text": "البيانات والحقائق الثابتة",
        "traits": {
          "logical": 2,
          "planner": 1,
          "risk": -1
        }
      },
      {
        "text": "شغفي وما يمليه علي قلبي",
        "traits": {
          "emotional": 2,
          "risk": 1,
          "logical": -1
        }
      },
      {
        "text": "نصائح المقربين مني",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "الفرص والمخاطر المحتملة",
        "traits": {
          "risk": 2,
          "ambition": 2,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 125,
    "category": "الاستقلالية",
    "text": "كيف تقضي وقت فراغك عادة (في العلاقات الشخصية) - الموقف 2؟",
    "options": [
      {
        "text": "في التخطيط وتعلم مهارات جديدة",
        "traits": {
          "ambition": 2,
          "planner": 1,
          "discipline": 1
        }
      },
      {
        "text": "في الخروج مع الأصدقاء والعائلة",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "في ممارسة هوايات إبداعية أو فنية",
        "traits": {
          "creative": 2,
          "independence": 1,
          "social": -1
        }
      },
      {
        "text": "في الراحة والاسترخاء التام",
        "traits": {
          "calm": 2,
          "relaxed": 2,
          "ambition": -1
        }
      }
    ]
  },
  {
    "id": 126,
    "category": "الانضباط",
    "text": "عندما تواجه مشكلة معقدة وغير متوقعة، كيف تتصرف (عند تجربة شيء جديد) - الموقف 2؟",
    "options": [
      {
        "text": "أحللها منطقياً وأضع خطة لحلها",
        "traits": {
          "logical": 2,
          "planner": 2,
          "calm": 1,
          "reactive": -1
        }
      },
      {
        "text": "أعتمد على حدسي وتجاربي السابقة",
        "traits": {
          "emotional": 2,
          "adaptive": 1,
          "creative": 1
        }
      },
      {
        "text": "أستشير الآخرين وأطلب مساعدتهم",
        "traits": {
          "social": 2,
          "teamwork": 2,
          "independence": -1
        }
      },
      {
        "text": "أتخذ إجراءً سريعاً ومباشراً",
        "traits": {
          "reactive": 2,
          "risk": 1,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 127,
    "category": "الذكاء",
    "text": "كيف تفضل العمل على مشروع كبير (عند تجربة شيء جديد) - الموقف 2؟",
    "options": [
      {
        "text": "أقود فريقاً وأوزع المهام",
        "traits": {
          "leader": 2,
          "teamwork": 1,
          "confidence": 1
        }
      },
      {
        "text": "أعمل بمفردي لضمان الجودة",
        "traits": {
          "independence": 2,
          "logical": 1,
          "teamwork": -1
        }
      },
      {
        "text": "أكون جزءاً من فريق متعاون",
        "traits": {
          "teamwork": 2,
          "social": 1,
          "leader": -1
        }
      },
      {
        "text": "أبتكر أفكاراً وأترك التنفيذ للآخرين",
        "traits": {
          "creative": 2,
          "planner": -1,
          "independence": 1
        }
      }
    ]
  },
  {
    "id": 128,
    "category": "الإبداع",
    "text": "ما هو رد فعلك عند التعرض لانتقاد قاسٍ في العمل (عند تجربة شيء جديد) - الموقف 2؟",
    "options": [
      {
        "text": "أستمع بهدوء وأحاول التحسين",
        "traits": {
          "calm": 2,
          "adaptive": 2,
          "reactive": -1
        }
      },
      {
        "text": "أدافع عن نفسي وأوضح وجهة نظري",
        "traits": {
          "confidence": 2,
          "reactive": 1,
          "logical": 1
        }
      },
      {
        "text": "أشعر بالإحباط وأنسحب مؤقتاً",
        "traits": {
          "emotional": 2,
          "calm": -1,
          "confidence": -1
        }
      },
      {
        "text": "أتجاهل الأمر وأستمر في عملي",
        "traits": {
          "independence": 2,
          "avoidant": 1,
          "reactive": -1
        }
      }
    ]
  },
  {
    "id": 129,
    "category": "القيادة",
    "text": "عند اتخاذ قرار مصيري، ما هو دافعك الأول (عند تجربة شيء جديد) - الموقف 2؟",
    "options": [
      {
        "text": "البيانات والحقائق الثابتة",
        "traits": {
          "logical": 2,
          "planner": 1,
          "risk": -1
        }
      },
      {
        "text": "شغفي وما يمليه علي قلبي",
        "traits": {
          "emotional": 2,
          "risk": 1,
          "logical": -1
        }
      },
      {
        "text": "نصائح المقربين مني",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "الفرص والمخاطر المحتملة",
        "traits": {
          "risk": 2,
          "ambition": 2,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 130,
    "category": "العلاقات الاجتماعية",
    "text": "كيف تقضي وقت فراغك عادة (عند تجربة شيء جديد) - الموقف 2؟",
    "options": [
      {
        "text": "في التخطيط وتعلم مهارات جديدة",
        "traits": {
          "ambition": 2,
          "planner": 1,
          "discipline": 1
        }
      },
      {
        "text": "في الخروج مع الأصدقاء والعائلة",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "في ممارسة هوايات إبداعية أو فنية",
        "traits": {
          "creative": 2,
          "independence": 1,
          "social": -1
        }
      },
      {
        "text": "في الراحة والاسترخاء التام",
        "traits": {
          "calm": 2,
          "relaxed": 2,
          "ambition": -1
        }
      }
    ]
  },
  {
    "id": 131,
    "category": "الثقة بالنفس",
    "text": "عندما تواجه مشكلة معقدة وغير متوقعة، كيف تتصرف (تحت الضغط) - الموقف 2؟",
    "options": [
      {
        "text": "أحللها منطقياً وأضع خطة لحلها",
        "traits": {
          "logical": 2,
          "planner": 2,
          "calm": 1,
          "reactive": -1
        }
      },
      {
        "text": "أعتمد على حدسي وتجاربي السابقة",
        "traits": {
          "emotional": 2,
          "adaptive": 1,
          "creative": 1
        }
      },
      {
        "text": "أستشير الآخرين وأطلب مساعدتهم",
        "traits": {
          "social": 2,
          "teamwork": 2,
          "independence": -1
        }
      },
      {
        "text": "أتخذ إجراءً سريعاً ومباشراً",
        "traits": {
          "reactive": 2,
          "risk": 1,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 132,
    "category": "اتخاذ القرار",
    "text": "كيف تفضل العمل على مشروع كبير (تحت الضغط) - الموقف 2؟",
    "options": [
      {
        "text": "أقود فريقاً وأوزع المهام",
        "traits": {
          "leader": 2,
          "teamwork": 1,
          "confidence": 1
        }
      },
      {
        "text": "أعمل بمفردي لضمان الجودة",
        "traits": {
          "independence": 2,
          "logical": 1,
          "teamwork": -1
        }
      },
      {
        "text": "أكون جزءاً من فريق متعاون",
        "traits": {
          "teamwork": 2,
          "social": 1,
          "leader": -1
        }
      },
      {
        "text": "أبتكر أفكاراً وأترك التنفيذ للآخرين",
        "traits": {
          "creative": 2,
          "planner": -1,
          "independence": 1
        }
      }
    ]
  },
  {
    "id": 133,
    "category": "السيطرة على الغضب",
    "text": "ما هو رد فعلك عند التعرض لانتقاد قاسٍ في العمل (تحت الضغط) - الموقف 2؟",
    "options": [
      {
        "text": "أستمع بهدوء وأحاول التحسين",
        "traits": {
          "calm": 2,
          "adaptive": 2,
          "reactive": -1
        }
      },
      {
        "text": "أدافع عن نفسي وأوضح وجهة نظري",
        "traits": {
          "confidence": 2,
          "reactive": 1,
          "logical": 1
        }
      },
      {
        "text": "أشعر بالإحباط وأنسحب مؤقتاً",
        "traits": {
          "emotional": 2,
          "calm": -1,
          "confidence": -1
        }
      },
      {
        "text": "أتجاهل الأمر وأستمر في عملي",
        "traits": {
          "independence": 2,
          "avoidant": 1,
          "reactive": -1
        }
      }
    ]
  },
  {
    "id": 134,
    "category": "الطموح",
    "text": "عند اتخاذ قرار مصيري، ما هو دافعك الأول (تحت الضغط) - الموقف 2؟",
    "options": [
      {
        "text": "البيانات والحقائق الثابتة",
        "traits": {
          "logical": 2,
          "planner": 1,
          "risk": -1
        }
      },
      {
        "text": "شغفي وما يمليه علي قلبي",
        "traits": {
          "emotional": 2,
          "risk": 1,
          "logical": -1
        }
      },
      {
        "text": "نصائح المقربين مني",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "الفرص والمخاطر المحتملة",
        "traits": {
          "risk": 2,
          "ambition": 2,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 135,
    "category": "المخاطرة",
    "text": "كيف تقضي وقت فراغك عادة (تحت الضغط) - الموقف 2؟",
    "options": [
      {
        "text": "في التخطيط وتعلم مهارات جديدة",
        "traits": {
          "ambition": 2,
          "planner": 1,
          "discipline": 1
        }
      },
      {
        "text": "في الخروج مع الأصدقاء والعائلة",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "في ممارسة هوايات إبداعية أو فنية",
        "traits": {
          "creative": 2,
          "independence": 1,
          "social": -1
        }
      },
      {
        "text": "في الراحة والاسترخاء التام",
        "traits": {
          "calm": 2,
          "relaxed": 2,
          "ambition": -1
        }
      }
    ]
  },
  {
    "id": 136,
    "category": "العاطفة",
    "text": "عندما تواجه مشكلة معقدة وغير متوقعة، كيف تتصرف (في حياتك اليومية) - الموقف 2؟",
    "options": [
      {
        "text": "أحللها منطقياً وأضع خطة لحلها",
        "traits": {
          "logical": 2,
          "planner": 2,
          "calm": 1,
          "reactive": -1
        }
      },
      {
        "text": "أعتمد على حدسي وتجاربي السابقة",
        "traits": {
          "emotional": 2,
          "adaptive": 1,
          "creative": 1
        }
      },
      {
        "text": "أستشير الآخرين وأطلب مساعدتهم",
        "traits": {
          "social": 2,
          "teamwork": 2,
          "independence": -1
        }
      },
      {
        "text": "أتخذ إجراءً سريعاً ومباشراً",
        "traits": {
          "reactive": 2,
          "risk": 1,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 137,
    "category": "التفكير المنطقي",
    "text": "كيف تفضل العمل على مشروع كبير (في حياتك اليومية) - الموقف 2؟",
    "options": [
      {
        "text": "أقود فريقاً وأوزع المهام",
        "traits": {
          "leader": 2,
          "teamwork": 1,
          "confidence": 1
        }
      },
      {
        "text": "أعمل بمفردي لضمان الجودة",
        "traits": {
          "independence": 2,
          "logical": 1,
          "teamwork": -1
        }
      },
      {
        "text": "أكون جزءاً من فريق متعاون",
        "traits": {
          "teamwork": 2,
          "social": 1,
          "leader": -1
        }
      },
      {
        "text": "أبتكر أفكاراً وأترك التنفيذ للآخرين",
        "traits": {
          "creative": 2,
          "planner": -1,
          "independence": 1
        }
      }
    ]
  },
  {
    "id": 138,
    "category": "العمل الجماعي",
    "text": "ما هو رد فعلك عند التعرض لانتقاد قاسٍ في العمل (في حياتك اليومية) - الموقف 2؟",
    "options": [
      {
        "text": "أستمع بهدوء وأحاول التحسين",
        "traits": {
          "calm": 2,
          "adaptive": 2,
          "reactive": -1
        }
      },
      {
        "text": "أدافع عن نفسي وأوضح وجهة نظري",
        "traits": {
          "confidence": 2,
          "reactive": 1,
          "logical": 1
        }
      },
      {
        "text": "أشعر بالإحباط وأنسحب مؤقتاً",
        "traits": {
          "emotional": 2,
          "calm": -1,
          "confidence": -1
        }
      },
      {
        "text": "أتجاهل الأمر وأستمر في عملي",
        "traits": {
          "independence": 2,
          "avoidant": 1,
          "reactive": -1
        }
      }
    ]
  },
  {
    "id": 139,
    "category": "الاستقلالية",
    "text": "عند اتخاذ قرار مصيري، ما هو دافعك الأول (في حياتك اليومية) - الموقف 2؟",
    "options": [
      {
        "text": "البيانات والحقائق الثابتة",
        "traits": {
          "logical": 2,
          "planner": 1,
          "risk": -1
        }
      },
      {
        "text": "شغفي وما يمليه علي قلبي",
        "traits": {
          "emotional": 2,
          "risk": 1,
          "logical": -1
        }
      },
      {
        "text": "نصائح المقربين مني",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "الفرص والمخاطر المحتملة",
        "traits": {
          "risk": 2,
          "ambition": 2,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 140,
    "category": "الانضباط",
    "text": "كيف تقضي وقت فراغك عادة (في حياتك اليومية) - الموقف 2؟",
    "options": [
      {
        "text": "في التخطيط وتعلم مهارات جديدة",
        "traits": {
          "ambition": 2,
          "planner": 1,
          "discipline": 1
        }
      },
      {
        "text": "في الخروج مع الأصدقاء والعائلة",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "في ممارسة هوايات إبداعية أو فنية",
        "traits": {
          "creative": 2,
          "independence": 1,
          "social": -1
        }
      },
      {
        "text": "في الراحة والاسترخاء التام",
        "traits": {
          "calm": 2,
          "relaxed": 2,
          "ambition": -1
        }
      }
    ]
  },
  {
    "id": 141,
    "category": "الذكاء",
    "text": "عندما تواجه مشكلة معقدة وغير متوقعة، كيف تتصرف (في بيئة العمل) - الموقف 3؟",
    "options": [
      {
        "text": "أحللها منطقياً وأضع خطة لحلها",
        "traits": {
          "logical": 2,
          "planner": 2,
          "calm": 1,
          "reactive": -1
        }
      },
      {
        "text": "أعتمد على حدسي وتجاربي السابقة",
        "traits": {
          "emotional": 2,
          "adaptive": 1,
          "creative": 1
        }
      },
      {
        "text": "أستشير الآخرين وأطلب مساعدتهم",
        "traits": {
          "social": 2,
          "teamwork": 2,
          "independence": -1
        }
      },
      {
        "text": "أتخذ إجراءً سريعاً ومباشراً",
        "traits": {
          "reactive": 2,
          "risk": 1,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 142,
    "category": "الإبداع",
    "text": "كيف تفضل العمل على مشروع كبير (في بيئة العمل) - الموقف 3؟",
    "options": [
      {
        "text": "أقود فريقاً وأوزع المهام",
        "traits": {
          "leader": 2,
          "teamwork": 1,
          "confidence": 1
        }
      },
      {
        "text": "أعمل بمفردي لضمان الجودة",
        "traits": {
          "independence": 2,
          "logical": 1,
          "teamwork": -1
        }
      },
      {
        "text": "أكون جزءاً من فريق متعاون",
        "traits": {
          "teamwork": 2,
          "social": 1,
          "leader": -1
        }
      },
      {
        "text": "أبتكر أفكاراً وأترك التنفيذ للآخرين",
        "traits": {
          "creative": 2,
          "planner": -1,
          "independence": 1
        }
      }
    ]
  },
  {
    "id": 143,
    "category": "القيادة",
    "text": "ما هو رد فعلك عند التعرض لانتقاد قاسٍ في العمل (في بيئة العمل) - الموقف 3؟",
    "options": [
      {
        "text": "أستمع بهدوء وأحاول التحسين",
        "traits": {
          "calm": 2,
          "adaptive": 2,
          "reactive": -1
        }
      },
      {
        "text": "أدافع عن نفسي وأوضح وجهة نظري",
        "traits": {
          "confidence": 2,
          "reactive": 1,
          "logical": 1
        }
      },
      {
        "text": "أشعر بالإحباط وأنسحب مؤقتاً",
        "traits": {
          "emotional": 2,
          "calm": -1,
          "confidence": -1
        }
      },
      {
        "text": "أتجاهل الأمر وأستمر في عملي",
        "traits": {
          "independence": 2,
          "avoidant": 1,
          "reactive": -1
        }
      }
    ]
  },
  {
    "id": 144,
    "category": "العلاقات الاجتماعية",
    "text": "عند اتخاذ قرار مصيري، ما هو دافعك الأول (في بيئة العمل) - الموقف 3؟",
    "options": [
      {
        "text": "البيانات والحقائق الثابتة",
        "traits": {
          "logical": 2,
          "planner": 1,
          "risk": -1
        }
      },
      {
        "text": "شغفي وما يمليه علي قلبي",
        "traits": {
          "emotional": 2,
          "risk": 1,
          "logical": -1
        }
      },
      {
        "text": "نصائح المقربين مني",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "الفرص والمخاطر المحتملة",
        "traits": {
          "risk": 2,
          "ambition": 2,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 145,
    "category": "الثقة بالنفس",
    "text": "كيف تقضي وقت فراغك عادة (في بيئة العمل) - الموقف 3؟",
    "options": [
      {
        "text": "في التخطيط وتعلم مهارات جديدة",
        "traits": {
          "ambition": 2,
          "planner": 1,
          "discipline": 1
        }
      },
      {
        "text": "في الخروج مع الأصدقاء والعائلة",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "في ممارسة هوايات إبداعية أو فنية",
        "traits": {
          "creative": 2,
          "independence": 1,
          "social": -1
        }
      },
      {
        "text": "في الراحة والاسترخاء التام",
        "traits": {
          "calm": 2,
          "relaxed": 2,
          "ambition": -1
        }
      }
    ]
  },
  {
    "id": 146,
    "category": "اتخاذ القرار",
    "text": "عندما تواجه مشكلة معقدة وغير متوقعة، كيف تتصرف (مع أصدقائك) - الموقف 3؟",
    "options": [
      {
        "text": "أحللها منطقياً وأضع خطة لحلها",
        "traits": {
          "logical": 2,
          "planner": 2,
          "calm": 1,
          "reactive": -1
        }
      },
      {
        "text": "أعتمد على حدسي وتجاربي السابقة",
        "traits": {
          "emotional": 2,
          "adaptive": 1,
          "creative": 1
        }
      },
      {
        "text": "أستشير الآخرين وأطلب مساعدتهم",
        "traits": {
          "social": 2,
          "teamwork": 2,
          "independence": -1
        }
      },
      {
        "text": "أتخذ إجراءً سريعاً ومباشراً",
        "traits": {
          "reactive": 2,
          "risk": 1,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 147,
    "category": "السيطرة على الغضب",
    "text": "كيف تفضل العمل على مشروع كبير (مع أصدقائك) - الموقف 3؟",
    "options": [
      {
        "text": "أقود فريقاً وأوزع المهام",
        "traits": {
          "leader": 2,
          "teamwork": 1,
          "confidence": 1
        }
      },
      {
        "text": "أعمل بمفردي لضمان الجودة",
        "traits": {
          "independence": 2,
          "logical": 1,
          "teamwork": -1
        }
      },
      {
        "text": "أكون جزءاً من فريق متعاون",
        "traits": {
          "teamwork": 2,
          "social": 1,
          "leader": -1
        }
      },
      {
        "text": "أبتكر أفكاراً وأترك التنفيذ للآخرين",
        "traits": {
          "creative": 2,
          "planner": -1,
          "independence": 1
        }
      }
    ]
  },
  {
    "id": 148,
    "category": "الطموح",
    "text": "ما هو رد فعلك عند التعرض لانتقاد قاسٍ في العمل (مع أصدقائك) - الموقف 3؟",
    "options": [
      {
        "text": "أستمع بهدوء وأحاول التحسين",
        "traits": {
          "calm": 2,
          "adaptive": 2,
          "reactive": -1
        }
      },
      {
        "text": "أدافع عن نفسي وأوضح وجهة نظري",
        "traits": {
          "confidence": 2,
          "reactive": 1,
          "logical": 1
        }
      },
      {
        "text": "أشعر بالإحباط وأنسحب مؤقتاً",
        "traits": {
          "emotional": 2,
          "calm": -1,
          "confidence": -1
        }
      },
      {
        "text": "أتجاهل الأمر وأستمر في عملي",
        "traits": {
          "independence": 2,
          "avoidant": 1,
          "reactive": -1
        }
      }
    ]
  },
  {
    "id": 149,
    "category": "المخاطرة",
    "text": "عند اتخاذ قرار مصيري، ما هو دافعك الأول (مع أصدقائك) - الموقف 3؟",
    "options": [
      {
        "text": "البيانات والحقائق الثابتة",
        "traits": {
          "logical": 2,
          "planner": 1,
          "risk": -1
        }
      },
      {
        "text": "شغفي وما يمليه علي قلبي",
        "traits": {
          "emotional": 2,
          "risk": 1,
          "logical": -1
        }
      },
      {
        "text": "نصائح المقربين مني",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "الفرص والمخاطر المحتملة",
        "traits": {
          "risk": 2,
          "ambition": 2,
          "calm": -1
        }
      }
    ]
  },
  {
    "id": 150,
    "category": "العاطفة",
    "text": "كيف تقضي وقت فراغك عادة (مع أصدقائك) - الموقف 3؟",
    "options": [
      {
        "text": "في التخطيط وتعلم مهارات جديدة",
        "traits": {
          "ambition": 2,
          "planner": 1,
          "discipline": 1
        }
      },
      {
        "text": "في الخروج مع الأصدقاء والعائلة",
        "traits": {
          "social": 2,
          "teamwork": 1,
          "independence": -1
        }
      },
      {
        "text": "في ممارسة هوايات إبداعية أو فنية",
        "traits": {
          "creative": 2,
          "independence": 1,
          "social": -1
        }
      },
      {
        "text": "في الراحة والاسترخاء التام",
        "traits": {
          "calm": 2,
          "relaxed": 2,
          "ambition": -1
        }
      }
    ]
  }
];
