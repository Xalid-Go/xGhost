import React from 'react';
import { Zap, Maximize2, Mic, MicOff, Camera, ArrowRight } from 'lucide-react';
import { InterviewItem } from '../types';

interface TeleprompterViewProps {
  currentItem: InterviewItem | null;
  onExpand: () => void;
  isListening: boolean;
  onToggleListening: () => void;
  onTriggerSnip: () => void;
  onSolve: () => void;
  isLoading: boolean;
}

export const TeleprompterView: React.FC<TeleprompterViewProps> = ({
  currentItem,
  onExpand,
  isListening,
  onToggleListening,
  onTriggerSnip,
  onSolve,
  isLoading,
}) => {
  return (
    <div 
      className="flex flex-col justify-between h-full p-2.5 bg-zinc-950/95 backdrop-blur-2xl border border-white/10 rounded-xl select-none text-zinc-100 shadow-2xl"
      style={{ WebkitAppRegion: 'drag' } as any}
    >
      {/* Top micro toolbar */}
      <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-1.5" style={{ WebkitAppRegion: 'no-drag' } as any}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
            Суфлер под камеру (Webcam HUD)
          </span>
          {currentItem?.question && (
            <span className="text-[11px] text-zinc-300 font-medium truncate max-w-[360px]">
              Q: {currentItem.question}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleListening}
            title="Запись голоса (⌘⇧R)"
            className={`p-1 rounded text-xs transition-all ${
              isListening ? 'bg-red-500/20 text-red-400' : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {isListening ? <Mic className="w-3 h-3 text-red-400 animate-pulse" /> : <MicOff className="w-3 h-3" />}
          </button>

          <button
            onClick={onTriggerSnip}
            title="Снимок экрана (⌘⇧S)"
            className="p-1 rounded bg-zinc-800 text-zinc-400 hover:text-white transition-all"
          >
            <Camera className="w-3 h-3" />
          </button>

          <button
            onClick={onExpand}
            title="Развернуть полное окно"
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 text-[10px] font-medium border border-blue-500/30 transition-all"
          >
            <Maximize2 className="w-2.5 h-2.5" />
            <span>Развернуть</span>
          </button>
        </div>
      </div>

      {/* Main punchline & bullet display for eye-contact reading */}
      <div className="flex-1 flex items-center justify-between gap-3 py-1 px-1 overflow-hidden" style={{ WebkitAppRegion: 'no-drag' } as any}>
        {isLoading ? (
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono animate-pulse">
            <Zap className="w-3.5 h-3.5 fill-emerald-400" />
            <span>Генерирую естественный ответ...</span>
          </div>
        ) : currentItem?.response ? (
          <div className="flex items-center justify-between w-full gap-4">
            {/* Punchline (left 60%) */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-0.5">
                <Zap className="w-3 h-3 fill-emerald-400" />
                <span>Говори это:</span>
              </div>
              <p className="text-xs font-medium text-white line-clamp-3 leading-snug">
                {currentItem.response.punchline}
              </p>
            </div>

            {/* Bullets (right 40%) */}
            {currentItem.response.bulletPoints?.length > 0 && (
              <div className="w-[300px] shrink-0 border-l border-white/5 pl-3 space-y-1">
                {currentItem.response.bulletPoints.slice(0, 2).map((bp, i) => (
                  <div key={i} className="flex items-start gap-1 text-[10px] text-zinc-300 leading-tight">
                    <span className="text-emerald-400 font-bold shrink-0">•</span>
                    <span className="line-clamp-1">{bp}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between w-full text-zinc-400 text-xs">
            <span>Ожидаю вопрос (включи микрофон или сделай снимок экрана)...</span>
            {currentItem?.question && (
              <button
                onClick={onSolve}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs font-medium border border-emerald-500/30"
              >
                <span>Ответить</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
