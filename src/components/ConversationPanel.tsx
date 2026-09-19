import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Send, Volume2, Globe, Sparkles, User, Bot, RefreshCw } from "lucide-react";
import { ChatMessage, GestureType } from "../types";
import { speechCtrl } from "./SpeechController";

interface ConversationPanelProps {
  messages: ChatMessage[];
  isSpeaking: boolean;
  isListening: boolean;
  suggestedReplies: string[];
  langCode: string;
  speechRate: number;
  onSendMessage: (text: string) => void;
  onReplayAudio: (message: ChatMessage) => void;
  onStartListening: () => void;
  onStopListening: () => void;
  onSelectGesture: (gesture: GestureType) => void;
  onRateChange: (rate: number) => void;
  interimTranscript: string;
}

export const ConversationPanel: React.FC<ConversationPanelProps> = ({
  messages,
  isSpeaking,
  isListening,
  suggestedReplies,
  langCode,
  speechRate,
  onSendMessage,
  onReplayAudio,
  onStartListening,
  onStopListening,
  onSelectGesture,
  onRateChange,
  interimTranscript,
}) => {
  const [inputText, setInputText] = useState("");
  const [showTranslations, setShowTranslations] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, interimTranscript]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  const toggleTranslation = (id: string) => {
    setShowTranslations((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-md overflow-hidden">
      {/* Header bar */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Live Voice Dialogue
          </span>
        </div>

        {/* Speech Speed Control */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span>Tutor Speed:</span>
          <select
            value={speechRate}
            onChange={(e) => onRateChange(parseFloat(e.target.value))}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2 py-0.5 text-xs focus:outline-none focus:border-blue-500"
          >
            <option value={0.8}>0.8x (Slow)</option>
            <option value={0.9}>0.9x</option>
            <option value={1.0}>1.0x (Normal)</option>
            <option value={1.15}>1.15x (Native)</option>
          </select>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <Bot className="w-10 h-10 text-slate-600 mb-2" />
            <p className="text-sm font-medium text-slate-400">
              Your 3D Tutor Maestro is ready to practice!
            </p>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              Speak using the microphone or pick a suggested topic below.
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isTutor = msg.role === "tutor";
          const isTranslated = showTranslations[msg.id];

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isTutor ? "justify-start" : "justify-end"}`}
            >
              {isTutor && (
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[82%] rounded-2xl p-3.5 shadow-md flex flex-col gap-1.5 ${
                  isTutor
                    ? "bg-slate-800/90 text-slate-100 border border-slate-700/60 rounded-tl-sm"
                    : "bg-blue-600 text-white rounded-tr-sm"
                }`}
              >
                {/* Tutor Gesture Indicator Tag */}
                {isTutor && msg.gesture && (
                  <div className="flex items-center gap-1 text-[11px] text-blue-300 font-medium">
                    <Sparkles className="w-3 h-3" />
                    <span className="capitalize">Gesture: {msg.gesture}</span>
                  </div>
                )}

                {/* Spoken Text */}
                <p className="text-sm leading-relaxed font-normal whitespace-pre-wrap">
                  {msg.text}
                </p>

                {/* English translation if toggled */}
                {isTutor && msg.translation && isTranslated && (
                  <div className="text-xs text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800 italic">
                    {msg.translation}
                  </div>
                )}

                {/* Tutor Message Action Buttons (Audio replay & translation toggle) */}
                {isTutor && (
                  <div className="flex items-center gap-3 pt-1 border-t border-slate-700/40 text-[11px] text-slate-400">
                    <button
                      onClick={() => onReplayAudio(msg)}
                      className="flex items-center gap-1 hover:text-white transition-colors"
                      title="Replay pronunciation & 3D gesture"
                    >
                      <Volume2 className="w-3 h-3 text-blue-400" />
                      <span>Replay Voice</span>
                    </button>

                    {msg.translation && (
                      <button
                        onClick={() => toggleTranslation(msg.id)}
                        className="flex items-center gap-1 hover:text-white transition-colors"
                      >
                        <Globe className="w-3 h-3 text-emerald-400" />
                        <span>{isTranslated ? "Hide English" : "Show English"}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {!isTutor && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Live speech recognition transcription indicator */}
        {isListening && (
          <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-950/40 border border-amber-800/50 p-2.5 rounded-xl animate-pulse">
            <Mic className="w-4 h-4 animate-bounce" />
            <span>
              Listening: {interimTranscript || "Speak clearly in target language..."}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Replies */}
      {suggestedReplies.length > 0 && (
        <div className="px-4 py-2 bg-slate-950/30 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[11px] text-slate-400 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Try saying:
          </span>
          {suggestedReplies.map((reply, i) => (
            <button
              key={i}
              onClick={() => onSendMessage(reply)}
              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg whitespace-nowrap transition-colors border border-slate-700/60"
            >
              "{reply}"
            </button>
          ))}
        </div>
      )}

      {/* Input Bar with Voice Toggle */}
      <form
        onSubmit={handleSubmit}
        className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center gap-2"
      >
        <button
          type="button"
          onClick={isListening ? onStopListening : onStartListening}
          className={`p-2.5 rounded-xl transition-all shadow-md shrink-0 ${
            isListening
              ? "bg-rose-600 text-white animate-pulse"
              : "bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white"
          }`}
          title={isListening ? "Stop listening" : "Start speaking with microphone"}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Speak or type in target language...`}
          className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white rounded-xl transition-colors shrink-0"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
