import React, { useState } from "react";
import {
  Activity,
  Flame,
  Volume2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sliders,
  Zap,
} from "lucide-react";
import { PhonemeHeatmapTile } from "../types";
import { speechCtrl } from "./SpeechController";

interface SoundHeatmapVisualizerProps {
  soundHeatmap?: PhonemeHeatmapTile[];
  phonemeClarityScore?: number;
  accuracyScore: number;
  pronunciationScore: number;
  targetLanguage: string;
  langCode: string;
  onPlayAudio?: (text: string) => void;
}

export const SoundHeatmapVisualizer: React.FC<SoundHeatmapVisualizerProps> = ({
  soundHeatmap = [],
  phonemeClarityScore,
  accuracyScore,
  pronunciationScore,
  targetLanguage,
  langCode,
  onPlayAudio,
}) => {
  const [activeTile, setActiveTile] = useState<PhonemeHeatmapTile | null>(
    soundHeatmap[0] || null
  );

  // Fallback clarity score calculation if not explicitly set
  const effectiveClarityScore =
    phonemeClarityScore ??
    (soundHeatmap.length > 0
      ? Math.round(
          soundHeatmap.reduce((acc, curr) => acc + curr.clarityScore, 0) /
            soundHeatmap.length
        )
      : Math.round((accuracyScore + pronunciationScore) / 2));

  // Determine clarity band rating
  const getClarityBand = (score: number) => {
    if (score >= 90) {
      return {
        label: "Crystal Clear Articulation",
        color: "text-emerald-400",
        badgeBg: "bg-emerald-950/80 border-emerald-800 text-emerald-300",
        description: "Optimal formant alignment with crisp consonant bursts and open vowel resonances.",
      };
    }
    if (score >= 75) {
      return {
        label: "Good Phonemic Clarity",
        color: "text-cyan-400",
        badgeBg: "bg-cyan-950/80 border-cyan-800 text-cyan-300",
        description: "Clear and intelligible speech with minor natural vowel reductions.",
      };
    }
    if (score >= 60) {
      return {
        label: "Mild Acoustic Reduction",
        color: "text-amber-400",
        badgeBg: "bg-amber-950/80 border-amber-800 text-amber-300",
        description: "Certain syllables lacked vocal projection or exhibited slight phoneme blurring.",
      };
    }
    return {
      label: "Indistinct Phonemes",
      color: "text-rose-400",
      badgeBg: "bg-rose-950/80 border-rose-800 text-rose-300",
      description: "Phonemes were muffled or swallowed. Focus on slower syllable pacing and deliberate mouth opening.",
    };
  };

  const clarityBand = getClarityBand(effectiveClarityScore);

  const handlePlayPhoneme = (tile: PhonemeHeatmapTile) => {
    if (onPlayAudio) {
      onPlayAudio(tile.word);
    } else {
      speechCtrl.speak(tile.word, langCode, 0.85);
    }
  };

  return (
    <div className="rounded-2xl bg-slate-950/90 border border-slate-800 p-4 sm:p-5 flex flex-col gap-4 shadow-xl">
      {/* Visual Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-100">
                Acoustic Sound Heatmap & Phoneme Clarity
              </h4>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-orange-950/80 text-orange-300 border border-orange-800/80 font-mono">
                Spectrographic Feedback
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Visual acoustic resonance and formant clarity mapped across each spoken phoneme.
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400 self-start sm:self-auto">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span>90-100 (Clear)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
            <span>70-89 (Fair)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
            <span>&lt;70 (Muffled)</span>
          </div>
        </div>
      </div>

      {/* Primary Metrics Row: Accuracy, Pronunciation, and Phoneme Clarity Score / 100 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Core Phoneme Clarity Score (Featured) */}
        <div className="sm:col-span-1 p-4 rounded-xl bg-gradient-to-b from-orange-950/40 to-slate-900 border border-orange-800/50 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-orange-300 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-orange-400" />
              Phoneme Clarity Score
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${clarityBand.badgeBg}`}>
              Band: {effectiveClarityScore >= 80 ? "A" : effectiveClarityScore >= 65 ? "B" : "C"}
            </span>
          </div>

          <div className="my-2 flex items-baseline gap-2">
            <span className={`text-4xl font-black tracking-tight ${clarityBand.color}`}>
              {effectiveClarityScore}
            </span>
            <span className="text-xs text-slate-400 font-semibold">/ 100 Clarity</span>
          </div>

          <div className="space-y-1 pt-1 border-t border-slate-800/80">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Rating:</span>
              <span className={`font-semibold ${clarityBand.color}`}>
                {clarityBand.label}
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  effectiveClarityScore >= 85
                    ? "bg-emerald-500"
                    : effectiveClarityScore >= 70
                    ? "bg-amber-500"
                    : "bg-rose-500"
                }`}
                style={{ width: `${Math.min(100, Math.max(0, effectiveClarityScore))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Overall Accuracy Score */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Speech Recognition Accuracy
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-1.5">
            <div className="text-3xl font-black text-emerald-400">
              {accuracyScore}%
            </div>
            <span className="text-[11px] text-slate-500">
              Lexical & word recognition match
            </span>
          </div>
          <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${accuracyScore}%` }}
            />
          </div>
        </div>

        {/* Overall Pronunciation & Intonation Score */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Accent & Cadence
            </span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-1.5">
            <div className="text-3xl font-black text-cyan-400">
              {pronunciationScore}%
            </div>
            <span className="text-[11px] text-slate-500">
              Vowel duration & pitch cadence
            </span>
          </div>
          <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-cyan-500 rounded-full"
              style={{ width: `${pronunciationScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Sound Heatmap Spectral Ribbon */}
      <div className="space-y-2.5 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            Phoneme Heatmap Spectrum (Click to Inspect)
          </span>
          <span className="text-[11px] text-slate-500">
            {soundHeatmap.length} acoustic segments analyzed
          </span>
        </div>

        {/* The Interactive Heatmap Tiles Ribbon */}
        {soundHeatmap.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {soundHeatmap.map((tile, idx) => {
              const isSelected = activeTile?.phoneme === tile.phoneme && activeTile?.word === tile.word;
              const bgClass =
                tile.clarityScore >= 85
                  ? "bg-emerald-950/70 border-emerald-700/80 text-emerald-200 hover:bg-emerald-900"
                  : tile.clarityScore >= 70
                  ? "bg-amber-950/70 border-amber-700/80 text-amber-200 hover:bg-amber-900"
                  : "bg-rose-950/70 border-rose-700/80 text-rose-200 hover:bg-rose-900";

              return (
                <button
                  key={idx}
                  onClick={() => setActiveTile(tile)}
                  className={`flex flex-col items-center justify-center min-w-[54px] px-3 py-2 rounded-xl border transition-all cursor-pointer ${bgClass} ${
                    isSelected
                      ? "ring-2 ring-white scale-105 shadow-lg shadow-orange-500/20"
                      : "opacity-90 hover:opacity-100"
                  }`}
                >
                  <span className="font-mono text-sm font-bold tracking-wide">
                    {tile.phoneme}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 opacity-80 mt-0.5">
                    {tile.ipa}
                  </span>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-[10px] font-black">{tile.clarityScore}</span>
                    <span className="text-[8px] text-slate-400">pts</span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="p-4 text-center text-xs text-slate-500">
            Record your pronunciation to generate the granular phoneme heatmap ribbon.
          </div>
        )}

        {/* Selected Tile Inspector Drawer */}
        {activeTile && (
          <div className="mt-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center font-mono text-lg font-bold border ${
                  activeTile.clarityScore >= 85
                    ? "bg-emerald-950 text-emerald-300 border-emerald-700"
                    : activeTile.clarityScore >= 70
                    ? "bg-amber-950 text-amber-300 border-amber-700"
                    : "bg-rose-950 text-rose-300 border-rose-700"
                }`}
              >
                {activeTile.phoneme}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200">
                    Word Context: <span className="text-white underline font-semibold">{activeTile.word}</span>
                  </span>
                  <span className="font-mono text-xs text-slate-400">
                    [{activeTile.ipa}]
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${
                      activeTile.clarityScore >= 85
                        ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                        : activeTile.clarityScore >= 70
                        ? "bg-amber-950 text-amber-300 border-amber-800"
                        : "bg-rose-950 text-rose-300 border-rose-800"
                    }`}
                  >
                    {activeTile.clarityScore} / 100 ({activeTile.intensity})
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {activeTile.tip || "Maintain steady vocal cord vibration and firm articulatory contact."}
                </p>
              </div>
            </div>

            <button
              onClick={() => handlePlayPhoneme(activeTile)}
              className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
              title="Hear word pronunciation"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Listen Word</span>
            </button>
          </div>
        )}
      </div>

      {/* Educational Formant Clarity Note */}
      <div className="text-[11px] text-slate-400 bg-slate-900/40 p-3 rounded-xl border border-slate-800/60 flex items-start gap-2">
        <HelpCircle className="w-4 h-4 text-orange-400/80 shrink-0 mt-0.2" />
        <div>
          <span className="font-semibold text-slate-300">How Phoneme Clarity is Calculated:</span>{" "}
          Each syllable is evaluated on formant stability, consonant closure timing, and vowel opening resonance compared against standard native acoustic models in {targetLanguage}.
        </div>
      </div>
    </div>
  );
};
