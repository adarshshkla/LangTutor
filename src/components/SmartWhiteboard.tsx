import React from "react";
import { BookOpen, CheckCircle2, Sparkles, Volume2, AlertCircle } from "lucide-react";
import { GrammarFeedback, VocabularyItem } from "../types";

interface SmartWhiteboardProps {
  boardNotes: string[];
  vocabularySpotlight: VocabularyItem[];
  grammarFeedback: GrammarFeedback | null;
  pronunciationTip?: string;
  onPlayWordAudio: (word: string) => void;
  onSelectWordForTutor: (word: string) => void;
}

export const SmartWhiteboard: React.FC<SmartWhiteboardProps> = ({
  boardNotes,
  vocabularySpotlight,
  grammarFeedback,
  pronunciationTip,
  onPlayWordAudio,
  onSelectWordForTutor,
}) => {
  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto pr-1">
      {/* Grammar Real-time Feedback Alert (if user had a mistake or if perfect) */}
      {grammarFeedback && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 backdrop-blur-md">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm mb-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Grammar & Natural Expression Coach</span>
          </div>

          {grammarFeedback.originalSentence && (
            <div className="text-xs text-slate-400 mb-1">
              Your phrase: <span className="line-through text-rose-400 font-medium">"{grammarFeedback.originalSentence}"</span>
            </div>
          )}

          {grammarFeedback.correctedSentence && (
            <div className="text-sm font-semibold text-emerald-300 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Native phrasing: "{grammarFeedback.correctedSentence}"</span>
            </div>
          )}

          {grammarFeedback.explanation && (
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
              {grammarFeedback.explanation}
            </p>
          )}
        </div>
      )}

      {/* Vocabulary Spotlight */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
            <BookOpen className="w-4 h-4" />
            <span>Vocabulary Spotlight</span>
          </div>
          <span className="text-[11px] text-slate-500 uppercase tracking-wider font-mono">
            Key Lexicon
          </span>
        </div>

        {vocabularySpotlight.length === 0 ? (
          <p className="text-xs text-slate-500 italic">
            Vocabulary highlights will appear here as you speak with the tutor.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2.5">
            {vocabularySpotlight.map((item, idx) => (
              <div
                key={idx}
                className="group p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 transition-all flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <button
                      onClick={() => onSelectWordForTutor(item.word)}
                      className="font-bold text-slate-100 hover:text-blue-300 text-sm transition-colors text-left"
                      title="Ask tutor to explain this word"
                    >
                      {item.word}
                    </button>
                    <span className="text-xs font-mono text-cyan-400">
                      {item.phonetic}
                    </span>
                  </div>
                  <button
                    onClick={() => onPlayWordAudio(item.word)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
                    title="Listen to pronunciation"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-xs text-slate-300">
                  <span className="text-slate-500">Meaning:</span> {item.meaning}
                </div>

                {item.example && (
                  <div className="text-[11px] text-slate-400 italic bg-slate-900/60 px-2 py-1 rounded-lg border border-slate-800/80">
                    "{item.example}"
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pronunciation & Sound Coach Tip */}
      {pronunciationTip && (
        <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold text-cyan-300 block mb-0.5">
              Phonetic & Pronunciation Coach Tip
            </span>
            <span className="text-slate-300 leading-relaxed">{pronunciationTip}</span>
          </div>
        </div>
      )}

      {/* Lesson Takeaways & Board Notes */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Classroom Board Notes</span>
        </div>
        <ul className="space-y-2">
          {boardNotes.map((note, i) => (
            <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
              <span className="text-blue-400 mt-0.5 font-bold">•</span>
              <span className="leading-relaxed">{note}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
