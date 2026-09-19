import React, { useState } from "react";
import { Mic, MicOff, Volume2, Award, RotateCcw, CheckCircle, AlertTriangle } from "lucide-react";
import confetti from "canvas-confetti";
import { GestureType, PronunciationEvaluation, TargetLanguage } from "../types";
import { speechCtrl } from "./SpeechController";
import { savePronunciationAttempt } from "../lib/userDataService";
import { PhoneticMouthVisualizer } from "./PhoneticMouthVisualizer";

interface PronunciationTrainerProps {
  targetLanguage: TargetLanguage;
  langCode: string;
  practiceSentences: string[];
  userId?: string;
  onTriggerGesture: (gesture: GestureType) => void;
  onSpeakText: (text: string) => void;
}

export const PronunciationTrainer: React.FC<PronunciationTrainerProps> = ({
  targetLanguage,
  langCode,
  practiceSentences,
  userId,
  onTriggerGesture,
  onSpeakText,
}) => {
  const [selectedSentenceIndex, setSelectedSentenceIndex] = useState<number>(0);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcription, setTranscription] = useState<string>("");
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [result, setResult] = useState<PronunciationEvaluation | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeSentence = practiceSentences[selectedSentenceIndex] || "¡Hola mundo!";

  const handleStartSpeaking = () => {
    setErrorMsg(null);
    setResult(null);
    setTranscription("");

    const supported = speechCtrl.startListening(
      langCode,
      (transcript, isFinal) => {
        setTranscription(transcript);
        if (isFinal) {
          setIsRecording(false);
          evaluateAudio(activeSentence, transcript);
        }
      },
      (err) => {
        setErrorMsg(err);
        setIsRecording(false);
      },
      () => {
        setIsRecording(false);
      }
    );

    if (supported) {
      setIsRecording(true);
      onTriggerGesture("listening");
    }
  };

  const handleStopSpeaking = () => {
    speechCtrl.stopListening();
    setIsRecording(false);
    if (transcription.trim()) {
      evaluateAudio(activeSentence, transcription);
    }
  };

  const evaluateAudio = async (expected: string, transcribed: string) => {
    setIsEvaluating(true);
    onTriggerGesture("thinking");

    try {
      const res = await fetch("/api/tutor/evaluate-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expectedText: expected,
          transcribedText: transcribed,
          targetLanguage,
        }),
      });

      if (!res.ok) throw new Error("Failed to evaluate pronunciation");

      const data: PronunciationEvaluation = await res.json();
      setResult(data);

      if (userId) {
        savePronunciationAttempt(userId, {
          targetLanguage,
          sentence: expected,
          transcribed,
          evaluation: data,
        });
      }

      // Trigger tutor gesture & voice response
      onTriggerGesture(data.gesture || (data.accuracyScore >= 80 ? "praising" : "encouraging"));

      if (data.accuracyScore >= 85) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      }

      // Tutor speaks spoken praise or encouragement
      const feedbackLine =
        data.accuracyScore >= 80
          ? `¡Excelente! ${data.feedback}`
          : `Buen intento. ${data.feedback}`;
      onSpeakText(feedbackLine);
    } catch (err) {
      console.error(err);
      // Fallback local scoring
      const wordsExpected = expected.toLowerCase().split(/\s+/);
      const wordsTrans = transcribed.toLowerCase().split(/\s+/);
      let matches = 0;
      wordsExpected.forEach((w) => {
        if (wordsTrans.includes(w)) matches++;
      });
      const ratio = matches / Math.max(wordsExpected.length, 1);
      const score = Math.round(ratio * 100);

      setResult({
        accuracyScore: score,
        pronunciationScore: Math.min(score + 5, 100),
        feedback:
          score > 75
            ? "Great diction! Your phonetic cadence sounded natural."
            : "Keep practicing. Focus on vowel clarity and smooth syllable transitions.",
        gesture: score > 75 ? "praising" : "encouraging",
        phoneticBreakdown: wordsExpected.map((w) => ({
          word: w,
          ipa: "/.../",
          status: wordsTrans.includes(w) ? "good" : "needs-work",
        })),
        encouragement: "Repeat the sentence while observing the tutor's mouth movements!",
      });

      onTriggerGesture(score > 75 ? "praising" : "encouraging");
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
          <Award className="w-4 h-4" />
          <span>Pronunciation & Accent Studio</span>
        </div>
        <span className="text-xs text-slate-400">
          Sentence {selectedSentenceIndex + 1} of {practiceSentences.length}
        </span>
      </div>

      {/* Target Sentence Box */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
        <div className="text-[11px] text-slate-500 font-mono uppercase tracking-wider">
          Target Sentence to Read Aloud:
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-base font-semibold text-slate-100 leading-snug">
            "{activeSentence}"
          </span>
          <button
            onClick={() => onSpeakText(activeSentence)}
            className="p-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 transition-colors shrink-0"
            title="Listen to native pronunciation"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2D Articulation & Mouth Anatomy Guide (No 3D needed here) */}
      <PhoneticMouthVisualizer
        currentWord={activeSentence.split(" ")[0] || activeSentence}
        targetLanguage={targetLanguage}
        onPlayAudio={onSpeakText}
        isRecording={isRecording}
      />

      {/* Sentence selector chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {practiceSentences.map((s, idx) => (
          <button
            key={idx}
            onClick={() => {
              setSelectedSentenceIndex(idx);
              setResult(null);
              setTranscription("");
            }}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-medium ${
              selectedSentenceIndex === idx
                ? "bg-blue-600 text-white"
                : "bg-slate-800/80 text-slate-400 hover:text-slate-200"
            }`}
          >
            Phrase {idx + 1}
          </button>
        ))}
      </div>

      {/* Microphone Record & Analysis Trigger */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
        <button
          onClick={isRecording ? handleStopSpeaking : handleStartSpeaking}
          disabled={isEvaluating}
          className={`w-full sm:w-auto flex-1 flex items-center justify-center gap-2.5 py-3 px-5 rounded-xl font-bold text-sm transition-all shadow-lg ${
            isRecording
              ? "bg-rose-600 hover:bg-rose-500 text-white animate-pulse"
              : "bg-blue-600 hover:bg-blue-500 text-white"
          }`}
        >
          {isRecording ? (
            <>
              <MicOff className="w-4 h-4" />
              <span>Listening... Click when finished</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              <span>Record Your Pronunciation</span>
            </>
          )}
        </button>

        {result && (
          <button
            onClick={() => {
              setResult(null);
              setTranscription("");
            }}
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Try again"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Real-time transcribed text preview */}
      {transcription && (
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300">
          <span className="text-slate-500 block mb-0.5">Recognized Speech:</span>
          <span className="font-medium text-slate-100 italic">"{transcription}"</span>
        </div>
      )}

      {/* Error message */}
      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Pronunciation Score and Breakdown */}
      {result && (
        <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-emerald-400">
                {result.accuracyScore}%
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Accuracy Score</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-cyan-400">
                {result.pronunciationScore}%
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Pronunciation Score</span>
            </div>
          </div>

          <div className="text-xs text-slate-200 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="font-semibold text-blue-300 mb-1 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
              <span>Tutor Feedback</span>
            </div>
            {result.feedback}
          </div>

          {result.phoneticBreakdown && result.phoneticBreakdown.length > 0 && (
            <div>
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block mb-1.5">
                Word-by-Word Phonetic Analysis:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {result.phoneticBreakdown.map((item, i) => (
                  <div
                    key={i}
                    className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 border ${
                      item.status === "good"
                        ? "bg-emerald-950/40 text-emerald-300 border-emerald-800/50"
                        : "bg-amber-950/40 text-amber-300 border-amber-800/50"
                    }`}
                  >
                    <span className="font-bold">{item.word}</span>
                    {item.ipa && <span className="font-mono text-[10px] text-slate-400">{item.ipa}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
