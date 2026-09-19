import React, { useState, useRef, useEffect } from "react";
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  Globe,
  Sparkles,
  User,
  Bot,
  RefreshCw,
  FileText,
  MessageSquare,
} from "lucide-react";
import { ChatMessage, GestureType, TargetLanguage } from "../types";
import { speechCtrl } from "./SpeechController";
import { TextAnalysisPanel } from "./TextAnalysisPanel";

interface ConversationPanelProps {
  messages: ChatMessage[];
  isSpeaking: boolean;
  isListening: boolean;
  suggestedReplies: string[];
  langCode: string;
  speechRate: number;
  targetLanguage?: TargetLanguage;
  nativeLanguage?: string;
  onSendMessage: (text: string) => void;
  onReplayAudio: (message: ChatMessage) => void;
  onStartListening: () => void;
  onStopListening: () => void;
  onSelectGesture: (gesture: GestureType) => void;
  onRateChange: (rate: number) => void;
  onSendToSmartboard?: (notes: string[], spotlightWord?: string) => void;
  onSpeakText?: (text: string) => void;
  interimTranscript: string;
}

export const ConversationPanel: React.FC<ConversationPanelProps> = ({
  messages,
  isSpeaking,
  isListening,
  suggestedReplies,
  langCode,
  speechRate,
  targetLanguage = "English",
  nativeLanguage = "English",
  onSendMessage,
  onReplayAudio,
  onStartListening,
  onStopListening,
  onSelectGesture,
  onRateChange,
  onSendToSmartboard,
  onSpeakText,
  interimTranscript,
}) => {
  const [activeTab, setActiveTab] = useState<"dialogue" | "text-analysis">("dialogue");
  const [inputText, setInputText] = useState("");
  const [showTranslations, setShowTranslations] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeTab === "dialogue") {
      scrollToBottom();
    }
  }, [messages, interimTranscript, activeTab]);

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
      {/* Header Bar with Sub-feature Tabs */}
      <div className="px-3 py-2.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
        {/* Tab Toggle: Dialogue vs Text Analysis */}
        <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-950 border border-slate-800/80">
          <button
            onClick={() => setActiveTab("dialogue")}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "dialogue"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Voice Dialogue</span>
            {messages.length > 0 && (
              <span className="ml-1 text-[10px] px-1.5 py-0.2 bg-blue-500/40 text-blue-100 rounded-full font-mono">
                {messages.length}
              </span>
            )}
          </button>

          <button
            id="tab-text-analysis"
            onClick={() => setActiveTab("text-analysis")}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "text-analysis"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-slate-400 hover:text-purple-300"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>Text Analysis</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-950 text-purple-300 border border-purple-800 font-mono">
              AI Nuance
            </span>
          </button>
        </div>

        {/* Right side controls */}
        {activeTab === "dialogue" ? (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="hidden sm:inline">Speed:</span>
            <select
              value={speechRate}
              onChange={(e) => onRateChange(parseFloat(e.target.value))}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2 py-0.5 text-xs focus:outline-none focus:border-blue-500"
            >
              <option value={0.8}>0.8x</option>
              <option value={0.9}>0.9x</option>
              <option value={1.0}>1.0x</option>
              <option value={1.15}>1.15x</option>
            </select>
          </div>
        ) : (
          <div className="text-[11px] text-slate-400 hidden sm:flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-purple-400" />
            <span>Target: {targetLanguage}</span>
          </div>
        )}
      </div>

      {/* Main Container Area */}
      {activeTab === "text-analysis" ? (
        <div className="flex-1 overflow-hidden">
          <TextAnalysisPanel
            targetLanguage={targetLanguage}
            nativeLanguage={nativeLanguage}
            langCode={langCode}
            onSendToChat={(prompt) => {
              setActiveTab("dialogue");
              onSendMessage(prompt);
            }}
            onSendToSmartboard={onSendToSmartboard}
            onSpeakText={onSpeakText}
          />
        </div>
      ) : (
        <>
          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <Bot className="w-10 h-10 text-slate-600 mb-2" />
                <p className="text-sm font-medium text-slate-400">
                  Your 3D Tutor Maestro is ready to practice!
                </p>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Speak using the microphone, type below, or switch to{" "}
                  <button
                    onClick={() => setActiveTab("text-analysis")}
                    className="text-purple-400 underline font-semibold hover:text-purple-300 inline"
                  >
                    Text Analysis
                  </button>{" "}
                  to paste written text for instant nuance corrections.
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
                          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                          title="Replay pronunciation & 3D gesture"
                        >
                          <Volume2 className="w-3 h-3 text-blue-400" />
                          <span>Replay Voice</span>
                        </button>

                        {msg.translation && (
                          <button
                            onClick={() => toggleTranslation(msg.id)}
                            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
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
                  className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg whitespace-nowrap transition-colors border border-slate-700/60 cursor-pointer"
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
              className={`p-2.5 rounded-xl transition-all shadow-md shrink-0 cursor-pointer ${
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
              className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white rounded-xl transition-colors shrink-0 cursor-pointer"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </>
      )}
    </div>
  );
};
