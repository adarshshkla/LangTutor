import React from "react";
import {
  MessageSquare,
  Mic,
  BookOpen,
  Sparkles,
  Award,
  Globe,
  Headphones,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  Zap,
  Play,
  RotateCcw,
} from "lucide-react";
import { TargetLanguage, ProficiencyLevel, LessonTopic, UserProfile, TeachingModuleProgress } from "../types";
import { LANGUAGE_CONFIGS, LESSON_TOPICS } from "./LessonCurriculum";

interface DashboardProps {
  targetLanguage: TargetLanguage;
  proficiencyLevel: ProficiencyLevel;
  userProfile: UserProfile | null;
  curriculumProgress?: TeachingModuleProgress | null;
  onOpenOnboarding: (step?: 1 | 2 | 3) => void;
  onSelectLanguage: (lang: TargetLanguage) => void;
  onSelectProficiency: (level: ProficiencyLevel) => void;
  onStartSession: (tab: "stage" | "pronunciation" | "curriculum", topicId?: string) => void;
  onTriggerQuickDemo: (gesture: string) => void;
  onResumeLesson?: () => void;
  onOpenDiagnostics?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  targetLanguage,
  proficiencyLevel,
  userProfile,
  curriculumProgress,
  onOpenOnboarding,
  onSelectLanguage,
  onSelectProficiency,
  onStartSession,
  onResumeLesson,
  onOpenDiagnostics,
}) => {
  const langConfig = LANGUAGE_CONFIGS[targetLanguage];
  const topics: LessonTopic[] = LESSON_TOPICS[targetLanguage] || [];

  const featureCards = [
    {
      id: "stage",
      title: "Interactive 3D Classroom",
      badge: "Real-time 3D & Speech",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      description:
        "Speak directly with the 3D animated tutor. Watch real-time lip-sync, expressive hand gestures, and chalkboard note-taking as you converse.",
      icon: MessageSquare,
      accentGradient: "from-blue-600/20 to-indigo-600/10",
      borderAccent: "hover:border-blue-500/50",
      stats: ["Real-time Viseme Lip Sync", "Dynamic Pointing & Welcoming Gestures", "Instant Voice Synthesis"],
      ctaText: "Enter 3D Classroom",
      action: () => onStartSession("stage"),
    },
    {
      id: "pronunciation",
      title: "Pronunciation & Phonetics Coach",
      badge: "Speech Recognition & AI",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      description:
        "Master authentic accents with syllable-by-syllable breakdowns, speech recognition accuracy ratings, and real-time encouragement gestures.",
      icon: Mic,
      accentGradient: "from-emerald-600/20 to-teal-600/10",
      borderAccent: "hover:border-emerald-500/50",
      stats: ["Phonetic IPA Breakdowns", "Microphone Voice Scoring", "Real-time Pronunciation Tips"],
      ctaText: "Start Pronunciation Lab",
      action: () => onStartSession("pronunciation"),
    },
    {
      id: "curriculum",
      title: "Scenarios & Curriculum Library",
      badge: "Structured Paths",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      description:
        "Choose from curated practical scenarios: ordering at cafes, airport navigation, job interviews, and everyday conversations with targeted vocabulary.",
      icon: BookOpen,
      accentGradient: "from-amber-600/20 to-orange-600/10",
      borderAccent: "hover:border-amber-500/50",
      stats: ["Curated Roleplay Scenarios", "High-frequency Vocabulary Spotlights", "Grammar Rule Mastery"],
      ctaText: "Explore Curriculum",
      action: () => onStartSession("curriculum"),
    },
  ];

  return (
    <div className="h-full overflow-y-auto px-4 py-6 md:px-8 max-w-7xl mx-auto flex flex-col gap-6 text-slate-100">
      {/* Top Banner / Welcome Hero */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-slate-800/80 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                Next-Gen 3D AI Language Tutor
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-slate-800 text-slate-300 border border-slate-700">
                <Globe className="w-3 h-3 text-cyan-400" />
                {targetLanguage}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Learn <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300">{targetLanguage}</span> with a Responsive 3D Voice Tutor
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Experience a tutor that truly listens and talks back with synchronized lips, head turns, and hand gestures. Practice spoken dialogues, refine pronunciation, and master grammar in real time.
            </p>

            {/* Learner Intake Consultation Badge & Fast Switch */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                  {langConfig.flag}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      {userProfile?.name ? `${userProfile.name}'s Curriculum` : "Personalized Language Intake"}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {proficiencyLevel}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Goal: <span className="text-slate-200 font-medium">{userProfile?.learningGoal || "Daily Conversation"}</span> • Focus: <span className="text-slate-200 font-medium">{targetLanguage} ({langConfig.nativeName})</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="btn-reopen-intake"
                  onClick={() => onOpenOnboarding(2)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 border border-blue-500/30 transition-colors flex items-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Consult / Change Language</span>
                </button>
                {onOpenDiagnostics && (
                  <button
                    id="btn-dash-sound-test"
                    onClick={onOpenDiagnostics}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    <Headphones className="w-3.5 h-3.5 text-blue-400" />
                    <span>Test Sound & Mic</span>
                  </button>
                )}
                <button
                  id="btn-quick-launch-classroom"
                  onClick={() => onStartSession("stage")}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-lg shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Launch 3D</span>
                </button>
              </div>
            </div>

            {/* Resume Teaching Module Where You Left Off Card */}
            {curriculumProgress?.currentLessonTitle && (
              <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/60 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                        Resume Where You Left Off:
                      </span>
                      <span className="text-xs font-bold text-white">
                        {curriculumProgress.currentLessonTitle}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Completed: {curriculumProgress.completedCount || 0} of {curriculumProgress.totalLessons || 12} steps ({curriculumProgress.progressPercentage || 0}%) • Synced with Database
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (onResumeLesson) {
                      onResumeLesson();
                    } else {
                      onStartSession("curriculum");
                    }
                  }}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-md transition-all shrink-0 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Resume</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Quick status preview card */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 min-w-[260px]">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-xs font-medium text-slate-400">Learner Profile</span>
              <button
                onClick={() => onOpenOnboarding(1)}
                className="text-[10px] font-semibold text-blue-400 hover:underline"
              >
                {userProfile?.name ? "Edit Account" : "Sign In / Sign Up"}
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Learner:</span>
                <span className="font-semibold text-white">{userProfile?.name || "Guest Student"}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Target Language:</span>
                <span className="font-semibold text-white flex items-center gap-1">
                  <span>{langConfig.flag}</span>
                  <span>{targetLanguage}</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Target Level:</span>
                <span className="font-medium text-blue-300">{proficiencyLevel.split(" ")[0]}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Curriculum Step:</span>
                <span className="font-medium text-cyan-300 line-clamp-1 max-w-[120px]">
                  {curriculumProgress?.currentLessonTitle || "Step 1: Introduction"}
                </span>
              </div>
            </div>
            <button
              id="btn-take-intake-discussion"
              onClick={() => onOpenOnboarding(2)}
              className="w-full mt-1 py-1.5 text-center text-[11px] font-semibold text-blue-300 bg-blue-950/40 hover:bg-blue-900/50 border border-blue-800/60 rounded-lg transition-colors cursor-pointer"
            >
              Take Language Intake Discussion
            </button>
          </div>
        </div>
      </div>

      {/* Main Section Feature Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Learning Modes & Features
          </h2>
          <span className="text-xs text-slate-400">Select any section to begin</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {featureCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                id={`card-feature-${card.id}`}
                onClick={card.action}
                className={`group cursor-pointer rounded-2xl bg-gradient-to-b ${card.accentGradient} bg-slate-900/90 border border-slate-800 ${card.borderAccent} p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 shadow-xl`}
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-white shadow-md group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-cyan-400" />
                    </div>
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/70 space-y-1.5">
                    {card.stats.map((stat, sIdx) => (
                      <div key={sIdx} className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span>{stat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-cyan-400 group-hover:text-cyan-300">
                  <span>{card.ctaText}</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Featured Lesson Scenarios for Current Language */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            Quick-Start Lesson Scenarios ({targetLanguage})
          </h2>
          <span className="text-xs text-slate-400">Jump right into a targeted dialogue</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.slice(0, 3).map((topic) => (
            <div
              key={topic.id}
              id={`card-topic-${topic.id}`}
              onClick={() => onStartSession("stage", topic.id)}
              className="p-4 rounded-xl bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-all flex flex-col justify-between gap-3 group"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-100 group-hover:text-blue-300 transition-colors">
                    {topic.title}
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                    {topic.category}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {topic.description}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {topic.targetVocab.slice(0, 3).map((vocab, vIdx) => (
                    <span
                      key={vIdx}
                      className="px-2 py-0.5 rounded text-[10px] bg-slate-950/80 text-cyan-300 border border-slate-800 font-mono"
                    >
                      {vocab}
                    </span>
                  ))}
                  {topic.targetVocab.length > 3 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
                      +{topic.targetVocab.length - 3}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] font-semibold text-blue-400 group-hover:text-blue-300">
                  <span>Start Scenario with 3D Tutor</span>
                  <Play className="w-3 h-3 fill-current" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
