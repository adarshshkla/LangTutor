import React, { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  CheckCircle,
  Circle,
  Play,
  Volume2,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  Award,
  ChevronRight,
  Cloud,
  RotateCcw,
  Compass,
} from "lucide-react";
import { TargetLanguage } from "../../types";
import { StepByStepCurriculumProps, StepLesson, CurriculumModule } from "./types";
import { STEP_BY_STEP_CURRICULUM } from "./curriculumData";
import {
  fetchUserCurriculumProgress,
  saveUserCurriculumProgress,
  subscribeUserCurriculumProgress,
} from "../../lib/userDataService";
import { speechCtrl } from "../../components/SpeechController";

export const StepByStepCurriculum: React.FC<StepByStepCurriculumProps> = ({
  targetLanguage,
  nativeLanguage = "English",
  userId,
  currentTopicId,
  onSelectTopic,
  onSpeakPhrase,
}) => {
  const modules = STEP_BY_STEP_CURRICULUM[targetLanguage] || STEP_BY_STEP_CURRICULUM.Spanish;

  // Flatten lessons for quick lookup
  const allLessons = useMemo(() => {
    return modules.flatMap((m) => m.lessons.map((l) => ({ ...l, moduleId: m.id, moduleTitle: m.title })));
  }, [modules]);

  const [selectedLesson, setSelectedLesson] = useState<StepLesson>(
    modules[0]?.lessons[0] || ({} as StepLesson)
  );

  // Completed steps tracking in database and local cache
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`maestro_progress_${targetLanguage}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.completedLessonIds || [];
      }
    } catch {}
    return [];
  });

  const [lastResumeLessonId, setLastResumeLessonId] = useState<string | null>(null);
  const [isCloudSynced, setIsCloudSynced] = useState(false);
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<string>("");

  // Load progress from Firestore on mount or when targetLanguage / userId changes
  useEffect(() => {
    let isMounted = true;

    async function loadProgress() {
      if (!userId) return;
      try {
        const cloudData = await fetchUserCurriculumProgress(userId, targetLanguage);
        if (cloudData && isMounted) {
          if (cloudData.completedLessonIds) {
            setCompletedLessonIds(cloudData.completedLessonIds);
          }
          if (cloudData.currentLessonId) {
            setLastResumeLessonId(cloudData.currentLessonId);
            const found = allLessons.find((l) => l.id === cloudData.currentLessonId);
            if (found) {
              setSelectedLesson(found);
            }
          }
          setIsCloudSynced(true);
          setLastSavedTimestamp(cloudData.lastActiveDate || new Date().toLocaleTimeString());
        }
      } catch (err) {
        console.warn("Error loading cloud curriculum progress:", err);
      }
    }

    loadProgress();

    // Subscribe to real-time changes
    const unsub = subscribeUserCurriculumProgress(userId || "", targetLanguage, (data) => {
      if (data && isMounted) {
        if (data.completedLessonIds) {
          setCompletedLessonIds(data.completedLessonIds);
        }
        if (data.currentLessonId) {
          setLastResumeLessonId(data.currentLessonId);
        }
        setIsCloudSynced(true);
      }
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, [userId, targetLanguage, allLessons]);

  // Persist curriculum progress whenever lesson is selected or completed
  const persistProgress = (
    newCompletedIds: string[],
    activeLesson: StepLesson
  ) => {
    const total = allLessons.length;
    const completedCount = newCompletedIds.length;
    const progressPercentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;
    const parentModule = modules.find((m) => m.lessons.some((l) => l.id === activeLesson.id)) || modules[0];

    const progressPayload = {
      userId: userId || "guest",
      targetLanguage,
      completedLessonIds: newCompletedIds,
      currentModuleId: parentModule.id,
      currentLessonId: activeLesson.id,
      currentLessonTitle: activeLesson.title,
      progressPercentage,
      completedCount,
      totalLessons: total,
      lastActiveDate: new Date().toISOString(),
    };

    setLastResumeLessonId(activeLesson.id);
    setIsCloudSynced(Boolean(userId));
    setLastSavedTimestamp(new Date().toLocaleTimeString());

    saveUserCurriculumProgress(userId || "", progressPayload);
  };

  // Toggle complete step
  const toggleLessonCompleted = (lessonId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    speechCtrl.playChime("success");
    const nextCompleted = completedLessonIds.includes(lessonId)
      ? completedLessonIds.filter((id) => id !== lessonId)
      : [...completedLessonIds, lessonId];

    setCompletedLessonIds(nextCompleted);
    persistProgress(nextCompleted, selectedLesson);
  };

  // Select a lesson to view
  const handleSelectLesson = (lesson: StepLesson) => {
    setSelectedLesson(lesson);
    speechCtrl.playChime("tap");
    persistProgress(completedLessonIds, lesson);
  };

  // Resume where user left off
  const handleResumeWhereLeftOff = () => {
    const resumeLesson =
      allLessons.find((l) => l.id === lastResumeLessonId) ||
      allLessons.find((l) => !completedLessonIds.includes(l.id)) ||
      allLessons[0];

    if (resumeLesson) {
      setSelectedLesson(resumeLesson);
      speechCtrl.playChime("praise");
      onSelectTopic(resumeLesson.id, resumeLesson.starterPrompt, resumeLesson.title);
    }
  };

  const totalLessons = allLessons.length;
  const completedCount = completedLessonIds.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Identify next uncompleted step for the Resume card
  const nextUncompletedLesson =
    allLessons.find((l) => l.id === lastResumeLessonId) ||
    allLessons.find((l) => !completedLessonIds.includes(l.id)) ||
    allLessons[0];

  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto pr-1">
      {/* Curriculum Header & Database Progress Bar */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/50 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <BookOpen className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-white tracking-tight">
              Step-by-Step Curriculum Roadmap ({targetLanguage})
            </h2>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 font-mono">
              Basic to Mastery
            </span>
            <span className="flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/70 font-mono">
              <Cloud className="w-3 h-3 text-emerald-400" />
              {isCloudSynced ? "Database Synced" : "Locally Cached"}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Structured step-by-step modules taught through {nativeLanguage} bridge instructions. All
            progress is securely stored in your user database.
          </p>
        </div>

        {/* Global Progress Indicator */}
        <div className="flex items-center gap-4 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 self-start md:self-auto shrink-0">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase text-slate-400">Curriculum Progress</span>
            <span className="text-sm font-bold text-blue-400">
              {completedCount} of {totalLessons} Steps Completed
            </span>
          </div>
          <div className="w-20 bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-200">{progressPercent}%</span>
        </div>
      </div>

      {/* Resume Where Left Off Callout Card */}
      {nextUncompletedLesson && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-blue-900/60 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-blue-950/30 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                  Resume Where You Left Off:
                </span>
                <span className="text-xs font-bold text-white">
                  Step {nextUncompletedLesson.stepNumber}: {nextUncompletedLesson.title}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                Target: {nextUncompletedLesson.grammarFocus} ({nextUncompletedLesson.estimatedMinutes} min practice)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleResumeWhereLeftOff}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-600/30 transition-all cursor-pointer active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Resume Lesson</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Left Module Tree, Right Active Lesson Detail Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Modules & Step Timeline */}
        <div className="lg:col-span-6 xl:col-span-7 flex flex-col gap-4">
          {modules.map((mod) => (
            <div
              key={mod.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex flex-col gap-3"
            >
              {/* Module Title Banner */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800/80">
                      {mod.level}
                    </span>
                    <span className="text-xs font-bold text-slate-200">{mod.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    {mod.description}
                  </p>
                </div>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">
                  {mod.lessons.length} {mod.lessons.length === 1 ? "Step" : "Steps"}
                </span>
              </div>

              {/* Step Lesson Items */}
              <div className="flex flex-col gap-2 pt-1 border-t border-slate-800/70">
                {mod.lessons.map((lesson) => {
                  const isSelected = selectedLesson?.id === lesson.id;
                  const isCompleted = completedLessonIds.includes(lesson.id);

                  return (
                    <div
                      key={lesson.id}
                      onClick={() => handleSelectLesson(lesson)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-blue-600/10 border-blue-500/50 shadow-md shadow-blue-500/10"
                          : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => toggleLessonCompleted(lesson.id, e)}
                          className="text-slate-500 hover:text-blue-400 transition-colors cursor-pointer"
                          title={isCompleted ? "Mark incomplete" : "Mark step completed in database"}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400 fill-emerald-950" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </button>

                        <div className="flex flex-col">
                          <span
                            className={`text-xs font-bold ${
                              isSelected ? "text-blue-300" : "text-slate-200"
                            }`}
                          >
                            Step {lesson.stepNumber}: {lesson.title}
                          </span>
                          <span className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {lesson.grammarFocus}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          {lesson.estimatedMinutes}m
                        </span>
                        <ChevronRight
                          className={`w-3.5 h-3.5 ${
                            isSelected ? "text-blue-400" : "text-slate-600"
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Selected Lesson Deep Dive Card */}
        <div className="lg:col-span-6 xl:col-span-5 flex flex-col">
          {selectedLesson?.id ? (
            <div className="sticky top-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col gap-4">
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400">
                    Step {selectedLesson.stepNumber} Details
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {selectedLesson.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {selectedLesson.summary}
                  </p>
                </div>
              </div>

              {/* Grammar Focus Badge */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1">
                <span className="text-[10px] font-mono uppercase text-blue-400 font-bold">
                  Grammar & Linguistic Target:
                </span>
                <span className="text-xs text-slate-200 font-medium leading-relaxed">
                  {selectedLesson.grammarFocus}
                </span>
              </div>

              {/* Key Phrases with Audio & Phonetics */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Key Step Phrases (Click to Listen):</span>
                </span>

                <div className="flex flex-col gap-2">
                  {selectedLesson.keyPhrases.map((phrase, pIdx) => (
                    <div
                      key={pIdx}
                      className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start justify-between gap-3"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-slate-100 font-medium">
                          {phrase.text}
                        </span>
                        <span className="text-[10px] text-amber-300/90 font-mono">
                          {phrase.phonetic}
                        </span>
                        <span className="text-[11px] text-slate-400 mt-0.5">
                          "{phrase.translation}"
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          speechCtrl.playChime("tap");
                          onSpeakPhrase(phrase.text);
                        }}
                        className="p-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 transition-colors shrink-0 cursor-pointer"
                        title="Play audio phrase"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-2">
                <button
                  onClick={() =>
                    onSelectTopic(
                      selectedLesson.id,
                      selectedLesson.starterPrompt,
                      selectedLesson.title
                    )
                  }
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer active:scale-95"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Practice This Step in Live Classroom</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={(e) => toggleLessonCompleted(selectedLesson.id, e)}
                  className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-colors cursor-pointer ${
                    completedLessonIds.includes(selectedLesson.id)
                      ? "bg-emerald-950/30 border-emerald-800 text-emerald-300"
                      : "bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {completedLessonIds.includes(selectedLesson.id)
                      ? "Completed (Click to unmark in Database)"
                      : "Mark as Completed Step in Database"}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-xs">
              Select any step lesson on the left to review its phonetic details and start practicing.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
