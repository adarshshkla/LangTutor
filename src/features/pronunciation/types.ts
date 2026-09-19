import { TargetLanguage, GestureType, PronunciationEvaluation } from "../../types";

export type MouthShape = "A" | "E" | "I" | "O" | "U" | "M" | "F" | "TH" | "L" | "R" | "REST";

export interface AccentStep {
  id: string;
  level: "Basic" | "Intermediate" | "Advanced";
  title: string;
  subtitle: string;
  conceptDescription: string;
  nativeLanguageComparisonTip: string;
  ruleSummary: string;
  rhythmType: "syllable-timed" | "stress-timed" | "mora-timed";
  exampleSentence: string;
  phoneticSpelling: string;
  translation: string;
  stressIndices: number[]; // which syllables take tonic accent
  pitchContour: ("low" | "mid" | "high" | "rise" | "fall")[];
  practiceDrills: {
    phrase: string;
    focusNote: string;
    expectedPace: "slow" | "natural" | "brisk";
  }[];
}

export interface PronunciationFeatureProps {
  targetLanguage: TargetLanguage;
  langCode: string;
  nativeLanguage?: string;
  userId?: string;
  practiceSentences?: string[];
  onTriggerGesture?: (gesture: GestureType) => void;
  onSpeakText: (text: string) => void;
}
