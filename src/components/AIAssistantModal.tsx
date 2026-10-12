import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Mic,
  MicOff,
  Sparkles,
  Bot,
  User,
  ExternalLink,
  CheckCircle2,
  FolderGit2,
  Timer,
  Volume2,
  VolumeX,
  RotateCcw,
  Search,
  Loader2,
} from 'lucide-react';
import { ChatMessage, AISettings, Project, Task, Priority } from '../types';
import { sound } from '../utils/audio';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (userText: string) => Promise<void>;
  aiSettings: AISettings;
  projects: Project[];
  tasks: Task[];
  isProcessing: boolean;
  onClearHistory: () => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  aiSettings,
  projects,
  tasks,
  isProcessing,
  onClearHistory,
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState<string>('');
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages, isProcessing]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || isProcessing) return;

    setInputText('');
    await onSendMessage(text);
  };

  const handleQuickPrompt = async (prompt: string) => {
    if (isProcessing) return;
    await onSendMessage(prompt);
  };

  // Voice recording & transcription
  const handleToggleVoice = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      setRecordingStatus('Transcribing voice directive...');
    } else {
      // Start recording
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setRecordingStatus('Microphone recording is not supported in this browser.');
          setTimeout(() => setRecordingStatus(''), 3000);
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];

        // Pick supported mimeType
        const mimeType = MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : 'audio/wav';

        const mediaRecorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          // Stop media tracks
          stream.getTracks().forEach((track) => track.stop());

          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          const reader = new FileReader();

          reader.onloadend = async () => {
            const base64Data = (reader.result as string).split(',')[1];
            try {
              const res = await fetch('/api/ai/transcribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ audioBase64: base64Data, mimeType }),
              });

              const data = await res.json();
              if (data.transcription && data.transcription.trim()) {
                setInputText(data.transcription.trim());
                setRecordingStatus('');
                sound.playTick();
              } else {
                setRecordingStatus('Audio captured. Ready for directive.');
                setTimeout(() => setRecordingStatus(''), 3000);
              }
            } catch (err: any) {
              console.warn('Transcription notice:', err?.message);
              setRecordingStatus('Audio capture complete.');
              setTimeout(() => setRecordingStatus(''), 3000);
            }
          };

          reader.readAsDataURL(audioBlob);
        };

        mediaRecorder.start();
        setIsRecording(true);
        setRecordingStatus('Listening... Tap mic again to finish.');
        sound.playTick();
      } catch (err: any) {
        console.warn('Mic access notice:', err?.message);
        setIsRecording(false);
        setRecordingStatus('Microphone permission required.');
        setTimeout(() => setRecordingStatus(''), 3000);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#1A1B20] w-full max-w-2xl rounded-t-3xl sm:rounded-2xl border border-[#d4af37]/30 shadow-2xl shadow-black/90 flex flex-col h-[90vh] sm:h-[82vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between gap-3 bg-[#16171D]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1A1B20] border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shadow-sm">
              <Sparkles className="w-5 h-5 text-[#d4af37]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  OmniFlow Executive Agent
                </h2>
                <span className="text-[10px] font-mono text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.5 rounded border border-[#d4af37]/25">
                  {aiSettings.model}
                </span>
              </div>
              <p className="text-[11px] text-[#797C86]">
                Talk or write directives to create tasks, launch initiatives, or query market intel.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onClearHistory}
              className="p-1.5 rounded-lg hover:bg-white/10 text-[#797C86] hover:text-[#B8BAC2] transition"
              title="Clear chat history"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#B8BAC2] hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-4 py-2 border-b border-white/5 bg-[#121316] flex items-center gap-2 overflow-x-auto text-xs shrink-0">
          <span className="text-[10px] text-[#797C86] font-semibold uppercase tracking-wider shrink-0">
            Quick Actions:
          </span>
          <button
            onClick={() =>
              handleQuickPrompt('Create a P0 urgent task "Conduct emergency smart contract audit" under Project Nexus due today 18:00')
            }
            className="px-2.5 py-1 rounded-lg bg-[#1A1B20] hover:bg-[#22242B] border border-[#d4af37]/20 text-[11px] text-[#B8BAC2] hover:text-[#d4af37] whitespace-nowrap transition"
          >
            + P0 Task under Nexus
          </button>
          <button
            onClick={() =>
              handleQuickPrompt('Launch a new project "Sovereign Staking Pool" with dark green theme and description "Decentralized validator network"')
            }
            className="px-2.5 py-1 rounded-lg bg-[#1A1B20] hover:bg-[#22242B] border border-white/10 text-[11px] text-[#B8BAC2] hover:text-white whitespace-nowrap transition"
          >
            + Launch Initiative
          </button>
          <button
            onClick={() => handleQuickPrompt('Set an operational focus session for 25 minutes and start it')}
            className="px-2.5 py-1 rounded-lg bg-[#1A1B20] hover:bg-[#22242B] border border-white/10 text-[11px] text-[#B8BAC2] hover:text-white whitespace-nowrap transition"
          >
            Set 25m Focus Sprint
          </button>
          <button
            onClick={() => handleQuickPrompt('Search the web for current European institutional crypto regulations and summarize key milestones')}
            className="px-2.5 py-1 rounded-lg bg-[#1A1B20] hover:bg-[#22242B] border border-white/10 text-[11px] text-[#B8BAC2] hover:text-white whitespace-nowrap transition"
          >
            Search Market Intel
          </button>
        </div>

        {/* Chat Thread Messages */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-[#121316] border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 space-y-2 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-b from-[#2a2c35] to-[#1e2027] text-white border border-white/10'
                      : 'bg-[#16171D] text-[#F5F5F7] border border-[#d4af37]/20 shadow-md'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {/* Executed Action Badge */}
                  {msg.actionExecuted && (
                    <div className="p-2.5 rounded-xl bg-[#0b2116] border border-[#1b4332] text-xs text-[#52b788] flex items-start gap-2 shadow-sm">
                      <CheckCircle2 className="w-4 h-4 text-[#52b788] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">{msg.actionExecuted.summary}</span>
                        <span className="text-[10px] text-[#797C86]">
                          Automatically synced to OmniFlow state.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Search Grounding Sources */}
                  {msg.webSources && msg.webSources.length > 0 && (
                    <div className="pt-2 border-t border-white/10 space-y-1">
                      <span className="text-[10px] font-semibold text-[#797C86] uppercase tracking-wider flex items-center gap-1">
                        <Search className="w-3 h-3 text-[#d4af37]" /> Verified Web Sources:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.webSources.map((source, sIdx) => (
                          <a
                            key={sIdx}
                            href={source.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#121316] hover:bg-[#22242B] border border-white/10 text-[10px] text-[#E5C158] hover:underline"
                          >
                            <span className="truncate max-w-[180px]">{source.title || source.uri}</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-[10px] text-[#797C86] text-right font-mono">
                    {msg.timestamp}
                  </div>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-[#22242B] border border-white/10 flex items-center justify-center text-[#B8BAC2] shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isProcessing && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-7 h-7 rounded-lg bg-[#121316] border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-2xl bg-[#16171D] border border-white/10 text-xs text-[#B8BAC2] flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#d4af37]" />
                <span>Executive Agent is formulating directive...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Recording Status Banner */}
        {recordingStatus && (
          <div className="px-4 py-1.5 bg-[#8B2635]/25 border-t border-[#8B2635]/40 text-xs text-[#ffb4ab] flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ffb4ab] animate-pulse" />
              {recordingStatus}
            </span>
            {isRecording && (
              <span className="text-[10px] font-mono text-[#ffb4ab]">REC</span>
            )}
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-white/10 bg-[#16171D] flex items-center gap-2">
          {/* Microphone Voice Button */}
          <button
            type="button"
            onClick={handleToggleVoice}
            className={`p-2.5 rounded-xl border transition active:scale-95 flex items-center justify-center ${
              isRecording
                ? 'bg-[#8B2635] text-white border-red-500 animate-pulse'
                : 'bg-[#1A1B20] text-[#d4af37] border-[#d4af37]/30 hover:border-[#d4af37]'
            }`}
            title={isRecording ? 'Stop Recording' : 'Speak to AI Agent (Voice Input)'}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type directive (e.g., 'Create task under Project Nexus', 'Set timer')..."
            className="flex-1 bg-[#1A1B20] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#797C86] focus:outline-none focus:border-[#d4af37]"
            disabled={isProcessing}
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isProcessing}
            className="p-2.5 rounded-xl bg-gradient-to-b from-[#E5C158] to-[#D4AF37] text-[#121316] font-bold disabled:opacity-40 disabled:hover:scale-100 active:scale-95 transition shadow-md shadow-[#d4af37]/20 flex items-center justify-center"
            title="Send directive"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
