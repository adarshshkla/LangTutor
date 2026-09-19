import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Volume2, Sparkles, HelpCircle } from "lucide-react";
import { TargetLanguage } from "../types";

export type MouthShape = "A" | "E" | "I" | "O" | "U" | "M" | "F" | "TH" | "L" | "R" | "REST";

interface PhoneticMouthVisualizerProps {
  currentWord?: string;
  targetLanguage: TargetLanguage;
  onPlayAudio?: (text: string) => void;
  isRecording?: boolean;
}

// Phonetic mapping to 2D mouth shape & articulate guide
interface ShapeGuide {
  shape: MouthShape;
  label: string;
  tonguePosition: "front-high" | "front-mid" | "central-low" | "back-high" | "back-mid" | "teeth-contact" | "lip-press";
  airflow: "unobstructed" | "friction" | "nasal" | "trill" | "lip-burst";
  tip: string;
  diagramColor: string;
}

const MOUTH_GUIDES: Record<MouthShape, ShapeGuide> = {
  A: {
    shape: "A",
    label: "Open Central /a/",
    tonguePosition: "central-low",
    airflow: "unobstructed",
    tip: "Jaw lowered generously, tongue lies flat and relaxed in bottom of mouth.",
    diagramColor: "#38bdf8",
  },
  E: {
    shape: "E",
    label: "Front Spread /e/ or /ɛ/",
    tonguePosition: "front-mid",
    airflow: "unobstructed",
    tip: "Corners of lips pulled back slightly into a smile, tongue arched toward palate.",
    diagramColor: "#818cf8",
  },
  I: {
    shape: "I",
    label: "High Front /i/",
    tonguePosition: "front-high",
    airflow: "unobstructed",
    tip: "Lips wide and spread, teeth close together, tongue blade pushed high forward.",
    diagramColor: "#c084fc",
  },
  O: {
    shape: "O",
    label: "Mid Rounded /o/ or /ɔ/",
    tonguePosition: "back-mid",
    airflow: "unobstructed",
    tip: "Lips rounded forward into an oval; back of tongue slightly raised.",
    diagramColor: "#f59e0b",
  },
  U: {
    shape: "U",
    label: "High Tight Rounded /u/",
    tonguePosition: "back-high",
    airflow: "unobstructed",
    tip: "Tight circular lip purse (puckered like blowing a candle), tongue bunched back.",
    diagramColor: "#f43f5e",
  },
  M: {
    shape: "M",
    label: "Bilabial Closure /m/, /b/, /p/",
    tonguePosition: "lip-press",
    airflow: "nasal",
    tip: "Upper and lower lips pressed firmly together; air builds pressure or passes through nose.",
    diagramColor: "#10b981",
  },
  F: {
    shape: "F",
    label: "Labiodental /f/, /v/",
    tonguePosition: "teeth-contact",
    airflow: "friction",
    tip: "Upper incisors gently touch lower lip inner margin, letting turbulent air whistle through.",
    diagramColor: "#06b6d4",
  },
  TH: {
    shape: "TH",
    label: "Dental / Interdental /θ/, /ð/",
    tonguePosition: "teeth-contact",
    airflow: "friction",
    tip: "Tongue tip protrudes slightly between front teeth or against back of upper incisors.",
    diagramColor: "#eab308",
  },
  L: {
    shape: "L",
    label: "Alveolar Lateral /l/",
    tonguePosition: "teeth-contact",
    airflow: "unobstructed",
    tip: "Tongue tip touches upper alveolar gum ridge, air escapes freely around sides.",
    diagramColor: "#22c55e",
  },
  R: {
    shape: "R",
    label: "Trill / Alveolar Tap /r/, /rr/",
    tonguePosition: "teeth-contact",
    airflow: "trill",
    tip: "Tongue tip flutters against roof of mouth behind front teeth with focused air flow.",
    diagramColor: "#ec4899",
  },
  REST: {
    shape: "REST",
    label: "Neutral / Ready",
    tonguePosition: "central-low",
    airflow: "unobstructed",
    tip: "Relaxed natural position. Breathe through nose, jaw loose.",
    diagramColor: "#64748b",
  },
};

