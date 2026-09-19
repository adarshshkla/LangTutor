import React, { useState } from "react";
import {
  Volume2,
  Mic,
  MicOff,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  Music,
  HelpCircle,
  Play,
  RotateCcw,
} from "lucide-react";
import { TargetLanguage } from "../../types";
import { AccentStep } from "./types";

interface AccentCoachProps {
  targetLanguage: TargetLanguage;
  nativeLanguage?: string;
  onSpeakText: (text: string) => void;
}

const ACCENT_MODULES_BY_LANG: Record<TargetLanguage, AccentStep[]> = {
  Spanish: [
    {
      id: "es-step-1",
      level: "Basic",
      title: "Step 1: Equal-Length Syllable Rhythm (Syllable-Timed)",
      subtitle: "Machine-gun rhythm vs. English stress-timing",
      conceptDescription:
        "Unlike English, where syllables stretch and shrink, Spanish is 'syllable-timed'—each syllable receives almost exactly the same duration, like a steady metronome: ta-ta-ta-ta.",
      nativeLanguageComparisonTip:
        "In English you compress unstressed vowels (e.g. 'photograph' -> 'photographer'). Never do this in Spanish! Keep every syllable distinct and equal in length.",
      ruleSummary: "Pronounce every syllable with equal beat duration. No vowel swallowing.",
      rhythmType: "syllable-timed",
      exampleSentence: "Ma-ña-na voy a Sa-la-man-ca.",
      phoneticSpelling: "[ma.ˈɲa.na ˈβoj a sa.la.ˈmaŋ.ka]",
      translation: "Tomorrow I am going to Salamanca.",
      stressIndices: [1, 3, 7], // ña, voy, man
      pitchContour: ["mid", "mid", "high", "mid", "mid", "high", "low"],
      practiceDrills: [
        { phrase: "Pa-na-má", focusNote: "Tap foot on every syllable with identical tempo", expectedPace: "slow" },
        { phrase: "To-do el mun-do", focusNote: "Blend words smoothly without pausing", expectedPace: "natural" },
        { phrase: "Es u-na bue-na i-de-a", focusNote: "Maintain steady syllable beat throughout", expectedPace: "natural" },
      ],
    },
    {
      id: "es-step-2",
      level: "Basic",
      title: "Step 2: The Two Inviolable Rules of Spanish Stress",
      subtitle: "Palabras llanas vs. agudas",
      conceptDescription:
        "1. Words ending in a vowel, 'N', or 'S' are stressed on the second-to-last syllable (llana). 2. Words ending in any other consonant are stressed on the final syllable (aguda). Written accents (tildes) break this rule.",
      nativeLanguageComparisonTip:
        "Look for the written accent mark (á, é, í, ó, ú). When present, punch that syllable firmly and elevate its pitch!",
      ruleSummary: "Vowel/N/S -> penultimate stress. Other consonants -> last syllable. Tilde overrides all.",
      rhythmType: "syllable-timed",
      exampleSentence: "El ca-fé es-tá en la me-sa.",
      phoneticSpelling: "[el ka.ˈfe es.ˈta en la ˈme.sa]",
      translation: "The coffee is on the table.",
      stressIndices: [2, 4, 7],
      pitchContour: ["low", "mid", "high", "mid", "high", "mid", "high", "low"],
      practiceDrills: [
        { phrase: "ha-blo vs. ha-bló", focusNote: "Notice how shifting stress changes from 'I speak' to 'he spoke'", expectedPace: "slow" },
        { phrase: "can-tar, co-mer, vi-vir", focusNote: "All infinitives end in R, so stress the final syllable", expectedPace: "natural" },
      ],
    },
    {
      id: "es-step-3",
      level: "Intermediate",
      title: "Step 3: Synalepha (Sinalefa) & Connected Speech Linking",
      subtitle: "Melting word boundaries together like a native speaker",
      conceptDescription:
        "In natural spoken Spanish, when one word ends in a vowel and the next word starts with a vowel, they merge into a single musical syllable. Native speakers NEVER pause between them.",
      nativeLanguageComparisonTip:
        "Instead of 'va... a... ir', say 'vaaír' in one fluid vocal breath.",
      ruleSummary: "Word-final vowel + word-initial vowel = 1 continuous syllable.",
      rhythmType: "syllable-timed",
      exampleSentence: "Va a es-tar a-llí.",
      phoneticSpelling: "[ˈbaa̯s.ˈta.ɾa.ˈʝi]",
      translation: "He/she is going to be there.",
      stressIndices: [0, 2, 4],
      pitchContour: ["mid", "rise", "high", "fall"],
      practiceDrills: [
        { phrase: "¿De dón-de e-res?", focusNote: "de + e merges into 'de-e-res' smoothly", expectedPace: "natural" },
        { phrase: "Mi a-mi-go es a-ma-ble", focusNote: "Three continuous vowel bridges without breaks", expectedPace: "brisk" },
      ],
    },
    {
      id: "es-step-4",
      level: "Advanced",
      title: "Step 4: Melodic Pitch Contours & Question Cadences",
      subtitle: "Rising vs. Falling intonation in authentic conversations",
      conceptDescription:
        "Yes/No questions in Spanish make a sharp, dramatic pitch rise at the very end of the sentence. Declarations fall decisively into a low pitch.",
      nativeLanguageComparisonTip:
        "Start lower in questions and launch the final syllable upward with higher pitch than in English.",
      ruleSummary: "Statements fall steeply. Yes/No questions launch upward dramatically on the final word.",
      rhythmType: "syllable-timed",
      exampleSentence: "¿Tie-nes tiem-po hoy?",
      phoneticSpelling: "[ˈtje.nes ˈtjem.po ˈoi̯ ↗]",
      translation: "Do you have time today?",
      stressIndices: [0, 2, 4],
      pitchContour: ["low", "mid", "mid", "high", "rise"],
      practiceDrills: [
        { phrase: "Tienes tiempo hoy. (Statement)", focusNote: "Pitch drops low on 'hoy'", expectedPace: "natural" },
        { phrase: "¿Tienes tiempo hoy? (Question)", focusNote: "Pitch rockets upward on 'hoy'", expectedPace: "natural" },
      ],
    },
  ],
  French: [
    {
      id: "fr-step-1",
      level: "Basic",
      title: "Step 1: The Group Stress Principle",
      subtitle: "French has no word stress—only rhythmic group stress",
      conceptDescription:
        "Unlike English or Spanish, individual French words DO NOT have their own stress! Instead, words are grouped into rhythmic 'sense groups', and ONLY the very last syllable of the whole group is stressed and slightly elongated.",
      nativeLanguageComparisonTip:
        "Do not punch individual words. Keep everything flat and even, then give a gentle rise/lengthening to the final syllable of the group.",
      ruleSummary: "Stress only the final syllable of the entire sense-group.",
      rhythmType: "syllable-timed",
      exampleSentence: "Je vou-drais un croi-ssant.",
      phoneticSpelling: "[ʒə vu.dʁɛ œ̃ kʁwa.sɑ̃ː]",
      translation: "I would like a croissant.",
      stressIndices: [5],
      pitchContour: ["low", "mid", "mid", "mid", "mid", "high"],
      practiceDrills: [
        { phrase: "C'est fa-cile", focusNote: "Equal beat, slight lengthening on '-cile'", expectedPace: "natural" },
        { phrase: "Un grand châ-teau", focusNote: "Accent exclusively on '-teau'", expectedPace: "natural" },
      ],
    },
    {
      id: "fr-step-2",
      level: "Basic",
      title: "Step 2: Pure Vowels & The French 'R' /ʁ/",
      subtitle: "Gargling air without rolling your tongue",
      conceptDescription:
        "The French 'R' is produced at the back of the mouth (uvular fricative), not the tip of the tongue. Touch the back of your tongue against your soft palate like a gentle gargle.",
      nativeLanguageComparisonTip:
        "Never roll your tongue against your teeth like in Spanish. Keep tongue tip resting quietly behind your lower front teeth.",
      ruleSummary: "Tongue tip stays down. Friction happens softly in the throat.",
      rhythmType: "syllable-timed",
      exampleSentence: "Re-gard-ez la tour.",
      phoneticSpelling: "[ʁə.ɡaʁ.de la tuʁ]",
      translation: "Look at the tower.",
      stressIndices: [2, 4],
      pitchContour: ["mid", "mid", "high", "mid", "fall"],
      practiceDrills: [
        { phrase: "mer-ci beau-coup", focusNote: "Soft uvular friction on 'mer'", expectedPace: "natural" },
        { phrase: "pa-ris, fran-ce", focusNote: "Light, dry throat contact", expectedPace: "natural" },
      ],
    },
    {
      id: "fr-step-3",
      level: "Intermediate",
      title: "Step 3: Liaison & Enchaînement (Connected Flow)",
      subtitle: "Connecting silent letters to the following vowel",
      conceptDescription:
        "A normally silent final consonant (like S, T, N, X) comes alive and links to the next word if that word starts with a vowel or silent H.",
      nativeLanguageComparisonTip:
        "'Les amis' becomes 'Lè-zamis'. 'Vous avez' becomes 'Vou-zavez'.",
      ruleSummary: "Silent final consonant sounds become the first sound of the next vowel-word.",
      rhythmType: "syllable-timed",
      exampleSentence: "Vous a-vez des a-mis.",
      phoneticSpelling: "[vu.za.ve de.za.mi]",
      translation: "You have friends.",
      stressIndices: [2, 5],
      pitchContour: ["mid", "mid", "high", "mid", "mid", "high"],
      practiceDrills: [
        { phrase: "les en-fants [lè-zan-fan]", focusNote: "Pronounce S as a buzzing Z attached to 'enfants'", expectedPace: "natural" },
        { phrase: "un pe-tit a-mi [un pe-ti-tami]", focusNote: "T attaches to 'ami' crisp and clean", expectedPace: "natural" },
      ],
    },
  ],
  Japanese: [
    {
      id: "ja-step-1",
      level: "Basic",
      title: "Step 1: Pitch Accent vs. English Stress (High/Low Melodies)",
      subtitle: "Mora timing (拍) and musical pitch elevation",
      conceptDescription:
        "Japanese does not use loudness/volume to stress syllables. Instead, it uses 'Pitch Accent' (high vs. low musical pitch). Every mora (beat) lasts the exact same amount of time.",
      nativeLanguageComparisonTip:
        "Do NOT speak louder on accented syllables. Instead, raise your musical pitch by 2-3 notes like singing.",
      ruleSummary: "No loudness stress. Words have high (高) and low (低) pitch patterns.",
      rhythmType: "mora-timed",
      exampleSentence: "ha-shi (箸 chopsticks) vs ha-shi (橋 bridge)",
      phoneticSpelling: "[há.shì vs hà.shí]",
      translation: "chopsticks (high-low) vs bridge (low-high)",
      stressIndices: [0],
      pitchContour: ["high", "low"],
      practiceDrills: [
        { phrase: "A-me (雨 rain: High-Low)", focusNote: "Start high, drop low on 'me'", expectedPace: "slow" },
        { phrase: "A-me (飴 candy: Low-High)", focusNote: "Start low, step high on 'me'", expectedPace: "slow" },
      ],
    },
    {
      id: "ja-step-2",
      level: "Intermediate",
      title: "Step 2: Equal Mora Timing & Double Vowels / Consonants",
      subtitle: "The sokuon (っ) pause and long vowels (ー)",
      conceptDescription:
        "Double consonants (sokuon っ) count as a full silent beat. Long vowels also count as two separate beats. Skipping them completely changes the meaning!",
      nativeLanguageComparisonTip:
        "Hold your breath for exactly one beat on small 'tsu'. 'Kite' (come) vs 'Kitte' (stamp) is differentiated only by that silent pause.",
      ruleSummary: "Every mora, pause, and long vowel gets an identical tick of the clock.",
      rhythmType: "mora-timed",
      exampleSentence: "Kit-te o kat-te ku-da-sai.",
      phoneticSpelling: "[ki.t.te o ka.t.te ku.da.sa.i]",
      translation: "Please buy a stamp.",
      stressIndices: [0, 3],
      pitchContour: ["high", "low", "low", "high", "low", "low", "mid", "low"],
      practiceDrills: [
        { phrase: "to-kyo (to-u-kyo-u = 4 beats)", focusNote: "Hold each vowel for full 2 counts", expectedPace: "natural" },
        { phrase: "ma-t-te (matte = 3 beats)", focusNote: "Hold the silent catch in your throat for 1 beat", expectedPace: "natural" },
      ],
    },
  ],
  German: [
    {
      id: "de-step-1",
      level: "Basic",
      title: "Step 1: The Glottal Stop (Knacklaut ʔ)",
      subtitle: "The crisp microscopic break before word-initial vowels",
      conceptDescription:
        "In German, words starting with a vowel do NOT smoothly link like in French or Spanish. Instead, you gently close your vocal cords and release with a crisp tiny 'catch' (Knacklaut).",
      nativeLanguageComparisonTip:
        "Say 'uh-oh'. That brief catch between 'uh' and 'oh' is the German glottal stop. Use it before words like 'Apfel', 'und', 'aber'.",
      ruleSummary: "Separate words cleanly with a crisp glottal catch before initial vowels.",
      rhythmType: "stress-timed",
      exampleSentence: "Ich esse ʔeinen ʔApfel.",
      phoneticSpelling: "[ɪç ˈʔɛ.sə ˈʔaɪ̯.nən ˈʔap͡fl̩]",
      translation: "I am eating an apple.",
      stressIndices: [1, 3],
      pitchContour: ["mid", "high", "mid", "high", "low"],
      practiceDrills: [
        { phrase: "Spie-ge-lei (Spiegel + ʔEi)", focusNote: "Tiny separation between Spiegel and Ei", expectedPace: "natural" },
        { phrase: "Fei-er-a-bend (Feier + ʔAbend)", focusNote: "Crisp micro-pause before Abend", expectedPace: "natural" },
      ],
    },
  ],
  Mandarin: [
    {
      id: "zh-step-1",
      level: "Basic",
      title: "Step 1: The Four Tones & Neutral Tone Foundations",
      subtitle: "Tone 1 (Flat High), Tone 2 (Rising), Tone 3 (Dip), Tone 4 (Sharp Drop)",
      conceptDescription:
        "Mandarin is tonal: the pitch contour of every syllable determines its vocabulary meaning completely. 1st: High flat (55). 2nd: Question rise (35). 3rd: Low dipping (214). 4th: Stern command drop (51).",
      nativeLanguageComparisonTip:
        "Tone 1 sounds like holding a high note singing 'ahhh'. Tone 2 sounds like asking 'huh?'. Tone 4 sounds like a decisive 'No!'.",
      ruleSummary: "1=High flat, 2=Rising question, 3=Low dip, 4=Decisive fall.",
      rhythmType: "syllable-timed",
      exampleSentence: "Mā mā qí mǎ, mǎ màn, mā mā mà mǎ.",
      phoneticSpelling: "[mā mā qí mǎ, mǎ màn, mā mā mà mǎ]",
      translation: "Mother rides a horse, the horse is slow, mother scolds the horse.",
      stressIndices: [0, 2, 4, 7],
      pitchContour: ["high", "high", "rise", "low", "low", "fall", "high", "high", "fall", "low"],
      practiceDrills: [
        { phrase: "Mā (1st: mother), Má (2nd: hemp)", focusNote: "Practice switching high-flat to rising", expectedPace: "slow" },
        { phrase: "Mǎ (3rd: horse), Mà (4th: scold)", focusNote: "Deep low chest dip vs sharp angry drop", expectedPace: "slow" },
      ],
    },
  ],
  English: [
    {
      id: "en-step-1",
      level: "Basic",
      title: "Step 1: Stress-Timed Rhythm & The Schwa /ə/",
      subtitle: "The most important secret of native English rhythm",
      conceptDescription:
        "English is 'stress-timed': stressed syllables land on a regular rhythm beat, while unstressed syllables are squished down into the relaxed, lazy 'schwa' vowel /ə/ (like the 'a' in 'about').",
      nativeLanguageComparisonTip:
        "If you pronounce every English vowel clearly with full value, you will have a thick foreign accent. Practice reducing unstressed words ('to' -> /tə/, 'for' -> /fər/).",
      ruleSummary: "Emphasize content words (nouns, main verbs). Reduce function words to schwa.",
      rhythmType: "stress-timed",
      exampleSentence: "I'd like to go to the par-ty.",
      phoneticSpelling: "[aɪd ˈlaɪk tə ˈɡoʊ tə ðə ˈpɑːr.ti]",
      translation: "I'd like to go to the party.",
      stressIndices: [1, 3, 6],
      pitchContour: ["low", "high", "low", "high", "low", "low", "high", "low"],
      practiceDrills: [
        { phrase: "CATS chase MICE", focusNote: "Equal time between CATS and MICE, regardless of intervening words", expectedPace: "natural" },
        { phrase: "The CATS have been CHAS-ing the MICE", focusNote: "Notice the whole sentence takes the SAME time!", expectedPace: "natural" },
      ],
    },
  ],
  Hindi: [
    {
      id: "hi-step-1",
      level: "Basic",
      title: "Step 1: Clear Vowels & Aspiration",
      subtitle: "Differentiating aspirated and non-aspirated consonants",
      conceptDescription: "In Hindi, blowing air (aspiration) changes the meaning of words. You must clearly distinguish 'k' and 'kh', 'p' and 'ph'.",
      nativeLanguageComparisonTip: "Hold a hand in front of your mouth. For 'kh', you should feel a strong puff of air.",
      ruleSummary: "Aspiration is a phonemic feature.",
      rhythmType: "syllable-timed",
      exampleSentence: "Pal (moment) vs Phal (fruit)",
      phoneticSpelling: "[pəl vs pʰəl]",
      translation: "Moment vs Fruit",
      stressIndices: [0],
      pitchContour: ["mid", "mid"],
      practiceDrills: [
        { phrase: "Kal vs Khal", focusNote: "Practice the puff of air", expectedPace: "slow" },
      ],
    }
  ],
  Kannada: [
    {
      id: "kn-step-1",
      level: "Basic",
      title: "Step 1: Retroflex Consonants",
      subtitle: "Rolling the tongue back",
      conceptDescription: "Kannada has distinct retroflex sounds (ṭ, ḍ, ṇ, ḷ). Roll your tongue back to touch the roof of your mouth.",
      nativeLanguageComparisonTip: "It sounds 'harder' or 'heavier' than the standard t or d.",
      ruleSummary: "Distinguish dental and retroflex consonants clearly.",
      rhythmType: "syllable-timed",
      exampleSentence: "Tale (head) vs Taale (palm)",
      phoneticSpelling: "[ta.le vs ṭa.le]",
      translation: "Head vs Palm Tree",
      stressIndices: [0],
      pitchContour: ["mid", "mid"],
      practiceDrills: [
        { phrase: "Halli (lizard) vs Halli (village)", focusNote: "Listen to the L sounds carefully", expectedPace: "slow" },
      ],
    }
  ],
  Gujarati: [
    {
      id: "gu-step-1",
      level: "Basic",
      title: "Step 1: Murmured Vowels",
      subtitle: "The breathy voice of Gujarati",
      conceptDescription: "Gujarati uses 'murmured' or 'breathy' vowels, where you simultaneously vibrate vocal cords and release extra air.",
      nativeLanguageComparisonTip: "Imagine sighing deeply while speaking the vowel.",
      ruleSummary: "Breathy vowels change meaning.",
      rhythmType: "syllable-timed",
      exampleSentence: "Māro (mine) vs Mhāro (our)",
      phoneticSpelling: "[ma.ro vs mha.ro]",
      translation: "Mine vs Our",
      stressIndices: [0],
      pitchContour: ["mid", "mid"],
      practiceDrills: [
        { phrase: "Bār (twelve) vs Bhār (weight)", focusNote: "Focus on the breathy sound", expectedPace: "slow" },
      ],
    }
  ],
  Telugu: [
    {
      id: "te-step-1",
      level: "Basic",
      title: "Step 1: Vowel Endings (Ajanta)",
      subtitle: "Every word ends in a vowel",
      conceptDescription: "Telugu is known as the 'Italian of the East' because almost all native words end in a vowel sound.",
      nativeLanguageComparisonTip: "Never cut a word off on a consonant. Always let it finish on a soft vowel.",
      ruleSummary: "Ensure final vowels are pronounced clearly.",
      rhythmType: "syllable-timed",
      exampleSentence: "Namaskaramu",
      phoneticSpelling: "[na.mas.kā.ra.mu]",
      translation: "Hello",
      stressIndices: [2],
      pitchContour: ["mid", "mid", "high", "mid", "mid"],
      practiceDrills: [
        { phrase: "Baagunnara (How are you?)", focusNote: "Let the final 'a' ring clearly", expectedPace: "slow" },
      ],
    }
  ],
};

