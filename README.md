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

## 🔑 Google Authentication when Running Locally

If Google Sign-In is not opening or failing when you run the downloaded project locally:

### 1. The `localhost` vs `127.0.0.1` Rule (Most Common Cause)
- Firebase Authentication authorizes `localhost` by default.
- If you access the application at `http://127.0.0.1:3000` or an internal network IP (e.g., `192.168.x.x`), Firebase blocks Google Sign-In with an `auth/unauthorized-domain` error.
- **Fix**: Open your browser at **`http://localhost:3000`** (using the word `localhost` instead of `127.0.0.1`).
- The in-app login modal will automatically detect `127.0.0.1` and provide a 1-click button to switch to `localhost:3000`.

### 2. Instant Guest Mode (Zero-Config Local Development)
- If you or your teammates want to work on features without signing into Google or configuring OAuth consent screens:
- Click **"Continue as Guest (Instant Local Dev Mode)"** or **"Instant Guest Mode"** in the login modal.
- This immediately unlocks the 3D tutor, speech recognition, pronunciation studio, smart whiteboard, and full curriculum.

### 3. Browser Popup Blockers
- If your browser blocks the Google OAuth popup window, click **"Popup blocked? Try Redirect"** right below the Google button.
- The app supports both Popup and Redirect OAuth authentication flows seamlessly.

### 4. Adding Custom Local Domains in Firebase (Optional)
If your team runs the app on custom domains or network IPs:
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Select your project (`ai-studio-ai3dlanguagelear-cf491331-e8d8-45c1-aeec-7c20f4adec52`).
3. Go to **Authentication** > **Settings** > **Authorized Domains**.
4. Click **Add Domain** and add your custom host or IP.

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

---

## 🔒 Local Development & Firebase Authentication

If you are running the project locally and having trouble signing in with Google, this is a common issue with Firebase Auth in local development environments.

### Why Google Auth Fails Locally
1. **The `localhost` vs `127.0.0.1` Rule**: Firebase Authentication authorizes the domain name `localhost` by default. If your terminal or browser opened the app using `http://127.0.0.1:3000` or an internal network IP (e.g., `192.168.x.x`), Firebase rejects the authentication request with an `auth/unauthorized-domain` error.
2. **Browser Popup Blockers**: Browsers like Safari, Edge, or Firefox often block secondary popup windows spawned on local development ports.
3. **Third-Party Cookie / Privacy Shields**: Browsers like Brave or privacy extensions block the Firebase authentication cross-origin cookie handler.

### Built-In Solutions
- **Automatic Domain Detection**: The app detects if you are using `127.0.0.1` and displays a 1-click button to automatically switch your browser to `localhost:3000`.
- **Redirect Flow Fallback**: If popups are blocked, click the **"Popup blocked? Try Redirect"** button to use `signInWithRedirect` instead of `signInWithPopup`.
- **Instant Guest / Local Dev Mode**: Click **"Continue as Guest"** to completely bypass Firebase Auth and create a local dummy profile. This is perfect for teammates who want to instantly test the 3D avatar, speech evaluation, and curriculum without configuring Google Cloud OAuth consent screens.

