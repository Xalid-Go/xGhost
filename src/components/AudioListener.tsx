import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Send, Trash2, Sparkles, Volume2 } from 'lucide-react';

interface AudioListenerProps {
  isListening: boolean;
  onToggleListening: () => void;
  audioVolume: number;
  transcript: string;
  onUpdateTranscript: (text: string) => void;
  onAskAI: (question: string) => void;
  isLoading: boolean;
}

export const AudioListener: React.FC<AudioListenerProps> = ({
  isListening,
  onToggleListening,
  audioVolume,
  transcript,
  onUpdateTranscript,
  onAskAI,
  isLoading,
}) => {
  const [inputText, setInputText] = useState(transcript);

  useEffect(() => {
    setInputText(transcript);
  }, [transcript]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onAskAI(inputText.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl bg-zinc-900/60 border border-white/5 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleListening}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              isListening
                ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-white/5'
            }`}
          >
            {isListening ? <Mic className="w-3.5 h-3.5 text-red-400" /> : <MicOff className="w-3.5 h-3.5" />}
            <span>{isListening ? 'Слушаю собеседование...' : 'Включить прослушивание'}</span>
          </button>

          {isListening && (
            <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
              <Volume2 className="w-3 h-3 text-red-400" />
              <span>{Math.round(audioVolume * 100)}%</span>
            </div>
          )}
        </div>

        {inputText && (
          <button
            onClick={() => {
              setInputText('');
              onUpdateTranscript('');
            }}
            className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 transition-all"
          >
            <Trash2 className="w-3 h-3" />
            <span>Очистить</span>
          </button>
        )}
      </div>

      {/* Input / Live Speech Textarea */}
      <div className="relative">
        <textarea
          rows={2}
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
            onUpdateTranscript(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Текст вопроса появится здесь автоматически при прослушивании, либо напиши/вставь вопрос вручную..."
          className="w-full p-2.5 pr-20 rounded-lg bg-zinc-950/70 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 resize-none transition-all leading-relaxed"
        />

        {/* Send / Ask AI Button */}
        <button
          onClick={() => handleSubmit()}
          disabled={!inputText.trim() || isLoading}
          title="Сгенерировать ответ (⌘Enter)"
          className="absolute right-2 bottom-2.5 flex items-center gap-1 px-3 py-1 rounded-md bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 font-medium text-xs transition-all shadow-md shadow-emerald-500/20"
        >
          {isLoading ? (
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          <span>{isLoading ? 'Думаю...' : 'Ответить'}</span>
        </button>
      </div>

      <div className="flex items-center justify-between text-[10px] text-zinc-400 px-1 font-mono">
        <span>⌘Enter — быстрый ответ</span>
        <span>⌘⇧R — вкл/выкл микрофон</span>
      </div>
    </div>
  );
};
