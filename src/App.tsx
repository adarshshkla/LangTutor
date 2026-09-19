import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Languages,
  Award,
  Sparkles,
  Volume2,
  BookOpen,
  MessageSquare,
  Mic,
  Settings2,
  HelpCircle,
  GraduationCap,
  VolumeX,
  LayoutDashboard,
  User,
  ChevronDown,
  Trash2,
  Layers,
} from "lucide-react";
import { Dashboard } from "./features/dashboard";
import { TutorCanvas } from "./features/avatar";
import { ConversationPanel } from "./features/conversation";
import { SmartWhiteboard } from "./features/smartboard";
import { PronunciationSuite } from "./features/pronunciation";
import { StepByStepCurriculum } from "./features/curriculum";
import { AuthOnboardingModal } from "./features/auth";
import { VocabGrammarChapters } from "./features/chapters";
import { AudioDiagnosticsModal } from "./components/AudioDiagnosticsModal";
import { speechCtrl } from "./components/SpeechController";
import {
  LANGUAGE_CONFIGS,
  LESSON_TOPICS,
} from "./components/LessonCurriculum";
import {
  ChatMessage,
  GestureType,
  GrammarFeedback,
  LessonTopic,
  ProficiencyLevel,
  TargetLanguage,
  TutorResponse,
  VocabularyItem,
  UserProfile,
  TeachingModuleProgress,
} from "./types";
import { auth } from "./lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  fetchUserProfile,
  saveUserProfile,
  saveConversationMessage,
  savePronunciationAttempt,
  signOutUser,
  deleteCurrentUserData,
  subscribeUserCurriculumProgress,
  checkRedirectSignInResult,
} from "./lib/userDataService";

