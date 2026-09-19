# Modular Architecture & Team Collaboration Guide

This application is architected with **strict feature-based modularity** so multiple teammates can collaborate concurrently on GitHub, work on separate features, and merge branches smoothly without merge conflicts.

---

## 📁 Directory & Feature Ownership Map

```text
src/
├── features/
│   ├── pronunciation/      # Feature 1: Pronunciation & Accent Studio (2D Anatomical Model)
│   │   ├── PronunciationSuite.tsx   # Top-level feature container
│   │   ├── AccentCoach.tsx          # Step-by-step cadence, rhythm & pitch coach
│   │   ├── types.ts                 # Pronunciation & accent contracts
│   │   └── index.ts                 # Public barrel export
│   │
│   ├── curriculum/         # Feature 2: Step-by-Step Curriculum (A1 -> A2 -> B1 -> B2)
│   │   ├── StepByStepCurriculum.tsx # Roadmap UI with step completion checkboxes
│   │   ├── curriculumData.ts        # Modular step lesson database
│   │   ├── types.ts                 # Curriculum contracts
│   │   └── index.ts                 # Public barrel export
│   │
│   ├── conversation/       # Feature 3: Live AI Dialogue & Speech Input
│   │   ├── ConversationPanel.tsx    # Audio controls, speech recognition, quick replies
│   │   └── index.ts
│   │
│   ├── smartboard/         # Feature 4: Classroom Smartboard & Grammar Coach
│   │   ├── SmartWhiteboard.tsx      # Grammar feedback, vocab spotlight, notes
│   │   └── index.ts
│   │
│   ├── avatar/             # Feature 5: 3D Humanoid Tutor (Stage Only)
│   │   ├── TutorCanvas.tsx          # Three.js avatar, visemes, gestures & classroom
│   │   └── index.ts
│   │
│   ├── dashboard/          # Feature 6: Learner Progress & Analytics Dashboard
│   │   ├── Dashboard.tsx            # CEFR readiness, streak tracker, quick actions
│   │   └── index.ts
│   │
│   ├── auth/               # Feature 7: Onboarding & Bridge Language Selection
│   │   ├── AuthOnboardingModal.tsx  # Intake consultation modal
│   │   └── index.ts
│   │
│   └── index.ts            # Master barrel export for all features
│
├── lib/
│   ├── firebase.ts         # Firebase initialization & Firestore instance
│   └── userDataService.ts  # Database CRUD operations & user persistence
│
├── types.ts                # Global cross-cutting shared TypeScript types
├── App.tsx                 # Root coordinator mounting features by active tab
└── server.ts               # Gemini API full-stack proxy & system prompts
```

---

## 👥 Assigning Features to Teammates

| Teammate | Assigned Feature Directory | Scope of Work |
| :--- | :--- | :--- |
| **Teammate A** | `src/features/pronunciation/` | Enhance 2D vocal tract, mouth shapes, add new phonetic languages, improve pitch contour algorithms in `AccentCoach.tsx`. |
| **Teammate B** | `src/features/curriculum/` | Add new language modules (A1/A2/B1/B2), custom quiz drills, or cultural etiquette guides in `curriculumData.ts`. |
| **Teammate C** | `src/features/conversation/` | Upgrade microphone audio processing, speech-to-text UX, or conversational suggestion styling. |
| **Teammate D** | `src/features/smartboard/` | Enhance whiteboard notes, grammar cards, or add interactive flashcards. |
| **Teammate E** | `src/features/avatar/` | Customize 3D lighting, camera angles, body gestures, or whiteboard rendering on the Stage. |

---

## 🚀 How Teammates Should Branch and Merge on GitHub

1. **Clone and Install**:
   ```bash
   git clone <repo-url>
   cd <project-folder>
   npm install
   ```

2. **Create Your Feature Branch**:
   ```bash
   # If working on pronunciation:
   git checkout -b feature/pronunciation-enhancements

   # If working on curriculum:
   git checkout -b feature/curriculum-lessons
   ```

3. **Rule for Clean Merging**:
   - **DO** work inside your assigned feature folder (`src/features/<your-feature>/`).
   - **DO NOT** modify another teammate's feature directory unless coordinating with them.
   - Shared contracts: If you need to change a shared type in `src/types.ts`, communicate with the team first so interfaces remain in sync.

4. **Verify Build Before Pushing**:
   ```bash
   npm run build
   ```
   If TypeScript and Vite compile without errors, push your branch:
   ```bash
   git push origin feature/<your-feature>
   ```

5. **Open Pull Request (PR)**:
   - Since each teammate worked in their respective feature directory, Git will merge your changes automatically without conflicts!
