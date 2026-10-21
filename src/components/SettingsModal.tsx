import React, { useState } from 'react';
import { 
  X, 
  Key, 
  UserCheck, 
  Command, 
  ExternalLink, 
  Check, 
  AlertCircle, 
  Loader2, 
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  Cpu
} from 'lucide-react';
import { AppSettings, JobRole, SeniorityLevel, AnswerLanguage, LLMProvider, PROVIDER_MODELS } from '../types';
import { testProviderKey } from '../services/aiService';

interface SettingsModalProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSave,
  onClose,
}) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>({ ...settings });
  const [activeTab, setActiveTab] = useState<'keys' | 'models' | 'profile' | 'hotkeys'>('keys');
  const [testingProvider, setTestingProvider] = useState<LLMProvider | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; latencyMs?: number; error?: string }>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  const toggleShowKey = (provider: string) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    let newPreferred = localSettings.preferredProvider;
    // Auto-select preferred provider if user fills in a key
    if (typeof value === 'string' && value.trim().length > 6) {
      if (key === 'geminiApiKey') newPreferred = 'gemini';
      else if (key === 'groqApiKey' && !localSettings.geminiApiKey.trim()) newPreferred = 'groq';
      else if (key === 'openaiApiKey' && !localSettings.geminiApiKey.trim() && !localSettings.groqApiKey.trim()) newPreferred = 'openai';
      else if (key === 'claudeApiKey' && !localSettings.geminiApiKey.trim() && !localSettings.groqApiKey.trim()) newPreferred = 'claude';
    }

    const updated = { ...localSettings, [key]: value, preferredProvider: newPreferred };
    setLocalSettings(updated);
    onSave(updated); // Instant auto-save to localStorage
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 2000);
  };

  const handleTest = async (provider: LLMProvider) => {
    let key = '';
    if (provider === 'gemini') key = localSettings.geminiApiKey;
    if (provider === 'groq') key = localSettings.groqApiKey;
    if (provider === 'openai') key = localSettings.openaiApiKey;
    if (provider === 'claude') key = localSettings.claudeApiKey;

    setTestingProvider(provider);
    const res = await testProviderKey(provider, key);
    setTestResults(prev => ({ ...prev, [provider]: res }));
    setTestingProvider(null);

    if (res.success) {
      updateSetting('preferredProvider', provider);
    }
  };

  const handleSaveAndClose = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="flex flex-col w-full max-w-xl max-h-[88vh] rounded-2xl bg-zinc-950 border border-white/10 shadow-2xl overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <h2 className="text-sm font-semibold tracking-wide text-white">
              Настройки xGhost Copilot
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-white/5 bg-zinc-900/30">
          <button
            onClick={() => setActiveTab('keys')}
            className={`flex items-center gap-1.5 pb-2.5 text-xs font-medium border-b-2 transition-all ${
              activeTab === 'keys'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>API Ключи</span>
          </button>

          <button
            onClick={() => setActiveTab('models')}
            className={`flex items-center gap-1.5 pb-2.5 text-xs font-medium border-b-2 transition-all ${
              activeTab === 'models'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Выбор моделей</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-1.5 pb-2.5 text-xs font-medium border-b-2 transition-all ${
              activeTab === 'profile'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Профиль кандидата</span>
          </button>

          <button
            onClick={() => setActiveTab('hotkeys')}
            className={`flex items-center gap-1.5 pb-2.5 text-xs font-medium border-b-2 transition-all ${
              activeTab === 'hotkeys'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Command className="w-3.5 h-3.5" />
            <span>Стелс и шорткаты</span>
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar text-xs">
          {/* TAB 1: API KEYS */}
          {activeTab === 'keys' && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] leading-relaxed">
                <span className="font-semibold block mb-0.5">💡 Достаточно указать хотя бы один ключ:</span>
                Мы рекомендуем <b>Google Gemini</b> (бесплатный, быстрый, читает скриншоты) или <b>Groq</b> (сверхбыстрый Llama 3.3, 300 токенов/сек для живого диалога).
              </div>

              {/* Preferred Provider Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-medium text-zinc-300">
                    Основной провайдер для ответов:
                  </label>
                  {isSavedRecently && (
                    <span className="text-[10px] text-emerald-400 font-mono animate-fadeIn flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Сохранено</span>
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {(['gemini', 'groq', 'openai', 'claude'] as LLMProvider[]).map((p) => {
                    const hasKey = Boolean(
                      p === 'gemini' ? localSettings.geminiApiKey :
                      p === 'groq' ? localSettings.groqApiKey :
                      p === 'openai' ? localSettings.openaiApiKey :
                      localSettings.claudeApiKey
                    );
                    const isSelected = localSettings.preferredProvider === p;

                    return (
                      <button
                        key={p}
                        onClick={() => updateSetting('preferredProvider', p)}
                        className={`py-2 px-1 rounded-lg font-medium text-[11px] border transition-all flex flex-col items-center gap-0.5 ${
                          isSelected
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm'
                            : hasKey
                            ? 'bg-zinc-900 text-zinc-200 border-white/10 hover:bg-zinc-800'
                            : 'bg-zinc-950/60 text-zinc-500 border-white/5 hover:bg-zinc-900'
                        }`}
                      >
                        <span className="uppercase font-semibold tracking-wider">{p}</span>
                        <span className="text-[9px] font-mono">
                          {isSelected ? '● Активен' : hasKey ? '✓ Есть ключ' : 'Нет ключа'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 1. Google Gemini Key */}
              <div className="space-y-1.5 p-3 rounded-xl bg-zinc-900/50 border border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-zinc-200">Google Gemini API Key</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-mono">Рекомендуем</span>
                  </div>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] text-emerald-400 hover:underline"
                  >
                    <span>Получить ключ бесплатно (AI Studio)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showKeys['gemini'] ? 'text' : 'password'}
                      value={localSettings.geminiApiKey}
                      onChange={(e) => updateSetting('geminiApiKey', e.target.value)}
                      placeholder="Вставь ключ AIzaSy..."
                      className="w-full px-3 py-1.5 pr-8 rounded-lg bg-zinc-950 border border-white/10 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey('gemini')}
                      className="absolute right-2.5 top-2 text-zinc-500 hover:text-zinc-300"
                    >
                      {showKeys['gemini'] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <button
                    onClick={() => handleTest('gemini')}
                    disabled={testingProvider === 'gemini' || !localSettings.geminiApiKey.trim()}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium disabled:opacity-50 transition-all shrink-0"
                  >
                    {testingProvider === 'gemini' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Тест'}
                  </button>
                </div>
                {testResults['gemini'] && (
                  <div className={`flex items-center gap-1.5 text-[11px] mt-1 ${testResults['gemini'].success ? 'text-emerald-400' : 'text-red-400'}`}>
                    {testResults['gemini'].success ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    <span>{testResults['gemini'].success ? `Подключено к Gemini 2.0! Пинг: ${testResults['gemini'].latencyMs}ms` : `Ошибка: ${testResults['gemini'].error}`}</span>
                  </div>
                )}
              </div>

              {/* 2. Groq Key */}
              <div className="space-y-1.5 p-3 rounded-xl bg-zinc-900/50 border border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-zinc-200">Groq API Key</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-400 font-mono">300 т/с</span>
                  </div>
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] text-emerald-400 hover:underline"
                  >
                    <span>Получить ключ бесплатно (console.groq.com)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showKeys['groq'] ? 'text' : 'password'}
                      value={localSettings.groqApiKey}
                      onChange={(e) => updateSetting('groqApiKey', e.target.value)}
                      placeholder="Вставь ключ gsk_..."
                      className="w-full px-3 py-1.5 pr-8 rounded-lg bg-zinc-950 border border-white/10 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey('groq')}
                      className="absolute right-2.5 top-2 text-zinc-500 hover:text-zinc-300"
                    >
                      {showKeys['groq'] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <button
                    onClick={() => handleTest('groq')}
                    disabled={testingProvider === 'groq' || !localSettings.groqApiKey.trim()}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium disabled:opacity-50 transition-all shrink-0"
                  >
                    {testingProvider === 'groq' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Тест'}
                  </button>
                </div>
                {testResults['groq'] && (
                  <div className={`flex items-center gap-1.5 text-[11px] mt-1 ${testResults['groq'].success ? 'text-emerald-400' : 'text-red-400'}`}>
                    {testResults['groq'].success ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    <span>{testResults['groq'].success ? `Подключено к Llama 3.3! Пинг: ${testResults['groq'].latencyMs}ms` : `Ошибка: ${testResults['groq'].error}`}</span>
                  </div>
                )}
              </div>

              {/* 3. OpenAI Key */}
              <div className="space-y-1.5 p-3 rounded-xl bg-zinc-900/50 border border-white/5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-200">OpenAI API Key (GPT-4o / o3-mini)</span>
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] text-zinc-400 hover:underline"
                  >
                    <span>platform.openai.com</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showKeys['openai'] ? 'text' : 'password'}
                      value={localSettings.openaiApiKey}
                      onChange={(e) => updateSetting('openaiApiKey', e.target.value)}
                      placeholder="sk-proj-..."
                      className="w-full px-3 py-1.5 pr-8 rounded-lg bg-zinc-950 border border-white/10 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey('openai')}
                      className="absolute right-2.5 top-2 text-zinc-500 hover:text-zinc-300"
                    >
                      {showKeys['openai'] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <button
                    onClick={() => handleTest('openai')}
                    disabled={testingProvider === 'openai' || !localSettings.openaiApiKey.trim()}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium disabled:opacity-50 transition-all shrink-0"
                  >
                    {testingProvider === 'openai' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Тест'}
                  </button>
                </div>
                {testResults['openai'] && (
                  <div className={`flex items-center gap-1.5 text-[11px] mt-1 ${testResults['openai'].success ? 'text-emerald-400' : 'text-red-400'}`}>
                    {testResults['openai'].success ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    <span>{testResults['openai'].success ? `Подключено! Пинг: ${testResults['openai'].latencyMs}ms` : `Ошибка: ${testResults['openai'].error}`}</span>
                  </div>
                )}
              </div>

              {/* 4. Anthropic Claude Key */}
              <div className="space-y-1.5 p-3 rounded-xl bg-zinc-900/50 border border-white/5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-200">Anthropic Claude API Key (Claude 3.5 Sonnet)</span>
                  <a
                    href="https://console.anthropic.com/settings/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] text-zinc-400 hover:underline"
                  >
                    <span>console.anthropic.com</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showKeys['claude'] ? 'text' : 'password'}
                      value={localSettings.claudeApiKey}
                      onChange={(e) => updateSetting('claudeApiKey', e.target.value)}
                      placeholder="sk-ant-..."
                      className="w-full px-3 py-1.5 pr-8 rounded-lg bg-zinc-950 border border-white/10 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey('claude')}
                      className="absolute right-2.5 top-2 text-zinc-500 hover:text-zinc-300"
                    >
                      {showKeys['claude'] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <button
                    onClick={() => handleTest('claude')}
                    disabled={testingProvider === 'claude' || !localSettings.claudeApiKey.trim()}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium disabled:opacity-50 transition-all shrink-0"
                  >
                    {testingProvider === 'claude' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Тест'}
                  </button>
                </div>
                {testResults['claude'] && (
                  <div className={`flex items-center gap-1.5 text-[11px] mt-1 ${testResults['claude'].success ? 'text-emerald-400' : 'text-red-400'}`}>
                    {testResults['claude'].success ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    <span>{testResults['claude'].success ? `Подключено! Пинг: ${testResults['claude'].latencyMs}ms` : `Ошибка: ${testResults['claude'].error}`}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MODEL SELECTION */}
          {activeTab === 'models' && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] leading-relaxed flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block mb-0.5">Выбор конкретной модели:</span>
                  Здесь ты можешь точно указать, какая модель будет генерировать ответ. Например, <b>Gemini 2.0 Flash</b> для мгновенного ответа за 0.4с или <b>Claude 3.5 Sonnet</b> для решения сложного алгоритма.
                </div>
              </div>

              {/* Gemini Models */}
              <div className="space-y-2 p-3 rounded-xl bg-zinc-900/50 border border-white/5">
                <span className="font-semibold text-zinc-200 block">Модель Google Gemini:</span>
                <div className="grid grid-cols-1 gap-1.5">
                  {PROVIDER_MODELS.gemini.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setLocalSettings({ ...localSettings, geminiModel: m.id })}
                      className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                        localSettings.geminiModel === m.id
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-white'
                          : 'bg-zinc-950/50 border-white/5 text-zinc-400 hover:bg-zinc-800'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-zinc-200">{m.name}</div>
                        <div className="text-[10px] text-zinc-400">{m.desc}</div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 border border-white/10 text-emerald-400 font-mono">
                        {m.badge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Groq Models */}
              <div className="space-y-2 p-3 rounded-xl bg-zinc-900/50 border border-white/5">
                <span className="font-semibold text-zinc-200 block">Модель Groq:</span>
                <div className="grid grid-cols-1 gap-1.5">
                  {PROVIDER_MODELS.groq.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setLocalSettings({ ...localSettings, groqModel: m.id })}
                      className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                        localSettings.groqModel === m.id
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-white'
                          : 'bg-zinc-950/50 border-white/5 text-zinc-400 hover:bg-zinc-800'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-zinc-200">{m.name}</div>
                        <div className="text-[10px] text-zinc-400">{m.desc}</div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 border border-white/10 text-emerald-400 font-mono">
                        {m.badge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* OpenAI Models */}
              <div className="space-y-2 p-3 rounded-xl bg-zinc-900/50 border border-white/5">
                <span className="font-semibold text-zinc-200 block">Модель OpenAI:</span>
                <div className="grid grid-cols-1 gap-1.5">
                  {PROVIDER_MODELS.openai.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setLocalSettings({ ...localSettings, openaiModel: m.id })}
                      className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                        localSettings.openaiModel === m.id
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-white'
                          : 'bg-zinc-950/50 border-white/5 text-zinc-400 hover:bg-zinc-800'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-zinc-200">{m.name}</div>
                        <div className="text-[10px] text-zinc-400">{m.desc}</div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 border border-white/10 text-emerald-400 font-mono">
                        {m.badge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Claude Models */}
              <div className="space-y-2 p-3 rounded-xl bg-zinc-900/50 border border-white/5">
                <span className="font-semibold text-zinc-200 block">Модель Anthropic Claude:</span>
                <div className="grid grid-cols-1 gap-1.5">
                  {PROVIDER_MODELS.claude.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setLocalSettings({ ...localSettings, claudeModel: m.id })}
                      className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                        localSettings.claudeModel === m.id
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-white'
                          : 'bg-zinc-950/50 border-white/5 text-zinc-400 hover:bg-zinc-800'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-zinc-200">{m.name}</div>
                        <div className="text-[10px] text-zinc-400">{m.desc}</div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 border border-white/10 text-emerald-400 font-mono">
                        {m.badge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROFILE & STYLE */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-zinc-300 font-medium">Специализация кандидата:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'frontend', name: 'Frontend (React/TS/Next.js)' },
                    { id: 'backend', name: 'Backend (Node/Go/Python/DB)' },
                    { id: 'fullstack', name: 'Fullstack Engineer' },
                    { id: 'system_design', name: 'System Design & Architect' },
                    { id: 'algo', name: 'Algorithms & LeetCode' },
                    { id: 'devops', name: 'DevOps / SRE / Cloud' },
                    { id: 'mobile', name: 'Mobile (React Native/iOS)' },
                    { id: 'qa', name: 'QA Automation Engineer' },
                  ].map((role) => (
                    <button
                      key={role.id}
                      onClick={() => setLocalSettings({ ...localSettings, role: role.id as JobRole })}
                      className={`p-2.5 rounded-lg text-left border transition-all ${
                        localSettings.role === role.id
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-medium'
                          : 'bg-zinc-900 text-zinc-400 border-white/5 hover:bg-zinc-800'
                      }`}
                    >
                      {role.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-300 font-medium">Грейд / Уровень опыта:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['middle', 'senior', 'lead'] as SeniorityLevel[]).map((level) => (
                    <button
                      key={level}
                      onClick={() => setLocalSettings({ ...localSettings, seniority: level })}
                      className={`py-2 rounded-lg text-center uppercase tracking-wider font-semibold border transition-all ${
                        localSettings.seniority === level
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-zinc-900 text-zinc-400 border-white/5 hover:bg-zinc-800'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-300 font-medium">Стиль и язык ответа:</label>
                <div className="space-y-2">
                  {[
                    {
                      id: 'ru-tech',
                      title: 'Живой разработческий русский (Рекомендуется)',
                      desc: 'Естественный язык реального разработчика со сленгом ("стейт", "деплой", "хэндлер", "оверхед"). Звучит 100% как человек на собесе.',
                    },
                    {
                      id: 'ru-pure',
                      title: 'Чистый литературный русский',
                      desc: 'Грамотная техническая речь без разговорного сленга.',
                    },
                    {
                      id: 'en',
                      title: 'Natural American English',
                      desc: 'Conversational, senior-level English without academic robotic cliches.',
                    },
                  ].map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setLocalSettings({ ...localSettings, language: item.id as AnswerLanguage })}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        localSettings.language === item.id
                          ? 'bg-emerald-500/15 text-white border-emerald-500/30'
                          : 'bg-zinc-900 text-zinc-400 border-white/5 hover:bg-zinc-800'
                      }`}
                    >
                      <div className="font-semibold text-xs text-zinc-100">{item.title}</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STEALTH & HOTKEYS */}
          {activeTab === 'hotkeys' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Стелс-режим (Screen Capture Protection)</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  Приложение использует нативную возможность macOS (<code className="text-emerald-300">NSWindowSharingNone</code>).
                  Когда ты расшариваешь весь экран в <b>Zoom</b>, <b>Google Meet</b>, <b>Teams</b>, <b>Discord</b> или <b>Slack</b>, это окно становится <b>полностью невидимым для собеседующего</b>!
                  Ты видишь шпаргалку, а собеседующий видит чистый рабочий стол или код за ним.
                </p>
              </div>

              {/* Hotkeys Table */}
              <div className="space-y-1.5">
                <span className="font-semibold text-zinc-300">Глобальные горячие клавиши:</span>
                <div className="rounded-xl bg-zinc-900/50 border border-white/5 divide-y divide-white/5">
                  {[
                    { key: '⌘ ⇧ Space', desc: 'Скрыть / показать окно приложения' },
                    { key: '⌘ ⇧ S', desc: 'Сделать снимок экрана / решить задачу с экрана' },
                    { key: '⌘ ⇧ R', desc: 'Включить / остановить прослушивание голоса' },
                    { key: '⌘ Enter', desc: 'Сгенерировать ответ на введенный/услышанный вопрос' },
                    { key: '⌘ ⇧ ↑ / ↓', desc: 'Увеличить / уменьшить прозрачность окна' },
                    { key: '⌘ ⇧ X', desc: 'Паническая кнопка (мгновенно спрятать окно)' },
                  ].map((hk, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2">
                      <span className="text-zinc-300">{hk.desc}</span>
                      <kbd className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-white/10 font-mono text-[11px]">
                        {hk.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-white/10 bg-zinc-900/60">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-zinc-400 hover:text-white transition-all"
          >
            Отмена
          </button>
          <button
            onClick={handleSaveAndClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold transition-all shadow-md shadow-emerald-500/20"
          >
            Сохранить настройки
          </button>
        </div>
      </div>
    </div>
  );
};
