import React, { useState } from "react";
import { Mic, Volume2, Sparkles, Music, BookOpen, Layers, Award } from "lucide-react";
import { TargetLanguage, GestureType } from "../../types";
import { PronunciationTrainer } from "../../components/PronunciationTrainer";
import { PhoneticMouthVisualizer } from "../../components/PhoneticMouthVisualizer";
import { AccentCoach } from "./AccentCoach";

export interface PronunciationSuiteProps {
  targetLanguage: TargetLanguage;
  langCode: string;
  nativeLanguage?: string;
  userId?: string;
  practiceSentences?: string[];
  onTriggerGesture?: (gesture: GestureType) => void;
  onSpeakText: (text: string) => void;
}

export const PronunciationSuite: React.FC<PronunciationSuiteProps> = ({
  targetLanguage,
  langCode,
  nativeLanguage = "English",
  userId,
  practiceSentences,
  onTriggerGesture,
  onSpeakText,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"speech-lab" | "accent-coach">("speech-lab");

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto pr-1">
      {/* Top Suite Bar & Sub-feature Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Phonetics, Pronunciation & Accent Lab
            </h2>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
              2D Anatomical Mode
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pure 2D speech physics and articulatory diagrams designed for precise motor mastery.
          </p>
        </div>

        {/* Sub-tab selection */}
        <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 self-start sm:self-auto">
          <button
            id="subtab-speech-lab"
            onClick={() => setActiveSubTab("speech-lab")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === "speech-lab"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Speech & 2D Mouth Lab</span>
          </button>

          <button
            id="subtab-accent-coach"
            onClick={() => setActiveSubTab("accent-coach")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === "accent-coach"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Step-by-Step Accent & Rhythm</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {activeSubTab === "speech-lab" ? (
        <div className="flex flex-col gap-4">
          <PronunciationTrainer
            targetLanguage={targetLanguage}
            langCode={langCode}
            userId={userId}
            practiceSentences={practiceSentences}
            onTriggerGesture={onTriggerGesture}
            onSpeakText={onSpeakText}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <AccentCoach
            targetLanguage={targetLanguage}
            nativeLanguage={nativeLanguage}
            onSpeakText={onSpeakText}
          />
        </div>
      )}
    </div>
  );
};