export const PhoneticMouthVisualizer: React.FC<PhoneticMouthVisualizerProps> = ({
  currentWord = "Hola",
  targetLanguage,
  onPlayAudio,
  isRecording,
}) => {
  const [selectedShape, setSelectedShape] = useState<MouthShape>("A");
  const [isAnimatingCycle, setIsAnimatingCycle] = useState<boolean>(false);
  const [activeCycleIndex, setActiveCycleIndex] = useState<number>(0);

  // Derive initial shape suggestion based on first vowel or letter of currentWord
  useEffect(() => {
    const lower = currentWord.toLowerCase();
    if (lower.includes("rr") || lower.startsWith("r")) {
      setSelectedShape("R");
    } else if (lower.includes("u") || lower.includes("ou")) {
      setSelectedShape("U");
    } else if (lower.includes("o")) {
      setSelectedShape("O");
    } else if (lower.includes("i") || lower.includes("ee")) {
      setSelectedShape("I");
    } else if (lower.includes("e") || lower.includes("é")) {
      setSelectedShape("E");
    } else if (lower.includes("a") || lower.includes("á")) {
      setSelectedShape("A");
    } else if (lower.includes("m") || lower.includes("b") || lower.includes("p")) {
      setSelectedShape("M");
    } else if (lower.includes("f") || lower.includes("v")) {
      setSelectedShape("F");
    } else {
      setSelectedShape("A");
    }
  }, [currentWord]);

  // Vowel cycle walkthrough animation
  const cycleShapes: MouthShape[] = ["A", "E", "I", "O", "U", "R"];

  useEffect(() => {
    if (!isAnimatingCycle) return;
    const timer = setInterval(() => {
      setActiveCycleIndex((prev) => {
        const next = (prev + 1) % cycleShapes.length;
        setSelectedShape(cycleShapes[next]);
        return next;
      });
    }, 900);
    return () => clearInterval(timer);
  }, [isAnimatingCycle]);

  const guide = MOUTH_GUIDES[selectedShape] || MOUTH_GUIDES.A;

  // Render pure SVG diagram for Front and Profile views of mouth, tongue, and airflow
  const renderFrontMouthSVG = (shape: MouthShape) => {
    switch (shape) {
      case "A": // Open wide oval, visible tongue base
        return (
          <svg viewBox="0 0 200 140" className="w-full h-full">
            {/* Face/Skin backdrop */}
            <rect width="200" height="140" rx="16" fill="#0f172a" />
            {/* Outer Lips */}
            <path
              d="M 40 70 Q 100 45 160 70 Q 100 115 40 70 Z"
              fill="#fb7185"
              stroke="#f43f5e"
              strokeWidth="3"
            />
            {/* Oral Cavity Dark */}
            <ellipse cx="100" cy="74" rx="44" ry="26" fill="#1e1b4b" />
            {/* Upper Teeth */}
            <path d="M 64 62 Q 100 66 136 62 L 134 68 Q 100 72 66 68 Z" fill="#ffffff" />
            {/* Lower Teeth (barely visible) */}
            <path d="M 72 84 Q 100 82 128 84 L 126 87 Q 100 85 74 87 Z" fill="#e2e8f0" />
            {/* Tongue relaxed at bottom */}
            <path
              d="M 66 84 Q 100 76 134 84 Q 100 95 66 84 Z"
              fill="#f87171"
              stroke="#ef4444"
              strokeWidth="1.5"
            />
            {/* Airflow arrow out */}
            <path
              d="M 100 74 L 100 40 M 94 48 L 100 38 L 106 48"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case "E": // Wide horizontal smile, arched tongue
        return (
          <svg viewBox="0 0 200 140" className="w-full h-full">
            <rect width="200" height="140" rx="16" fill="#0f172a" />
            <path
              d="M 28 70 Q 100 56 172 70 Q 100 88 28 70 Z"
              fill="#fb7185"
              stroke="#f43f5e"
              strokeWidth="3"
            />
            <ellipse cx="100" cy="70" rx="55" ry="12" fill="#1e1b4b" />
            {/* Prominent teeth */}
            <path d="M 52 64 Q 100 67 148 64 L 146 68 Q 100 71 54 68 Z" fill="#ffffff" />
            <path d="M 58 74 Q 100 72 142 74 L 140 77 Q 100 75 60 77 Z" fill="#e2e8f0" />
            {/* Tongue elevated */}
            <path d="M 68 74 Q 100 67 132 74 Q 100 78 68 74 Z" fill="#f87171" />
            {/* Horizontal expansion arrows */}
            <path
              d="M 24 70 L 14 70 M 176 70 L 186 70"
              stroke="#818cf8"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        );
      case "I": // High narrow spread, teeth nearly touching
        return (
          <svg viewBox="0 0 200 140" className="w-full h-full">
            <rect width="200" height="140" rx="16" fill="#0f172a" />
            <path
              d="M 25 70 Q 100 58 175 70 Q 100 84 25 70 Z"
              fill="#fb7185"
              stroke="#f43f5e"
              strokeWidth="3"
            />
            <ellipse cx="100" cy="70" rx="60" ry="8" fill="#1e1b4b" />
            <path d="M 46 66 Q 100 68 154 66 L 152 70 Q 100 72 48 70 Z" fill="#ffffff" />
            <path d="M 52 72 Q 100 71 148 72 L 146 74 Q 100 73 54 74 Z" fill="#e2e8f0" />
            <path
              d="M 22 70 L 10 70 M 178 70 L 190 70"
              stroke="#c084fc"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </svg>
        );
      case "O": // Rounded vertical oval
        return (
          <svg viewBox="0 0 200 140" className="w-full h-full">
            <rect width="200" height="140" rx="16" fill="#0f172a" />
            <ellipse cx="100" cy="70" rx="42" ry="34" fill="#fb7185" stroke="#f43f5e" strokeWidth="3" />
            <ellipse cx="100" cy="70" rx="22" ry="20" fill="#1e1b4b" />
            {/* Teeth tucked inside */}
            <path d="M 86 58 Q 100 60 114 58" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
            {/* Forward arrows */}
            <circle cx="100" cy="70" r="14" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2" />
          </svg>
        );
      case "U": // Tight circle / pucker
        return (
          <svg viewBox="0 0 200 140" className="w-full h-full">
            <rect width="200" height="140" rx="16" fill="#0f172a" />
            {/* Puckered thick lips */}
            <ellipse cx="100" cy="70" rx="34" ry="28" fill="#fb7185" stroke="#f43f5e" strokeWidth="3" />
            <circle cx="100" cy="70" r="11" fill="#1e1b4b" />
            {/* Concentric rings showing projection */}
            <circle cx="100" cy="70" r="18" fill="none" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3 3" />
            <path d="M 100 50 L 100 42 M 100 90 L 100 98" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case "R": // Tongue tip fluttering on alveolar ridge
        return (
          <svg viewBox="0 0 200 140" className="w-full h-full">
            <rect width="200" height="140" rx="16" fill="#0f172a" />
            <path
              d="M 40 70 Q 100 50 160 70 Q 100 105 40 70 Z"
              fill="#fb7185"
              stroke="#f43f5e"
              strokeWidth="3"
            />
            <ellipse cx="100" cy="72" rx="42" ry="20" fill="#1e1b4b" />
            <path d="M 68 62 Q 100 65 132 62" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
            {/* Vibrating tongue tip touching ridge */}
            <path
              d="M 80 82 Q 100 66 120 82"
              fill="none"
              stroke="#f87171"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Flutter waves (trill) */}
            <path
              d="M 92 65 Q 100 61 108 65 Q 100 69 92 65"
              fill="none"
              stroke="#ec4899"
              strokeWidth="2.5"
            />
          </svg>
        );
      case "F": // Upper teeth on lower lip
        return (
          <svg viewBox="0 0 200 140" className="w-full h-full">
            <rect width="200" height="140" rx="16" fill="#0f172a" />
            {/* Upper lip raised */}
            <path d="M 45 62 Q 100 48 155 62" stroke="#fb7185" strokeWidth="7" fill="none" />
            {/* Prominent upper teeth */}
            <path d="M 70 65 L 70 78 L 130 78 L 130 65 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            {/* Lower lip pressed under teeth */}
            <path
              d="M 50 78 Q 100 95 150 78 Q 100 86 50 78"
              fill="#fb7185"
              stroke="#f43f5e"
              strokeWidth="3"
            />
            {/* Whistle air escape dots */}
            <circle cx="85" cy="80" r="2" fill="#06b6d4" />
            <circle cx="100" cy="81" r="2" fill="#06b6d4" />
            <circle cx="115" cy="80" r="2" fill="#06b6d4" />
          </svg>
        );
      case "M": // Closed lips
      default:
        return (
          <svg viewBox="0 0 200 140" className="w-full h-full">
            <rect width="200" height="140" rx="16" fill="#0f172a" />
            {/* Closed lips pressed together */}
            <path
              d="M 45 70 Q 100 58 155 70 Q 100 82 45 70 Z"
              fill="#fb7185"
              stroke="#f43f5e"
              strokeWidth="4"
            />
            <line x1="50" y1="70" x2="150" y2="70" stroke="#991b1b" strokeWidth="2.5" />
            {/* Nasal sound waves coming from above */}
            <path
              d="M 90 40 Q 100 35 110 40 M 85 32 Q 100 25 115 32"
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        );
    }
  };

  // Profile Cross-Section SVG (Tongue Palate Architecture)
  const renderProfileVocalTractSVG = (shape: MouthShape) => {
    return (
      <svg viewBox="0 0 200 140" className="w-full h-full">
        <rect width="200" height="140" rx="16" fill="#0f172a" />
        {/* Head/Nose/Lip silhouette contour */}
        <path
          d="M 40 10 L 70 10 Q 75 30 65 45 Q 85 46 80 58 Q 70 65 72 70 Q 75 72 82 72 Q 72 78 70 85 Q 75 92 68 110 L 40 110"
          fill="#1e293b"
          stroke="#334155"
          strokeWidth="2"
        />
        {/* Hard Palate & Soft Palate (roof of mouth) */}
        <path
          d="M 85 58 Q 120 54 150 72 L 155 86"
          fill="none"
          stroke="#94a3b8"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <text x="110" y="48" fill="#64748b" fontSize="8" fontFamily="sans-serif">
          Hard Palate
        </text>
        {/* Teeth Upper & Lower */}
        <rect x="80" y="58" width="6" height="8" rx="2" fill="#ffffff" />
        <rect x="76" y="80" width="6" height="8" rx="2" fill="#e2e8f0" />

        {/* Dynamic Tongue Position based on shape */}
        {shape === "A" && (
          // Low flat tongue
          <path
            d="M 82 86 Q 100 90 140 92 L 142 110 L 80 110 Z"
            fill="#f87171"
            stroke="#ef4444"
            strokeWidth="2"
          />
        )}
        {shape === "E" && (
          // Front raised tongue
          <path
            d="M 82 86 Q 105 70 140 88 L 142 110 L 80 110 Z"
            fill="#f87171"
            stroke="#ef4444"
            strokeWidth="2"
          />
        )}
        {shape === "I" && (
          // High front arched close to hard palate
          <path
            d="M 82 84 Q 102 62 140 86 L 142 110 L 80 110 Z"
            fill="#f87171"
            stroke="#ef4444"
            strokeWidth="2"
          />
        )}
        {shape === "O" && (
          // Back raised tongue
          <path
            d="M 82 88 Q 115 85 135 68 L 145 110 L 80 110 Z"
            fill="#f87171"
            stroke="#ef4444"
            strokeWidth="2"
          />
        )}
        {shape === "U" && (
          // High back tongue near velum
          <path
            d="M 82 90 Q 118 88 138 62 L 145 110 L 80 110 Z"
            fill="#f87171"
            stroke="#ef4444"
            strokeWidth="2"
          />
        )}
        {shape === "R" && (
          // Tongue tip curled up touching alveolar ridge
          <path
            d="M 88 64 Q 92 78 115 85 Q 135 88 142 94 L 142 110 L 80 110 Z"
            fill="#f87171"
            stroke="#ef4444"
            strokeWidth="2"
          />
        )}
        {(shape === "M" || shape === "F" || shape === "TH" || shape === "L") && (
          <path
            d="M 82 86 Q 100 80 138 88 L 142 110 L 80 110 Z"
            fill="#f87171"
            stroke="#ef4444"
            strokeWidth="2"
          />
        )}

        {/* Airflow trajectory glow line */}
        <path
          d="M 148 95 Q 120 70 82 70"
          fill="none"
          stroke={guide.diagramColor}
          strokeWidth="3"
          strokeDasharray="4 2"
          strokeLinecap="round"
        />
        <text x="145" y="125" fill="#64748b" fontSize="8" fontFamily="sans-serif">
          Vocal Tract (Side)
        </text>
      </svg>
    );
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col gap-4">
      {/* Header & Controls */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h4 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
              <span>2D Phonetic Articulation & Mouth Anatomy</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                {guide.label}
              </span>
            </h4>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Clear visual guide showing lip opening, teeth contact, and tongue placement for {targetLanguage}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAnimatingCycle(!isAnimatingCycle)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isAnimatingCycle
                ? "bg-amber-500/20 border border-amber-500/40 text-amber-300"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300"
            }`}
          >
            {isAnimatingCycle ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isAnimatingCycle ? "Pause Cycle" : "Vowel Walkthrough"}</span>
          </button>
        </div>
      </div>

      {/* Dual 2D Canvas Display: Front View + Profile Vocal Tract */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Left: Front View */}
        <div className="relative rounded-xl border border-slate-800 bg-slate-950 p-2 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-1 px-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Front Lip Shape
            </span>
            <span
              className="text-[10px] px-2 py-0.5 rounded font-bold font-mono"
              style={{ color: guide.diagramColor, backgroundColor: `${guide.diagramColor}22` }}
            >
              Shape /{selectedShape.toLowerCase()}/
            </span>
          </div>
          <div className="h-36 flex items-center justify-center">
            {renderFrontMouthSVG(selectedShape)}
          </div>
        </div>

        {/* Right: Side Profile Anatomy (Tongue + Airflow) */}
        <div className="relative rounded-xl border border-slate-800 bg-slate-950 p-2 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-1 px-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Tongue & Palate Profile
            </span>
            <span className="text-[10px] text-slate-400 font-mono capitalize">
              {guide.tonguePosition.replace("-", " ")}
            </span>
          </div>
          <div className="h-36 flex items-center justify-center">
            {renderProfileVocalTractSVG(selectedShape)}
          </div>
        </div>
      </div>

      {/* Phoneme Quick Selector Chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-slate-400 mr-1 font-semibold">Test Sound:</span>
        {(["A", "E", "I", "O", "U", "R", "F", "M", "L"] as MouthShape[]).map((shape) => (
          <button
            key={shape}
            onClick={() => {
              setIsAnimatingCycle(false);
              setSelectedShape(shape);
            }}
            className={`px-3 py-1 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
              selectedShape === shape
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300"
            }`}
          >
            /{shape}/
          </button>
        ))}
      </div>

      {/* Articulation & Motor Coaching Tip Box */}
      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 flex items-start gap-3 text-xs">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="font-semibold text-slate-200 mb-0.5">
            How to Form This Sound ({targetLanguage}):
          </div>
          <p className="text-slate-400 leading-relaxed">{guide.tip}</p>
          <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500 font-mono">
            <span>Airflow: <strong className="text-slate-300 capitalize">{guide.airflow}</strong></span>
            <span>•</span>
            <span>Tongue: <strong className="text-slate-300 capitalize">{guide.tonguePosition}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
