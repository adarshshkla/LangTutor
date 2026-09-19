// Web Speech API, Web Audio synthesizer & Viseme synchronization engine for the 3D Tutor

export interface SpeechCallbackProps {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: string) => void;
  onViseme?: (openness: number, pucker: number, smile: number) => void;
}

// Map vowels and character shapes to approximate visemes
export function estimateViseme(char: string): { openness: number; pucker: number; smile: number } {
  const c = char.toLowerCase();
  if ("ae".includes(c)) {
    return { openness: 0.85, pucker: 0.1, smile: 0.4 };
  } else if ("o".includes(c)) {
    return { openness: 0.7, pucker: 0.8, smile: 0.05 };
  } else if ("u".includes(c)) {
    return { openness: 0.4, pucker: 0.9, smile: 0.0 };
  } else if ("i".includes(c)) {
    return { openness: 0.35, pucker: 0.05, smile: 0.8 };
  } else if ("mbp".includes(c)) {
    return { openness: 0.05, pucker: 0.2, smile: 0.1 };
  } else if ("f v".includes(c)) {
    return { openness: 0.15, pucker: 0.1, smile: 0.3 };
  } else if ("tdsz".includes(c)) {
    return { openness: 0.3, pucker: 0.1, smile: 0.5 };
  }
  return { openness: 0.2, pucker: 0.1, smile: 0.2 };
}

class SpeechController {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private visemeInterval: number | null = null;
  private recognition: any = null;
  private voices: SpeechSynthesisVoice[] = [];
  private audioCtx: AudioContext | null = null;
  private keepAliveTimer: number | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      if ("speechSynthesis" in window) {
        this.synth = window.speechSynthesis;
        const loadVoices = () => {
          if (this.synth) {
            this.voices = this.synth.getVoices();
          }
        };
        loadVoices();
        if (typeof window.speechSynthesis.onvoiceschanged !== "undefined") {
          window.speechSynthesis.onvoiceschanged = loadVoices;
        }
      }

