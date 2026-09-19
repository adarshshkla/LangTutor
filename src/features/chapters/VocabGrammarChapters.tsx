import React, { useState, useMemo } from "react";
import {
  BookOpen,
  Sparkles,
  Search,
  CheckCircle2,
  HelpCircle,
  Volume2,
  ChevronRight,
  ArrowRight,
  GraduationCap,
  Layers,
  Award,
  Send,
  AlertTriangle,
  RotateCcw,
  Check,
  X,
  Play,
  Lightbulb,
  Clock,
  Compass,
  Briefcase,
  Brain,
} from "lucide-react";
import { TargetLanguage, VocabularyItem } from "../../types";
import { VOCABULARY_CHAPTERS, GRAMMAR_CHAPTERS } from "./chaptersData";
import { VocabChapter, GrammarChapter, VocabWord, ChapterCEFR } from "./types";
import { speechCtrl } from "../../components/SpeechController";

interface VocabGrammarChaptersProps {
  targetLanguage: TargetLanguage;
  userId?: string;
  onSendToSmartboard?: (item: VocabularyItem) => void;
  onPracticeWithTutor?: (prompt: string, title?: string) => void;
  onSelectTopic?: (topicId: string, starterPrompt: string, title?: string) => void;
}

export function VocabGrammarChapters({
  targetLanguage,
  userId,
  onSendToSmartboard,
  onPracticeWithTutor,
  onSelectTopic,
}: VocabGrammarChaptersProps) {
  // Navigation & Filter State
  const [activeMode, setActiveMode] = useState<"all" | "vocab" | "grammar" | "flashcards">("all");
  const [selectedLevel, setSelectedLevel] = useState<"all" | ChapterCEFR>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Interactive Chapter State
  const [expandedVocabChapterId, setExpandedVocabChapterId] = useState<string | null>(null);
  const [expandedGrammarChapterId, setExpandedGrammarChapterId] = useState<string | null>(null);
  const [activeQuizChapterId, setActiveQuizChapterId] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});

  // Flashcard Drill State
  const [flashcardChapterId, setFlashcardChapterId] = useState<string | null>(null);
  const [flashcardIndex, setFlashcardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [masteredWordIds, setMasteredWordIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(`maestro_mastered_words_${targetLanguage}`);
      return saved ? new Set(JSON.parse(saved)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Get data for active language (fall back to English if targetLanguage has no chapters yet)
  const vocabChapters = useMemo(() => {
    const direct = VOCABULARY_CHAPTERS[targetLanguage];
    if (direct && direct.length > 0) return direct;
    return VOCABULARY_CHAPTERS.English || [];
  }, [targetLanguage]);

  const grammarChapters = useMemo(() => {
    const direct = GRAMMAR_CHAPTERS[targetLanguage];
    if (direct && direct.length > 0) return direct;
    return GRAMMAR_CHAPTERS.English || [];
  }, [targetLanguage]);

  // Filtered Vocabulary Chapters
  const filteredVocab = useMemo(() => {
    return vocabChapters.filter((ch) => {
      const matchLevel = selectedLevel === "all" || ch.cefrLevel === selectedLevel;
      const matchSearch =
        !searchQuery.trim() ||
        ch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.words.some(
          (w) =>
            w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
            w.meaning.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchLevel && matchSearch;
    });
  }, [vocabChapters, selectedLevel, searchQuery]);

  // Filtered Grammar Chapters
  const filteredGrammar = useMemo(() => {
    return grammarChapters.filter((ch) => {
      const matchLevel = selectedLevel === "all" || ch.cefrLevel === selectedLevel;
      const matchSearch =
        !searchQuery.trim() ||
        ch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.formula.toLowerCase().includes(searchQuery.toLowerCase());
      return matchLevel && matchSearch;
    });
  }, [grammarChapters, selectedLevel, searchQuery]);

  // Pronounce word
  const handlePronounce = (text: string) => {
    const langCode = targetLanguage === "Spanish" ? "es-ES" : "en-US";
    speechCtrl.speak(text, langCode, 0.9);
  };

  // Toggle Word Mastery
  const toggleWordMastery = (wordId: string) => {
    setMasteredWordIds((prev) => {
      const next = new Set(prev);
      if (next.has(wordId)) {
        next.delete(wordId);
      } else {
        next.add(wordId);
      }
      try {
        localStorage.setItem(
          `maestro_mastered_words_${targetLanguage}`,
          JSON.stringify(Array.from(next))
        );
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Push word to smartboard
  const handlePushToSmartboard = (w: VocabWord) => {
    if (onSendToSmartboard) {
      onSendToSmartboard({
        word: w.word,
        phonetic: w.ipa,
        meaning: w.meaning,
        example: w.exampleSentence,
      });
      showToast(`Added "${w.word}" to Classroom Smartboard!`);
    }
  };

  // Launch practice prompt with tutor
  const handleLaunchPractice = (prompt: string, title?: string) => {
    if (onPracticeWithTutor) {
      onPracticeWithTutor(prompt, title);
    } else if (onSelectTopic) {
      onSelectTopic("custom-chapter", prompt, title);
    }
  };

  // Flashcard Deck
  const activeFlashcardChapter = useMemo(() => {
    if (!flashcardChapterId) return vocabChapters[0];
    return vocabChapters.find((c) => c.id === flashcardChapterId) || vocabChapters[0];
  }, [flashcardChapterId, vocabChapters]);

  const currentFlashcard = activeFlashcardChapter?.words[flashcardIndex] || null;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Banner with Stats */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950/60 to-slate-900 border border-slate-800/80 p-6 md:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-semibold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Vocabulary & Grammar Academy</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Chapters of Vocabulary & Grammar
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Step-by-step masterclasses featuring phonetic IPA pronunciations, algebraic sentence
              formulas, high-frequency collocations, side-by-side corrections, and live classroom smartboard sync.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 text-center">
              <span className="text-xl font-black text-blue-400">
                {vocabChapters.length}
              </span>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Vocab Chapters</p>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 text-center">
              <span className="text-xl font-black text-purple-400">
                {grammarChapters.length}
              </span>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Grammar Chapters</p>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 text-center">
              <span className="text-xl font-black text-emerald-400">
                {masteredWordIds.size}
              </span>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Words Mastered</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls: Mode Switcher, CEFR Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 p-3 rounded-2xl">
        {/* Mode Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveMode("all")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeMode === "all"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All Chapters
          </button>
          <button
            type="button"
            onClick={() => setActiveMode("vocab")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMode === "vocab"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Vocabulary ({filteredVocab.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode("grammar")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMode === "grammar"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Grammar ({filteredGrammar.length})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveMode("flashcards");
              if (!flashcardChapterId && vocabChapters[0]) {
                setFlashcardChapterId(vocabChapters[0].id);
                setFlashcardIndex(0);
                setIsFlipped(false);
              }
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMode === "flashcards"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Flashcard Drill</span>
          </button>
        </div>

        {/* Filter & Search */}
        <div className="flex items-center gap-3">
          {/* CEFR Level Filter */}
          <div className="flex items-center gap-1 bg-slate-950/80 px-2 py-1 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-500 font-medium pl-1 text-[11px]">Level:</span>
            {(["all", "A1", "A2", "B1", "B2", "C1"] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setSelectedLevel(lvl)}
                className={`px-2 py-0.5 rounded-md font-semibold text-[11px] transition-all cursor-pointer ${
                  selectedLevel === lvl
                    ? "bg-slate-700 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {lvl.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search words, rules, idioms..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* FLASHCARD DRILL VIEW */}
      {activeMode === "flashcards" && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Active Recall Flashcard Studio</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Flip cards, test your memory, listen to pronunciation, and mark words as mastered.
              </p>
            </div>

            {/* Chapter Picker for Flashcards */}
            <select
              value={activeFlashcardChapter?.id}
              onChange={(e) => {
                setFlashcardChapterId(e.target.value);
                setFlashcardIndex(0);
                setIsFlipped(false);
              }}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {vocabChapters.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  Chapter {ch.chapterNumber}: {ch.title} ({ch.cefrLevel})
                </option>
              ))}
            </select>
          </div>

          {currentFlashcard ? (
            <div className="max-w-xl mx-auto space-y-6">
              {/* Card Container */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="min-h-[260px] bg-gradient-to-b from-slate-950 to-slate-900 border-2 border-slate-700/80 hover:border-blue-500/80 rounded-3xl p-8 flex flex-col justify-between items-center text-center cursor-pointer shadow-2xl transition-all select-none relative group"
              >
                <div className="w-full flex items-center justify-between text-xs text-slate-500">
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-blue-400 font-semibold uppercase text-[10px]">
                    {currentFlashcard.partOfSpeech}
                  </span>
                  <span>
                    Card {flashcardIndex + 1} of {activeFlashcardChapter.words.length}
                  </span>
                </div>

                {!isFlipped ? (
                  /* Front Side */
                  <div className="my-auto space-y-3">
                    <h4 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                      {currentFlashcard.word}
                    </h4>
                    <p className="text-base text-blue-400 font-mono">
                      {currentFlashcard.ipa}
                    </p>
                    <p className="text-xs text-slate-500 italic mt-4">
                      (Click card to reveal meaning & example)
                    </p>
                  </div>
                ) : (
                  /* Back Side */
                  <div className="my-auto space-y-3 text-center">
                    <p className="text-base font-semibold text-white">
                      {currentFlashcard.meaning}
                    </p>
                    <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
                      "{currentFlashcard.exampleSentence}"
                    </div>
                    {currentFlashcard.exampleTranslation && (
                      <p className="text-[11px] text-slate-400 italic">
                        {currentFlashcard.exampleTranslation}
                      </p>
                    )}
                  </div>
                )}

                {/* Flip Hint */}
                <div className="w-full flex items-center justify-between pt-4 border-t border-slate-800/80 text-[11px] text-slate-500">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePronounce(currentFlashcard.word);
                    }}
                    className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen</span>
                  </button>

                  <span className="text-slate-400">Click anywhere to flip</span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWordMastery(currentFlashcard.id);
                    }}
                    className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                      masteredWordIds.has(currentFlashcard.id)
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>
                      {masteredWordIds.has(currentFlashcard.id) ? "Mastered" : "Mark Mastered"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Prev / Next Controls */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  disabled={flashcardIndex === 0}
                  onClick={() => {
                    setFlashcardIndex((prev) => Math.max(0, prev - 1));
                    setIsFlipped(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handlePushToSmartboard(currentFlashcard);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send to Smartboard</span>
                </button>

                <button
                  type="button"
                  disabled={flashcardIndex >= activeFlashcardChapter.words.length - 1}
                  onClick={() => {
                    setFlashcardIndex((prev) =>
                      Math.min(activeFlashcardChapter.words.length - 1, prev + 1)
                    );
                    setIsFlipped(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <span>Next Word</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <p className="text-center text-slate-500 py-12">No flashcards in this chapter.</p>
          )}
        </div>
      )}

      {/* VOCABULARY CHAPTERS SECTION */}
      {(activeMode === "all" || activeMode === "vocab") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span>Vocabulary Chapters ({filteredVocab.length})</span>
            </h3>
            <span className="text-xs text-slate-400">
              Curated by linguistic frequency & practical usage
            </span>
          </div>

          <div className="space-y-4">
            {filteredVocab.map((ch) => {
              const isExpanded = expandedVocabChapterId === ch.id;
              const isQuizActive = activeQuizChapterId === ch.id;

              return (
                <div
                  key={ch.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl overflow-hidden transition-all shadow-md"
                >
                  {/* Chapter Header Card */}
                  <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 font-black text-sm">
                        Ch.{ch.chapterNumber}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-bold text-white tracking-tight">
                            {ch.title}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[10px] font-bold">
                            {ch.cefrLevel}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-medium">
                            {ch.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                          {ch.summary}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveQuizChapterId(isQuizActive ? null : ch.id);
                        }}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isQuizActive
                            ? "bg-amber-600 text-white border-amber-500"
                            : "bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700"
                        }`}
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Chapter Quiz</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setExpandedVocabChapterId(isExpanded ? null : ch.id);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                      >
                        <span>{isExpanded ? "Hide Words" : `Study ${ch.words.length} Words`}</span>
                        <ChevronRight
                          className={`w-3.5 h-3.5 transition-transform ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* CHAPTER QUIZ DRAWER */}
                  {isQuizActive && ch.quizQuestions && ch.quizQuestions.length > 0 && (
                    <div className="bg-slate-950/90 border-t border-amber-500/30 p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-amber-400" />
                          <h5 className="text-sm font-bold text-white">
                            Chapter {ch.chapterNumber} Knowledge Check
                          </h5>
                        </div>
                        <span className="text-xs text-slate-400">
                          {ch.quizQuestions.length} Questions
                        </span>
                      </div>

                      <div className="space-y-4">
                        {ch.quizQuestions.map((q, qIndex) => {
                          const userAns = quizAnswers[`${ch.id}_${q.id}`];
                          const isAnswered = userAns !== undefined;
                          const isCorrect = userAns === q.correctIndex;

                          return (
                            <div
                              key={q.id}
                              className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3"
                            >
                              <p className="text-xs font-bold text-white">
                                {qIndex + 1}. {q.question}
                              </p>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {q.options.map((opt, optIndex) => {
                                  const isSelected = userAns === optIndex;
                                  let btnColor =
                                    "bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800";

                                  if (isAnswered) {
                                    if (optIndex === q.correctIndex) {
                                      btnColor = "bg-emerald-600/20 text-emerald-300 border-emerald-500";
                                    } else if (isSelected && !isCorrect) {
                                      btnColor = "bg-rose-600/20 text-rose-300 border-rose-500";
                                    }
                                  } else if (isSelected) {
                                    btnColor = "bg-blue-600/20 text-blue-300 border-blue-500";
                                  }

                                  return (
                                    <button
                                      key={optIndex}
                                      type="button"
                                      disabled={isAnswered}
                                      onClick={() => {
                                        setQuizAnswers((prev) => ({
                                          ...prev,
                                          [`${ch.id}_${q.id}`]: optIndex,
                                        }));
                                      }}
                                      className={`p-2.5 rounded-lg border text-left text-xs font-medium transition-all cursor-pointer ${btnColor}`}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>

                              {isAnswered && (
                                <div
                                  className={`p-2.5 rounded-lg text-xs flex items-start gap-2 ${
                                    isCorrect
                                      ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                                      : "bg-rose-500/10 text-rose-300 border border-rose-500/30"
                                  }`}
                                >
                                  {isCorrect ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                  ) : (
                                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                                  )}
                                  <p>{q.explanation}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* EXPANDED WORD LIST */}
                  {isExpanded && (
                    <div className="border-t border-slate-800/80 bg-slate-950/60 p-5 divide-y divide-slate-800/60">
                      {ch.words.map((w) => {
                        const isMastered = masteredWordIds.has(w.id);

                        return (
                          <div
                            key={w.id}
                            className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-start justify-between gap-4"
                          >
                            <div className="space-y-1.5 max-w-xl">
                              <div className="flex items-center gap-2.5">
                                <h5 className="text-base font-bold text-white">{w.word}</h5>
                                <span className="text-xs text-blue-400 font-mono">{w.ipa}</span>
                                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-semibold uppercase">
                                  {w.partOfSpeech}
                                </span>
                              </div>

                              <p className="text-xs text-slate-300 font-medium">{w.meaning}</p>

                              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 text-xs text-slate-300">
                                <p className="italic">"{w.exampleSentence}"</p>
                                {w.exampleTranslation && (
                                  <p className="text-[11px] text-slate-500 mt-1">
                                    {w.exampleTranslation}
                                  </p>
                                )}
                              </div>

                              {w.collocations && w.collocations.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                  <span className="text-[10px] text-slate-500 font-semibold uppercase">
                                    Collocations:
                                  </span>
                                  {w.collocations.map((col, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 text-[10px]"
                                    >
                                      {col}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Word Action Controls */}
                            <div className="flex items-center gap-2 shrink-0 self-end md:self-start pt-1">
                              <button
                                type="button"
                                onClick={() => handlePronounce(w.word)}
                                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-white transition-colors cursor-pointer"
                                title="Listen to pronunciation"
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handlePushToSmartboard(w)}
                                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                                title="Send word to 3D Smartboard"
                              >
                                <Send className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => toggleWordMastery(w.id)}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                                  isMastered
                                    ? "bg-emerald-600 text-white"
                                    : "bg-slate-800 text-slate-400 hover:text-slate-200"
                                }`}
                                title="Toggle mastery status"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>{isMastered ? "Mastered" : "Learn"}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleLaunchPractice(
                                    `Hello Maestro! I am studying the word "${w.word}" (${w.ipa}). Can we practice using it in natural conversation?`,
                                    `Practice: ${w.word}`
                                  )
                                }
                                className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 text-xs font-semibold transition-colors cursor-pointer"
                              >
                                <span>Practice in Stage</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* GRAMMAR CHAPTERS SECTION */}
      {(activeMode === "all" || activeMode === "grammar") && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Grammar Masterclasses ({filteredGrammar.length})</span>
            </h3>
            <span className="text-xs text-slate-400">
              Formulas, conceptual mental models, and error prevention
            </span>
          </div>

          <div className="space-y-4">
            {filteredGrammar.map((ch) => {
              const isExpanded = expandedGrammarChapterId === ch.id;

              return (
                <div
                  key={ch.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl overflow-hidden transition-all shadow-md"
                >
                  {/* Grammar Chapter Header */}
                  <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 font-black text-sm">
                        §{ch.chapterNumber}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-bold text-white tracking-tight">
                            {ch.title}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-400 text-[10px] font-bold">
                            {ch.cefrLevel}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-medium">
                            {ch.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                          {ch.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          handleLaunchPractice(ch.practicePrompt, ch.title)
                        }
                        className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Interactive Lesson</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedGrammarChapterId(isExpanded ? null : ch.id)
                        }
                        className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                      >
                        <span>{isExpanded ? "Hide Breakdown" : "Explore Rules"}</span>
                        <ChevronRight
                          className={`w-3.5 h-3.5 transition-transform ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* EXPANDED GRAMMAR CONTENT */}
                  {isExpanded && (
                    <div className="border-t border-slate-800/80 bg-slate-950/60 p-6 space-y-6">
                      {/* Formula Banner */}
                      <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-800/40 space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                          <Lightbulb className="w-3.5 h-3.5 text-purple-400" />
                          <span>Syntax Blueprint & Formula:</span>
                        </div>
                        <code className="block text-sm md:text-base font-mono font-bold text-purple-200">
                          {ch.formula}
                        </code>
                      </div>

                      {/* Deep Explanation */}
                      <div className="space-y-2">
                        <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                          Conceptual Foundation
                        </h5>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {ch.deepExplanation}
                        </p>
                      </div>

                      {/* Key Rules List */}
                      {ch.keyRules && ch.keyRules.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                            Essential Rules of the Road
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            {ch.keyRules.map((rule, rIdx) => (
                              <div
                                key={rIdx}
                                className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5"
                              >
                                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                                <span>{rule}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Common Pitfalls Box */}
                      {ch.commonPitfalls && ch.commonPitfalls.length > 0 && (
                        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                            <span>Common Native-Speaker Traps to Avoid:</span>
                          </div>
                          <ul className="space-y-1.5 pl-5 list-disc text-xs text-amber-200/90">
                            {ch.commonPitfalls.map((pit, pIdx) => (
                              <li key={pIdx}>{pit}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Side-by-Side Example Comparison */}
                      {ch.examples && ch.examples.length > 0 && (
                        <div className="space-y-2.5">
                          <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                            Exemplars & Contrast Analysis
                          </h5>
                          <div className="space-y-2">
                            {ch.examples.map((ex, exIdx) => (
                              <div
                                key={exIdx}
                                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5"
                              >
                                <div className="flex items-start gap-2 text-xs font-semibold text-emerald-400">
                                  <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                                  <span>{ex.correct}</span>
                                </div>
                                {ex.incorrect && (
                                  <div className="flex items-start gap-2 text-xs font-medium text-rose-400 pl-6 line-through decoration-rose-500">
                                    <span>{ex.incorrect}</span>
                                  </div>
                                )}
                                <p className="text-[11px] text-slate-400 pl-6">{ex.explanation}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Practice Exercises Check */}
                      {ch.practiceExercises && ch.practiceExercises.length > 0 && (
                        <div className="space-y-3 pt-2">
                          <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                            Interactive Syntax Drill
                          </h5>
                          {ch.practiceExercises.map((pex, pIdx) => {
                            const ansKey = `grammar_${ch.id}_${pex.id}`;
                            const userAns = quizAnswers[ansKey];
                            const isAnswered = userAns !== undefined;
                            const isCorrect = userAns === pex.correctIndex;

                            return (
                              <div
                                key={pex.id}
                                className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3"
                              >
                                <p className="text-xs font-bold text-white">
                                  {pIdx + 1}. {pex.question}
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {pex.options.map((opt, oIdx) => {
                                    const isSelected = userAns === oIdx;
                                    let btnColor =
                                      "bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800";

                                    if (isAnswered) {
                                      if (oIdx === pex.correctIndex) {
                                        btnColor =
                                          "bg-emerald-600/20 text-emerald-300 border-emerald-500";
                                      } else if (isSelected && !isCorrect) {
                                        btnColor = "bg-rose-600/20 text-rose-300 border-rose-500";
                                      }
                                    }

                                    return (
                                      <button
                                        key={oIdx}
                                        type="button"
                                        disabled={isAnswered}
                                        onClick={() =>
                                          setQuizAnswers((prev) => ({
                                            ...prev,
                                            [ansKey]: oIdx,
                                          }))
                                        }
                                        className={`p-2.5 rounded-lg border text-left text-xs font-medium transition-all cursor-pointer ${btnColor}`}
                                      >
                                        {opt}
                                      </button>
                                    );
                                  })}
                                </div>

                                {isAnswered && (
                                  <div
                                    className={`p-2.5 rounded-lg text-xs flex items-start gap-2 ${
                                      isCorrect
                                        ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                                        : "bg-rose-500/10 text-rose-300 border border-rose-500/30"
                                    }`}
                                  >
                                    {isCorrect ? (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                    ) : (
                                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                                    )}
                                    <p>{pex.explanation}</p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
