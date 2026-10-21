import React, { useState } from 'react';
import { Camera, Sparkles, X, Image as ImageIcon } from 'lucide-react';

interface ScreenSnipperProps {
  capturedImage: string | null;
  onClearImage: () => void;
  onTriggerCapture: () => void;
  onSolveImage: (image: string, prompt: string) => void;
  isLoading: boolean;
}

export const ScreenSnipper: React.FC<ScreenSnipperProps> = ({
  capturedImage,
  onClearImage,
  onTriggerCapture,
  onSolveImage,
  isLoading,
}) => {
  const [extraPrompt, setExtraPrompt] = useState('');

  if (!capturedImage) {
    return (
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/40 border border-white/5 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-zinc-500" />
          <span>Снимок экрана для решения задач (LeetCode, тесты, код, архитектура)</span>
        </div>
        <button
          onClick={onTriggerCapture}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-white/5 transition-all"
        >
          <Camera className="w-3.5 h-3.5 text-emerald-400" />
          <span>Снять экран (⌘⇧S)</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl bg-zinc-900/70 border border-emerald-500/30 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
          <Camera className="w-3 h-3" />
          Снимок экрана захвачен
        </span>
        <button
          onClick={onClearImage}
          className="text-zinc-400 hover:text-white p-1 rounded transition-all"
          title="Удалить скриншот"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        {/* Thumbnail Preview */}
        <div className="relative w-28 h-18 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-black">
          <img 
            src={capturedImage} 
            alt="Screen capture preview" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Action input */}
        <div className="flex-1 flex flex-col gap-1.5">
          <input
            type="text"
            value={extraPrompt}
            onChange={(e) => setExtraPrompt(e.target.value)}
            placeholder="Опционально: уточнение (напр: реши на Go, оптимально по памяти)..."
            className="w-full px-2.5 py-1.5 rounded-md bg-zinc-950/70 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
          />

          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => onSolveImage(capturedImage, extraPrompt)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 text-xs font-semibold transition-all shadow-md shadow-emerald-500/20"
            >
              {isLoading ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{isLoading ? 'Решаю задачу...' : 'Решить задачу с экрана'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
