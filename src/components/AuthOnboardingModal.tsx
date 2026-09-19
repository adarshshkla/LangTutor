import React, { useState, useEffect } from "react";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  User,
  Mail,
  Lock,
  Compass,
  Briefcase,
  GraduationCap,
  MessageCircle,
  Film,
  Brain,
  Clock,
  Globe2,
  Volume2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { TargetLanguage, ProficiencyLevel, LearningGoal, UserProfile } from "../types";
import { LANGUAGE_CONFIGS } from "./LessonCurriculum";
import { 
  signInWithGoogle, 
  signInWithEmail, 
  signUpWithEmail, 
  saveUserProfile,
  signInWithGoogleRedirect,
  getGoogleRedirectResult,
  signInAsGuest
} from "../lib/userDataService";

interface AuthOnboardingModalProps {
  isOpen: boolean;
  currentUser: UserProfile | null;
  onComplete: (user: UserProfile) => void;
  onClose?: () => void;
  forcedStep?: 1 | 2 | 3;
}

export const AuthOnboardingModal: React.FC<AuthOnboardingModalProps> = ({
  isOpen,
  currentUser,
  onComplete,
  onClose,
  forcedStep,
}) => {
  // Mode: "signup" | "signin"
  const [authMode, setAuthMode] = useState<"signup" | "signin">(
    currentUser ? "signin" : "signup"
  );
  const [step, setStep] = useState<number>(forcedStep || 1);
  const [loading, setLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [isIPAddress, setIsIPAddress] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // 1. Domain Check
    if (typeof window !== "undefined") {
      if (window.location.hostname === "127.0.0.1" || window.location.hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
        setIsIPAddress(true);
      }
    }

    // 2. Check for Redirect Result
    const checkRedirect = async () => {
      try {
        setLoading(true);
        const profile = await getGoogleRedirectResult();
        if (profile) {
          setName(profile.name);
          setEmail(profile.email);
          setTargetLanguage(profile.targetLanguage);
          setProficiencyLevel(profile.proficiencyLevel);
          setLearningGoal(profile.learningGoal);
          setDailyMinutes(profile.dailyGoalMinutes);
          setNativeLanguage(profile.nativeLanguage);
          
          if (!profile.isOnboarded) {
            setStep(2);
          } else {
            onComplete(profile);
          }
        }
      } catch (err: any) {
        console.error("Redirect auth error:", err);
        setAuthError(err.message || "Failed to sign in with Google Redirect");
      } finally {
        setLoading(false);
      }
    };
    
    checkRedirect();
  }, [onComplete]);

  // Form State
  const [name, setName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [password, setPassword] = useState("");
  const [targetLanguage, setTargetLanguage] = useState<TargetLanguage>(
    currentUser?.targetLanguage || "Spanish"
  );
  const [proficiencyLevel, setProficiencyLevel] = useState<ProficiencyLevel>(
    currentUser?.proficiencyLevel || "Beginner (A1-A2)"
  );
  const [learningGoal, setLearningGoal] = useState<LearningGoal>(
    currentUser?.learningGoal || "Daily Conversation & Socializing"
  );
  const [dailyMinutes, setDailyMinutes] = useState<number>(
    currentUser?.dailyGoalMinutes || 15
  );
  const [nativeLanguage, setNativeLanguage] = useState(
    currentUser?.nativeLanguage || "English"
  );

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const profile = await signInWithGoogle();
      setName(profile.name);
      setEmail(profile.email);
      setTargetLanguage(profile.targetLanguage);
      setProficiencyLevel(profile.proficiencyLevel);
      setLearningGoal(profile.learningGoal);
      setDailyMinutes(profile.dailyGoalMinutes);
      setNativeLanguage(profile.nativeLanguage);

      if (!profile.isOnboarded) {
        // First time Google user: move to language selection
        setStep(2);
      } else {
        onComplete(profile);
      }
    } catch (err: any) {
      console.error("Google sign in error:", err);
      if (err.code === "auth/unauthorized-domain") {
        setAuthError("Domain not authorized. Are you using 127.0.0.1 instead of localhost?");
      } else if (err.code === "auth/popup-blocked" || err.code === "auth/popup-closed-by-user") {
        setAuthError("Popup blocked or closed. Please try the 'Redirect' method below.");
      } else {
        setAuthError(err.message || "Failed to sign in with Google");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRedirect = async () => {
    setLoading(true);
    setIsRedirecting(true);
    setAuthError(null);
    try {
      await signInWithGoogleRedirect();
    } catch (err: any) {
      console.error("Google redirect init error:", err);
      setLoading(false);
      setIsRedirecting(false);
      setAuthError(err.message || "Failed to initialize redirect");
    }
  };

  const handleGuestMode = () => {
    const profile = signInAsGuest();
    setName(profile.name);
    setEmail(profile.email);
    setStep(2); // proceed to onboarding
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      if (authMode === "signin") {
        const profile = await signInWithEmail(email, password);
        onComplete(profile);
      } else {
        // Sign up with Firebase
        const profile = await signUpWithEmail(name, email, password, {
          targetLanguage,
          proficiencyLevel,
          learningGoal,
          dailyGoalMinutes: dailyMinutes,
          nativeLanguage,
          isOnboarded: false,
        });
        // Proceed to language consultation
        setStep(2);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setAuthError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinishOnboarding = async () => {
    setLoading(true);
    try {
      const profile: UserProfile = {
        id: currentUser?.id || "user-" + Date.now(),
        name: name || "Student",
        email: email || "student@example.com",
        targetLanguage,
        proficiencyLevel,
        learningGoal,
        dailyGoalMinutes: dailyMinutes,
        nativeLanguage,
        isOnboarded: true,
        createdAt: currentUser?.createdAt || new Date().toISOString(),
      };
      await saveUserProfile(profile);
      onComplete(profile);
    } catch (err: any) {
      console.error("Failed to save profile:", err);
      // Still complete locally
      const fallback: UserProfile = {
        id: currentUser?.id || "user-" + Date.now(),
        name: name || "Student",
        email: email || "student@example.com",
        targetLanguage,
        proficiencyLevel,
        learningGoal,
        dailyGoalMinutes: dailyMinutes,
        nativeLanguage,
        isOnboarded: true,
        createdAt: new Date().toISOString(),
      };
      onComplete(fallback);
    } finally {
      setLoading(false);
    }
  };

  const goalOptions: {
    title: LearningGoal;
    desc: string;
    icon: React.ElementType;
    badge: string;
  }[] = [
    {
      title: "Daily Conversation & Socializing",
      desc: "Speak fluently with locals, make friends, and order food with natural confidence.",
      icon: MessageCircle,
      badge: "Most Popular",
    },
    {
      title: "Travel & Tourism",
      desc: "Navigate transit, hotels, asking directions, restaurants, and cultural landmarks.",
      icon: Compass,
      badge: "Essential",
    },
    {
      title: "Career & Business",
      desc: "Ace corporate interviews, deliver professional pitches, and draft formal emails.",
      icon: Briefcase,
      badge: "Professional",
    },
    {
      title: "Academic & Exams",
      desc: "Prepare for standardized tests (DELE, JLPT, DELF, TestDaF, HSK, TOEFL).",
      icon: GraduationCap,
      badge: "Rigorous",
    },
    {
      title: "Culture, Cinema & Literature",
      desc: "Enjoy foreign films, music lyrics, anime, podcasts, and literary masterpieces.",
      icon: Film,
      badge: "Creative",
    },
    {
      title: "Brain Fitness & Personal Interest",
      desc: "Keep mind sharp, improve neuroplasticity, and explore linguistic roots.",
      icon: Brain,
      badge: "Lifelong",
    },
  ];

  const proficiencyOptions: {
    level: ProficiencyLevel;
    subtitle: string;
    description: string;
    indicator: string;
  }[] = [
    {
      level: "Beginner (A1-A2)",
      subtitle: "Starting Fresh or Basic Words",
      description: "You know basic greetings and simple vocabulary. Tutor speaks clearly with helpful English scaffolding.",
      indicator: "1/3",
    },
    {
      level: "Intermediate (B1-B2)",
      subtitle: "Conversational & Grammar",
      description: "You can express opinions and describe past events. Tutor challenges you with richer vocabulary and natural idioms.",
      indicator: "2/3",
    },
    {
      level: "Advanced (C1-C2)",
      subtitle: "Near-Native Mastery",
      description: "Rapid native speaking speed, deep cultural nuances, complex debate, and nuanced pronunciation polish.",
      indicator: "3/3",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Top Progress Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Maestro 3D Academy</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Step {step} of 3
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {step === 1 && "Create your learner profile or sign in"}
                {step === 2 && "Choose your target language & proficiency"}
                {step === 3 && "Personalize your learning goals & pace"}
              </p>
            </div>
          </div>

          {onClose && currentUser && (
            <button
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Skip
            </button>
          )}
        </div>

        {/* Step Indicators */}
        <div className="grid grid-cols-3 bg-slate-950/40 border-b border-slate-800/60 text-xs text-center font-medium">
          <div
            className={`py-2 px-3 border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              step === 1
                ? "border-blue-500 text-blue-400 bg-blue-500/5 font-semibold"
                : step > 1
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-500"
            }`}
          >
            {step > 1 ? <Check className="w-3.5 h-3.5" /> : <span>1.</span>}
            <span>Account</span>
          </div>

          <div
            className={`py-2 px-3 border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              step === 2
                ? "border-blue-500 text-blue-400 bg-blue-500/5 font-semibold"
                : step > 2
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-500"
            }`}
          >
            {step > 2 ? <Check className="w-3.5 h-3.5" /> : <span>2.</span>}
            <span>Target Language</span>
          </div>

          <div
            className={`py-2 px-3 border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              step === 3
                ? "border-blue-500 text-blue-400 bg-blue-500/5 font-semibold"
                : "border-transparent text-slate-500"
            }`}
          >
            <span>3.</span>
            <span>Goals & Practice</span>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* STEP 1: SIGN IN / SIGN UP */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {authMode === "signup" ? "Get Started with Maestro" : "Welcome Back"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {authMode === "signup"
                      ? "Create your account to unlock interactive 3D voice lessons and speech evaluations."
                      : "Sign in to resume your active curriculum and personalized whiteboard."}
                  </p>
                </div>
                <div className="flex rounded-xl bg-slate-800/80 p-1 border border-slate-700/60 text-xs">
                  <button
                    type="button"
                    onClick={() => setAuthMode("signup")}
                    className={`px-3 py-1 rounded-lg font-medium transition-all ${
                      authMode === "signup"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Sign Up
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode("signin")}
                    className={`px-3 py-1 rounded-lg font-medium transition-all ${
                      authMode === "signin"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Sign In
                  </button>
                </div>
              </div>

              {/* Error Banner */}
              {authError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* IP Address Warning Banner */}
              {isIPAddress && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <AlertCircle className="w-4 h-4" />
                    <span>Using 127.0.0.1?</span>
                  </div>
                  <p className="text-[11px] text-amber-200/80 leading-relaxed">
                    Firebase Authentication requires <strong>localhost</strong> by default. Google Sign-In will fail if you continue on 127.0.0.1.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      window.location.hostname = "localhost";
                    }}
                    className="w-full mt-1 py-2 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Switch to localhost:3000
                  </button>
                </div>
              )}

              {/* 1-Click Google Sign In */}
              <div>
                <button
                  id="btn-google-auth"
                  type="button"
                  disabled={loading}
                  onClick={handleGoogleSignIn}
                  className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-800 rounded-xl font-semibold text-sm flex items-center justify-center gap-3 shadow-md transition-all cursor-pointer border border-slate-200"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.37 7.35 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.98 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.63 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                  )}
                  <span>
                    {authMode === "signup" ? "Sign up with Google" : "Sign in with Google"}
                  </span>
                </button>

                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    disabled={loading || isRedirecting}
                    onClick={handleGoogleRedirect}
                    className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-medium transition-colors border border-slate-700 cursor-pointer disabled:opacity-50"
                  >
                    {isRedirecting ? "Redirecting..." : "Popup blocked? Try Redirect"}
                  </button>
                  <button
                    type="button"
                    onClick={handleGuestMode}
                    className="flex-1 py-2 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-[11px] font-medium transition-colors border border-emerald-500/20 cursor-pointer"
                  >
                    Continue as Guest
                  </button>
                </div>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-slate-900 px-2 text-slate-500 font-semibold tracking-wider">
                      Or with email
                    </span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === "signup" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Your Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="auth-input-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Alex Morgan"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="auth-input-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@example.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="auth-input-password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {authMode === "signup" ? (
                  <button
                    id="btn-signup-proceed"
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 mt-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Continue to Language Consultation</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    id="btn-signin-complete"
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 mt-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Sign In to Classroom</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </form>

              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2.5">
                <Globe2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <p>
                  Signing up customizes your 3D tutor’s vocal pace, phonetics scoring, and smartboard lessons to match your individual language goals.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: LANGUAGE SELECTION & PROFICIENCY CONSULTATION */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">
                  What language do you want to learn?
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select your target language. Maestro will calibrate his speech synthesizer, lip-sync visemes, and curriculum to this language.
                </p>
              </div>

              {/* Language Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(Object.keys(LANGUAGE_CONFIGS) as TargetLanguage[]).map((lang) => {
                  const cfg = LANGUAGE_CONFIGS[lang];
                  const isSelected = targetLanguage === lang;
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setTargetLanguage(lang)}
                      className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-blue-600/15 border-blue-500 shadow-md shadow-blue-500/10 ring-1 ring-blue-500"
                          : "bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{cfg.flag}</span>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">{lang}</div>
                        <div className="text-[11px] text-slate-400">{cfg.nativeName}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Which language do you understand completely (instructional language) */}
              <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-800/60 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-blue-300 font-bold text-xs">
                  <Globe2 className="w-4 h-4 text-blue-400" />
                  <span>Which language do you understand completely?</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  We use this language as your instructional bridge to clearly explain grammar rules, meanings, and pronunciation secrets for <strong className="text-white">{targetLanguage}</strong>.
                </p>
                <select
                  value={nativeLanguage}
                  onChange={(e) => setNativeLanguage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-blue-500 mt-1 cursor-pointer"
                >
                  <option value="English">English (Fluent / Completely Understand)</option>
                  <option value="Spanish">Spanish / Español</option>
                  <option value="French">French / Français</option>
                  <option value="German">German / Deutsch</option>
                  <option value="Mandarin">Mandarin Chinese / 中文</option>
                  <option value="Japanese">Japanese / 日本語</option>
                  <option value="Hindi">Hindi / हिन्दी</option>
                  <option value="Portuguese">Portuguese / Português</option>
                  <option value="Arabic">Arabic / العربية</option>
                  <option value="Russian">Russian / Русский</option>
                  <option value="Italian">Italian / Italiano</option>
                </select>
              </div>

              {/* Proficiency Level Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  What is your current proficiency level in {targetLanguage}?
                </label>
                <div className="space-y-2.5">
                  {proficiencyOptions.map((opt) => {
                    const isSelected = proficiencyLevel === opt.level;
                    return (
                      <div
                        key={opt.level}
                        onClick={() => setProficiencyLevel(opt.level)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                          isSelected
                            ? "bg-blue-600/15 border-blue-500 ring-1 ring-blue-500"
                            : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border mt-0.5 shrink-0 flex items-center justify-center ${
                            isSelected
                              ? "border-blue-500 bg-blue-500 text-white"
                              : "border-slate-600"
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-white">
                              {opt.level}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {opt.subtitle}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                            {opt.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-800 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  id="btn-step2-next"
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white flex items-center gap-1.5 shadow-lg shadow-blue-600/20 cursor-pointer"
                >
                  <span>Continue to Goals</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: LEARNING GOALS & DAILY HABIT */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Why are you learning {targetLanguage}?
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Maestro adapts scenario roleplays, vocabulary spotlights, and chalkboard notes to your primary objective.
                </p>
              </div>

              {/* Learning Goals Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {goalOptions.map((g) => {
                  const Icon = g.icon;
                  const isSelected = learningGoal === g.title;
                  return (
                    <div
                      key={g.title}
                      onClick={() => setLearningGoal(g.title)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-2.5 ${
                        isSelected
                          ? "bg-blue-600/15 border-blue-500 ring-1 ring-blue-500"
                          : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            isSelected
                              ? "bg-blue-500 text-white"
                              : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300">
                          {g.badge}
                        </span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{g.title}</div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                          {g.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Daily Commitment Slider */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-semibold text-slate-200">
                      Daily Practice Goal
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-blue-400 px-2.5 py-0.5 rounded-lg bg-blue-500/15 border border-blue-500/30">
                    {dailyMinutes} mins / day
                  </span>
                </div>

                <input
                  type="range"
                  min={5}
                  max={60}
                  step={5}
                  value={dailyMinutes}
                  onChange={(e) => setDailyMinutes(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                  <span>5m (Casual)</span>
                  <span>15m (Recommended)</span>
                  <span>30m (Fast Track)</span>
                  <span>60m (Intensive)</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-800 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  id="btn-complete-onboarding"
                  type="button"
                  disabled={loading}
                  onClick={handleFinishOnboarding}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Start Learning {targetLanguage} Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
