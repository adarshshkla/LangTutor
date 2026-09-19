export type GestureType =
  | "idle"
  | "speaking"
  | "explaining"
  | "welcoming"
  | "praising"
  | "pointing"
  | "thinking"
  | "encouraging"
  | "listening";

export type TargetLanguage =
  | "Spanish"
  | "French"
  | "Japanese"
  | "German"
  | "Mandarin"
  | "English"
  | "Hindi"
  | "Kannada"
  | "Gujarati"
  | "Telugu";

export type ProficiencyLevel =
  | "Beginner (A1-A2)"
  | "Intermediate (B1-B2)"
  | "Advanced (C1-C2)";

export interface VocabularyItem {
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
}

export interface GrammarFeedback {
  hasMistake?: boolean;
  originalSentence?: string;
  correctedSentence?: string;
  explanation?: string;
  ruleKey?: string;
}

export interface TutorResponse {
  spokenText: string;
  translation: string;
  gesture: GestureType;
  boardNotes: string[];
  grammarFeedback: GrammarFeedback | null;
  vocabularySpotlight: VocabularyItem[];
  pronunciationTip?: string;
  suggestedReplies?: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "tutor";
  text: string;
  translation?: string;
  timestamp: string;
  gesture?: GestureType;
  feedback?: GrammarFeedback | null;
  vocabulary?: VocabularyItem[];
  boardNotes?: string[];
  audioPlayed?: boolean;
}

export interface PhonemeHeatmapTile {
  phoneme: string;
  ipa: string;
  word: string;
  clarityScore: number; // 0 to 100
  intensity: "crystal-clear" | "acceptable" | "muffled" | "distorted";
  status: "good" | "needs-work" | "accent-tip";
  frequencyBand?: "low" | "mid" | "high";
  tip?: string;
}

export interface PronunciationEvaluation {
  accuracyScore: number;
  pronunciationScore: number;
  phonemeClarityScore?: number; // Score out of 100 for phoneme clarity
  feedback: string;
  gesture: GestureType;
  phoneticBreakdown: {
    word: string;
    ipa: string;
    status: "good" | "needs-work" | "accent-tip";
  }[];
  soundHeatmap?: PhonemeHeatmapTile[];
  encouragement?: string;
}

export interface GrammarIssueItem {
  original: string;
  corrected: string;
  issueType: "syntax" | "tense" | "agreement" | "preposition" | "spelling" | "nuance";
  explanation: string;
}

export interface NuanceVariation {
  register: "Casual & Colloquial" | "Polite & Conversational" | "Formal & Business" | "Literary & Expressive";
  sentence: string;
  explanation: string;
}

export interface VocabularyUpgrade {
  originalWord: string;
  suggestedWord: string;
  reason: string;
}

export interface TextAnalysisResult {
  originalText: string;
  correctedText: string;
  isFlawless: boolean;
  naturalnessScore: number; // 0 to 100
  formalityLevel: "Casual" | "Neutral" | "Semi-Formal" | "Formal / Business";
  toneDescription: string;
  grammarIssues: GrammarIssueItem[];
  nuanceVariations: NuanceVariation[];
  vocabularyUpgrades: VocabularyUpgrade[];
  pedagogicalSummary: string;
}

export interface LessonTopic {
  id: string;
  title: string;
  description: string;
  category: "conversation" | "vocabulary" | "grammar" | "pronunciation";
  starterPrompt: string;
  targetVocab: string[];
  practiceSentences: string[];
}

export type LearningGoal =
  | "Travel & Tourism"
  | "Career & Business"
  | "Academic & Exams"
  | "Daily Conversation & Socializing"
  | "Culture, Cinema & Literature"
  | "Brain Fitness & Personal Interest";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  targetLanguage: TargetLanguage;
  proficiencyLevel: ProficiencyLevel;
  learningGoal: LearningGoal;
  dailyGoalMinutes: number;
  nativeLanguage: string;
  isOnboarded: boolean;
  avatarIcon?: string;
  createdAt: string;
}

export interface TeachingModuleProgress {
  userId: string;
  targetLanguage: TargetLanguage;
  completedLessonIds: string[];
  currentModuleId: string;
  currentLessonId: string;
  currentLessonTitle: string;
  currentTopicId?: string;
  progressPercentage: number;
  completedCount: number;
  totalLessons: number;
  lastActiveDate: string;
  updatedAt?: any;
}