      // Automatically unlock audio on first user click or touch
      const unlock = () => {
        this.unlockAudio();
        window.removeEventListener("click", unlock);
        window.removeEventListener("touchstart", unlock);
        window.removeEventListener("keydown", unlock);
      };
      window.addEventListener("click", unlock);
      window.addEventListener("touchstart", unlock);
      window.addEventListener("keydown", unlock);
    }
  }

  public unlockAudio() {
    try {
      if (!this.audioCtx && typeof window !== "undefined") {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.audioCtx = new AudioCtx();
        }
      }
      if (this.audioCtx && this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }
      if (this.synth && this.synth.paused) {
        this.synth.resume();
      }
    } catch {
      // ignore
    }
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    const v = this.synth.getVoices();
    if (v && v.length > 0) {
      this.voices = v;
    }
    return this.voices;
  }

  public getVoiceForLanguage(langCode: string): SpeechSynthesisVoice | null {
    const voices = this.getAvailableVoices();
    if (!voices || voices.length === 0) return null;
    const prefix = langCode.slice(0, 2).toLowerCase();

    // 1. Exact match (e.g. es-ES, es-MX, fr-FR, ja-JP)
    let match = voices.find(
      (v) => v.lang.toLowerCase().replace("_", "-") === langCode.toLowerCase()
    );
    if (match) return match;

    // 2. Language prefix match (e.g. any 'es-*' or 'fr-*')
    match = voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
    if (match) return match;

    // 3. Fallback to default or first voice
    return voices.find((v) => v.default) || voices[0] || null;
  }

  public speak(
    text: string,
    langCode: string,
    rate: number = 1.0,
    callbacks?: SpeechCallbackProps
  ) {
    this.unlockAudio();

    // Clean text of markdown or special characters before speaking
    const cleanText = text
      .replace(/[*_~`#\[\]]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleanText) return;

    if (!this.synth) {
      this.playChime("tap");
      callbacks?.onError?.("Speech synthesis not supported in this browser.");
      return;
    }

    this.stopSpeaking();

    try {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      this.currentUtterance = utterance;

      const voice = this.getVoiceForLanguage(langCode);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = langCode;
      }

      utterance.rate = Math.min(Math.max(rate, 0.7), 1.3);
      utterance.pitch = 1.0;

      // Viseme synchronization during speech
      let wordIndex = 0;
      const words = cleanText.split(" ");

      utterance.onstart = () => {
        callbacks?.onStart?.();

        // Lip sync flutter oscillator
        let step = 0;
        this.visemeInterval = window.setInterval(() => {
          step++;
          const currWord = words[wordIndex % words.length] || "a";
          const char = currWord[step % currWord.length] || "a";
          const base = estimateViseme(char);

          const wave = (Math.sin(step * 0.4) + 1) * 0.5;
          const openness = base.openness * (0.6 + wave * 0.4);
          callbacks?.onViseme?.(openness, base.pucker, base.smile);
        }, 75);

        // Chrome keep-alive hack to prevent speech stopping after ~15 seconds
        if (this.keepAliveTimer !== null) clearInterval(this.keepAliveTimer);
        this.keepAliveTimer = window.setInterval(() => {
          if (this.synth && this.synth.speaking) {
            this.synth.pause();
            this.synth.resume();
          }
        }, 10000);
      };

      utterance.onboundary = (event) => {
        if (event.name === "word") {
          wordIndex++;
        }
      };

      utterance.onend = () => {
        this.clearVisemeLoop();
        callbacks?.onViseme?.(0, 0, 0.1);
        callbacks?.onEnd?.();
        this.currentUtterance = null;
      };

      utterance.onerror = (e) => {
        this.clearVisemeLoop();
        callbacks?.onViseme?.(0, 0, 0.1);
        this.currentUtterance = null;
        if (e.error === "canceled" || e.error === "interrupted") {
          return;
        }
        // Fallback acoustic chime so user knows something occurred
        this.playChime("tap");
        callbacks?.onError?.(e.error || "Speech synthesis interrupted");
      };

      // Ensure synth is resumed if paused
      if (this.synth.paused) {
        this.synth.resume();
      }

      this.synth.speak(utterance);
    } catch (err: any) {
      this.playChime("tap");
      callbacks?.onError?.(err?.message || "Failed to trigger voice synthesis");
    }
  }

  public stopSpeaking() {
    this.clearVisemeLoop();
    if (this.keepAliveTimer !== null) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {
        // ignore
      }
    }
    this.currentUtterance = null;
  }

  private clearVisemeLoop() {
    if (this.visemeInterval !== null) {
      clearInterval(this.visemeInterval);
      this.visemeInterval = null;
    }
  }

  // Web Audio Harmonic Tone Synthesizer
  public playAcousticTone(
    frequency: number = 440,
    durationMs: number = 300,
    type: OscillatorType = "sine"
  ) {
    try {
      this.unlockAudio();
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.18, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + durationMs / 1000);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + durationMs / 1000);
    } catch {
      // ignore
    }
  }

  public playChime(kind: "success" | "praise" | "tap" | "error" | "bell") {
    try {
      if (kind === "success") {
        this.playAcousticTone(523.25, 120); // C5
        setTimeout(() => this.playAcousticTone(659.25, 120), 100); // E5
        setTimeout(() => this.playAcousticTone(783.99, 260), 200); // G5
      } else if (kind === "praise") {
        this.playAcousticTone(587.33, 120);
        setTimeout(() => this.playAcousticTone(880.0, 240), 120);
      } else if (kind === "bell") {
        this.playAcousticTone(659.25, 350, "triangle");
      } else if (kind === "tap") {
        this.playAcousticTone(440, 70, "triangle");
      } else {
        this.playAcousticTone(220, 220, "sawtooth");
      }
    } catch {
      // ignore
    }
  }

  // Speech Recognition with Microphone Priming & Clear Diagnostics
  public isSpeechRecognitionSupported(): boolean {
    if (typeof window === "undefined") return false;
    return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  public async startListening(
    langCode: string,
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (helpfulMessage: string, rawError?: string) => void,
    onEnd: () => void
  ): Promise<boolean> {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      onError(
        "Speech recognition is not built into this browser engine. Please type or click a suggested reply.",
        "UNSUPPORTED_BROWSER"
      );
      return false;
    }

    try {
      this.stopListening();
      this.unlockAudio();

      // Check / prime microphone permission if getUserMedia is supported
      if (navigator?.mediaDevices?.getUserMedia) {
        try {
          const testStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          // Release stream immediately so SpeechRecognition can take exclusive audio handle
          testStream.getTracks().forEach((t) => t.stop());
        } catch (mediaErr: any) {
          if (
            mediaErr.name === "NotAllowedError" ||
            mediaErr.name === "PermissionDeniedError" ||
            mediaErr.message?.includes("Permission denied")
          ) {
            onError(
              "Microphone permission is blocked. Please allow microphone access in your browser or open this app in a new tab.",
              "PERMISSION_DENIED"
            );
            return false;
          }
        }
      }

      const rec = new SpeechRec();
      this.recognition = rec;
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = langCode;

      rec.onresult = (event: any) => {
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (final) {
          onResult(final.trim(), true);
        } else if (interim) {
          onResult(interim.trim(), false);
        }
      };

      rec.onerror = (event: any) => {
        const errType = event.error;
        let helpfulMessage = "Microphone or recognition issue encountered.";
        if (errType === "not-allowed" || errType === "service-not-allowed") {
          helpfulMessage =
            "Microphone permission denied. Click the microphone/camera icon in your browser URL bar to allow access, or open the app in a new tab.";
        } else if (errType === "no-speech") {
          helpfulMessage = "No speech was detected. Please speak clearly into your microphone.";
        } else if (errType === "network") {
          helpfulMessage =
            "Speech recognition network service could not connect. Please try again or type your message.";
        } else if (errType === "audio-capture") {
          helpfulMessage = "No microphone hardware detected on your device.";
        }
        onError(helpfulMessage, errType);
      };

      rec.onend = () => {
        onEnd();
      };

      rec.start();
      return true;
    } catch (e: any) {
      onError(e instanceof Error ? e.message : "Failed to start listening", "EXCEPTION");
      return false;
    }
  }

  public stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
      this.recognition = null;
    }
  }

  // Interactive Microphone Live Stream Tester (gives volume 0-100 to prove mic works)
  public async testMicrophoneStream(
    onVolumeLevel: (level: number) => void,
    onError: (err: string) => void
  ): Promise<() => void> {
    try {
      this.unlockAudio();
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error("getUserMedia is not supported on this browser.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      let isRunning = true;
      let animId: number;

      const checkVolume = () => {
        if (!isRunning) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        onVolumeLevel(normalized);
        animId = requestAnimationFrame(checkVolume);
      };
      checkVolume();

      return () => {
        isRunning = false;
        cancelAnimationFrame(animId);
        stream.getTracks().forEach((t) => t.stop());
        try {
          ctx.close();
        } catch {}
      };
    } catch (e: any) {
      onError(e?.message || "Failed to access microphone hardware.");
      return () => {};
    }
  }
}

export const speechCtrl = new SpeechController();
