import { LessonTopic, TargetLanguage } from "../types";

export const LANGUAGE_CONFIGS: Record<
  TargetLanguage,
  {
    code: string;
    flag: string;
    nativeName: string;
    defaultVoiceLang: string;
    accentColor: string;
    sampleStarter: string;
    defaultSuggestedReplies: string[];
  }
> = {
  Spanish: {
    code: "es-ES",
    flag: "🇪🇸",
    nativeName: "Español",
    defaultVoiceLang: "es-ES",
    accentColor: "from-amber-500 to-red-500",
    sampleStarter: "¡Hola! Me gustaría practicar mi español contigo.",
    defaultSuggestedReplies: [
      "¡Hola! ¿Cómo estás hoy?",
      "Me gustaría practicar conversación cotidiana.",
      "¿Puedes corregir mi pronunciación y gramática?",
    ],
  },
  French: {
    code: "fr-FR",
    flag: "🇫🇷",
    nativeName: "Français",
    defaultVoiceLang: "fr-FR",
    accentColor: "from-blue-500 to-indigo-600",
    sampleStarter: "Bonjour ! Je voudrais améliorer mon français.",
    defaultSuggestedReplies: [
      "Bonjour ! Comment allez-vous ?",
      "Je voudrais commander quelque chose au café.",
      "Pouvez-vous m'expliquer cette règle de grammaire ?",
    ],
  },
  Japanese: {
    code: "ja-JP",
    flag: "🇯🇵",
    nativeName: "日本語",
    defaultVoiceLang: "ja-JP",
    accentColor: "from-rose-500 to-red-600",
    sampleStarter: "こんにちは！日本語の会話を練習したいです。",
    defaultSuggestedReplies: [
      "こんにちは！お元気ですか？",
      "日常会話を練習したいです。",
      "私の発音をチェックしてもらえますか？",
    ],
  },
  German: {
    code: "de-DE",
    flag: "🇩🇪",
    nativeName: "Deutsch",
    defaultVoiceLang: "de-DE",
    accentColor: "from-amber-600 to-stone-700",
    sampleStarter: "Hallo! Ich möchte mein Deutsch verbessern.",
    defaultSuggestedReplies: [
      "Hallo! Wie geht es dir heute?",
      "Ich möchte gerne Kaffee und Kuchen bestellen.",
      "Kannst du bitte meine Aussprache korrigieren?",
    ],
  },
  Mandarin: {
    code: "zh-CN",
    flag: "🇨🇳",
    nativeName: "普通话",
    defaultVoiceLang: "zh-CN",
    accentColor: "from-red-500 to-amber-500",
    sampleStarter: "你好！我想练习我的中文口语。",
    defaultSuggestedReplies: [
      "你好！你今天怎么样？",
      "我想练习点餐和日常会话。",
      "请帮我纠正发音和声调。",
    ],
  },
  English: {
    code: "en-US",
    flag: "🇬🇧",
    nativeName: "English",
    defaultVoiceLang: "en-US",
    accentColor: "from-emerald-500 to-teal-600",
    sampleStarter: "Hello! I would like to practice conversational English.",
    defaultSuggestedReplies: [
      "Hello! How are you doing today?",
      "I'd like to practice professional communication.",
      "Could you please give me feedback on my pronunciation?",
    ],
  },
  Hindi: {
    code: "hi-IN",
    flag: "🇮🇳",
    nativeName: "हिन्दी",
    defaultVoiceLang: "hi-IN",
    accentColor: "from-orange-500 to-red-600",
    sampleStarter: "नमस्ते! मैं आपके साथ हिन्दी का अभ्यास करना चाहता हूँ।",
    defaultSuggestedReplies: [
      "नमस्ते! आप कैसे हैं?",
      "मैं रोजमर्रा की बातचीत का अभ्यास करना चाहता हूँ।",
      "कृपया मेरे उच्चारण को सुधारें।",
    ],
  },
  Kannada: {
    code: "kn-IN",
    flag: "🇮🇳",
    nativeName: "ಕನ್ನಡ",
    defaultVoiceLang: "kn-IN",
    accentColor: "from-yellow-500 to-red-500",
    sampleStarter: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮೊಂದಿಗೆ ಕನ್ನಡ ಅಭ್ಯಾಸ ಮಾಡಲು ಬಯಸುತ್ತೇನೆ.",
    defaultSuggestedReplies: [
      "ನಮಸ್ಕಾರ! ನೀವು ಹೇಗಿದ್ದೀರಿ?",
      "ನಾನು ದೈನಂದಿನ ಸಂಭಾಷಣೆಯನ್ನು ಕಲಿಯಲು ಬಯಸುತ್ತೇನೆ.",
      "ದಯವಿಟ್ಟು ನನ್ನ ಉಚ್ಚಾರಣೆಯನ್ನು ಸರಿಪಡಿಸಿ.",
    ],
  },
  Gujarati: {
    code: "gu-IN",
    flag: "🇮🇳",
    nativeName: "ગુજરાતી",
    defaultVoiceLang: "gu-IN",
    accentColor: "from-orange-400 to-yellow-600",
    sampleStarter: "નમસ્તે! મારે તમારી સાથે ગુજરાતીમાં વાત કરવી છે.",
    defaultSuggestedReplies: [
      "નમસ્તે! તમે કેમ છો?",
      "મારે રોજિંદી વાતચીત શીખવી છે.",
      "કૃપા કરીને મારા ઉચ્ચારણને સુધારો.",
    ],
  },
  Telugu: {
    code: "te-IN",
    flag: "🇮🇳",
    nativeName: "తెలుగు",
    defaultVoiceLang: "te-IN",
    accentColor: "from-rose-500 to-pink-600",
    sampleStarter: "నమస్కారం! నేను మీతో తెలుగు నేర్చుకోవాలనుకుంటున్నాను.",
    defaultSuggestedReplies: [
      "నమస్కారం! మీరు ఎలా ఉన్నారు?",
      "నేను రోజువారీ సంభాషణలను సాధన చేయాలనుకుంటున్నాను.",
      "దయచేసి నా ఉచ్చారణను సరిదిద్దండి.",
    ],
  },
};

