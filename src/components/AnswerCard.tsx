import React, { useState } from 'react';
import { 
  Zap, 
  MessageSquare, 
  ListChecks, 
  Code2, 
  AlertTriangle, 
  Copy, 
  Check, 
  Clock, 
  Sparkles,
  Cpu
} from 'lucide-react';
import { AntiAIResponse, LLMProvider } from '../types';

interface AnswerCardProps {
  response: AntiAIResponse;
  question: string;
  provider: LLMProvider;
  onRefine: (instruction: string) => void;
  isLoading: boolean;
}

export const AnswerCard: React.FC<AnswerCardProps> = ({
  response,
  question,
  provider,
  onRefine,
  isLoading,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'script' | 'code' | 'bullets'>('script');

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const hasCode = Boolean(response.codeSnippet && response.codeSnippet.trim().length > 0);

  return (
    <div className="flex flex-col gap-3 p-3.5 rounded-xl bg-zinc-900/70 border border-white/10 backdrop-blur-xl shadow-xl text-zinc-100 animate-fadeIn">
      {/* Question context & metadata */}
      <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
            Вопрос собеседующего:
          </span>
          <p className="text-xs font-medium text-zinc-200 line-clamp-2">
            "{question}"
          </p>
        </div>

        {/* Latency & Model badge */}
        <div className="flex items-center gap-1.5 shrink-0">
          {response.latencyMs && (
            <span className="flex items-center gap-0.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <Clock className="w-2.5 h-2.5" />
              {response.latencyMs} ms
            </span>
          )}
          {response.usedModel ? (
            <span className="flex items-center gap-1 text-[10px] font-mono text-blue-300 bg-blue-500/15 px-2 py-0.5 rounded border border-blue-500/20">
              <Cpu className="w-2.5 h-2.5" />
              {response.usedModel}
            </span>
          ) : (
            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded border border-white/5 uppercase">
              {provider}
            </span>
          )}
        </div>
      </div>

      {/* 1. THE PUNCHLINE: Say this immediately! */}
      <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-950/40 via-zinc-900/60 to-emerald-950/20 border border-emerald-500/30 relative group shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px] tracking-wide uppercase">
            <Zap className="w-3.5 h-3.5 fill-emerald-400" />
            <span>Начни говорить прямо сейчас (Панчлайн):</span>
          </div>
          <button
            onClick={() => copyToClipboard(response.punchline, 'punchline')}
            className="p-1 rounded text-zinc-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all"
            title="Скопировать панчлайн"
          >
            {copiedKey === 'punchline' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
        <p className="text-sm font-medium text-white leading-relaxed tracking-normal select-text">
          {response.punchline}
        </p>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center justify-between border-b border-white/5 pt-1 pb-1">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('script')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === 'script'
                ? 'bg-zinc-800 text-white border border-white/10 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <MessageSquare className="w-3 h-3" />
            <span>Живой скрипт</span>
          </button>

          <button
            onClick={() => setActiveTab('bullets')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === 'bullets'
                ? 'bg-zinc-800 text-white border border-white/10 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <ListChecks className="w-3 h-3" />
            <span>Тезисы ({response.bulletPoints?.length || 0})</span>
          </button>

          {hasCode && (
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                activeTab === 'code'
                  ? 'bg-zinc-800 text-blue-300 border border-blue-500/20 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
            >
              <Code2 className="w-3 h-3" />
              <span>Код {response.codeLanguage ? `(${response.codeLanguage})` : ''}</span>
              {response.complexity?.time && (
                <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1 rounded">
                  {response.complexity.time}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Copy full script button */}
        <button
          onClick={() => copyToClipboard(response.conversationalScript, 'full')}
          className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 px-2 py-0.5 rounded hover:bg-zinc-800/50 transition-all"
        >
          {copiedKey === 'full' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copiedKey === 'full' ? 'Скопировано!' : 'Копировать'}</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="max-h-[260px] overflow-y-auto pr-1 select-text space-y-2.5 custom-scrollbar">
        {activeTab === 'script' && (
          <div className="text-xs leading-relaxed text-zinc-200 space-y-2 font-normal">
            {response.conversationalScript.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="bg-zinc-950/40 p-2 rounded-lg border border-white/5">
                {paragraph}
              </p>
            ))}
          </div>
        )}

        {activeTab === 'bullets' && (
          <div className="space-y-1.5">
            {response.bulletPoints?.map((bullet, idx) => (
              <div 
                key={idx}
                className="flex items-start gap-2 p-2 rounded-lg bg-zinc-950/40 border border-white/5 text-xs text-zinc-200 hover:border-zinc-700 transition-all"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span className="leading-snug">{bullet}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'code' && hasCode && (
          <div className="space-y-2">
            {(response.complexity?.time || response.complexity?.space) && (
              <div className="flex items-center gap-2 text-xs font-mono">
                {response.complexity?.time && (
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Time: {response.complexity.time}
                  </span>
                )}
                {response.complexity?.space && (
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    Space: {response.complexity.space}
                  </span>
                )}
              </div>
            )}

            <div className="relative group">
              <pre className="p-3 rounded-lg bg-zinc-950 text-emerald-300 font-mono text-[11px] overflow-x-auto border border-white/10 leading-relaxed">
                <code>{response.codeSnippet}</code>
              </pre>
              <button
                onClick={() => copyToClipboard(response.codeSnippet || '', 'code')}
                className="absolute top-2 right-2 p-1.5 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-white/10 transition-all opacity-0 group-hover:opacity-100"
                title="Скопировать код"
              >
                {copiedKey === 'code' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        )}

        {response.gotchas && response.gotchas.length > 0 && (
          <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-[10px] uppercase tracking-wide mb-1">
              <AlertTriangle className="w-3 h-3" />
              <span>О чем интервьюер спросит дальше (Ловушки):</span>
            </div>
            <ul className="space-y-1 text-zinc-300 text-[11px] list-disc list-inside">
              {response.gotchas.map((gotcha, idx) => (
                <li key={idx} className="leading-snug">{gotcha}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Quick Refine Actions */}
      <div className="flex items-center gap-1.5 pt-2 border-t border-white/5 text-[11px]">
        <span className="text-zinc-500 font-medium mr-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-zinc-400" />
          Уточнить:
        </span>
        <button
          disabled={isLoading}
          onClick={() => onRefine('Ответь еще короче, буквально в 2 предложениях')}
          className="px-2 py-0.5 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-white/5 transition-all disabled:opacity-50"
        >
          Короче
        </button>
        <button
          disabled={isLoading}
          onClick={() => onRefine('Расскажи подробнее с реальным архитектурным примером из продакшена')}
          className="px-2 py-0.5 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-white/5 transition-all disabled:opacity-50"
        >
          Подробнее
        </button>
        <button
          disabled={isLoading}
          onClick={() => onRefine('Напиши конкретную реализацию на коде')}
          className="px-2 py-0.5 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-white/5 transition-all disabled:opacity-50"
        >
          Дай код
        </button>
      </div>
    </div>
  );
};