export const AccentCoach: React.FC<AccentCoachProps> = ({
  targetLanguage,
  nativeLanguage = "English",
  onSpeakText,
}) => {
  const steps = ACCENT_MODULES_BY_LANG[targetLanguage] || ACCENT_MODULES_BY_LANG.Spanish;
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedFeedback, setRecordedFeedback] = useState<string | null>(null);

  const activeStep = steps[currentStepIndex] || steps[0];

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      setRecordedFeedback(null);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      setRecordedFeedback(null);
    }
  };

  const simulateRecordAndEvaluate = () => {
    setIsRecording(true);
    setRecordedFeedback(null);
    setTimeout(() => {
      setIsRecording(false);
      setRecordedFeedback(
        "Rhythm & Cadence: 92% native match! Excellent syllable pacing and pitch control."
      );
    }, 2800);
  };

  return (
    <div className="flex flex-col gap-5 p-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 shadow-xl">
      {/* Header with Step Tracker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Music className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-base text-slate-100">
              Step-by-Step Accent & Rhythm Mastery ({targetLanguage})
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Master native cadence, syllable timing, tonic stress, and pitch melody without a 3D avatar distraction.
          </p>
        </div>

        {/* Step Indicator Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
          {steps.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => {
                setCurrentStepIndex(idx);
                setRecordedFeedback(null);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentStepIndex === idx
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              Step {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Active Step Hero Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 border border-slate-800 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {activeStep.level} Accent Drill
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 capitalize">
                {activeStep.rhythmType.replace("-", " ")}
              </span>
            </div>
            <h4 className="text-lg font-bold text-white tracking-tight">
              {activeStep.title}
            </h4>
            <p className="text-xs text-indigo-200/80 font-medium mt-0.5">
              {activeStep.subtitle}
            </p>
          </div>

          <button
            onClick={() => onSpeakText(activeStep.exampleSentence)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer shrink-0"
            title="Listen to native cadence demonstration"
          >
            <Volume2 className="w-4 h-4" />
            <span>Listen Native</span>
          </button>
        </div>

        {/* Core Linguistic Explanation */}
        <p className="text-xs text-slate-300 leading-relaxed">
          {activeStep.conceptDescription}
        </p>

        {/* Bridge Tip relative to language student understands */}
        <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/50 flex items-start gap-2.5 text-xs text-blue-200">
          <HelpCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-blue-100">Comparison with {nativeLanguage}: </strong>
            <span>{activeStep.nativeLanguageComparisonTip}</span>
          </div>
        </div>

        {/* Interactive 2D Pitch & Stress Contour Visualizer */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-slate-400 uppercase text-[10px] tracking-wider">
              2D Melodic Pitch & Syllable Contour
            </span>
            <span className="text-slate-400 text-[11px] font-mono">
              IPA: <span className="text-amber-300">{activeStep.phoneticSpelling}</span>
            </span>
          </div>

          {/* Interactive Syllable Blocks with Pitch Elevation */}
          <div className="flex flex-wrap items-end gap-2 py-3 px-2 overflow-x-auto min-h-[90px] border-b border-slate-900">
            {activeStep.exampleSentence.split("-").map((syllable, sIdx) => {
              const isStressed = activeStep.stressIndices.includes(sIdx);
              const pitch = activeStep.pitchContour[sIdx] || "mid";
              const heightClass =
                pitch === "high" || pitch === "rise"
                  ? "h-16 bg-gradient-to-t from-indigo-600 to-cyan-400 text-white"
                  : pitch === "mid"
                  ? "h-12 bg-slate-800 text-slate-200"
                  : "h-8 bg-slate-900 text-slate-400";

              return (
                <div key={sIdx} className="flex flex-col items-center gap-1.5 min-w-[48px]">
                  <div
                    className={`w-full rounded-lg flex items-center justify-center text-xs font-bold font-mono transition-all ${heightClass} ${
                      isStressed ? "ring-2 ring-amber-400 shadow-md shadow-amber-400/20" : ""
                    }`}
                  >
                    {isStressed && <span className="text-[9px] text-amber-300 mr-0.5">▲</span>}
                    {pitch.toUpperCase()}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      isStressed ? "text-amber-300 font-bold underline" : "text-slate-300"
                    }`}
                  >
                    {syllable.trim()}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>
              Translation: <em className="text-slate-200">"{activeStep.translation}"</em>
            </span>
            <span className="text-amber-400 font-semibold flex items-center gap-1">
              <span>▲ Yellow = Tonic Accent Peak</span>
            </span>
          </div>
        </div>

        {/* Practice Drills for this step */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-300">
            Step Drills to Practice Out Loud:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {activeStep.practiceDrills.map((drill, dIdx) => (
              <div
                key={dIdx}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-2"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-100 font-mono">
                    "{drill.phrase}"
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">{drill.focusNote}</span>
                </div>
                <button
                  onClick={() => onSpeakText(drill.phrase)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 transition-colors shrink-0 cursor-pointer"
                  title="Play drill pronunciation"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recording Practice & Feedback */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={simulateRecordAndEvaluate}
              disabled={isRecording}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                isRecording
                  ? "bg-rose-600 text-white animate-pulse"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200"
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-rose-400" />}
              <span>{isRecording ? "Listening to your rhythm..." : "Test My Accent"}</span>
            </button>

            {recordedFeedback && (
              <span className="text-xs text-emerald-300 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{recordedFeedback}</span>
              </span>
            )}
          </div>

          {/* Step Navigation */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-slate-300 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <button
              onClick={handleNext}
              disabled={currentStepIndex === steps.length - 1}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-xs font-semibold text-white flex items-center gap-1 cursor-pointer"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
