import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { AudioListener } from './components/AudioListener';
import { ScreenSnipper } from './components/ScreenSnipper';
import { AnswerCard } from './components/AnswerCard';
import { TeleprompterView } from './components/TeleprompterView';
import { SettingsModal } from './components/SettingsModal';
import { LandingPage } from './components/LandingPage';
import { speechService } from './services/sttService';
import { generateAntiAIResponse } from './services/aiService';
import { loadSettings, saveSettings } from './services/storageService';
import { AppSettings, InterviewItem, AntiAIResponse } from './types';
import { AlertCircle, History, Sparkles, Globe, X } from 'lucide-react';

export const App: React.FC = () => {
  const isElectron = Boolean(window.electronAPI);

  // In Electron: default to HUD. In Web Browser (e.g. Vercel): default to Landing Page!
  const [viewMode, setViewMode] = useState<'hud' | 'landing'>(() => isElectron ? 'hud' : 'landing');

  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTeleprompter, setIsTeleprompter] = useState(false);

  // Audio / Speech state
  const [isListening, setIsListening] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0);
  const [transcript, setTranscript] = useState('');

  // Screen Snip state
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Interview Items & Answers
  const [history, setHistory] = useState<InterviewItem[]>([]);
  const [currentItem, setCurrentItem] = useState<InterviewItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync settings updates
  const handleUpdateSettings = (partial: Partial<AppSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    saveSettings(updated);
  };

  useEffect(() => {
    if (isElectron && viewMode === 'hud') {
      document.body.classList.add('electron-hud');
    } else {
      document.body.classList.remove('electron-hud');
    }
  }, [isElectron, viewMode]);

  // 1. Solve Question / Ask AI
  const handleAskAI = useCallback(async (questionText: string, imageBase64?: string) => {
    if (!questionText.trim() && !imageBase64) return;

    setErrorMessage(null);
    setIsLoading(true);

    const newItem: InterviewItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      question: questionText || (imageBase64 ? 'Задача со скриншота экрана' : ''),
      source: imageBase64 ? 'screen' : isListening ? 'voice' : 'text',
      imagePreview: imageBase64,
      isLoading: true,
    };

    setCurrentItem(newItem);

    try {
      const response: AntiAIResponse = await generateAntiAIResponse(
        questionText,
        settings,
        imageBase64
      );

      const completedItem: InterviewItem = {
        ...newItem,
        response,
        isLoading: false,
      };

      setCurrentItem(completedItem);
      setHistory(prev => [completedItem, ...prev.slice(0, 20)]);
    } catch (err: any) {
      console.error('[xGhost] Error generating response:', err);
      const msg = err?.message || 'Не удалось получить ответ. Проверь API ключ в настройках.';
      setErrorMessage(msg);
      setCurrentItem(prev => (prev ? { ...prev, isLoading: false, error: msg } : null));
    } finally {
      setIsLoading(false);
    }
  }, [settings, isListening]);

  // 2. Refine Answer
  const handleRefine = useCallback(async (instruction: string) => {
    if (!currentItem || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);

    const refinePrompt = `Предыдущий вопрос: "${currentItem.question}".
Предыдущий ответ: "${currentItem.response?.punchline || ''}".
Уточнение кандидата: "${instruction}". Ответь с учетом этого уточнения.`;

    try {
      const response = await generateAntiAIResponse(refinePrompt, settings);
      const updatedItem: InterviewItem = {
        ...currentItem,
        response,
      };
      setCurrentItem(updatedItem);
      setHistory(prev => prev.map(item => item.id === currentItem.id ? updatedItem : item));
    } catch (err: any) {
      setErrorMessage(err?.message || 'Ошибка уточнения ответа');
    } finally {
      setIsLoading(false);
    }
  }, [currentItem, isLoading, settings]);

  // 3. Audio Listening Toggle
  const handleToggleListening = useCallback(() => {
    if (isListening) {
      speechService.stop();
      setIsListening(false);
      setAudioVolume(0);
    } else {
      speechService.setLanguage(settings.language.startsWith('ru') ? 'ru' : 'en');
      speechService.start(
        (text, isFinal) => {
          setTranscript(text);
          if (isFinal && text.trim().length > 15 && settings.autoSolveVoice) {
            handleAskAI(text.trim());
          }
        },
        (volume) => {
          setAudioVolume(volume);
        }
      );
      setIsListening(true);
    }
  }, [isListening, settings.language, settings.autoSolveVoice, handleAskAI]);

  // 4. Screen Snip Trigger
  const handleTriggerSnip = useCallback(async () => {
    if (window.electronAPI) {
      const result = await window.electronAPI.captureScreen();
      if (result.success && result.image) {
        setCapturedImage(result.image);
      } else {
        setErrorMessage(result.error || 'Не удалось сделать снимок экрана');
      }
    } else {
      setErrorMessage('Снимок экрана доступен в нативном приложении macOS/Windows.');
    }
  }, []);

  // 5. Teleprompter Toggle
  const handleToggleTeleprompter = useCallback(() => {
    if (window.electronAPI) {
      window.electronAPI.toggleTeleprompter().then((isTele) => {
        setIsTeleprompter(isTele);
      });
    } else {
      setIsTeleprompter(prev => !prev);
    }
  }, []);

  // Connect Electron Global Hotkeys & Listeners
  useEffect(() => {
    if (!window.electronAPI) return;

    const unsubs = [
      window.electronAPI.onTriggerScreenSnip(() => {
        handleTriggerSnip();
      }),
      window.electronAPI.onTriggerVoiceRecord(() => {
        handleToggleListening();
      }),
      window.electronAPI.onOpacityChanged((newOpacity) => {
        handleUpdateSettings({ windowOpacity: newOpacity });
      }),
    ];

    return () => {
      unsubs.forEach(fn => fn());
    };
  }, [handleTriggerSnip, handleToggleListening]);

  // Cleanup speech service on unmount
  useEffect(() => {
    return () => {
      speechService.stop();
    };
  }, []);

  // If in web mode (Vercel landing page view)
  if (viewMode === 'landing') {
    return (
      <LandingPage onLaunchDemo={() => setViewMode('hud')} />
    );
  }

  // HUD View
  return (
    <div 
      className="flex flex-col h-screen w-screen overflow-hidden text-zinc-100 font-sans"
      style={{ opacity: settings.windowOpacity }}
    >
      {isTeleprompter ? (
        <TeleprompterView
          currentItem={currentItem}
          onExpand={handleToggleTeleprompter}
          isListening={isListening}
          onToggleListening={handleToggleListening}
          onTriggerSnip={handleTriggerSnip}
          onSolve={() => currentItem && handleAskAI(currentItem.question)}
          isLoading={isLoading}
        />
      ) : (
        <div className="flex flex-col h-full bg-[#060608]/90 backdrop-blur-2xl border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl">
          {/* Header */}
          <Header
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onOpenSettings={() => setIsSettingsOpen(true)}
            isListening={isListening}
            onToggleListening={handleToggleListening}
            onTriggerSnip={handleTriggerSnip}
            onToggleTeleprompter={handleToggleTeleprompter}
            isTeleprompter={isTeleprompter}
            audioVolume={audioVolume}
          />

          {/* Web Mode Banner: allows toggling back to Landing Page */}
          {!isElectron && (
            <div className="px-3 py-1 bg-zinc-900 border-b border-white/5 flex items-center justify-between text-[11px] text-zinc-400">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Globe className="w-3 h-3" />
                <span>Браузерная версия HUD (Web Demo)</span>
              </span>
              <button
                onClick={() => setViewMode('landing')}
                className="hover:text-white flex items-center gap-1 text-[10px] font-medium"
              >
                <span>Вернуться на сайт</span>
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-3.5 space-y-3 custom-scrollbar">
            {/* API Key Missing Notice */}
            {!Boolean(settings.geminiApiKey?.trim() || settings.groqApiKey?.trim() || settings.openaiApiKey?.trim() || settings.claudeApiKey?.trim()) && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs animate-fadeIn shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span><b>Начало работы:</b> Добавь бесплатный API ключ Gemini или Groq в настройках.</span>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 font-medium text-[11px] transition-all shrink-0 ml-2"
                >
                  Открыть настройки
                </button>
              </div>
            )}

            {/* Error Notification */}
            {errorMessage && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs animate-fadeIn">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="px-2 py-0.5 rounded bg-red-500/20 hover:bg-red-500/30 text-red-200 text-[11px] font-medium shrink-0 ml-2"
                >
                  Настройки
                </button>
              </div>
            )}

            {/* Audio Listener & Input */}
            <AudioListener
              isListening={isListening}
              onToggleListening={handleToggleListening}
              audioVolume={audioVolume}
              transcript={transcript}
              onUpdateTranscript={setTranscript}
              onAskAI={(q) => handleAskAI(q)}
              isLoading={isLoading}
            />

            {/* Screen Snipper / Image solver */}
            <ScreenSnipper
              capturedImage={capturedImage}
              onClearImage={() => setCapturedImage(null)}
              onTriggerCapture={handleTriggerSnip}
              onSolveImage={(img, prompt) => handleAskAI(prompt, img)}
              isLoading={isLoading}
            />

            {/* Active Answer Card */}
            {currentItem?.response && (
              <AnswerCard
                response={currentItem.response}
                question={currentItem.question}
                provider={settings.preferredProvider}
                onRefine={handleRefine}
                isLoading={isLoading}
              />
            )}

            {/* Empty State / Welcome */}
            {!currentItem?.response && !isLoading && (
              <div className="flex flex-col items-center justify-center py-8 text-center px-4 rounded-xl border border-white/5 bg-zinc-900/20">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-sm font-semibold text-white">xGhost Copilot готов к собеседованию</h3>
                <p className="text-xs text-zinc-400 max-w-sm mt-1 leading-relaxed">
                  Включи микрофон (⌘⇧R) или сделай снимок экрана (⌘⇧S) с кодом или задачей.
                  Ответы оптимизированы для естественной живой речи без ИИ-шаблонов.
                </p>
                <div className="flex items-center gap-2 mt-3 text-[11px] text-zinc-400 font-mono">
                  <span className="px-2 py-0.5 rounded bg-zinc-900 border border-white/5">Роль: {settings.role}</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-900 border border-white/5">Грейд: {settings.seniority}</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-900 border border-white/5">Язык: {settings.language}</span>
                </div>
              </div>
            )}

            {/* Recent Questions Drawer */}
            {history.length > 1 && (
              <div className="pt-2 border-t border-white/5">
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-2 font-medium">
                  <History className="w-3.5 h-3.5" />
                  <span>Предыдущие вопросы:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {history.slice(1, 6).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setCurrentItem(item)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 text-[11px] text-zinc-300 border border-white/5 truncate max-w-[280px] transition-all"
                    >
                      {item.question}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onSave={handleUpdateSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
