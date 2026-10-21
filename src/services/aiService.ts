import { AppSettings, AntiAIResponse, LLMProvider } from '../types';

const ROLE_PROMPTS: Record<string, string> = {
  frontend: 'Специализация: Senior Frontend Engineer (React, TypeScript, Next.js, Web Vitals, State Management, Architecture).',
  backend: 'Специализация: Senior Backend Engineer (Node.js, Go, Python, Distributed Systems, SQL/NoSQL, Kafka, Caching).',
  fullstack: 'Специализация: Senior Fullstack Engineer (React, Node.js/Go, System Design, REST/GraphQL, Postgres, Cloud).',
  devops: 'Специализация: Senior DevOps / SRE Engineer (Kubernetes, CI/CD, Terraform, Docker, AWS/GCP, Monitoring, Prometheus).',
  mobile: 'Специализация: Senior Mobile Engineer (React Native / iOS Swift / Android Kotlin, Architecture, Performance, Offline-first).',
  system_design: 'Специализация: Principal / Staff Architect (High Load, Microservices, Sharding, Event-Driven, CAP Theorem, Trade-offs).',
  algo: 'Специализация: FAANG LeetCode Specialist (Optimal Big-O Time & Space, Edge Cases, Sliding Window, DP, Graph/Tree).',
  qa: 'Специализация: Senior QA Automation Engineer (E2E, Pytest, Playwright, CI/CD Integration, Test Strategies).',
};

const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  'ru-tech': 'ЯЗЫК: Живой русский язык разработчиков (с естественными терминами: "пуллить", "хэндлер", "стейт", "деплоить", "оверхед", "прод", "воркер"). Без занудства и канцелярита.',
  'ru-pure': 'ЯЗЫК: Грамотный, чистый русский язык без грубого сленга, но живой и уверенный.',
  'en': 'LANGUAGE: Fluent, natural American conversational English of a high-performing Senior Engineer. Use natural transitions like "So the way I usually approach this is...", "At its core...", "The main trade-off here is...". Avoid textbook robotic jargon.',
};

function buildSystemPrompt(settings: AppSettings): string {
  const roleText = ROLE_PROMPTS[settings.role] || ROLE_PROMPTS['fullstack'];
  const langText = LANGUAGE_INSTRUCTIONS[settings.language] || LANGUAGE_INSTRUCTIONS['ru-tech'];

  return `Ты — невидимый суфлер-копилот для кандидата на техническом собеседовании.
Твоя цель: помочь кандидату ответить так, чтобы интервьюер был уверен, что перед ним опытный ${settings.seniority.toUpperCase()} инженер с реальным практическим опытом.

${roleText}
Грейд кандидата: ${settings.seniority.toUpperCase()}
${langText}

КРИТИЧЕСКИ ВАЖНО: АБСОЛЮТНЫЙ ЗАПРЕТ НА "ИИШНЫЙ" СТИЛЬ:
- НИКОГДА не пиши вводные вежливости: "Конечно!", "Отличный вопрос!", "С радостью помогу!", "Давайте разберем...", "In conclusion...".
- НИКОГДА не цитируй сухие словарные определения из Википедии или учебников.
- Отвечай от ПЕРВОГО ЛИЦА ("Я обычно...", "По моему опыту...", "В продакшене мы делали так:...", "Здесь главный компромисс в том, что...").
- Никакой воды. Сразу суть.

ТЫ ОБЯЗАН ВЕРНУТЬ ОТВЕТ СТРОГО В ФОРМАТЕ JSON СО СЛЕДУЮЩИМИ ПОЛЯМИ:
{
  "punchline": "1-2 мощных первых предложения. Это то, что кандидат начнет говорить В ПЕРВУЮ ЖЕ СЕКУНДУ без запинки, пока пробегает глазами остальной текст.",
  "conversationalScript": "Развернутый, но живой и непринужденный ответ (2-4 коротких абзаца). Написан так, как будто опытный разработчик рассуждает вслух перед коллегой.",
  "bulletPoints": [
    "Тезис 1: Ключевой факт / механизм под капотом",
    "Тезис 2: Практический трейдофф (плюсы / минусы)",
    "Тезис 3: Продакшн нюанс или альтернативное решение"
  ],
  "codeSnippet": "Если вопрос требует кода или это алгоритмическая задача: напиши ЧИСТЫЙ, лаконичный код без лишнего boilerplate. Если код не нужен, передай пустую строку.",
  "codeLanguage": "typescript / python / go / etc или пустая строка",
  "complexity": {
    "time": "O(...) если задача алгоритмическая, иначе пусто",
    "space": "O(...) если задача алгоритмическая, иначе пусто"
  },
  "gotchas": [
    "Ловушка / доп. вопрос: о чем интервьюер обязательно спросит в продолжение",
    "Еще одна частая ошибка кандидатов на эту тему"
  ]
}

Верни ТОЛЬКО валидный JSON без обертки \`\`\`json.`;
}

