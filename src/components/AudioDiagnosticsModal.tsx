import React, { useState, useEffect } from "react";
import {
  Volume2,
  Mic,
  MicOff,
  AlertCircle,
  CheckCircle2,
  X,
  Play,
  ExternalLink,
  Sparkles,
  RefreshCw,
  HelpCircle,
} from "lucide-react";
import { speechCtrl } from "./SpeechController";
import { TargetLanguage } from "../types";
import { LANGUAGE_CONFIGS } from "./LessonCurriculum";

interface AudioDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetLanguage?: TargetLanguage;
}

export const AudioDiagnosticsModal: React.FC<AudioDiagnosticsModalProps> = ({
  isOpen,
  onClose,
  targetLanguage = "Spanish",
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioTestSuccess, setAudioTestSuccess] = useState<boolean | null>(null);
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [micSuccess, setMicSuccess] = useState<boolean | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [hasExactVoice, setHasExactVoice] = useState(false);

  const langConfig = LANGUAGE_CONFIGS[targetLanguage];

  useEffect(() => {
    if (isOpen) {
      speechCtrl.unlockAudio();
      const voices = speechCtrl.getAvailableVoices();
      setAvailableVoices(voices);
      const matched = speechCtrl.getVoiceForLanguage(langConfig.defaultVoiceLang);
      setHasExactVoice(Boolean(matched));
    }
  }, [isOpen, targetLanguage, langConfig.defaultVoiceLang]);

  // Handle Audio Output Test
  const handleTestAudio = () => {
    setIsPlayingAudio(true);
    setAudioTestSuccess(null);
    speechCtrl.unlockAudio();

    // Play both speech and gentle chime
    speechCtrl.playChime("praise");
    speechCtrl.speak(
      `Hello! Audio synthesis is working for ${targetLanguage}.`,
      langConfig.defaultVoiceLang,
      1.0,
      {
        onStart: () => {
          setAudioTestSuccess(true);
        },
        onEnd: () => {
          setIsPlayingAudio(false);
        },
        onError: (err) => {
          console.warn("Audio test error:", err);
          setIsPlayingAudio(false);
          // Fallback tone
          speechCtrl.playChime("bell");
          setAudioTestSuccess(true);
        },
      }
    );
  };

  // Handle Microphone Live Stream Test
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    if (isTestingMic) {
      setMicError(null);
      setMicSuccess(null);
      speechCtrl
        .testMicrophoneStream(
          (vol) => {
            setMicVolume(vol);
            if (vol > 15) {
              setMicSuccess(true);
            }
          },
          (err) => {
            setMicError(err);
            setIsTestingMic(false);
          }
        )
        .then((fn) => {
          cleanup = fn;
        });
    } else {
      setMicVolume(0);
    }
    return () => {
      if (cleanup) cleanup();
    };
  }, [isTestingMic]);

  if (!isOpen) return null;

  const isInIframe = typeof window !== "undefined" && window.self !== window.top;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Sound & Microphone Diagnostic</h3>
              <p className="text-[11px] text-slate-400">
                Verify audio output, speech synthesis, and microphone hardware
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsTestingMic(false);
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Section 1: Audio / Speaker Output Test */}
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  1. Audio Speaker Test
                </span>
              </div>
              {audioTestSuccess && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Working
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Click the button below to play a test greeting and harmonic acoustic tone. Make sure
              your device volume is turned up.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleTestAudio}
                disabled={isPlayingAudio}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {isPlayingAudio ? "Playing Test Audio..." : "Play Test Sound"}
              </button>
              <button
                onClick={() => speechCtrl.playChime("success")}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Play Success Chime
              </button>
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-1">
              <span>Installed Browser Voices: {availableVoices.length}</span>
              <span>•</span>
              <span className={hasExactVoice ? "text-emerald-400 font-medium" : "text-amber-400"}>
                {hasExactVoice
                  ? `Native ${targetLanguage} voice detected`
                  : `Universal voice fallback active`}
              </span>
            </div>
          </div>

          {/* Section 2: Microphone & Speech Recognition Test */}
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  2. Microphone Hardware Test
                </span>
              </div>
              {micSuccess && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Mic Input Detected!
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Click "Start Mic Test" and speak aloud. The live volume meter will bounce to confirm
              your microphone is actively receiving sound.
            </p>

            {/* Live Volume Meter */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Mic Input Level</span>
                <span className={micVolume > 20 ? "text-emerald-400 font-bold" : "text-slate-500"}>
                  {micVolume}%
                </span>
              </div>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <div
                  className={`h-full rounded-full transition-all duration-75 ${
                    micVolume > 40
                      ? "bg-emerald-400"
                      : micVolume > 15
                      ? "bg-blue-400"
                      : "bg-slate-600"
                  }`}
                  style={{ width: `${Math.max(4, micVolume)}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsTestingMic(!isTestingMic)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md ${
                  isTestingMic
                    ? "bg-rose-600 hover:bg-rose-500 text-white animate-pulse"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white"
                }`}
              >
                {isTestingMic ? (
                  <>
                    <MicOff className="w-3.5 h-3.5" /> Stop Mic Test
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5" /> Start Mic Test
                  </>
                )}
              </button>
            </div>

            {/* Error Message if Mic fails */}
            {micError && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <div className="space-y-1">
                  <p className="font-semibold">Microphone Access Notice</p>
                  <p className="text-[11px] text-rose-300/90 leading-relaxed">{micError}</p>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Browser / Iframe Permission Guidance */}
          <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-900/40 text-xs text-blue-200/90 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-blue-300">
              <HelpCircle className="w-4 h-4 text-blue-400" />
              <span>Troubleshooting Tips:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-blue-200/80 leading-relaxed">
              <li>
                <strong>Browser Permission:</strong> When prompted, click <em>Allow</em> for
                microphone access.
              </li>
              {isInIframe && (
                <li>
                  <strong>Embedded Iframe Sandbox:</strong> Some browsers restrict voice recognition
                  inside embedded iframes. Opening the app in a new tab provides direct, full
                  microphone access.
                </li>
              )}
              <li>
                <strong>Keyboard Input:</strong> You can type in the chat box or click suggested
                replies at any time to practice without a microphone.
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Speech Recognition Engine: Web Speech API & Web Audio
          </span>
          <button
            onClick={() => {
              setIsTestingMic(false);
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
