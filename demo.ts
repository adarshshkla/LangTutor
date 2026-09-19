async function runDemo() {
  const PORT = 3000;
  const BASE_URL = `http://127.0.0.1:${PORT}`;
  
  console.log("🚀 Starting Backend Demo...");
  
  // 1. Test Health Endpoint
  console.log("\n1️⃣ Testing /api/health");
  try {
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthRes.json();
    console.log("Health Response:", healthData);
  } catch (e) {
    console.error("Health check failed. Ensure the server is running on port 3000.");
    console.error(e);
    return; // Exit if server is not running
  }

  // 2. Test Tutor Chat Endpoint
  console.log("\n2️⃣ Testing /api/tutor/chat");
  const chatPayload = {
    message: "Hola, ¿cómo estás?",
    studentName: "Alice",
    targetLanguage: "Spanish",
    level: "Beginner",
    topic: "Greetings",
    learningGoal: "Basic interaction",
    nativeLanguage: "English"
  };
  console.log("Sending Chat Payload:", chatPayload);
  
  try {
    const chatRes = await fetch(`${BASE_URL}/api/tutor/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(chatPayload)
    });
    const chatData = await chatRes.json();
    console.log("Chat Response:");
    console.dir(chatData, { depth: null, colors: true });
  } catch (e) {
    console.error("Chat test failed:", e);
  }

  // 3. Test Evaluate Speech Endpoint
  console.log("\n3️⃣ Testing /api/tutor/evaluate-speech");
  const speechPayload = {
    expectedText: "Hola, ¿cómo estás?",
    transcribedText: "Hola como estas", // slight difference for realism
    targetLanguage: "Spanish"
  };
  console.log("Sending Speech Payload:", speechPayload);
  
  try {
    const speechRes = await fetch(`${BASE_URL}/api/tutor/evaluate-speech`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(speechPayload)
    });
    const speechData = await speechRes.json();
    console.log("Evaluate Speech Response:");
    console.dir(speechData, { depth: null, colors: true });
  } catch (e) {
    console.error("Evaluate speech test failed:", e);
  }
  // 4. Test Text Analysis Endpoint
  console.log("\n4️⃣ Testing /api/tutor/analyze-text");
  const analysisPayload = {
    text: "Yo soy teniendo hambre y quiero la comida rapido",
    targetLanguage: "Spanish",
    nativeLanguage: "English",
    level: "Intermediate (B1-B2)"
  };
  console.log("Sending Analysis Payload:", analysisPayload);

  try {
    const analysisRes = await fetch(`${BASE_URL}/api/tutor/analyze-text`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(analysisPayload)
    });
    const analysisData = await analysisRes.json();
    console.log("Text Analysis Response:");
    console.dir(analysisData, { depth: null, colors: true });
  } catch (e) {
    console.error("Text analysis test failed:", e);
  }
}

runDemo();