function sanitizeApiKey(key: string): string {
  if (!key) return '';
  return key.trim().replace(/^Bearer\s+/i, '').replace(/["']/g, '');
}

function parseAIResponse(text: string): AntiAIResponse {
  try {
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```\s*/, '').replace(/```\s*$/i, '');
    }

    let parsed: any;
    try {
      parsed = JSON.parse(cleanText);
    } catch {
      const firstBrace = cleanText.indexOf('{');
      const lastBrace = cleanText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        parsed = JSON.parse(cleanText.substring(firstBrace, lastBrace + 1));
      } else {
        throw new Error('Not JSON');
      }
    }

    return {
      punchline: parsed.punchline || 'Прямой ответ на вопрос...',
      conversationalScript: parsed.conversationalScript || cleanText,
      bulletPoints: Array.isArray(parsed.bulletPoints) ? parsed.bulletPoints : [],
      codeSnippet: parsed.codeSnippet || undefined,
      codeLanguage: parsed.codeLanguage || undefined,
      complexity: parsed.complexity || undefined,
      gotchas: Array.isArray(parsed.gotchas) ? parsed.gotchas : [],
      rawText: text,
    };
  } catch (e) {
    return {
      punchline: text.slice(0, 150) + '...',
      conversationalScript: text,
      bulletPoints: ['Обрати внимание на детали реализации', 'Следи за временем и памятью'],
      rawText: text,
    };
  }
}

// 1. Google Gemini
async function callGemini(
  prompt: string,
  settings: AppSettings,
  imageBase64?: string
): Promise<AntiAIResponse> {
  const startTime = Date.now();
  const apiKey = sanitizeApiKey(settings.geminiApiKey);
  if (!apiKey) throw new Error('Gemini API ключ не указан. Добавь бесплатный ключ в настройках (шестерёнка).');

  let model = settings.geminiModel || 'gemini-2.0-flash';
  if (model === 'gemini-2.5-flash' || model === 'gemini-2.5-pro' || !model) {
    model = 'gemini-2.0-flash';
  }

  const systemPrompt = buildSystemPrompt(settings);

  const parts: any[] = [];
  if (imageBase64) {
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: cleanBase64,
      },
    });
    parts.push({
      text: prompt ? `Вот скриншот экрана с задачей/кодом. Вопрос/комментарий: ${prompt}` : 'Реши задачу / объясни код со скриншота экрана подробно и четко.',
    });
  } else {
    parts.push({ text: prompt });
  }

  const requestBody = JSON.stringify({
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts }],
    generationConfig: {
      temperature: 0.4,
      responseMimeType: 'application/json',
    },
  });

  let response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: requestBody,
    }
  );

  // Fallback to gemini-1.5-flash if gemini-2.0-flash returned error or not found
  if (!response.ok && model !== 'gemini-1.5-flash') {
    console.warn(`[xGhost] Gemini ${model} failed, falling back to gemini-1.5-flash`);
    model = 'gemini-1.5-flash';
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: requestBody,
      }
    );
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Gemini API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const result = parseAIResponse(rawText);
  result.latencyMs = Date.now() - startTime;
  result.usedModel = model;
  return result;
}

// 2. Groq
async function callGroq(
  prompt: string,
  settings: AppSettings,
  imageBase64?: string
): Promise<AntiAIResponse> {
  const startTime = Date.now();
  const apiKey = sanitizeApiKey(settings.groqApiKey);
  if (!apiKey) throw new Error('Groq API ключ не указан в настройках.');

  const systemPrompt = buildSystemPrompt(settings);
  const model = imageBase64 ? 'llama-3.2-11b-vision-preview' : (settings.groqModel || 'llama-3.3-70b-versatile');

  const userContent: any = imageBase64
    ? [
        { type: 'text', text: prompt || 'Реши задачу со скриншота.' },
        { type: 'image_url', image_url: { url: imageBase64 } },
      ]
    : prompt;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Groq API Error: ${response.status}`);
  }

  const data = await response.json();
  const rawText = data?.choices?.[0]?.message?.content || '';
  const result = parseAIResponse(rawText);
  result.latencyMs = Date.now() - startTime;
  result.usedModel = model;
  return result;
}

// 3. OpenAI
async function callOpenAI(
  prompt: string,
  settings: AppSettings,
  imageBase64?: string
): Promise<AntiAIResponse> {
  const startTime = Date.now();
  const apiKey = sanitizeApiKey(settings.openaiApiKey);
  if (!apiKey) throw new Error('OpenAI API ключ не указан в настройках.');

  const systemPrompt = buildSystemPrompt(settings);
  const model = settings.openaiModel || 'gpt-4o';

  const userContent: any = imageBase64
    ? [
        { type: 'text', text: prompt || 'Реши задачу со скриншота.' },
        { type: 'image_url', image_url: { url: imageBase64 } },
      ]
    : prompt;

  const isReasoningModel = model.startsWith('o1') || model.startsWith('o3');

  const payload: any = {
    model,
    messages: [
      { role: isReasoningModel ? 'user' : 'system', content: isReasoningModel ? `${systemPrompt}\n\nПользователь спрашивает: ${prompt}` : systemPrompt },
      ...(isReasoningModel ? [] : [{ role: 'user', content: userContent }]),
    ],
  };

  if (!isReasoningModel) {
    payload.temperature = 0.4;
    payload.response_format = { type: 'json_object' };
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `OpenAI API Error: ${response.status}`);
  }

  const data = await response.json();
  const rawText = data?.choices?.[0]?.message?.content || '';
  const result = parseAIResponse(rawText);
  result.latencyMs = Date.now() - startTime;
  result.usedModel = model;
  return result;
}

// 4. Anthropic Claude
async function callClaude(
  prompt: string,
  settings: AppSettings,
  imageBase64?: string
): Promise<AntiAIResponse> {
  const startTime = Date.now();
  const apiKey = sanitizeApiKey(settings.claudeApiKey);
  if (!apiKey) throw new Error('Anthropic Claude API ключ не указан в настройках.');

  const systemPrompt = buildSystemPrompt(settings);
  const model = settings.claudeModel || 'claude-3-5-sonnet-20241022';

  const content: any[] = [];
  if (imageBase64) {
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    content.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: 'image/jpeg',
        data: cleanBase64,
      },
    });
    content.push({ type: 'text', text: prompt || 'Реши задачу со скриншота.' });
  } else {
    content.push({ type: 'text', text: prompt });
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content }],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Claude API Error: ${response.status}`);
  }

  const data = await response.json();
  const rawText = data?.content?.[0]?.text || '';
  const result = parseAIResponse(rawText);
  result.latencyMs = Date.now() - startTime;
  result.usedModel = model;
  return result;
}

