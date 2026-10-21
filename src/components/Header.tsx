import { 
  Shield, 
  Settings, 
  Eye, 
  EyeOff, 
  Sliders, 
  Mic, 
  MicOff, 
  Camera, 
  Minus, 
  X,
  Volume2,
  Key,
  AlertCircle
} from 'lucide-react';
import { AppSettings } from '../types';
import { Logo } from './Logo';

interface HeaderProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onOpenSettings: () => void;
  isListening: boolean;
  onToggleListening: () => void;
  onTriggerSnip: () => void;
  onToggleTeleprompter: () => void;
  isTeleprompter: boolean;
  audioVolume: number;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onUpdateSettings,
  onOpenSettings,
  isListening,
  onToggleListening,
  onTriggerSnip,
  onToggleTeleprompter,
  isTeleprompter,
  audioVolume,
}) => {
  const hasAnyKey = Boolean(
    settings.geminiApiKey?.trim() ||
    settings.groqApiKey?.trim() ||
    settings.openaiApiKey?.trim() ||
    settings.claudeApiKey?.trim()
  );

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onUpdateSettings({ windowOpacity: val });
    window.electronAPI?.setOpacity(val);
  };

  const handleToggleStealth = () => {
    const nextVal = !settings.stealthEnabled;
    onUpdateSettings({ stealthEnabled: nextVal });
    window.electronAPI?.toggleContentProtection(nextVal);
  };

  return (
    <header 
      className="flex items-center justify-between px-3 py-2 select-none border-b border-white/[0.08] bg-zinc-950/90 backdrop-blur-2xl rounded-t-xl"
      style={{ WebkitAppRegion: 'drag' } as any}
    >
      {/* Left: Brand & Stealth Badge */}
      <div className="flex items-center gap-2.5" style={{ WebkitAppRegion: 'no-drag' } as any}>
        <div className="flex items-center gap-2">
          <Logo size={24} />
          <span className="font-semibold text-xs tracking-wider text-white uppercase">
            xGhost
          </span>
          <span className="text-[10px] text-zinc-400 font-mono bg-zinc-900 px-1.5 py-0.5 rounded border border-white/5">
            HUD
          </span>
        </div>

        {/* API Key Status Pill */}
        {!hasAnyKey ? (
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[10px] hover:bg-amber-500/25 transition-all shadow-[0_0_12px_rgba(245,158,11,0.2)] animate-pulse"
            title="Нажми, чтобы ввести API ключ"
          >
            <AlertCircle className="w-3 h-3 text-amber-400" />
            <span>Введи API ключ</span>
          </button>
        ) : (
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-900 border border-white/10 text-[10px] text-zinc-300 hover:text-white hover:border-emerald-500/40 transition-all font-mono"
            title={`Активная модель: ${settings.preferredProvider.toUpperCase()}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
            <span className="uppercase text-emerald-400 font-semibold">{settings.preferredProvider}</span>
          </button>
        )}

        {/* Stealth Protection Pill */}
        <button
          onClick={handleToggleStealth}
          title={settings.stealthEnabled ? 'Невидимость активна (окно скрыто в Zoom/Meet)' : 'Невидимость отключена'}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-all ${
            settings.stealthEnabled
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
              : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:text-zinc-200'
          }`}
        >
          <Shield className="w-3 h-3" />
          <span>{settings.stealthEnabled ? 'Cloak ON' : 'Cloak OFF'}</span>
        </button>

        {/* Live Audio Visualizer */}
        {isListening && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px]">
            <Volume2 className="w-3 h-3 animate-pulse" />
            <div className="flex items-center gap-0.5 h-3">
              {[0.4, 0.9, 0.6, 1.0, 0.5].map((scale, i) => (
                <span
                  key={i}
                  className="w-0.5 bg-red-400 rounded-full transition-all duration-75"
                  style={{
                    height: `${Math.max(3, audioVolume * 14 * scale)}px`,
                  }}
                />
              ))}
            </div>
            <span className="ml-1 font-mono text-[9px]">LIVE</span>
          </div>
        )}
      </div>

      {/* Center: Quick Action Buttons */}
      <div className="flex items-center gap-1.5" style={{ WebkitAppRegion: 'no-drag' } as any}>
        {/* Mic Toggle */}
        <button
          onClick={onToggleListening}
          title="Запись голоса (⌘⇧R)"
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
            isListening 
              ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-sm shadow-red-500/20' 
              : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 border border-white/5'
          }`}
        >
          {isListening ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
          <span>{isListening ? 'Слушаю...' : 'Слушать'}</span>
        </button>

        {/* Screen Snip */}
        <button
          onClick={onTriggerSnip}
          title="Снимок экрана для ИИ (⌘⇧S)"
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-white/5 transition-all"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Скан экрана</span>
        </button>

        {/* Teleprompter Toggle */}
        <button
          onClick={onToggleTeleprompter}
          title={isTeleprompter ? 'Развернуть полное окно' : 'Свернуть в суфлер под камеру'}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border transition-all ${
            isTeleprompter
              ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
              : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 border-white/5'
          }`}
        >
          {isTeleprompter ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span>{isTeleprompter ? 'Суфлер' : 'Суфлер'}</span>
        </button>
      </div>

      {/* Right: Opacity slider, Settings, Window Controls */}
      <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' } as any}>
        {/* Opacity Slider */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-zinc-900/60 border border-white/5 text-zinc-400">
          <Sliders className="w-3 h-3 text-zinc-500" />
          <input
            type="range"
            min="0.2"
            max="1.0"
            step="0.05"
            value={settings.windowOpacity}
            onChange={handleOpacityChange}
            title="Прозрачность HUD (⌘⇧↑ / ⌘⇧↓)"
            className="w-14 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <span className="text-[10px] font-mono w-6 text-right">
            {Math.round(settings.windowOpacity * 100)}%
          </span>
        </div>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          title="Настройки API и профиля"
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 border border-transparent hover:border-white/5 transition-all"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        {/* macOS Window Controls */}
        <div className="flex items-center gap-1 pl-1 border-l border-white/10">
          <button
            onClick={() => window.electronAPI?.minimizeWindow()}
            className="w-3 h-3 rounded-full bg-yellow-500/70 hover:bg-yellow-400 flex items-center justify-center transition-all group"
            title="Свернуть"
          >
            <Minus className="w-2 h-2 text-zinc-950 opacity-0 group-hover:opacity-100" />
          </button>
          <button
            onClick={() => window.electronAPI?.hideWindow()}
            className="w-3 h-3 rounded-full bg-red-500/70 hover:bg-red-400 flex items-center justify-center transition-all group"
            title="Скрыть (⌘⇧␣ для возврата)"
          >
            <X className="w-2 h-2 text-zinc-950 opacity-0 group-hover:opacity-100" />
          </button>
        </div>
      </div>
    </header>
  );
};
