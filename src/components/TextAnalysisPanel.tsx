import React, { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Volume2,
  Send,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Sliders,
  Feather,
  FileText,
  HelpCircle,
  TrendingUp,
} from "lucide-react";
import { TargetLanguage, TextAnalysisResult } from "../types";
import { speechCtrl } from "./SpeechController";

interface TextAnalysisPanelProps {
  targetLanguage: TargetLanguage;
  nativeLanguage?: string;
  langCode: string;
  onSendToChat?: (text: string) => void;
  onSendToSmartboard?: (notes: string[], spotlightWord?: string) => void;
  onSpeakText?: (text: string) => void;
}

export const TextAnalysisPanel: React.FC<TextAnalysisPanelProps> = ({
  targetLanguage,
  nativeLanguage = "English",
  langCode,
  onSendToChat,
  onSendToSmartboard,
  onSpeakText,
}) => {
  const [inputText, setInputText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<TextAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Suggested starter sentences for quick testing
  const sampleSentences: Record<TargetLanguage, { label: string; text: string }[]> = {
    English: [
      { label: "Common Mistake", text: "I am having a car since two years and it is more better." },
      { label: "Job Interview", text: "I want to apply for this job because I am good in programming and work hard." },
      { label: "Formal Email", text: "I write to ask you if you can give me some informations about the meeting." },
      { label: "Everyday Chit-chat", text: "Hey mate, I was wondering if you feel like catching a coffee later on?" },
    ],
    Spanish: [
      { label: "Common Mistake", text: "Yo soy teniendo mucho hambre y quiero la comida rapido." },
      { label: "Job Interview", text: "Tengo mucho interés en este puesto porque mis habilidades son buenas para la empresa." },
      { label: "Formal Email", text: "Le escribo para solicitar información sobre el horario de la reunión de mañana." },
      { label: "Everyday Chit-chat", text: "¿Qué onda? ¿Te gustaría ir por un café esta tarde después del trabajo?" },
    ],
    French: [
      { label: "Common Mistake", text: "Je suis très faim et je veux visiter à mes amis." },
      { label: "Formal Email", text: "Je vous écris afin d'obtenir de plus amples informations concernant votre programme." },
      { label: "Everyday Chit-chat", text: "Salut! Ça te dit de boire un verre ce soir en terrasse?" },
      { label: "Job Application", text: "Je me permets de vous soumettre ma candidature pour le poste de gestionnaire." },
    ],
    German: [
      { label: "Common Mistake", text: "Ich bin kalt und ich will gehen zu Hause jetzt." },
      { label: "Formal Email", text: "Sehr geehrte Damen und Herren, ich bitte um Auskunft bezüglich des Termins." },
      { label: "Everyday Chit-chat", text: "Hallo! Hast du heute Lust, zusammen einen Kaffee zu trinken?" },
      { label: "Job Application", text: "Mit großem Interesse bewerbe ich mich um die ausgeschriebene Stelle." },
    ],
    Mandarin: [
      { label: "Common Mistake", text: "我是很高兴认识你，我有三个岁学习中文。" },
      { label: "Formal Email", text: "尊敬的老师，我想咨询一下关于下周课程的安排情况。" },
      { label: "Everyday Chit-chat", text: "周末你有空吗？我们一起去喝杯咖啡聊天吧！" },
      { label: "Polite Request", text: "麻烦您帮我看一眼这份报告，非常感谢您的指点。" },
    ],
    Japanese: [
      { label: "Common Mistake", text: "私は日本語を上手に話すことができますが、まだ下手です。" },
      { label: "Formal Email", text: "お世話になっております。明日の会議の議題についてご確認をお願い申し上げます。" },
      { label: "Everyday Chit-chat", text: "今度の週末、もし時間があったらカフェでお茶しない？" },
      { label: "Polite Request", text: "恐れ入りますが、こちらの書類のご確認をお願いできますでしょうか。" },
    ],
    Hindi: [],
    Gujarati: [],
    Kannada: [],
    Telugu: [],
  };

  const activeSamples = sampleSentences[targetLanguage] || sampleSentences.English;

  const handleAnalyze = async (textToAnalyze?: string) => {
    const text = (textToAnalyze || inputText).trim();
    if (!text) return;

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/tutor/analyze-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          targetLanguage,
          nativeLanguage,
          level: "Intermediate (B1-B2)",
        }),
      });

      if (!res.ok) {
        throw new Error("Analysis failed. Please check network or try again.");
      }

      const data: TextAnalysisResult = await res.json();
      setAnalysisResult(data);
    } catch (err) {
      console.error("Text analysis error:", err);
      setErrorMessage(err instanceof Error ? err.message : "Failed to analyze text");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handlePlayVoice = (text: string) => {
    if (onSpeakText) {
      onSpeakText(text);
    } else {
      speechCtrl.speak(text, langCode, 0.95);
    }
  };

  const handleProjectToBoard = () => {
    if (!analysisResult) return;
    const notes = [
      `Text Analysis: "${analysisResult.originalText.slice(0, 35)}..."`,
      `Tone & Register: ${analysisResult.formalityLevel} (${analysisResult.toneDescription.slice(0, 45)})`,
      analysisResult.isFlawless
        ? `Result: Grammatically flawless! Naturalness: ${analysisResult.naturalnessScore}/100`
        : `Refined: "${analysisResult.correctedText.slice(0, 45)}"`,
    ];
    const topWord = analysisResult.vocabularyUpgrades?.[0]?.suggestedWord;
    onSendToSmartboard?.(notes, topWord);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4 text-slate-100">
      {/* Intro Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-slate-100">
              AI Written Text & Nuance Analysis
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800/60 font-semibold">
              Grammar • Tone • Register
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Paste written sentences in {targetLanguage} to receive instant grammatical corrections, tone breakdown, and native nuances.
          </p>
        </div>

        {analysisResult && (
          <button
            onClick={() => {
              setAnalysisResult(null);
              setInputText("");
            }}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors"
            title="Start fresh"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Input Area */}
      <div className="space-y-2">
        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                handleAnalyze();
              }
            }}
            placeholder={`Paste or type a sentence in ${targetLanguage} here (e.g. from an email, essay, or message)...`}
            rows={3}
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl p-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 resize-none transition-all leading-relaxed"
          />
          {inputText && (
            <div className="absolute right-3 bottom-3 text-[10px] text-slate-500 font-mono">
              {inputText.trim().split(/\s+/).filter(Boolean).length} words
            </div>
          )}
        </div>

        {/* Quick Test Samples */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-[11px] text-slate-400 shrink-0 flex items-center gap-1">
            <FileText className="w-3 h-3 text-purple-400" />
            Try sample:
          </span>
          {activeSamples.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputText(sample.text);
                handleAnalyze(sample.text);
              }}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-800/80 hover:bg-purple-950/60 text-slate-300 hover:text-purple-200 border border-slate-700/60 hover:border-purple-700/60 whitespace-nowrap transition-all cursor-pointer"
            >
              {sample.label}
            </button>
          ))}
        </div>

        {/* Action button */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-500 hidden sm:inline-block">
            Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400">Ctrl+Enter</kbd> to analyze
          </span>

          <button
            onClick={() => handleAnalyze()}
            disabled={isAnalyzing || !inputText.trim()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white flex items-center justify-center gap-2 transition-all shadow-md shadow-purple-600/20 cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Analyzing Nuance & Grammar...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Analyze Grammar & Nuance</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error display */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Results View */}
      {analysisResult && (
        <div className="space-y-4 pt-2 border-t border-slate-800/90 animate-fadeIn">
          {/* Top Metric Cards: Naturalness & Formality */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Naturalness Gauge */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">
                  Naturalness Score
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className={`text-2xl font-black ${
                    analysisResult.naturalnessScore >= 85
                      ? "text-emerald-400"
                      : analysisResult.naturalnessScore >= 70
                      ? "text-amber-400"
                      : "text-rose-400"
                  }`}>
                    {analysisResult.naturalnessScore}%
                  </span>
                  <span className="text-[10px] text-slate-500">native flow</span>
                </div>
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-400/80" />
            </div>

            {/* Formality Level */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">
                  Register & Formality
                </span>
                <span className="text-sm font-bold text-purple-300 block mt-1">
                  {analysisResult.formalityLevel}
                </span>
              </div>
              <Sliders className="w-5 h-5 text-purple-400/80" />
            </div>

            {/* Status Summary */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">
                  Grammar Health
                </span>
                <span className={`text-xs font-bold block mt-1 ${
                  analysisResult.isFlawless ? "text-emerald-400" : "text-amber-400"
                }`}>
                  {analysisResult.isFlawless
                    ? "Flawless Grammar"
                    : `${analysisResult.grammarIssues.length} Correction${analysisResult.grammarIssues.length > 1 ? "s" : ""}`}
                </span>
              </div>
              {analysisResult.isFlawless ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-400" />
              )}
            </div>
          </div>

          {/* Tone & Pedagogical Overview */}
          <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-900/40 text-xs text-purple-200 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 font-bold text-purple-300">
              <Feather className="w-3.5 h-3.5" />
              <span>Linguistic Tone Assessment</span>
            </div>
            <p className="leading-relaxed text-slate-300">
              {analysisResult.toneDescription}
            </p>
            <p className="text-[11px] text-purple-300/80 italic mt-0.5 border-t border-purple-900/30 pt-1.5">
              "{analysisResult.pedagogicalSummary}"
            </p>
          </div>

          {/* Corrected / Refined Output Section */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Refined & Polished Version
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePlayVoice(analysisResult.correctedText)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                  title="Listen to native speech"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleCopy(analysisResult.correctedText, "refined")}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Copy refined text"
                >
                  {copiedKey === "refined" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-sm font-semibold text-emerald-200 leading-relaxed">
              "{analysisResult.correctedText}"
            </div>

            {/* Original vs Refined Diff if changes exist */}
            {!analysisResult.isFlawless && (
              <div className="text-xs text-slate-400 flex flex-col gap-1 pt-1 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase font-mono">Original:</span>
                <span className="line-through text-rose-300/80">
                  "{analysisResult.originalText}"
                </span>
              </div>
            )}
          </div>

          {/* Grammar Issues Breakdown (if any) */}
          {analysisResult.grammarIssues && analysisResult.grammarIssues.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Grammar Nuances & Corrections ({analysisResult.grammarIssues.length})
              </span>
              <div className="space-y-2">
                {analysisResult.grammarIssues.map((issue, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                          {issue.issueType}
                        </span>
                        <span className="font-semibold text-rose-400 line-through">
                          {issue.original}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                        <span className="font-bold text-emerald-400">
                          {issue.corrected}
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed pl-1">
                      {issue.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nuance Variations & Registers (How natives say it) */}
          {analysisResult.nuanceVariations && analysisResult.nuanceVariations.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                  Nuance & Register Variations
                </span>
                <span className="text-[11px] text-slate-500">
                  Choose the right tone for your context
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {analysisResult.nuanceVariations.map((v, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-2"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          v.register.includes("Casual")
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : v.register.includes("Formal")
                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            : v.register.includes("Literary")
                            ? "bg-pink-500/20 text-pink-300 border border-pink-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        }`}>
                          {v.register}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handlePlayVoice(v.sentence)}
                            className="p-1 rounded text-slate-400 hover:text-blue-300 transition-colors cursor-pointer"
                            title="Listen"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleCopy(v.sentence, `var-${idx}`)}
                            className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title="Copy"
                          >
                            {copiedKey === `var-${idx}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <p className="text-xs font-semibold text-slate-100 pt-0.5">
                        "{v.sentence}"
                      </p>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-snug border-t border-slate-800/60 pt-1.5">
                      {v.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vocabulary Upgrades */}
          {analysisResult.vocabularyUpgrades && analysisResult.vocabularyUpgrades.length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Vocabulary & Idiom Upgrades
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {analysisResult.vocabularyUpgrades.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs flex flex-col gap-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 line-through">{item.originalWord}</span>
                      <ArrowRight className="w-3 h-3 text-slate-600" />
                      <span className="font-bold text-purple-300">{item.suggestedWord}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">{item.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
            {onSendToSmartboard && (
              <button
                onClick={handleProjectToBoard}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700/80"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                <span>Send to Smartboard</span>
              </button>
            )}

            {onSendToChat && (
              <button
                onClick={() => {
                  onSendToChat(
                    `Can you explain the difference in nuance between: "${analysisResult.originalText}" and "${analysisResult.correctedText}"?`
                  );
                }}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/20 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ask Maestro in Dialogue</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