export function App() {
  // User Profile & Onboarding State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem("maestro_user_profile");
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    // If no user profile exists, open the intake consultation modal on first visit!
    try {
      const saved = localStorage.getItem("maestro_user_profile");
      return !saved;
    } catch {
      return false;
    }
  });
  const [onboardingForcedStep, setOnboardingForcedStep] = useState<1 | 2 | 3>(1);

  // Synchronize with Firebase Auth State & load Firestore profile
  useEffect(() => {
    // Check if user just completed a Google OAuth redirect
    checkRedirectSignInResult().then((redirectProfile) => {
      if (redirectProfile) {
        setUserProfile(redirectProfile);
        setTargetLanguage(redirectProfile.targetLanguage);
        setProficiencyLevel(redirectProfile.proficiencyLevel);
        localStorage.setItem("maestro_user_profile", JSON.stringify(redirectProfile));
      }
    });

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const profile = await fetchUserProfile(fbUser.uid);
          if (profile) {
            setUserProfile(profile);
            setTargetLanguage(profile.targetLanguage);
            setProficiencyLevel(profile.proficiencyLevel);
            localStorage.setItem("maestro_user_profile", JSON.stringify(profile));
          }
        } catch (e) {
          console.error("Failed to load user profile on auth change:", e);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Navigation & Preferences - Starts at dashboard as requested by user
  const [targetLanguage, setTargetLanguage] = useState<TargetLanguage>(
    userProfile?.targetLanguage || "English"
  );
  const [proficiencyLevel, setProficiencyLevel] = useState<ProficiencyLevel>(
    userProfile?.proficiencyLevel || "Beginner (A1-A2)"
  );
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "stage" | "pronunciation" | "curriculum" | "chapters"
  >("dashboard");
  const [selectedTopicId, setSelectedTopicId] = useState<string>("en-small-talk");
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState<boolean>(false);
  const [curriculumProgress, setCurriculumProgress] = useState<TeachingModuleProgress | null>(null);
  const [audioErrorToast, setAudioErrorToast] = useState<string | null>(null);

  // Subscribe to real-time curriculum progress for active user & language
  useEffect(() => {
    const unsub = subscribeUserCurriculumProgress(
      userProfile?.id || "",
      targetLanguage,
      (data) => {
        setCurriculumProgress(data);
      }
    );
    return () => unsub();
  }, [userProfile?.id, targetLanguage]);

  // 3D Avatar State
  const [currentGesture, setCurrentGesture] = useState<GestureType>("welcoming");
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [viseme, setViseme] = useState<{ openness: number; pucker: number; smile: number }>({
    openness: 0,
    pucker: 0,
    smile: 0.2,
  });
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [interimTranscript, setInterimTranscript] = useState<string>("");

  // Classroom Smartboard State
  const [boardNotes, setBoardNotes] = useState<string[]>([
    "Welcome to Maestro AI English Tutor!",
    "Master vocabulary, grammar chapters & spoken conversation.",
    "Click the microphone or choose a suggested reply.",
  ]);
  const [activeWord, setActiveWord] = useState<string>("Pleasure");
  const [activePhonetic, setActivePhonetic] = useState<string>("/ˈpleʒ.ər/");
  const [vocabularySpotlight, setVocabularySpotlight] = useState<VocabularyItem[]>([
    {
      word: "Pleasure",
      phonetic: "/ˈpleʒ.ər/",
      meaning: "A feeling of happy satisfaction; polite greeting",
      example: "It is a true pleasure to meet you.",
    },
    {
      word: "Appreciate",
      phonetic: "/əˈpriː.ʃi.eɪt/",
      meaning: "To recognize value or express sincere gratitude",
      example: "I deeply appreciate your guidance.",
    },
  ]);
  const [grammarFeedback, setGrammarFeedback] = useState<GrammarFeedback | null>(null);
  const [pronunciationTip, setPronunciationTip] = useState<string>(
    "Keep vowels clear and unreduced. Watch the 2D mouth anatomy visualizer!"
  );

  // Chat conversation
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>(
    LANGUAGE_CONFIGS[userProfile?.targetLanguage || "English"].defaultSuggestedReplies
  );

  // Automatically update suggested replies whenever target language changes
  useEffect(() => {
    const config = LANGUAGE_CONFIGS[targetLanguage];
    if (config?.defaultSuggestedReplies) {
      setSuggestedReplies(config.defaultSuggestedReplies);
    }
  }, [targetLanguage]);

  const langConfig = LANGUAGE_CONFIGS[targetLanguage];
  const availableTopics = LESSON_TOPICS[targetLanguage] || [];
  const currentTopic =
    availableTopics.find((t) => t.id === selectedTopicId) || availableTopics[0];

  // Helper to trigger voice synthesis + 3D lip-sync + gesture
  const speakWithAvatar = useCallback(
    (text: string, gestureToPerform: GestureType = "explaining") => {
      setCurrentGesture(gestureToPerform);

      speechCtrl.speak(text, langConfig.defaultVoiceLang, speechRate, {
        onStart: () => {
          setIsSpeaking(true);
        },
        onViseme: (openness, pucker, smile) => {
          setViseme({ openness, pucker, smile });
        },
        onEnd: () => {
          setIsSpeaking(false);
          setViseme({ openness: 0, pucker: 0, smile: 0.2 });
          // return to gentle idle or keep teaching pose
          setTimeout(() => {
            setCurrentGesture((prev) => (prev === gestureToPerform ? "idle" : prev));
          }, 1200);
        },
        onError: (err) => {
          console.warn("Speech synthesis error:", err);
          setIsSpeaking(false);
          setViseme({ openness: 0, pucker: 0, smile: 0.2 });
          setCurrentGesture("idle");
        },
      });
    },
    [langConfig.defaultVoiceLang, speechRate]
  );

  // Handle User Message Submission
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // 1. Add user message
    const userMsg: ChatMessage = {
      id: "user-" + Date.now(),
      role: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setCurrentGesture("thinking");

    if (userProfile?.id) {
      saveConversationMessage(userProfile.id, userMsg, targetLanguage);
    }

    try {
      const response = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          targetLanguage,
          level: proficiencyLevel,
          topic: currentTopic?.title || "General Practice",
          studentName: userProfile?.name || "Student",
          learningGoal: userProfile?.learningGoal || "Daily Conversation & Socializing",
          nativeLanguage: userProfile?.nativeLanguage || "English",
          history: messages.slice(-5).map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      if (!response.ok) throw new Error("Server response failed");

      const data: TutorResponse = await response.json();

      // 2. Update smartboard & feedback
      if (data.boardNotes && data.boardNotes.length > 0) {
        setBoardNotes(data.boardNotes);
      }
      if (data.vocabularySpotlight && data.vocabularySpotlight.length > 0) {
        setVocabularySpotlight(data.vocabularySpotlight);
        setActiveWord(data.vocabularySpotlight[0].word);
        setActivePhonetic(data.vocabularySpotlight[0].phonetic);
      }
      if (data.grammarFeedback) {
        setGrammarFeedback(data.grammarFeedback);
      } else {
        setGrammarFeedback(null);
      }
      if (data.pronunciationTip) {
        setPronunciationTip(data.pronunciationTip);
      }
      if (data.suggestedReplies) {
        setSuggestedReplies(data.suggestedReplies);
      }

      // 3. Add tutor chat message
      const tutorMsg: ChatMessage = {
        id: "tutor-" + Date.now(),
        role: "tutor",
        text: data.spokenText,
        translation: data.translation,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        gesture: data.gesture || "explaining",
        feedback: data.grammarFeedback,
        vocabulary: data.vocabularySpotlight,
        boardNotes: data.boardNotes,
      };

      setMessages((prev) => [...prev, tutorMsg]);

      if (userProfile?.id) {
        saveConversationMessage(userProfile.id, tutorMsg, targetLanguage);
      }

      // 4. Speak with avatar, lipsync, and perform gesture
      speakWithAvatar(data.spokenText, data.gesture || "explaining");
    } catch (err) {
      console.error(err);
      // Fallback
      const fallbackText = `I understand! Let's continue practicing ${targetLanguage}.`;
      speakWithAvatar(fallbackText, "encouraging");
      setMessages((prev) => [
        ...prev,
        {
          id: "tutor-" + Date.now(),
          role: "tutor",
          text: fallbackText,
          translation: fallbackText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          gesture: "encouraging",
        },
      ]);
    }
  };

  // Real-time Mic Listening for Chat
  const handleStartListening = async () => {
    setIsListening(true);
    setCurrentGesture("listening");
    setInterimTranscript("");
    setAudioErrorToast(null);

    const supported = await speechCtrl.startListening(
      langConfig.defaultVoiceLang,
      (transcript, isFinal) => {
        setInterimTranscript(transcript);
        if (isFinal) {
          setIsListening(false);
          setInterimTranscript("");
          handleSendMessage(transcript);
        }
      },
      (err) => {
        console.warn("Speech recognition error:", err);
        setIsListening(false);
        setAudioErrorToast(err);
      },
      () => {
        setIsListening(false);
      }
    );

    if (!supported) {
      setIsListening(false);
      setAudioErrorToast("Microphone input or speech recognition is blocked by your browser. Click 'Audio & Mic Test' to resolve.");
    }
  };

  const handleStopListening = () => {
    speechCtrl.stopListening();
    setIsListening(false);
    if (interimTranscript.trim()) {
      handleSendMessage(interimTranscript.trim());
      setInterimTranscript("");
    }
  };

  // Language Change Effect
  useEffect(() => {
    const topics = LESSON_TOPICS[targetLanguage] || [];
    if (topics.length > 0) {
      setSelectedTopicId(topics[0].id);
    }
    // Greet the student in the new language
    const starter = LANGUAGE_CONFIGS[targetLanguage].sampleStarter;
    const initialText =
      targetLanguage === "Spanish"
        ? "¡Hola! Soy tu tutor 3D de idiomas. ¿Listo para practicar hoy?"
        : targetLanguage === "French"
        ? "Bonjour ! Je suis votre tuteur 3D de français. Prêt à pratiquer ?"
        : targetLanguage === "Japanese"
        ? "こんにちは！3D日本語チューターです。一緒に練習しましょう！"
        : targetLanguage === "German"
        ? "Hallo! Ich bin dein 3D-Sprachtutor. Lass uns gemeinsam Deutsch lernen!"
        : targetLanguage === "Mandarin"
        ? "你好！我是你的3D中文导师。今天你想练习什么？"
        : targetLanguage === "Hindi"
        ? "नमस्ते! मैं आपका 3D भाषा शिक्षक हूँ। क्या आप अभ्यास के लिए तैयार हैं?"
        : targetLanguage === "Kannada"
        ? "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ 3D ಭಾಷಾ ಶಿಕ್ಷಕ. ಅಭ್ಯಾಸ ಮಾಡಲು ಸಿದ್ಧರಿದ್ದೀರಾ?"
        : targetLanguage === "Gujarati"
        ? "નમસ્તે! હું તમારો 3D ભાષા શિક્ષક છું. શું તમે પ્રેક્ટિસ કરવા માટે તૈયાર છો?"
        : targetLanguage === "Telugu"
        ? "నమస్కారం! నేను మీ 3D భాషా ఉపాధ్యాయుడిని. ఈ రోజు సాధన చేయడానికి సిద్ధంగా ఉన్నారా?"
        : "Hello! I am your 3D language tutor. Ready to practice speaking today?";

    setMessages([
      {
        id: "init-1",
        role: "tutor",
        text: initialText,
        translation: "Hello! I am your 3D language tutor. Ready to practice speaking today?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        gesture: "welcoming",
      },
    ]);

    setBoardNotes([
      `Target Language: ${targetLanguage}`,
      `Proficiency Level: ${proficiencyLevel}`,
      "Interactive 3D Avatar with real-time lip-sync & gestures",
      "Speak via microphone to practice your conversational fluency",
    ]);

    // Speak initial greeting
    speakWithAvatar(initialText, "welcoming");
  }, [targetLanguage]);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 font-sans overflow-hidden select-none">
      {/* Top Application Bar */}
      <header className="h-16 px-5 border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-xl flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-500/20 text-white">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-white">
                Maestro 3D
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                AI Tutor
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Interactive 3D Voice & Gesture Language Learning
            </p>
          </div>
        </div>

        {/* Global Selectors: User Profile & Consultation / Language Switcher */}
        <div className="flex items-center gap-2.5">
          {/* User Account / Consultation Button */}
          <button
            id="btn-user-account"
            onClick={() => {
              setOnboardingForcedStep(userProfile ? 2 : 1);
              setIsOnboardingOpen(true);
            }}
            className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 hover:border-blue-500/50 rounded-xl px-3 py-1.5 shadow-sm transition-all cursor-pointer"
            title={userProfile ? `Signed in as ${userProfile.name}. Click to change language or goals.` : "Sign in or sign up to personalize your tutor"}
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-slate-200 leading-tight">
                {userProfile?.name || "Sign In / Sign Up"}
              </div>
              <div className="text-[10px] text-blue-400 font-medium leading-tight">
                {userProfile ? `${userProfile.learningGoal.split(" ")[0]} • ${targetLanguage}` : "Language Consultation"}
              </div>
            </div>
          </button>

          {/* Sign Out & Delete User option if signed in */}
          {userProfile && (
            <div className="flex items-center gap-1">
              <button
                id="btn-sign-out"
                onClick={async () => {
                  await signOutUser();
                  setUserProfile(null);
                  localStorage.removeItem("maestro_user_profile");
                }}
                className="text-[11px] font-semibold text-slate-400 hover:text-slate-200 px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title="Sign out of account"
              >
                Sign Out
              </button>

              <button
                id="btn-delete-user"
                onClick={async () => {
                  if (
                    window.confirm(
                      "Are you sure you want to delete all user profile data, conversation history, and pronunciation records from the database?"
                    )
                  ) {
                    await deleteCurrentUserData(userProfile.id);
                    setUserProfile(null);
                    setMessages([]);
                    localStorage.clear();
                    // Reset to initial clean state
                    setTargetLanguage("Spanish");
                    setProficiencyLevel("Beginner (A1-A2)");
                    alert("All user records and session data have been deleted successfully.");
                  }
                }}
                className="flex items-center gap-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 px-2 py-1 rounded-lg hover:bg-rose-950/40 border border-rose-900/40 transition-colors cursor-pointer"
                title="Permanently delete all user profile and database records"
              >
                <Trash2 className="w-3 h-3 text-rose-400" />
                <span className="hidden md:inline">Delete User</span>
              </button>
            </div>
          )}

          {/* Target Language Consultation Trigger & Indicator */}
          <button
            id="btn-language-consult"
            onClick={() => {
              setOnboardingForcedStep(2);
              setIsOnboardingOpen(true);
            }}
            className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 hover:border-blue-500/50 rounded-xl px-3 py-1.5 shadow-sm transition-all cursor-pointer"
            title="Click to consult or change target language"
          >
            <span className="text-base leading-none">{langConfig.flag}</span>
            <span className="text-xs font-bold text-slate-200">
              {targetLanguage}
            </span>
            <span className="hidden md:inline text-[11px] text-slate-400">
              ({langConfig.nativeName})
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Proficiency Level Badge / Selector */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/70 rounded-xl px-3 py-1.5 shadow-sm">
            <select
              id="level-select"
              value={proficiencyLevel}
              onChange={(e) => {
                const newLevel = e.target.value as ProficiencyLevel;
                setProficiencyLevel(newLevel);
                if (userProfile) {
                  const updated = { ...userProfile, proficiencyLevel: newLevel };
                  setUserProfile(updated);
                  localStorage.setItem("maestro_user_profile", JSON.stringify(updated));
                }
              }}
              className="bg-transparent text-xs font-semibold text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="Beginner (A1-A2)" className="bg-slate-900 text-slate-100">
                Beginner (A1-A2)
              </option>
              <option value="Intermediate (B1-B2)" className="bg-slate-900 text-slate-100">
                Intermediate (B1-B2)
              </option>
              <option value="Advanced (C1-C2)" className="bg-slate-900 text-slate-100">
                Advanced (C1-C2)
              </option>
            </select>
          </div>

          {/* Audio & Mic Test Diagnostic Button */}
          <button
            id="btn-sound-mic-diagnostic"
            onClick={() => setIsDiagnosticsOpen(true)}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            title="Test audio speakers and microphone hardware"
          >
            <Volume2 className="w-3.5 h-3.5 text-blue-400" />
            <Mic className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Audio & Mic Test</span>
          </button>

          {/* Stop Audio Button */}
          {isSpeaking && (
            <button
              onClick={() => {
                speechCtrl.stopSpeaking();
                setIsSpeaking(false);
                setViseme({ openness: 0, pucker: 0, smile: 0.1 });
                setCurrentGesture("idle");
              }}
              className="px-2.5 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-medium flex items-center gap-1 transition-colors"
              title="Mute spoken audio"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Mute</span>
            </button>
          )}
        </div>
      </header>

      {/* Audio / Mic Warning Banner */}
      {audioErrorToast && (
        <div className="bg-amber-950/80 border-b border-amber-800/80 px-4 py-2 flex items-center justify-between text-xs text-amber-200 shrink-0">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{audioErrorToast}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDiagnosticsOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-amber-800/60 hover:bg-amber-700 text-amber-100 font-semibold text-[11px] cursor-pointer"
            >
              Open Audio Diagnostics
            </button>
            <button
              onClick={() => setAudioErrorToast(null)}
              className="text-amber-400 hover:text-amber-200 text-xs cursor-pointer ml-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Navigation Sub-bar */}
      <div className="px-5 py-2.5 bg-slate-900/40 border-b border-slate-800/60 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            id="tab-dashboard"
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === "dashboard"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard & Overview</span>
          </button>

          <button
            id="tab-stage"
            onClick={() => setActiveTab("stage")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === "stage"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>3D Tutor Conversation Stage</span>
          </button>

          <button
            id="tab-pronunciation"
            onClick={() => setActiveTab("pronunciation")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === "pronunciation"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Pronunciation & Accent Studio</span>
          </button>

          <button
            id="tab-curriculum"
            onClick={() => setActiveTab("curriculum")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === "curriculum"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Curriculum & Scenarios</span>
          </button>

          <button
            id="tab-chapters"
            onClick={() => setActiveTab("chapters")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === "chapters"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Vocab & Grammar Chapters</span>
          </button>
        </div>

        {/* Quick Gesture Trigger Testing Toolbar (Stage tab only) */}
        {activeTab === "stage" && (
          <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-400">
            <span className="font-semibold text-slate-500 mr-1">Gesture Demo:</span>
            {(["explaining", "welcoming", "praising", "pointing", "thinking", "encouraging"] as GestureType[]).map(
              (gesture) => (
                <button
                  key={gesture}
                  onClick={() => {
                    setCurrentGesture(gesture);
                    speakWithAvatar(
                      gesture === "praising"
                        ? "¡Muy bien! ¡Excelente trabajo!"
                        : gesture === "pointing"
                        ? "Mira aquí en la pizarra los puntos clave."
                        : gesture === "thinking"
                        ? "Mmm... vamos a pensar en esta regla gramatical."
                        : "Aquí te explico los detalles.",
                      gesture
                    );
                  }}
                  className={`px-2 py-0.5 rounded-lg border transition-colors capitalize cursor-pointer ${
                    currentGesture === gesture
                      ? "bg-blue-500/20 text-blue-300 border-blue-500/40 font-medium"
                      : "bg-slate-800/60 text-slate-400 border-slate-700/50 hover:text-slate-200"
                  }`}
                >
                  {gesture}
                </button>
              )
            )}
          </div>
        )}
      </div>

      {/* Main Workspace Layout */}
      {activeTab === "dashboard" && (
        <main className="flex-1 overflow-hidden">
          <Dashboard
            targetLanguage={targetLanguage}
            proficiencyLevel={proficiencyLevel}
            userProfile={userProfile}
            curriculumProgress={curriculumProgress}
            onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
            onResumeLesson={() => setActiveTab("curriculum")}
            onOpenOnboarding={(step) => {
              setOnboardingForcedStep(step || 2);
              setIsOnboardingOpen(true);
            }}
            onSelectLanguage={(lang) => {
              setTargetLanguage(lang);
              setSelectedTopicId(LESSON_TOPICS[lang]?.[0]?.id || "");
              if (userProfile) {
                const updated = { ...userProfile, targetLanguage: lang };
                setUserProfile(updated);
                localStorage.setItem("maestro_user_profile", JSON.stringify(updated));
              }
            }}
            onSelectProficiency={(level) => {
              setProficiencyLevel(level);
              if (userProfile) {
                const updated = { ...userProfile, proficiencyLevel: level };
                setUserProfile(updated);
                localStorage.setItem("maestro_user_profile", JSON.stringify(updated));
              }
            }}
            onStartSession={(tab, topicId) => {
              if (topicId) {
                setSelectedTopicId(topicId);
                const topic = LESSON_TOPICS[targetLanguage]?.find((t) => t.id === topicId);
                if (topic) {
                  setTimeout(() => handleSendMessage(topic.starterPrompt), 300);
                }
              }
              setActiveTab(tab);
            }}
            onTriggerQuickDemo={(gesture) => {
              setCurrentGesture(gesture as GestureType);
              const demoText =
                targetLanguage === "English"
                  ? gesture === "praising"
                    ? "Excellent work! Keep up the brilliant effort."
                    : gesture === "pointing"
                    ? "Notice this key pronunciation tip on the board."
                    : "Hello! I am Maestro, your English tutor."
                  : gesture === "praising"
                  ? "¡Excelente trabajo!"
                  : gesture === "pointing"
                  ? "Observa este detalle en la pizarra."
                  : "¡Hola! Estoy listo para ayudarte.";
              speakWithAvatar(demoText, gesture as GestureType);
            }}
          />
        </main>
      )}

      {/* 3D Classroom Stage (Stage Tab ONLY) */}
      {activeTab === "stage" && (
        <main className="flex-1 overflow-hidden p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* LEFT COLUMN: 3D Tutor Avatar Canvas (Stage only) */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col h-full gap-3 min-h-[360px]">
            {/* 3D Canvas Box */}
            <div className="flex-1 relative rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
              <TutorCanvas
                currentGesture={currentGesture}
                isSpeaking={isSpeaking}
                isListening={isListening}
                viseme={viseme}
                boardNotes={boardNotes}
                activeWord={activeWord}
                activePhonetic={activePhonetic}
              />
            </div>

            {/* Active Lesson Topic Bar */}
            <div className="px-4 py-2.5 rounded-xl bg-slate-900/70 border border-slate-800/90 flex items-center justify-between text-xs backdrop-blur-md shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-blue-400 font-bold uppercase tracking-wider text-[10px]">
                  Active Topic:
                </span>
                <span className="font-semibold text-slate-100">
                  {currentTopic?.title || "Conversational Practice"}
                </span>
              </div>
              <button
                onClick={() => {
                  if (currentTopic) {
                    handleSendMessage(currentTopic.starterPrompt);
                  }
                }}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Ask Topic Starter</span> →
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Conversation Panel & Smart Whiteboard */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col h-full overflow-hidden">
            <div className="grid grid-rows-2 h-full gap-4 overflow-hidden">
              {/* Top: Live Conversation Panel */}
              <div className="row-span-1 overflow-hidden">
                <ConversationPanel
                  messages={messages}
                  isSpeaking={isSpeaking}
                  isListening={isListening}
                  suggestedReplies={suggestedReplies}
                  langCode={langConfig.defaultVoiceLang}
                  speechRate={speechRate}
                  onSendMessage={handleSendMessage}
                  onReplayAudio={(msg) => speakWithAvatar(msg.text, msg.gesture || "explaining")}
                  onStartListening={handleStartListening}
                  onStopListening={handleStopListening}
                  onSelectGesture={setCurrentGesture}
                  onRateChange={setSpeechRate}
                  interimTranscript={interimTranscript}
                />
              </div>

              {/* Bottom: Smart Whiteboard with Vocabulary Spotlight & Grammar Coach */}
              <div className="row-span-1 overflow-hidden">
                <SmartWhiteboard
                  boardNotes={boardNotes}
                  vocabularySpotlight={vocabularySpotlight}
                  grammarFeedback={grammarFeedback}
                  pronunciationTip={pronunciationTip}
                  onPlayWordAudio={(word) => speakWithAvatar(word, "pointing")}
                  onSelectWordForTutor={(word) =>
                    handleSendMessage(`¿Puedes explicarme el significado y uso de "${word}"?`)
                  }
                />
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Dedicated Pronunciation & Accent Studio (NO 3D model, pure 2D anatomical mouth & step-by-step accent coach) */}
      {activeTab === "pronunciation" && (
        <main className="flex-1 overflow-hidden p-4">
          <PronunciationSuite
            targetLanguage={targetLanguage}
            langCode={langConfig.defaultVoiceLang}
            nativeLanguage={userProfile?.nativeLanguage || "English"}
            userId={userProfile?.id}
            practiceSentences={
              currentTopic?.practiceSentences || [
                "¡Buenos días! ¿Cómo estás hoy?",
                "Me gustaría practicar mi pronunciación.",
              ]
            }
            onTriggerGesture={(g) => setCurrentGesture(g)}
            onSpeakText={(text) => speechCtrl.speak(text, langConfig.defaultVoiceLang)}
          />
        </main>
      )}

      {/* Dedicated Step-by-Step Curriculum & Scenarios (Full Width, Progressive Modules from Basic to Mastery) */}
      {activeTab === "curriculum" && (
        <main className="flex-1 overflow-hidden p-4">
          <StepByStepCurriculum
            targetLanguage={targetLanguage}
            nativeLanguage={userProfile?.nativeLanguage || "English"}
            userId={userProfile?.id}
            currentTopicId={selectedTopicId}
            onSelectTopic={(topicId, starterPrompt, lessonTitle) => {
              setSelectedTopicId(topicId);
              setActiveTab("stage");
              if (lessonTitle) {
                setBoardNotes([
                  `Module Topic: ${lessonTitle}`,
                  `Practice conversational dialogue with your 3D tutor.`,
                  `Click the mic or speak freely to begin.`,
                ]);
              }
              handleSendMessage(starterPrompt);
            }}
            onSpeakPhrase={(text) => speechCtrl.speak(text, langConfig.defaultVoiceLang)}
          />
        </main>
      )}

      {/* Dedicated Chapters of Vocabulary & Grammar Masterclasses */}
      {activeTab === "chapters" && (
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            <VocabGrammarChapters
              targetLanguage={targetLanguage}
              userId={userProfile?.id}
              onSendToSmartboard={(item) => {
                setActiveWord(item.word);
                setActivePhonetic(item.phonetic);
                setVocabularySpotlight((prev) => [
                  item,
                  ...prev.filter((i) => i.word !== item.word).slice(0, 4),
                ]);
                setBoardNotes([
                  `Spotlight: ${item.word} (${item.phonetic})`,
                  `Meaning: ${item.meaning}`,
                  `Example: "${item.example}"`,
                ]);
              }}
              onPracticeWithTutor={(prompt, title) => {
                setActiveTab("stage");
                if (title) {
                  setBoardNotes([
                    `Practice: ${title}`,
                    `Interactive spoken dialogue with Maestro.`,
                    `Click mic to respond.`,
                  ]);
                }
                handleSendMessage(prompt);
              }}
              onSelectTopic={(topicId, starterPrompt, title) => {
                setSelectedTopicId(topicId);
                setActiveTab("stage");
                if (title) {
                  setBoardNotes([
                    `Topic: ${title}`,
                    `Engage in interactive dialogue with your 3D tutor.`,
                  ]);
                }
                handleSendMessage(starterPrompt);
              }}
            />
          </div>
        </main>
      )}

      {/* Audio & Microphone Self-Test Diagnostic Modal */}
      <AudioDiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
        targetLanguage={targetLanguage}
      />

      {/* User Onboarding & Language Intake Consultation Modal */}
      <AuthOnboardingModal
        isOpen={isOnboardingOpen}
        currentUser={userProfile}
        forcedStep={onboardingForcedStep}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={(newProfile) => {
          setUserProfile(newProfile);
          setTargetLanguage(newProfile.targetLanguage);
          setProficiencyLevel(newProfile.proficiencyLevel);
          localStorage.setItem("maestro_user_profile", JSON.stringify(newProfile));
          setIsOnboardingOpen(false);

          // Update curriculum topic to the new language's first lesson
          const newTopics = LESSON_TOPICS[newProfile.targetLanguage] || [];
          if (newTopics.length > 0) {
            setSelectedTopicId(newTopics[0].id);
          }

          // Greet user in their chosen language with avatar gesture & voice
          const cfg = LANGUAGE_CONFIGS[newProfile.targetLanguage];
          const greetingText =
            newProfile.targetLanguage === "English"
              ? `Hello ${newProfile.name}! Welcome to your English learning journey. ${cfg.sampleStarter}`
              : `¡Hola ${newProfile.name}! ${cfg.sampleStarter}`;
          setTimeout(() => {
            speakWithAvatar(greetingText, "welcoming");
          }, 600);
        }}
      />
    </div>
  );
}
export default App;