export const LESSON_TOPICS: Record<TargetLanguage, LessonTopic[]> = {
  Spanish: [
    {
      id: "es-cafe",
      title: "Ordering at a Tapas Bar & Cafe",
      description: "Practice ordering coffee, tapas, and asking for the bill in Madrid.",
      category: "conversation",
      starterPrompt: "¡Hola maestro! Estoy en una cafetería en Madrid. ¿Cómo pido un café con leche y una tostada?",
      targetVocab: ["Café con leche", "La cuenta, por favor", "Tostada con tomate", "¿Cuánto cuesta?"],
      practiceSentences: [
        "Buenas tardes, ¿me pone un café con leche templada?",
        "¿Tiene opciones sin gluten en la carta?",
        "Estaba todo delicioso, ¿puedo pagar con tarjeta?",
      ],
    },
    {
      id: "es-grammar-ser-estar",
      title: "Mastering Ser vs. Estar",
      description: "Understand the subtle difference between permanent essence and temporary state.",
      category: "grammar",
      starterPrompt: "¿Puedes explicarme con ejemplos claros cuándo usar 'ser' y cuándo usar 'estar'?",
      targetVocab: ["Esencia", "Estado temporal", "Ubicación", "Características permanentes"],
      practiceSentences: [
        "Soy profesor de idiomas pero hoy estoy cansado.",
        "El restaurante está en el centro y es muy elegante.",
        "La sopa está fría, pero el hielo es frío por naturaleza.",
      ],
    },
    {
      id: "es-pronunciation-rr",
      title: "Rolling the 'RR' & Vowel Crispness",
      description: "Hone tongue placement for the trilled 'rr' and unreduced pure vowels.",
      category: "pronunciation",
      starterPrompt: "Tengo dificultades para pronunciar la doble erre (rr). ¿Cómo coloco la lengua?",
      targetVocab: ["Ferrocarril", "Guitarra", "Perro", "Desarrollar"],
      practiceSentences: [
        "El perro corre rápido por el ferrocarril.",
        "Rodrigo toca la guitarra con ritmo.",
        "El carro rojo de Ramón recorre la carretera.",
      ],
    },
    {
      id: "es-directions",
      title: "Asking for Directions in the City",
      description: "Navigate streets, landmarks, metros, and asking locals for help.",
      category: "vocabulary",
      starterPrompt: "Disculpe, ¿me puede decir cómo llegar a la estación de metro más cercana?",
      targetVocab: ["Girar a la izquierda", "Seguir todo recto", "Semáforo", "A la vuelta"],
      practiceSentences: [
        "Perdone, ¿sabe si hay una farmacia cerca de aquí?",
        "Tuerce a la derecha en la próxima esquina y sigue dos manzanas.",
        "¿A qué distancia queda el museo a pie?",
      ],
    },
  ],
  French: [
    {
      id: "fr-boulangerie",
      title: "At the French Bakery (Boulangerie)",
      description: "Polite French greetings, buying baguettes, croissants, and small talk.",
      category: "conversation",
      starterPrompt: "Bonjour ! Je suis dans une boulangerie parisienne. Comment commander avec politesse ?",
      targetVocab: ["Une baguette tradition", "S'il vous plaît", "Ce sera tout", "Bonne journée"],
      practiceSentences: [
        "Bonjour monsieur, je voudrais une tradition bien cuite, s'il vous plaît.",
        "Est-ce que vous avez encore des croissants aux amandes ?",
        "Merci beaucoup, gardez la monnaie et bonne journée !",
      ],
    },
    {
      id: "fr-nasals",
      title: "French Nasal Vowels (an, in, on)",
      description: "Clear phonetic training for French nasal resonance without pronouncing the 'n'.",
      category: "pronunciation",
      starterPrompt: "Comment faire sonner correctement les voyelles nasales en français sans bloquer l'air ?",
      targetVocab: ["Maison", "Enfant", "Important", "Bonbon"],
      practiceSentences: [
        "Un bon vin blanc et du pain frais sur la table.",
        "L'enfant mange un bonbon dans le jardin.",
        "Le vent souffle doucement sur le pont ancien.",
      ],
    },
  ],
  Japanese: [
    {
      id: "ja-greetings",
      title: "Polite Japanese Greetings & Self-Intro",
      description: "Master Hajimemashite, desu/masu tone, and comfortable introductions.",
      category: "conversation",
      starterPrompt: "こんにちは！自己紹介の丁寧な言い方を教えてください。",
      targetVocab: ["はじめまして", "よろしくお願いします", "趣味は〜です", "出身"],
      practiceSentences: [
        "はじめまして、私は日本語を勉強している学生です。",
        "どうぞよろしくお願いします。",
        "週末は映画を見たり、本を読んだりするのが好きです。",
      ],
    },
    {
      id: "ja-restaurant",
      title: "Ordering Food at an Izakaya or Ramen Shop",
      description: "Calling the staff, asking for recommendations, and expressing deliciousness.",
      category: "vocabulary",
      starterPrompt: "日本の居酒屋で注文するときの自然なフレーズを教えてください。",
      targetVocab: ["すみません", "おすすめは何ですか", "これを二つください", "お会計お願いします"],
      practiceSentences: [
        "すみません、おすすめの料理は何ですか？",
        "温かいお茶とお水をお願いします。",
        "ごちそうさまでした、とても美味しかったです！",
      ],
    },
  ],
  German: [
    {
      id: "de-cafe",
      title: "Ordering Coffee & Cake in Berlin",
      description: "Cafe culture, polite requests, and customary German conversation.",
      category: "conversation",
      starterPrompt: "Hallo! Ich sitze in einem Café in Berlin. Wie bestelle ich höflich Kaffee und Kuchen?",
      targetVocab: ["Einen Kaffee bitte", "Mit Hafermilch", "Zusammen oder getrennt?", "Die Rechnung bitte"],
      practiceSentences: [
        "Ich hätte gerne einen Cappuccino mit Hafermilch, bitte.",
        "Haben Sie auch veganen Apfelkuchen?",
        "Wir möchten bitte getrennt zahlen.",
      ],
    },
  ],
  Mandarin: [
    {
      id: "zh-greetings",
      title: "Mastering the 4 Tones & Daily Greetings",
      description: "Understand tone contours (mā, má, mǎ, mà) and natural conversational flow.",
      category: "pronunciation",
      starterPrompt: "你好老师！请帮我纠正普通话的四个声调，怎样才能说得更自然？",
      targetVocab: ["四声", "你好", "很高兴认识你", "没问题"],
      practiceSentences: [
        "你好！很高兴今天能和你练习中文。",
        "请问这道菜辣不辣？",
        "我很喜欢中国的美食和茶文化。",
      ],
    },
  ],
  English: [
    {
      id: "en-interview",
      title: "Professional Job Interview & Self Pitch",
      description: "Confidently articulate your background, strengths, and collaborative mindset.",
      category: "conversation",
      starterPrompt: "Hello! I have a job interview tomorrow. Can you help me practice answering 'Tell me about yourself'?",
      targetVocab: ["Track record", "Collaborative", "Problem solver", "Core strengths"],
      practiceSentences: [
        "I specialize in building intuitive user experiences and leading cross-functional teams.",
        "One of my greatest strengths is turning complex challenges into clear milestones.",
        "I am excited about this role because it aligns with my passion for innovation.",
      ],
    },
  ],
  Hindi: [
    {
      id: "hi-greetings",
      title: "Namaste & Daily Greetings",
      description: "Learn essential polite greetings, asking how someone is doing, and showing respect.",
      category: "conversation",
      starterPrompt: "नमस्ते! मुझे आम बातचीत और अभिवादन का अभ्यास करना है।",
      targetVocab: ["नमस्ते", "आप कैसे हैं?", "मैं ठीक हूँ", "धन्यवाद"],
      practiceSentences: [
        "नमस्ते! आपसे मिलकर बहुत खुशी हुई।",
        "आप कैसे हैं? सब ठीक है?",
        "मैं ठीक हूँ, आपका बहुत-बहुत धन्यवाद।",
      ],
    },
  ],
  Kannada: [
    {
      id: "kn-greetings",
      title: "Basic Greetings in Kannada",
      description: "Start conversations, ask about wellbeing, and show politeness in Karnataka.",
      category: "conversation",
      starterPrompt: "ನಮಸ್ಕಾರ! ನಾನು ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಲು ಕಲಿಯಬೇಕು.",
      targetVocab: ["ನಮಸ್ಕಾರ", "ಹೇಗಿದ್ದೀರಿ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೀನಿ", "ಧನ್ಯವಾದಗಳು"],
      practiceSentences: [
        "ನಮಸ್ಕಾರ! ನಿಮ್ಮನ್ನು ಭೇಟಿಯಾಗಿದ್ದು ಸಂತೋಷವಾಯಿತು.",
        "ನೀವು ಹೇಗಿದ್ದೀರಿ? ಊಟ ಆಯ್ತಾ?",
        "ನಾನು ಚೆನ್ನಾಗಿದ್ದೀನಿ, ಧನ್ಯವಾದಗಳು.",
      ],
    },
  ],
  Gujarati: [
    {
      id: "gu-greetings",
      title: "Kem Cho? (How are you?)",
      description: "The classic Gujarati greeting and polite conversation starters.",
      category: "conversation",
      starterPrompt: "નમસ્તે! મારે ગુજરાતીમાં વાતચીત શરૂ કરવી છે.",
      targetVocab: ["નમસ્તે", "કેમ છો?", "મજામાં", "આભાર"],
      practiceSentences: [
        "નમસ્તે! તમને મળીને આનંદ થયો.",
        "તમે કેમ છો? બધું બરાબર ને?",
        "હું એકદમ મજામાં છું, આભાર.",
      ],
    },
  ],
  Telugu: [
    {
      id: "te-greetings",
      title: "Namaskaram & Politeness",
      description: "Learn respectful greetings and basic introductions in Telugu.",
      category: "conversation",
      starterPrompt: "నమస్కారం! నేను తెలుగులో మాట్లాడటం నేర్చుకోవాలనుకుంటున్నాను.",
      targetVocab: ["నమస్కారం", "ఎలా ఉన్నారు?", "బాగున్నాను", "ధన్యవాదాలు"],
      practiceSentences: [
        "నమస్కారం! మిమ్మల్ని కలవడం చాలా సంతోషంగా ఉంది.",
        "మీరు ఎలా ఉన్నారు? అంతా బాగుందా?",
        "నేను బాగున్నాను, ధన్యవాదాలు.",
      ],
    },
  ],
};
