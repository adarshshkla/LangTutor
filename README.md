# 3D AI Language Tutor & Immersive Learning Platform

An interactive full-stack AI language learning application featuring a real-time responsive 3D animated tutor, phonetic and pronunciation analysis, speech recognition, structured step-by-step curriculum with cloud database persistence, and acoustic diagnostics.

---

## 🚀 How to Share or Download the Project

### Option A: Share Live with Teammates (No Local Setup Required)
1. Click the **Share** button at the top-right of the **Google AI Studio** workspace.
2. Generate a preview link or grant access to your teammates' Google accounts.
3. Teammates can immediately interact with the full app, test mic and audio, sign in, and persist their progress in the cloud database.

### Option B: Export to GitHub / Download as ZIP
1. In Google AI Studio, open the **Project Settings** (gear icon) in the top-right toolbar.
2. Select **Export to GitHub** (to push directly to a shared team Git repository) or **Download ZIP** to save the entire source code locally.
3. Give the repository URL or ZIP file to your teammates.

---

## 🛠️ Running the Project Locally (for Teammates)

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- A free **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/)

### 2. Installation
```bash
git clone <your-repo-url>
cd <project-folder>
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```
Populate `.env` with your Gemini API key:
```env
GEMINI_API_KEY="your_actual_gemini_api_key_here"
```

> **Note on Firebase**: The application contains pre-configured client-side Firebase credentials in `firebase-applet-config.json` and `src/lib/firebase.ts`. When running locally, authentication and Firestore database syncing will connect automatically without requiring any extra local database setup!

### 4. Start Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

---

## 🧩 Modular Architecture for Team Collaboration

Each major feature is isolated in its own dedicated directory under `src/features/` with clean interface boundaries. Teammates can work in parallel on different features without causing merge conflicts:

| Feature Directory | Description & Team Responsibilities |
| :--- | :--- |
| `src/features/curriculum/` | **Step-by-Step Curriculum**: Modules, structured grammar lessons, phonetic phrases, and cloud progress tracking (`StepByStepCurriculum.tsx`, `curriculumData.ts`, `types.ts`). |
| `src/features/pronunciation/`| **Phonetics & Accent Studio**: 2D anatomical vocal tract visualizer, IPA breakdowns, and accent coaching (`PronunciationSuite.tsx`, `AccentCoach.tsx`). |
| `src/features/avatar/` | **3D Animated Classroom Avatar**: Three.js 3D model, facial visemes, gestures, lip sync, and lighting (`TutorCanvas.tsx`). |
| `src/features/conversation/`| **Live Voice & Dialogue Stage**: Gemini AI conversational prompts, chat transcript, feedback streaming (`ConversationPanel.tsx`). |
| `src/features/smartboard/` | **Interactive Smart Whiteboard**: Real-time chalk notes, vocabulary spotlight, and linguistic grammar feedback (`SmartWhiteboard.tsx`). |
| `src/features/auth/` | **User Onboarding & Authentication**: Firebase Auth, learner consultation intake questionnaire, and persistent profiles (`AuthOnboardingModal.tsx`). |
| `src/components/SpeechController.ts` | **Acoustic & Hardware Engine**: Speech synthesis, Web Audio API context unlocker, harmonic tone generator, and microphone streaming diagnostics. |
| `src/components/AudioDiagnosticsModal.tsx` | **Self-Test Diagnostic Suite**: In-app interactive speaker test, live microphone volume meter, and browser permission guide. |

---

## 🔊 Sound & Microphone Troubleshooting

1. **Browser Autoplay Policies**: Modern browsers (Chrome, Edge, Safari, Firefox) prevent sound playback until the user clicks or taps anywhere on the page. The app includes an automatic audio unlocker that triggers on your first click.
2. **Microphone Access in Preview / iFrames**: If running inside an embedded iframe or sandbox preview, the browser may restrict microphone permissions. Click the **Audio & Mic Test** button in the top navigation bar or launch the app in a **New Tab** to allow microphone access.
3. **Hardware Self-Test**: Use the top-bar **Audio & Mic Test** button anytime to:
   - Play an acoustic harmonic tone (tests hardware speakers independently of speech synthesis).
   - Test synthetic voice output in your target language (Spanish, French, German, Japanese, etc.).
   - Monitor live microphone volume levels with an animated decibel meter.

---

## 💾 Cloud Database Schema & Persistence

All learner progress is persistently stored in Google Cloud Firestore:
- **`users/{userId}`**: Stores learner profile, native language, target language, proficiency level, and goals.
- **`users/{userId}/curriculumProgress/{targetLanguage}`**: Stores completed step IDs, current module, current lesson title, progress percentage, and timestamp so users can always **Resume Where They Left Off**.
- **`users/{userId}/conversations`**: History of conversational turns with the 3D tutor.
- **`users/{userId}/pronunciationAttempts`**: Historical audio recordings and pronunciation accuracy scores.
