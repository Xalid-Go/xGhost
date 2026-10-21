export type LLMProvider = 'gemini' | 'groq' | 'openai' | 'claude';

export type JobRole = 
  | 'frontend'
  | 'backend'
  | 'fullstack'
  | 'devops'
  | 'mobile'
  | 'system_design'
  | 'algo'
  | 'qa';

export type SeniorityLevel = 'middle' | 'senior' | 'lead';

export type AnswerLanguage = 'ru-tech' | 'ru-pure' | 'en';

export interface ModelInfo {
  id: string;
  name: string;
  badge: '⚡ Ультра-быстро' | '🚀 Быстро' | '🧠 Рассуждения' | '🎯 Баланс' | '👑 Флагман';
  desc: string;
}

export const PROVIDER_MODELS: Record<LLMProvider, ModelInfo[]> = {
  gemini: [
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', badge: '⚡ Ультра-быстро', desc: 'Молниеносный флагман Google (~0.4с), идеален для Vision и кода' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', badge: '🚀 Быстро', desc: 'Стабильная рабочая модель с миллионным контекстом' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', badge: '🧠 Рассуждения', desc: 'Глубокий анализ для сложных архитектурных вопросов' },
    { id: 'gemini-2.0-pro-exp-02-05', name: 'Gemini 2.0 Pro', badge: '👑 Флагман', desc: 'Максимальный интеллект и логика от Google' },
  ],
  groq: [
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', badge: '⚡ Ультра-быстро', desc: '~300 токенов/сек, лучший выбор для мгновенной речи' },
    { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', badge: '🚀 Быстро', desc: 'Рекордные задержки (~150мс), короткие ответы' },
    { id: 'llama-3.2-90b-vision-preview', name: 'Llama 3.2 90B Vision', badge: '🎯 Баланс', desc: 'Мультимодальная модель с распознаванием задач с экрана' },
  ],
  openai: [
    { id: 'gpt-4o', name: 'GPT-4o', badge: '🎯 Баланс', desc: 'Флагман OpenAI с идеальным кодом и поддержкой скриншотов' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', badge: '🚀 Быстро', desc: 'Быстрый и экономный вариант для базовых вопросов' },
    { id: 'o3-mini', name: 'o3-mini', badge: '🧠 Рассуждения', desc: 'Новейшая рассуждающая модель для сложных алгоритмов' },
    { id: 'o1-mini', name: 'o1-mini', badge: '🧠 Рассуждения', desc: 'Продвинутое решение задач по математике и алгоритмам' },
  ],
  claude: [
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', badge: '👑 Флагман', desc: 'Лучшая в мире модель для программирования и System Design' },
    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', badge: '⚡ Ультра-быстро', desc: 'Быстрый легковесный Claude для мгновенных подсказок' },
  ],
};

export interface AppSettings {
  geminiApiKey: string;
  geminiModel: string;
  groqApiKey: string;
  groqModel: string;
  openaiApiKey: string;
  openaiModel: string;
  claudeApiKey: string;
  claudeModel: string;
  preferredProvider: LLMProvider;
  role: JobRole;
  seniority: SeniorityLevel;
  language: AnswerLanguage;
  stealthEnabled: boolean;
  windowOpacity: number;
  autoSolveVoice: boolean;
}

export interface AntiAIResponse {
  punchline: string;
  conversationalScript: string;
  bulletPoints: string[];
  codeSnippet?: string;
  codeLanguage?: string;
  complexity?: {
    time?: string;
    space?: string;
  };
  gotchas?: string[];
  rawText?: string;
  latencyMs?: number;
  usedModel?: string;
}

export interface InterviewItem {
  id: string;
  timestamp: number;
  question: string;
  source: 'voice' | 'screen' | 'text';
  imagePreview?: string;
  response?: AntiAIResponse;
  isLoading: boolean;
  error?: string;
}

export interface ElectronAPI {
  setOpacity: (opacity: number) => Promise<number>;
  toggleContentProtection: (enable: boolean) => Promise<boolean>;
  toggleTeleprompter: () => Promise<boolean>;
  setIgnoreMouse: (ignore: boolean) => Promise<boolean>;
  captureScreen: () => Promise<{ success: boolean; image?: string; error?: string }>;
  minimizeWindow: () => Promise<void>;
  hideWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;

  onTriggerScreenSnip: (callback: () => void) => () => void;
  onTriggerVoiceRecord: (callback: () => void) => () => void;
  onOpacityChanged: (callback: (opacity: number) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
