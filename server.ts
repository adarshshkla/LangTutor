import express from "express";
import path from "path";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import { createServer as createViteServer } from "vite";

dotenv.config();

let aiClient: Groq | null = null;

function getAI(): Groq | null {
  if (!aiClient && process.env.GROQ_API_KEY) {
    aiClient = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: "10mb" }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      hasApiKey: Boolean(process.env.GROQ_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // Main conversational tutor endpoint
  app.post("/api/tutor/chat", async (req, res) => {
    try {
      const {
        message,
        targetLanguage = "Spanish",
        level = "Beginner (A1-A2)",
        topic = "General Conversation",
        learningGoal = "Daily Conversation & Socializing",
        studentName = "Student",
        nativeLanguage = "English",
        history = [],
      } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Missing message parameter" });
      }

      const ai = getAI();

      if (!ai) {
        // High quality offline fallback if no API key is set yet
        return res.json({
          spokenText: `¡Hola ${studentName}! I am your 3D language tutor for ${targetLanguage}. Let's work towards your goal of ${learningGoal}! You said: "${message}".`,
          translation: `Hello ${studentName}! I am your 3D language tutor for ${targetLanguage}. Let's work towards your goal of ${learningGoal}!`,
          gesture: "welcoming",
          boardNotes: [
            `Student: ${studentName}`,
            `Target Language: ${targetLanguage}`,
            `Goal: ${learningGoal}`,
            `Proficiency: ${level}`,
          ],
          grammarFeedback: null,
          vocabularySpotlight: [
            {
              word: "Práctica",
              phonetic: "/ˈpɾak.ti.ka/",
              meaning: "Practice",
              example: "La práctica hace al maestro.",
            },
          ],
          pronunciationTip: "Keep vowels clear and unreduced.",
          suggestedReplies: [
            `¿Cómo estás?`,
            `Me gustaría aprender vocabulario.`,
            `¿Puedes explicarme la gramática?`,
          ],
        });
      }

      const systemInstruction = `You are "Maestro", an expert, warm, and highly engaging AI Language Learning Tutor.
Student's Name: ${studentName}
Language the student understands completely (instructional & bridge language): ${nativeLanguage}
Target Language to teach & practice: ${targetLanguage}
Student's proficiency level: ${level}
Student's Core Learning Goal: ${learningGoal}
Active Lesson Topic: ${topic}

CRITICAL LINGUISTIC DIRECTIVES:
1. Target Language Immersion: Speak directly to the student in ${targetLanguage}.
2. Clear Pedagogical Scaffolding: Use the language the student understands completely (${nativeLanguage}) whenever explaining grammar nuances, complex vocabulary definitions, or corrections so they grasp every concept easily.
3. Keep the 'spokenText' concise (1-3 sentences), natural, conversational, and tailored to their learning goal (${learningGoal}) so it sounds great when spoken aloud by voice synthesis.
4. Physical Gestures:
   - "welcoming": greetings, warm opening
   - "explaining": breaking down a concept, teaching rules
   - "praising": student did great, encouraging mastery
   - "pointing": drawing attention to vocabulary on the blackboard
   - "thinking": reflecting, asking student to consider a puzzle
   - "encouraging": gentle push to try again when there was a mistake
5. Provide constructive feedback on grammar or word choice: explain mistakes clearly in ${nativeLanguage}.
6. Highlight 1-3 useful vocabulary words or idioms with phonetic guides (IPA) and translations in ${nativeLanguage}.
7. Provide 2-4 bullet notes for the classroom smart whiteboard summarizing the key lesson concepts.
8. SUGGESTED REPLIES (MANDATORY): You MUST generate 2-3 natural suggested replies STRICTLY in the chosen target language (${targetLanguage}). The student will click these to practice speaking and responding in ${targetLanguage}. Do NOT output suggestions in ${nativeLanguage} unless ${targetLanguage} is the same as ${nativeLanguage}.

RESPOND STRICTLY WITH A JSON OBJECT EXACTLY MATCHING THIS STRUCTURE:
{
  "spokenText": "The verbal response in target language",
  "translation": "English translation",
  "gesture": "welcoming|explaining|praising|pointing|thinking|encouraging",
  "boardNotes": ["point 1", "point 2"],
  "grammarFeedback": {
    "hasMistake": true,
    "originalSentence": "text",
    "correctedSentence": "text",
    "explanation": "text",
    "ruleKey": "text"
  },
  "vocabularySpotlight": [
    { "word": "word", "phonetic": "ipa", "meaning": "meaning", "example": "example" }
  ],
  "pronunciationTip": "string tip",
  "suggestedReplies": ["reply 1", "reply 2"]
}
If there is no grammar mistake, set "grammarFeedback" to null. Ensure the output is a valid JSON object.`;

      const formattedHistory = Array.isArray(history)
        ? history
            .slice(-6)
            .map((h: { role: string; text: string }) => `${h.role === "user" ? "Student" : "Tutor"}: ${h.text}`)
            .join("\n")
        : "";

      const prompt = `${formattedHistory ? `Recent Conversation:\n${formattedHistory}\n\n` : ""}Student said: "${message}"`;

      const response = await ai.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1500,
        temperature: 0.7,
      });

      const rawText = response.choices[0]?.message?.content || "{}";
      const parsed = JSON.parse(rawText);
      return res.json(parsed);
    } catch (error) {
      console.error("Error in /api/tutor/chat:", error);
      return res.status(500).json({
        error: "Failed to generate tutor response",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Pronunciation & speech evaluation endpoint
  app.post("/api/tutor/evaluate-speech", async (req, res) => {
    try {
      const { expectedText, transcribedText, targetLanguage = "Spanish" } = req.body;

      const ai = getAI();
      if (!ai) {
        // Fallback calculation
        const match = expectedText?.toLowerCase().trim() === transcribedText?.toLowerCase().trim();
        return res.json({
          accuracyScore: match ? 95 : 75,
          pronunciationScore: match ? 90 : 70,
          feedback: match
            ? "Excellent pronunciation and clear diction!"
            : "Good effort! Notice the vowel clarity and syllable stress.",
          gesture: match ? "praising" : "encouraging",
          phoneticBreakdown: [
            { word: expectedText || "phrase", ipa: "/.../", status: match ? "good" : "needs-work" },
          ],
          encouragement: "Keep practicing aloud to build muscle memory!",
        });
      }

      const systemInstruction = `Evaluate the student's spoken attempt in ${targetLanguage}.
Analyze phonetic precision, syllable stress, omissions, or substitutions. Give constructive pronunciation feedback.

RESPOND STRICTLY WITH A JSON OBJECT EXACTLY MATCHING THIS STRUCTURE:
{
  "accuracyScore": 95,
  "pronunciationScore": 90,
  "feedback": "Detailed pronunciation coaching",
  "gesture": "praising|encouraging|explaining",
  "phoneticBreakdown": [
    { "word": "word", "ipa": "ipa", "status": "good|needs-work|accent-tip" }
  ],
  "encouragement": "Keep practicing!"
}
Ensure the output is a valid JSON object.`;

      const prompt = `Target sentence to pronounce: "${expectedText}"\nRecognized speech transcript: "${transcribedText}"`;

      const response = await ai.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000,
        temperature: 0.2,
      });

      const raw = response.choices[0]?.message?.content || "{}";
      return res.json(JSON.parse(raw));
    } catch (error) {
      console.error("Error in /api/tutor/evaluate-speech:", error);
      return res.status(500).json({ error: "Failed to evaluate speech" });
    }
  });

  // Vite middleware for dev / static for prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Tutor Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
