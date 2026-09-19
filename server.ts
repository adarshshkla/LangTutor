import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

const GROQ_MODEL = "openai/gpt-oss-120b";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

function hasApiKey(): boolean {
  return Boolean(process.env.GROQ_API_KEY);
}

// Calls Groq's OpenAI-compatible chat completions endpoint in JSON mode and
// returns the parsed object. Throws on network/HTTP/parse failure so callers
// can fall back cleanly.
async function callGroqJSON(systemPrompt: string, userPrompt: string): Promise<any> {
  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "{}";
  return JSON.parse(content);
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: "10mb" }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      hasApiKey: hasApiKey(),
      timestamp: new Date().toISOString(),
    });
  });

  // Main conversational tutor endpoint
  app.post("/api/tutor/chat", async (req, res) => {
    try {
      const {
        message,
        targetLanguage = "English",
        level = "Beginner (A1-A2)",
        topic = "General Conversation",
        learningGoal = "Daily Conversation & Socializing",
        studentName = "Student",
        nativeLanguage = "Spanish",
        history = [],
      } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Missing message parameter" });
      }

      if (!hasApiKey()) {
        const isTargetEnglish = targetLanguage.toLowerCase() === "english";
        // High quality offline fallback if no API key is set yet
        return res.json({
          spokenText: isTargetEnglish
            ? `Hello ${studentName}! I am your 3D language tutor for ${targetLanguage}. Let's work towards your goal of ${learningGoal}! You said: "${message}".`
            : `¡Hola ${studentName}! I am your 3D language tutor for ${targetLanguage}. Let's work towards your goal of ${learningGoal}! You said: "${message}".`,
          translation: isTargetEnglish
            ? `¡Hola ${studentName}! Soy tu tutor 3D de inglés. ¡Trabajemos en tu meta de ${learningGoal}!`
            : `Hello ${studentName}! I am your 3D language tutor for ${targetLanguage}. Let's work towards your goal of ${learningGoal}!`,
          gesture: "welcoming",
          boardNotes: [
            `Student: ${studentName}`,
            `Target Language: ${targetLanguage}`,
            `Goal: ${learningGoal}`,
            `Proficiency: ${level}`,
          ],
          grammarFeedback: null,
          vocabularySpotlight: isTargetEnglish
            ? [
                {
                  word: "Practice",
                  phonetic: "/ˈpræk.tɪs/",
                  meaning: "Repeated exercise in an activity or skill to acquire proficiency",
                  example: "Practice makes perfect in language learning.",
                },
              ]
            : [
                {
                  word: "Práctica",
                  phonetic: "/ˈpɾak.ti.ka/",
                  meaning: "Practice",
                  example: "La práctica hace al maestro.",
                },
              ],
          pronunciationTip: isTargetEnglish
            ? "Keep your vowel length clear and practice the voiced and unvoiced 'th' sounds."
            : "Keep vowels clear and unreduced.",
          suggestedReplies: isTargetEnglish
            ? [
                `Hello! How are you doing today?`,
                `I would like to practice vocabulary chapters.`,
                `Could you please explain this grammar rule?`,
              ]
            : [
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

You MUST respond with ONLY a single valid JSON object (no markdown fences, no commentary) matching EXACTLY this shape:
{
  "spokenText": string,
  "translation": string,
  "gesture": "welcoming" | "explaining" | "praising" | "pointing" | "thinking" | "encouraging",
  "boardNotes": string[],
  "grammarFeedback": { "hasMistake": boolean, "originalSentence": string, "correctedSentence": string, "explanation": string, "ruleKey": string } | null,
  "vocabularySpotlight": [{ "word": string, "phonetic": string, "meaning": string, "example": string }],
  "pronunciationTip": string,
  "suggestedReplies": string[]
}`;

      const formattedHistory = Array.isArray(history)
        ? history
            .slice(-6)
            .map((h: { role: string; text: string }) => `${h.role === "user" ? "Student" : "Tutor"}: ${h.text}`)
            .join("\n")
        : "";

      const userPrompt = `${formattedHistory ? `Recent Conversation:\n${formattedHistory}\n\n` : ""}Student said: "${message}"

Respond strictly with valid JSON matching the requested schema.`;

      const parsed = await callGroqJSON(systemInstruction, userPrompt);
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
      const { expectedText, transcribedText, targetLanguage = "English" } = req.body;

      if (!hasApiKey()) {
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

      const systemInstruction = `You are a precise pronunciation coach for ${targetLanguage}. Analyze phonetic precision, syllable stress, omissions, or substitutions between a target sentence and what speech recognition transcribed. Give constructive pronunciation feedback.

You MUST respond with ONLY a single valid JSON object (no markdown fences, no commentary) matching EXACTLY this shape:
{
  "accuracyScore": number (0-100),
  "pronunciationScore": number (0-100),
  "feedback": string,
  "gesture": "praising" | "encouraging" | "explaining",
  "phoneticBreakdown": [{ "word": string, "ipa": string, "status": "good" | "needs-work" | "accent-tip" }],
  "encouragement": string
}`;

      const userPrompt = `Target sentence to pronounce: "${expectedText}"
Recognized speech transcript: "${transcribedText}"`;

      const parsed = await callGroqJSON(systemInstruction, userPrompt);
      return res.json(parsed);
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