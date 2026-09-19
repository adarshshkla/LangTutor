import { TargetLanguage } from "../../types";

export type CEFRLevel = "A1 - Beginner" | "A2 - Elementary" | "B1 - Intermediate" | "B2 - Advanced";

export interface StepLesson {
  id: string;
  stepNumber: number;
  title: string;
  summary: string;
  grammarFocus: string;
  keyPhrases: { text: string; phonetic: string; translation: string }[];
  starterPrompt: string;
  estimatedMinutes: number;
  isCompleted?: boolean;
}

export interface CurriculumModule {
  id: string;
  level: CEFRLevel;
  title: string;
  description: string;
  badge: string;
  color: string;
  lessons: StepLesson[];
}

export interface StepByStepCurriculumProps {
  targetLanguage: TargetLanguage;
  nativeLanguage?: string;
  userId?: string;
  currentTopicId?: string;
  onSelectTopic: (topicId: string, starterPrompt: string, lessonTitle?: string) => void;
  onSpeakPhrase: (text: string) => void;
}