// Unified Router
export async function generateAntiAIResponse(
  prompt: string,
  settings: AppSettings,
  imageBase64?: string
): Promise<AntiAIResponse> {
  const hasGemini = Boolean(settings.geminiApiKey?.trim());
  const hasGroq = Boolean(settings.groqApiKey?.trim());
  const hasOpenai = Boolean(settings.openaiApiKey?.trim());
  const hasClaude = Boolean(settings.claudeApiKey?.trim());

  if (!hasGemini && !hasGroq && !hasOpenai && !hasClaude) {
    throw new Error('API ключ не указан. Открой настройки (шестерёнка вверху) и вставь бесплатный ключ Gemini или Groq.');
  }

  let activeProvider = settings.preferredProvider;
  if (activeProvider === 'gemini' && !hasGemini) {
    activeProvider = hasGroq ? 'groq' : hasOpenai ? 'openai' : 'claude';
  } else if (activeProvider === 'groq' && !hasGroq) {
    activeProvider = hasGemini ? 'gemini' : hasOpenai ? 'openai' : 'claude';
  } else if (activeProvider === 'openai' && !hasOpenai) {
    activeProvider = hasGemini ? 'gemini' : hasGroq ? 'groq' : 'claude';
  } else if (activeProvider === 'claude' && !hasClaude) {
    activeProvider = hasGemini ? 'gemini' : hasGroq ? 'groq' : 'openai';
  }

  switch (activeProvider) {
    case 'gemini':
      return callGemini(prompt, settings, imageBase64);
    case 'groq':
      return callGroq(prompt, settings, imageBase64);
    case 'openai':
      return callOpenAI(prompt, settings, imageBase64);
    case 'claude':
      return callClaude(prompt, settings, imageBase64);
    default:
      throw new Error('Пожалуйста, добавь хотя бы один API ключ в настройках (Gemini, Groq, OpenAI или Claude).');
  }
}

export async function testProviderKey(provider: LLMProvider, apiKey: string): Promise<{ success: boolean; latencyMs?: number; error?: string }> {
  const startTime = Date.now();
  try {
    const cleanKey = sanitizeApiKey(apiKey);
    if (!cleanKey) throw new Error('Ключ пустой');

    if (provider === 'gemini') {
      let res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${cleanKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: 'Ping' }] }] }),
      });
      if (!res.ok) {
        // Fallback to gemini-1.5-flash
        res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${cleanKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: 'Ping' }] }] }),
        });
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `Ошибка HTTP ${res.status}`);
      }
      return { success: true, latencyMs: Date.now() - startTime };
    }

    if (provider === 'groq') {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cleanKey}` },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: 'Ping' }],
          max_tokens: 5,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `Status ${res.status}`);
      }
      return { success: true, latencyMs: Date.now() - startTime };
    }

    if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cleanKey}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'Ping' }],
          max_tokens: 5,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `Status ${res.status}`);
      }
      return { success: true, latencyMs: Date.now() - startTime };
    }

    if (provider === 'claude') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': cleanKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 5,
          messages: [{ role: 'user', content: 'Ping' }],
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `Status ${res.status}`);
      }
      return { success: true, latencyMs: Date.now() - startTime };
    }

    return { success: false, error: 'Неизвестный провайдер' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Ошибка подключения' };
  }
}
