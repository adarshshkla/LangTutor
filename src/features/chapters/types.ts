import { TargetLanguage } from "../../types";

export type ChapterCEFR = "A1" | "A2" | "B1" | "B2" | "C1";

export interface VocabWord {
  id: string;
  word: string;
  ipa: string;
  meaning: string;
  partOfSpeech: "noun" | "verb" | "adjective" | "adverb" | "phrase" | "idiom";
  exampleSentence: string;
  exampleTranslation?: string;
  collocations?: string[];
}

export interface ChapterQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface VocabChapter {
  id: string;
  chapterNumber: number;
  title: string;
  subtitle: string;
  cefrLevel: ChapterCEFR;
  badge: string;
  category: string;
  iconName: string;
  summary: string;
  words: VocabWord[];
  quizQuestions: ChapterQuizQuestion[];
}

export interface GrammarRuleExample {
  correct: string;
  incorrect?: string;
  explanation: string;
}

export interface GrammarChapter {
  id: string;
  chapterNumber: number;
  title: string;
  subtitle: string;
  cefrLevel: ChapterCEFR;
  badge: string;
  summary: string;
  formula: string;
  deepExplanation: string;
  keyRules: string[];
  commonPitfalls: string[];
  examples: GrammarRuleExample[];
  practiceExercises: ChapterQuizQuestion[];
  practicePrompt: string;
}

export interface UserChapterProgress {
  completedVocabChapterIds: string[];
  completedGrammarChapterIds: string[];
  masteredWordIds: string[];
  chapterScores: Record<string, number>;
}
