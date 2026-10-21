import { AppSettings } from '../types';

const STORAGE_KEY = 'xghost_settings_v2';

export const DEFAULT_SETTINGS: AppSettings = {
  geminiApiKey: '',
  geminiModel: 'gemini-2.0-flash',
  groqApiKey: '',
  groqModel: 'llama-3.3-70b-versatile',
  openaiApiKey: '',
  openaiModel: 'gpt-4o',
  claudeApiKey: '',
  claudeModel: 'claude-3-5-sonnet-20241022',
  preferredProvider: 'gemini',
  role: 'fullstack',
  seniority: 'senior',
  language: 'ru-tech',
  stealthEnabled: true,
  windowOpacity: 0.95,
  autoSolveVoice: true,
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);

    // Auto-migrate broken/legacy model IDs in user localStorage
    if (parsed.geminiModel === 'gemini-2.5-flash' || parsed.geminiModel === 'gemini-2.5-pro' || !parsed.geminiModel) {
      parsed.geminiModel = 'gemini-2.0-flash';
    }
    if (parsed.groqModel === 'mixtral-8x7b-32768') {
      parsed.groqModel = 'llama-3.3-70b-versatile';
    }

    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('[xGhost] Failed to save settings to localStorage:', e);
  }
}
