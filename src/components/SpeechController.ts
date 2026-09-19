// Web Speech API & Viseme synchronization engine for the 3D Tutor

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

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  public getVoiceForLanguage(langCode: string): SpeechSynthesisVoice | null {
    if (!this.synth) return null;
    const voices = this.synth.getVoices();
    const prefix = langCode.slice(0, 2).toLowerCase();

    // 1. Exact match
    let match = voices.find((v) => v.lang.toLowerCase().replace("_", "-") === langCode.toLowerCase());
    if (match) return match;

    // 2. Language prefix match
    match = voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
    if (match) return match;

    return null;
  }

  public speak(
    text: string,
    langCode: string,
    rate: number = 1.0,
    callbacks?: SpeechCallbackProps
  ) {
    if (!this.synth) {
      callbacks?.onError?.("Speech synthesis not supported in this browser.");
      return;
    }

    this.stopSpeaking();

    // Clean text of markdown or special characters before speaking
    const cleanText = text
      .replace(/[*_~`#\[\]]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleanText) return;

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

    // Simulate viseme pulses during speech
    let wordIndex = 0;
    const words = cleanText.split(" ");

    utterance.onstart = () => {
      callbacks?.onStart?.();

      // Start continuous dynamic lip sync oscillator
      let step = 0;
      this.visemeInterval = window.setInterval(() => {
        step++;
        // Natural speech mouth flutter curve with vowel cadence
        const currWord = words[wordIndex % words.length] || "a";
        const char = currWord[step % currWord.length] || "a";
        const base = estimateViseme(char);

        // Modulate with rhythmic mouth movement
        const wave = (Math.sin(step * 0.4) + 1) * 0.5;
        const openness = base.openness * (0.6 + wave * 0.4);
        callbacks?.onViseme?.(openness, base.pucker, base.smile);
      }, 75);
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
      // If user canceled or interrupted with a new phrase, don't trigger error callback
      if (e.error === "canceled" || e.error === "interrupted") {
        this.clearVisemeLoop();
        callbacks?.onViseme?.(0, 0, 0.1);
        this.currentUtterance = null;
        return;
      }
      this.clearVisemeLoop();
      callbacks?.onViseme?.(0, 0, 0.1);
      callbacks?.onError?.(e.error);
      this.currentUtterance = null;
    };

    // Chrome speech synthesis workaround for paused / hung queue
    if (this.synth.paused) {
      this.synth.resume();
    }

    this.synth.speak(utterance);
  }

  public stopSpeaking() {
    this.clearVisemeLoop();
    if (this.synth) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
  }

  private clearVisemeLoop() {
    if (this.visemeInterval !== null) {
      clearInterval(this.visemeInterval);
      this.visemeInterval = null;
    }
  }

  // Speech Recognition
  public isSpeechRecognitionSupported(): boolean {
    if (typeof window === "undefined") return false;
    return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  public startListening(
    langCode: string,
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (err: string) => void,
    onEnd: () => void
  ): boolean {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      onError("Speech recognition is not supported in this browser. Please type your message.");
      return false;
    }

    try {
      this.stopListening();

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
        onError(event.error || "Speech recognition error");
      };

      rec.onend = () => {
        onEnd();
      };

      rec.start();
      return true;
    } catch (e) {
      onError(e instanceof Error ? e.message : "Failed to start listening");
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
}

export const speechCtrl = new SpeechController();
