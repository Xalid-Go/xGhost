import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Zap, 
  Camera, 
  Mic, 
  Eye, 
  Download, 
  Apple, 
  Terminal, 
  ExternalLink, 
  Check, 
  Copy, 
  Sparkles, 
  ArrowRight, 
  Cpu, 
  Monitor, 
  EyeOff, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Star,
  Lock,
  Radio,
  Play,
  Pause,
  Volume2,
  RefreshCw,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { Logo } from './Logo';

interface TopicData {
  id: string;
  label: string;
  hook: string;
  script: string;
  chips: string[];
  code: string;
  complexity: string;
  trapQ: string;
  trapA: string;
  latencyMs: number;
}

const TOPICS: Record<string, TopicData> = {
  node: {
    id: 'node',
    label: 'Node.js Event Loop',
    hook: '«Главное под капотом — Node использует однопоточный event loop на базе libuv, а тяжелые блокирующие системные вызовы делегирует во внутренний тредпул...»',
    script: '«Когда я проектирую I/O-интенсивные микросервисы, я всегда отталкиваюсь от того, что сам JavaScript крутится в одном потоке, но libuv по дефолту выделяет пул из 4 воркеров под работу с файловой системой, DNS и криптографией. В высоконагруженном проде под высокий трафик мы часто увеличиваем UV_THREADPOOL_SIZE, чтобы исключить starvation при частых дисковых операциях.»',
    chips: ['Микротаски всегда раньше макротасок', 'process.nextTick опережает Promise.then', 'Тредпул libuv (по дефолту 4 воркера)'],
    code: `process.nextTick(() => console.log("1. nextTick (высший приоритет)"));
Promise.resolve().then(() => console.log("2. Promise микротаска"));
setTimeout(() => console.log("3. Таймер макротаска"), 0);`,
    complexity: 'Время: O(1) диспетчеризация | Память: O(N)',
    trapQ: 'Что произойдет, если запустить синхронный CPU-bound цикл в process.nextTick?',
    trapA: 'Event loop намертво заблокируется: фазы ввода-вывода, таймеры и входящий сетевой трафик перестанут получать кванты времени.',
    latencyMs: 380
  },
  react: {
    id: 'react',
    label: 'React 18 Concurrency',
    hook: '«Ключевое отличие React 18 с Fiber — это разделение реконсиляции на прерываемую фазу Render и синхронную атомарную фазу Commit.»',
    script: '«Главная фича React 18 — это Concurrent Mode и транзакции (startTransition, useDeferredValue). Вместо того чтобы намертво фризить главный поток браузера тяжелым рендером огромных списков, React уступает управление критическому вводу пользователя (печати в инпуте, кликам) и возобновляет фоновый дифф без пропуска кадров.»',
    chips: ['Двойная буферизация Fiber', 'Прерываемый Work-In-Progress', 'Приоритеты на основе Lanes'],
    code: `// Срочный пользовательский ввод не лагает
setInputValue(text);

// Фоновый расчет с низким приоритетом
startTransition(() => {
  setLargeDataset(filterMillions(text));
});`,
    complexity: 'Дифф: O(N) эвристика | Рендер: По приоритетам',
    trapQ: 'Почему в StrictMode компоненты рендерятся дважды на этапе разработки?',
    trapA: 'Чтобы выявлять непреднамеренные сайд-эффекты в фазе Render, которая в конкурентном режиме может вызываться несколько раз до коммита.',
    latencyMs: 420
  },
  sysdesign: {
    id: 'sysdesign',
    label: 'Rate Limiter Design',
    hook: '«Для распределенного rate limiter на 100k+ RPS оптимален алгоритм Token Bucket на базе Redis Cluster с исполнением через атомарный Lua-скрипт.»',
    script: '«Я сознательно избегаю Sliding Window Log на высоких нагрузках из-за взрывного роста памяти. Token Bucket позволяет сглаживать пиковые всплески (bursts) и жестко держать средний лимит. Lua-скрипт прямо в Redis гарантирует атомарную проверку и списание токена за один сетевой round-trip без race conditions.»',
    chips: ['Token Bucket + Redis Lua', 'Память: O(1) на каждого клиента', 'Sliding Window Counter как альтернатива'],
    code: `-- Атомарный инкремент через Redis Lua
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local current = tonumber(redis.call('get', key) or "0")
if current < limit then
  redis.call('incr', key)
  return 1
else
  return 0
end`,
    complexity: 'Задержка: < 1.2мс | Память: 32 байта на IP',
    trapQ: 'Как обрабатывать падение кластера Redis без падения всего API Gateway?',
    trapA: 'Политика Fail-Open с локальным in-memory fallback кэшем (LRU), чтобы при аварии пропускать легитимный трафик, а не блокировать клиентов.',
    latencyMs: 460
  },
  leetcode: {
    id: 'leetcode',
    label: 'Two Sum O(N)',
    hook: '«Сводим квадратичный перебор O(N²) к линейному O(N) за счет сохранения дополнений в вспомогательной хэш-таблице за один проход.»',
    script: '«Итерируемся по массиву один раз: для каждого элемента вычисляем (target - num) и проверяем наличие в Map. Если дополнение найдено — мгновенно отдаем пару индексов. Если нет — кладем число и его индекс. Краевые случаи с отрицательными числами и нулями отрабатывают за O(N) по памяти.»',
    chips: ['Один проход O(N)', 'Поиск комплемента в HashMap за O(1)', 'Учет дубликатов и отрицательных чисел'],
    code: `function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    complexity: 'Время: O(N) | Память: O(N)',
    trapQ: 'Что если входной массив изначально отсортирован?',
    trapA: 'Тогда хэш-таблицу можно полностью исключить и решить методом двух указателей (Two Pointers) с краев за O(N) времени и O(1) памяти.',
    latencyMs: 310
  }
};

export const LandingPage: React.FC<{ onLaunchDemo?: () => void }> = ({ onLaunchDemo }) => {
  const [activeTopicId, setActiveTopicId] = useState<string>('node');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // Mouse spotlight coordinates for ambient glow
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  // Cloak view simulator toggle: candidate vs interviewer
  const [cloakMode, setCloakMode] = useState<'candidate' | 'interviewer'>('candidate');

  // Simulated AI Streaming Typewriter
  const [streamProgress, setStreamProgress] = useState<number>(100);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  // Simulated Audio Equalizer & Speech Synthesis
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioBars, setAudioBars] = useState<number[]>([15, 25, 45, 80, 60, 95, 75, 40, 65, 85, 90, 50, 35, 70, 45, 20]);

  const topic = TOPICS[activeTopicId];

  // Mouse Spotlight Tracker
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  // Toggle voice playback of the hook
  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const cleanSpeechText = topic.hook.replace(/^[«“"]|[»”"]$/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
        utterance.lang = 'ru-RU';
        utterance.rate = 1.0;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  // Trigger streaming animation on topic switch
  const handleSelectTopic = (id: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setActiveTopicId(id);
    setIsStreaming(true);
    setStreamProgress(0);
    setIsPlayingAudio(false);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 15;
      if (progress >= 100) {
        setStreamProgress(100);
        setIsStreaming(false);
        clearInterval(interval);
      } else {
        setStreamProgress(progress);
      }
    }, 35);
  };

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Simulated audio cadence waveform animation
  useEffect(() => {
    if (!isPlayingAudio) return;
    const timer = setInterval(() => {
      setAudioBars(prev => prev.map(() => Math.floor(Math.random() * 85) + 15));
    }, 90);
    return () => clearInterval(timer);
  }, [isPlayingAudio]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1800);
  };

  const toggleFaq = (idx: number) => {
    setExpandedFaq(expandedFaq === idx ? null : idx);
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[#050507] text-[#e3e2e3] font-sans antialiased selection:bg-emerald-500/25 selection:text-emerald-300 relative overflow-x-hidden"
    >
      {/* Interactive Raycast-style Mouse Spotlight */}
      <div 
        className="pointer-events-none fixed inset-0 -z-5 transition-opacity duration-300 opacity-60"
        style={{
          background: `radial-gradient(750px circle at ${mousePos.x}px ${mousePos.y}px, rgba(16, 185, 129, 0.08), transparent 60%)`
        }}
      />

      {/* Ambient background living aurora orbs & coordinate grid */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-emerald-500/[0.09] rounded-full blur-[160px] animate-pulseGlow" />
        <div className="absolute top-[800px] -right-[100px] w-[600px] h-[500px] bg-sky-500/[0.06] rounded-full blur-[180px] animate-floatSlow" />
        <div className="absolute top-[1800px] -left-[150px] w-[600px] h-[500px] bg-emerald-600/[0.05] rounded-full blur-[190px] animate-floatReverse" />
      </div>

      {/* FIXED TOP NAVBAR */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[#0A0C10]/85 backdrop-blur-2xl border-b border-white/[0.06]">
        <div className="h-16 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <Logo size={28} showText={true} />
          </div>

          <nav className="hidden xl:flex items-center gap-1 bg-[#161920]/80 px-3 py-1 rounded-full border border-white/5 text-xs text-[#94A3B8]">
            <a href="#stealth-cloak" className="px-3 py-1 rounded-full hover:text-white transition-colors">Стелс-маскировка</a>
            <a href="#hud-demo" className="px-3 py-1 rounded-full hover:text-white transition-colors">Демо суфлера</a>
            <a href="#features" className="px-3 py-1 rounded-full hover:text-white transition-colors">Возможности</a>
            <a href="#comparison" className="px-3 py-1 rounded-full hover:text-white transition-colors">Бенчмарк</a>
            <a href="#download" className="px-3 py-1 rounded-full hover:text-white transition-colors">Скачать</a>
            <a href="#faq" className="px-3 py-1 rounded-full hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href="https://github.com/Xalid-Go/xGhost"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white transition-all hover:scale-[1.02]"
              title="Поставить звезду на GitHub"
            >
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="hidden sm:inline">Star on GitHub</span>
            </a>

            {onLaunchDemo && (
              <button
                onClick={onLaunchDemo}
                className="hidden md:flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#161920] hover:bg-[#1e232e] border border-white/10 text-xs text-[#94A3B8] hover:text-white transition-all"
              >
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Веб-HUD</span>
              </button>
            )}

            <a
              href="#download"
              className="flex items-center gap-2 h-8 px-3.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Скачать v1.0</span>
            </a>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="w-full pt-16 flex-1">
        {/* ======================================================== */}
        {/* 1. HERO SECTION WITH RICH ANIMATIONS                     */}
        {/* ======================================================== */}
        <section className="relative px-6 lg:px-12 pt-16 pb-16 max-w-7xl mx-auto flex flex-col items-center text-center">
          {/* Animated Hardware Stealth Badge */}
          <div className="relative inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#121620]/90 border border-emerald-500/30 mb-8 shadow-[0_0_25px_rgba(16,185,129,0.18)] backdrop-blur-xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-mono text-[11px] text-[#A7F3D0] tracking-wide font-medium">
              NSWindowSharingNone • 100% невидимость в Zoom, Google Meet и Teams
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight max-w-4xl mx-auto font-sans leading-[1.08]">
            Невидимый суфлер-копилот для <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400">технических собеседований</span>
          </h1>

          <p className="text-base md:text-lg text-[#94A3B8] max-w-2xl mt-5 leading-relaxed font-normal">
            Бесшумный плавающий HUD, аппаратно исключенный из захвата экрана. Слушает вопросы интервьюера, мгновенно считывает код со скриншота и подсказывает естественные тезисы Senior-уровня без шаблонной ИИ-воды.
          </p>

          {/* Live Audio Ingestion Visualizer Pill */}
          <div className="mt-6 inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#0c0e14]/90 border border-white/10 shadow-lg backdrop-blur-md">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              <span>Поток CoreAudio</span>
            </div>
            <div className="h-3 w-px bg-white/10" />
            {/* 10 Animated Audio Equalizer Bars */}
            <div className="flex items-center gap-0.5 h-4">
              {[8, 14, 22, 10, 26, 16, 24, 12, 18, 9].map((h, i) => (
                <div 
                  key={i} 
                  className="w-1 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-full transition-all"
                  style={{ 
                    height: `${h}px`,
                    animation: `soundWaveBar 1.${2 + (i % 5)}s ease-in-out infinite`,
                    animationDelay: `${i * 0.12}s`,
                    transformOrigin: 'bottom'
                  }} 
                />
              ))}
            </div>
            <div className="h-3 w-px bg-white/10" />
            <span className="text-[11px] font-mono text-emerald-400 font-semibold">&lt; 0.4с отклик</span>
          </div>

          {/* CTA Buttons with high-tech Shimmer */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mt-8 w-full max-w-md">
            <a
              href="https://github.com/Xalid-Go/xGhost/releases/download/v1.0.0/xGhost-Copilot-1.0.0-arm64.dmg"
              target="_blank"
              rel="noreferrer"
              className="relative overflow-hidden group flex items-center justify-center gap-2.5 px-6 h-12 rounded-xl bg-white hover:bg-zinc-100 text-black font-bold text-xs transition-all w-full sm:w-auto shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-[0.98]"
            >
              {/* Animated Light Shimmer Beam */}
              <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-black/10 to-transparent pointer-events-none" />
              <Apple className="w-4 h-4 fill-current" />
              <span>macOS Apple Silicon (.dmg)</span>
            </a>

            <a
              href="https://github.com/Xalid-Go/xGhost/releases/download/v1.0.0/xGhost-Copilot-Setup-1.0.0.exe"
              target="_blank"
              rel="noreferrer"
              className="relative overflow-hidden group flex items-center justify-center gap-2.5 px-6 h-12 rounded-xl bg-[#161920] hover:bg-[#1f232d] text-white text-xs font-semibold border border-white/10 transition-all w-full sm:w-auto hover:border-white/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
              <Terminal className="w-4 h-4 text-sky-400" />
              <span>Windows x64 (.exe)</span>
            </a>
          </div>

          {/* Telemetry Grid with Glass Hover & Live Meters */}
          <div className="mt-14 w-full max-w-4xl grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="glass-panel glass-panel-hover p-4 rounded-xl text-left relative overflow-hidden group">
              <div className="font-mono text-base text-white font-semibold flex items-center justify-between">
                <span>&lt; 380мс</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div className="text-xs text-[#94A3B8] mt-1 font-medium">Groq Llama 3.3 / Gemini</div>
              <div className="text-[10px] text-emerald-400/80 font-mono mt-0.5">Первые токены ответа</div>
            </div>

            <div className="glass-panel glass-panel-hover p-4 rounded-xl text-left relative overflow-hidden group">
              <div className="font-mono text-base text-white font-semibold flex items-center justify-between">
                <span>100% Стелс</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-xs text-[#94A3B8] mt-1 font-medium">Zoom, Meet, Teams</div>
              <div className="text-[10px] text-emerald-400/80 font-mono mt-0.5">Аппаратное скрытие окна</div>
            </div>

            <div className="glass-panel glass-panel-hover p-4 rounded-xl text-left relative overflow-hidden group">
              <div className="font-mono text-base text-white font-semibold flex items-center justify-between">
                <span>Свой API ключ</span>
                <Lock className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <div className="text-xs text-[#94A3B8] mt-1 font-medium">Ноль облачных логов</div>
              <div className="text-[10px] text-[#64748B] font-mono mt-0.5">Шифрование Keychain / DPAPI</div>
            </div>

            <div className="glass-panel glass-panel-hover p-4 rounded-xl text-left relative overflow-hidden group">
              <div className="font-mono text-base text-white font-semibold flex items-center justify-between">
                <span>0.2% CPU</span>
                <Cpu className="w-3.5 h-3.5 text-yellow-400" />
              </div>
              <div className="text-xs text-[#94A3B8] mt-1 font-medium">Rust / C++ / ARM64</div>
              <div className="text-[10px] text-[#64748B] font-mono mt-0.5">Без троттлинга и нагрева</div>
            </div>
          </div>

          {/* INFINITE COMPATIBILITY PLATFORM MARQUEE */}
          <div className="w-full max-w-5xl mt-14 pt-6 border-t border-white/5 overflow-hidden">
            <div className="text-[11px] font-mono text-[#64748B] uppercase tracking-wider mb-4">
              Протестировано и не обнаруживается во всех программах видеосвязи и записи экрана
            </div>
            <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
              <div className="animate-marquee flex items-center gap-8 text-xs font-mono text-zinc-400 whitespace-nowrap py-2">
                {[
                  'Zoom Meetings',
                  'Google Meet',
                  'Microsoft Teams',
                  'Slack Huddles',
                  'Discord Screen Share',
                  'Cisco Webex',
                  'Loom Recording',
                  'OBS Studio',
                  'QuickTime Screen',
                  'Яндекс Телемост',
                  'Zoom Meetings',
                  'Google Meet',
                  'Microsoft Teams',
                  'Slack Huddles',
                  'Discord Screen Share',
                  'Cisco Webex',
                  'Loom Recording',
                  'OBS Studio',
                  'QuickTime Screen',
                  'Яндекс Телемост'
                ].map((name, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-[#10131a] px-3.5 py-1.5 rounded-lg border border-white/5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
                    <span className="text-zinc-200 font-medium">{name}</span>
                    <span className="text-[10px] text-emerald-400/70 font-mono">НЕВИДИМ</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        {/* ======================================================== */}
        {/* 2. INTERACTIVE STEALTH CLOAK SHOWCASE                     */}
        {/* ======================================================== */}
        <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto w-full" id="stealth-cloak">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-mono text-[#64748B] uppercase tracking-wider">Аппаратная маскировка</span>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mt-1">
              Что видишь ты vs. что видит собеседник
            </h2>
            <p className="text-sm text-[#94A3B8] mt-2">
              Исключение окна на уровне графического композитора ОС гарантирует, что слой подсказок никогда не попадет в видеокодек захвата экрана.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Candidate Display */}
            <div className="glass-panel rounded-2xl overflow-hidden flex flex-col shadow-2xl relative border-white/10 group">
              <div className="bg-[#12151c]/90 px-4 py-2.5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                  <span className="ml-2 font-mono text-xs text-[#94A3B8]">Retina-дисплей кандидата</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-medium">
                    HUD активен и виден
                  </span>
                </div>
              </div>

              <div className="p-5 font-mono text-xs relative min-h-[410px] flex-1 flex flex-col justify-between bg-[#080a0f] overflow-hidden">
                {/* Animated OCR Laser Scanning Line */}
                <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent pointer-events-none animate-scanline z-10 shadow-[0_0_12px_rgba(16,185,129,0.8)]" />

                <div className="text-[#64748B] space-y-1 select-none font-normal leading-relaxed relative z-0">
                  <div><span className="text-[#94A3B8]">class</span> <span className="text-white">Solution</span>:</div>
                  <div className="pl-4"><span className="text-[#94A3B8]">def</span> <span className="text-white">twoSum</span>(self, nums: List[int], target: int) -&gt; List[int]:</div>
                  <div className="pl-8 text-zinc-600"># Кандидат пишет код в полноэкранной IDE...</div>
                  <div className="pl-8 text-zinc-600">seen = &#123;&#125;</div>
                  <div className="pl-8 text-zinc-600">for i, num in enumerate(nums):</div>
                  <div className="pl-12 text-zinc-600">diff = target - num</div>
                  <div className="pl-12 text-zinc-600">if diff in seen: return [seen[diff], i]</div>
                  <div className="pl-8 text-zinc-600">return []</div>
                </div>

                {/* Floating HUD Card with Glow & Voice Meter */}
                <div className="mt-4 bg-[#11141c]/95 border border-emerald-500/40 rounded-xl p-4 shadow-[0_10px_35px_rgba(0,0,0,0.6),0_0_20px_rgba(16,185,129,0.12)] backdrop-blur-xl relative z-20">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
                    <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>xGhost HUD • Живой ответ без ИИ-клише</span>
                    </span>
                    {/* Live mini voice equalizer */}
                    <div className="flex items-center gap-1">
                      <div className="flex items-center gap-0.5 h-3">
                        {[6, 12, 10, 14, 8].map((h, i) => (
                          <div 
                            key={i} 
                            className="w-0.5 bg-emerald-400 rounded-full"
                            style={{ 
                              height: `${h}px`,
                              animation: `soundWaveBar 1.${1 + i}s ease-in-out infinite`,
                              transformOrigin: 'bottom'
                            }} 
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono ml-1">380мс</span>
                    </div>
                  </div>
                  <p className="text-xs text-white leading-relaxed font-sans font-medium">
                    «Сводим квадратичный перебор O(N²) к линейному O(N) за счет сохранения дополнений в вспомогательной хэш-таблице за один проход...»
                  </p>
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#94A3B8] font-mono">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">Время: O(N)</span>
                      <span className="px-1.5 py-0.5 rounded bg-white/5">Память: O(N)</span>
                    </div>
                    <span className="text-emerald-400/90 text-[10px]">⌥Пробел для вызова</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-[#64748B] font-mono relative z-10">
                  <span>Среда: macOS Quartz Compositor</span>
                  <span className="text-emerald-400">Прямой аппаратный рендер</span>
                </div>
              </div>
            </div>

            {/* Zoom / Meet Stream Feed */}
            <div className="glass-panel rounded-2xl overflow-hidden flex flex-col shadow-2xl relative border-white/10 group">
              <div className="bg-[#12151c]/90 px-4 py-2.5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <span className="ml-2 font-mono text-xs text-[#94A3B8]">Трансляция в Zoom и Google Meet</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[11px] font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 font-medium">
                    ● REC 1080p60 WebRTC
                  </span>
                </div>
              </div>

              <div className="p-5 font-mono text-xs relative min-h-[410px] flex-1 flex flex-col justify-between bg-[#080a0f] overflow-hidden">
                <div className="text-[#64748B] space-y-1 select-none font-normal leading-relaxed">
                  <div><span className="text-[#94A3B8]">class</span> <span className="text-white">Solution</span>:</div>
                  <div className="pl-4"><span className="text-[#94A3B8]">def</span> <span className="text-white">twoSum</span>(self, nums: List[int], target: int) -&gt; List[int]:</div>
                  <div className="pl-8 text-zinc-600"># Кандидат пишет код в полноэкранной IDE...</div>
                  <div className="pl-8 text-zinc-600">seen = &#123;&#125;</div>
                  <div className="pl-8 text-zinc-600">for i, num in enumerate(nums):</div>
                  <div className="pl-12 text-zinc-600">diff = target - num</div>
                  <div className="pl-12 text-zinc-600">if diff in seen: return [seen[diff], i]</div>
                  <div className="pl-8 text-zinc-600">return []</div>
                </div>

                {/* Cloak Verified Banner with Radar Sweep Animation */}
                <div className="my-auto py-7 px-4 rounded-xl border border-white/5 bg-[#12151c]/80 text-center flex flex-col items-center justify-center relative overflow-hidden">
                  {/* Subtle Radar sweep beam in background */}
                  <div className="absolute w-44 h-44 rounded-full border border-emerald-500/10 pointer-events-none flex items-center justify-center">
                    <div className="w-full h-0.5 bg-gradient-to-r from-emerald-500/40 to-transparent animate-radarSweep origin-center" />
                  </div>

                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2 relative z-10 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-white relative z-10">Слой HUD полностью невидим</span>
                  <p className="text-[11px] text-[#94A3B8] max-w-xs mt-1 relative z-10">
                    Интервьюер видит 100% чистый экран с вашим кодом. Оконный менеджер ОС отсекает окно xGhost до этапа видеокодирования.
                  </p>
                  <div className="mt-3 inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#0a0c10] border border-white/10 text-[10px] font-mono text-emerald-400">
                    <Lock className="w-3 h-3 text-emerald-400" />
                    <span>0 ОВЕРЛЕЕВ В ПОТОКЕ WEBRTC</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-[#64748B] font-mono">
                  <span>Кодировщик: WebRTC / OBS / Zoom</span>
                  <span className="text-white font-medium">NSWindowSharingNone</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 3. LIVE INTERACTIVE HUD TELEPROMPTER PREVIEW              */}
        {/* ======================================================== */}
        <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto w-full" id="hud-demo">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-mono text-[#64748B] uppercase tracking-wider">Анти-ИИ формулировки</span>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mt-1">
              Создано для живой человеческой речи
            </h2>
            <p className="text-sm text-[#94A3B8] mt-2">
              Генерирует мгновенный 1-секундный хук, связный скрипт рассуждения и практические трейдоффы архитектуры вместо заученных лекций.
            </p>
          </div>

          {/* Question Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            {Object.values(TOPICS).map((t) => (
              <button
                key={t.id}
                onClick={() => handleSelectTopic(t.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  activeTopicId === t.id
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)] font-semibold'
                    : 'bg-[#12151c] text-[#64748B] border-white/5 hover:text-white hover:border-white/10'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Interactive HUD Container */}
          <div className="glass-panel border-white/10 rounded-2xl p-6 lg:p-7 shadow-2xl max-w-4xl mx-auto relative overflow-hidden">
            {/* Top Status Bar with Streaming Clock & Speech Simulator Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/5 mb-5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-xs text-white font-medium">Слушаю эфир</span>
                <span className="text-xs font-mono text-[#64748B] hidden sm:inline">• CoreAudio Stream</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Audio Cadence Simulator Button */}
                <button 
                  onClick={handleToggleAudio}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                    isPlayingAudio 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                      : 'bg-[#161920] text-zinc-300 border-white/10 hover:text-white hover:border-white/20'
                  }`}
                >
                  {isPlayingAudio ? <Pause className="w-3.5 h-3.5 text-emerald-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>{isPlayingAudio ? 'Остановить голос' : 'Слушать темп речи'}</span>
                </button>

                <div className="px-2.5 py-1 rounded-md bg-[#12151c] border border-white/5 font-mono text-[11px] text-emerald-400 flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  <span>{topic.latencyMs}мс</span>
                </div>
              </div>
            </div>

            {/* Live Audio Equalizer Waveform (When Audio Simulation is active) */}
            {isPlayingAudio && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/30 flex items-center justify-between animate-fadeIn">
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-300">
                  <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>Естественная интонация с паузами (Anti-AI Voice Synthesis):</span>
                </div>
                {/* 16 Dynamic Jumping Bars */}
                <div className="flex items-center gap-1 h-6">
                  {audioBars.map((height, i) => (
                    <div 
                      key={i} 
                      className="w-1 bg-gradient-to-t from-emerald-500 to-teal-300 rounded-full transition-all duration-75"
                      style={{ height: `${Math.max(4, height * 0.24)}px` }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* Immediate Hook with Typewriter Streaming */}
              <div className="bg-[#12151c] border border-white/5 rounded-xl p-4 relative group">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>Мгновенный хук (говорится сразу на 1-й секунде)</span>
                  </span>
                  <button
                    onClick={() => handleCopy(topic.hook, 'hook')}
                    className="text-[10px] font-mono text-[#64748B] hover:text-white flex items-center gap-1 transition-colors"
                  >
                    {copied === 'hook' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied === 'hook' ? 'Скопировано' : 'Скопировать'}</span>
                  </button>
                </div>
                <p className="text-sm text-white leading-relaxed font-sans font-medium">
                  {isStreaming ? topic.hook.slice(0, Math.ceil((topic.hook.length * streamProgress) / 100)) : topic.hook}
                  {isStreaming && <span className="inline-block w-2 h-4 bg-emerald-400 ml-1 animate-blink align-middle" />}
                </p>
              </div>

              {/* Conversational Script */}
              <div className="bg-[#080a0f] border border-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-mono text-[#94A3B8] uppercase tracking-wide">Тезисы рассуждения (живой темп речи)</span>
                  <span className="text-[10px] font-mono text-[#64748B]">Без шаблонных списков</span>
                </div>
                <p className="text-xs text-[#94A3B8] leading-relaxed font-sans">
                  {isStreaming ? topic.script.slice(0, Math.ceil((topic.script.length * streamProgress) / 100)) : topic.script}
                </p>
              </div>

              {/* Chips */}
              <div className="flex flex-wrap gap-2">
                {topic.chips.map((chip, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-[#12151c] border border-white/5 text-[11px] font-mono text-[#94A3B8] hover:border-emerald-500/30 transition-colors">
                    {chip}
                  </span>
                ))}
              </div>

              {/* Code Snippet with Copy */}
              <div className="bg-[#080a0f] border border-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
                  <span className="text-[11px] font-mono text-[#64748B]">Чистая реализация</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono text-emerald-400">{topic.complexity}</span>
                    <button
                      onClick={() => handleCopy(topic.code, 'code')}
                      className="text-[10px] font-mono text-[#64748B] hover:text-white flex items-center gap-1 transition-colors"
                    >
                      {copied === 'code' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                <pre className="font-mono text-xs text-emerald-300 leading-relaxed overflow-x-auto">
                  <code>{topic.code}</code>
                </pre>
              </div>

              {/* Anticipated Follow-up */}
              <div className="bg-[#12151c] border border-white/5 rounded-xl p-4">
                <div className="text-[11px] font-mono text-[#94A3B8] mb-1">Каверзный вопрос от интервьюера</div>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  <strong className="text-white">Интервьюер:</strong> “{topic.trapQ}”<br />
                  <span className="text-emerald-400 font-medium mt-1 inline-block"><strong>Ответ кандидата:</strong> “{topic.trapA}”</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 4. FEATURE BENTO GRID WITH LIVE VISUALIZERS              */}
        {/* ======================================================== */}
        <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto w-full" id="features">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono text-[#64748B] uppercase tracking-wider">Возможности</span>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mt-1">
              Инженерия для ответственных собеседований
            </h2>
            <p className="text-sm text-[#94A3B8] mt-2">
              Фокус строго на минимальной задержке, аппаратной невидимости и естественности подачи.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Card 1: Native Cloak (Wide) */}
            <div className="lg:col-span-2 glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.04] rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/[0.08] transition-all" />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <Shield className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    Исключение на уровне ОС
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Аппаратный стелс-слой (Cloak)</h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed mb-5">
                  Работает через системные вызовы macOS <code className="text-emerald-400 font-mono bg-[#161920] px-1.5 py-0.5 rounded">NSWindowSharingNone</code> и Windows <code className="text-emerald-400 font-mono bg-[#161920] px-1.5 py-0.5 rounded">WDA_EXCLUDEFROMCAPTURE</code>. Окно суфлера физически рендерится только на монитор пользователя и полностью исключается из видеокодеков захвата экрана.
                </p>
              </div>

              {/* Supported App Badges with Active Green Dots */}
              <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                {['Zoom', 'Google Meet', 'Microsoft Teams', 'Slack Huddles', 'Discord', 'Cisco Webex'].map((app, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#121620] border border-white/5 text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{app}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2: Anti-AI Speech Tone */}
            <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <Zap className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">Анти-ИИ манера речи</h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed mb-4">
                  Полный запрет на шаблонные списки, вступительные вежливости и нудные академические эссе. Ответ формулируется от первого лица живым сленгом опытного разработчика.
                </p>
              </div>

              {/* Visual Comparison Pill */}
              <div className="space-y-2 text-[11px] font-mono">
                <div className="p-2 rounded-lg bg-red-500/[0.06] border border-red-500/20 text-red-300 line-through truncate opacity-70">
                  ❌ "Конечно! Давайте подробно разберем ключевые..."
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/[0.08] border border-emerald-500/30 text-emerald-300 truncate font-sans font-medium flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>«В продакшене мы обычно тюним тредпул libuv...»</span>
                </div>
              </div>
            </div>

            {/* Card 3: Vision OCR Snipper */}
            <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.15)]">
                    <Camera className="w-5 h-5 text-sky-400" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/5">
                    Шорткат ⌘⇧S
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white mb-2">Мгновенный скан экрана (OCR)</h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed mb-4">
                  Одной кнопкой выделяй условия алгоритмических задач на LeetCode, куски кода или схемы System Design. Нейросеть сразу выдает оптимальное решение.
                </p>
              </div>

              {/* Animated Reticle Preview */}
              <div className="relative rounded-lg bg-[#080a0f] p-3 border border-white/5 overflow-hidden">
                <div className="absolute inset-0 bg-sky-500/[0.03] animate-pulse" />
                <div className="absolute left-0 right-0 h-0.5 bg-sky-400/80 animate-scanline shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                <div className="flex justify-between items-center text-[10px] font-mono text-[#64748B]">
                  <span>[OCR сканер задачи]</span>
                  <span className="text-sky-400 font-semibold">1200x800 CROP</span>
                </div>
                <div className="text-[10px] text-zinc-400 font-mono mt-1 truncate">
                  &gt; def solve(graph: Dict[int, List[int]])...
                </div>
              </div>
            </div>

            {/* Card 4: Sub-350ms Audio Ingestion */}
            <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                    <Mic className="w-5 h-5 text-red-400" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                    Live Stream
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white mb-2">Захват речи быстрее 350мс</h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed mb-4">
                  Прямое подключение к системному аудиопотоку через CoreAudio и Web Speech API. Распознает вопросы собеседника на лету без необходимости вручную нажимать кнопки.
                </p>
              </div>

              {/* Animated Jumping Equalizer in Card */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#080a0f] border border-white/5">
                <span className="text-[10px] font-mono text-[#64748B]">Адаптивный шумоподавитель</span>
                <div className="flex items-center gap-1 h-5">
                  {[12, 22, 16, 26, 8, 20, 14, 18].map((h, i) => (
                    <div 
                      key={i} 
                      className="w-1 bg-gradient-to-t from-red-500 to-amber-400 rounded-full"
                      style={{ 
                        height: `${h}px`,
                        animation: `soundWaveBar 0.${9 + (i % 4)}s ease-in-out infinite`,
                        animationDelay: `${i * 0.1}s`,
                        transformOrigin: 'bottom'
                      }} 
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Card 5: Camera Notch Prompter */}
            <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.15)]">
                    <Eye className="w-5 h-5 text-yellow-400" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-300 border border-yellow-500/20">
                    Естественный контакт
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white mb-2">Суфлер под вырез камеры</h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed mb-4">
                  Компактная полоса суфлера высотой всего 36px закрепляется прямо под объективом твоей веб-камеры. Твой взгляд всегда направлен собеседнику прямо в глаза.
                </p>
              </div>

              {/* Simulated Camera Notch UI */}
              <div className="p-2.5 rounded-lg bg-[#080a0f] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-zinc-800 border border-zinc-600 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-300">Оптическая ось камеры</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold">100% фиксация взгляда</span>
              </div>
            </div>

            {/* Card 6: Bring Your Own API Key (Security) */}
            <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                    <Lock className="w-5 h-5 text-purple-400" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    BYOK архитектура
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white mb-2">Локальное шифрование ключей</h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed mb-4">
                  Твои API ключи шифруются локально в macOS Keychain / Windows DPAPI. Никаких подписок, никаких централизованных серверов и нуль логов.
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-2 border-t border-white/5">
                <span className="text-white font-medium">Gemini 2.0 • Groq • OpenAI • Claude</span>
                <span className="text-emerald-400">0 облачных логов</span>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 5. ARCHITECTURE & PRIVACY COMPARISON MATRIX               */}
        {/* ======================================================== */}
        <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto w-full" id="comparison">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-mono text-[#64748B] uppercase tracking-wider">Бенчмарк</span>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mt-1">Техническое сравнение</h2>
            <p className="text-sm text-[#94A3B8] mt-2">Чем xGhost Copilot кардинально отличается от обычных веб-чатботов и сторонних программ.</p>
          </div>

          <div className="w-full overflow-x-auto rounded-2xl border border-white/10 bg-[#0c0e14] shadow-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="border-b border-white/5 font-mono text-[#64748B]">
                <tr>
                  <th className="py-4 px-6 font-normal">Критерий</th>
                  <th className="py-4 px-6 font-normal">Обычный веб-чат (ChatGPT)</th>
                  <th className="py-4 px-6 font-semibold text-white bg-white/[0.02]">xGhost Copilot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[#94A3B8]">
                <tr>
                  <td className="py-4 px-6 text-white font-medium">Скрытие при демонстрации экрана</td>
                  <td className="py-4 px-6 text-[#64748B]">Виден в записи и стриме собеседнику</td>
                  <td className="py-4 px-6 text-emerald-400 bg-white/[0.02] font-semibold">100% аппаратно исключен из захвата</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-white font-medium">Скорость первой фразы</td>
                  <td className="py-4 px-6 text-[#64748B]">Задержка 3–6 секунд</td>
                  <td className="py-4 px-6 text-emerald-400 bg-white/[0.02] font-semibold">&lt; 850мс (мгновенный хук)</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-white font-medium">Подача и стиль ответа</td>
                  <td className="py-4 px-6 text-[#64748B]">Сухие эссе, нумерованные списки</td>
                  <td className="py-4 px-6 text-white bg-white/[0.02]">Живая речь от первого лица разработчика</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-white font-medium">Зрительный контакт с камерой</td>
                  <td className="py-4 px-6 text-[#64748B]">Глаза бегают по второму монитору</td>
                  <td className="py-4 px-6 text-white bg-white/[0.02]">Суфлер точно под объективом веб-камеры</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-white font-medium">Приватность и безопасность</td>
                  <td className="py-4 px-6 text-[#64748B]">Логи на сервере, платная подписка</td>
                  <td className="py-4 px-6 text-white bg-white/[0.02]">Локальные свои ключи, 0 телеметрии</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 6. DOWNLOAD & VERIFICATION SECTION                       */}
        {/* ======================================================== */}
        <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto w-full" id="download">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-mono text-[#64748B] uppercase tracking-wider">Релизы</span>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mt-1">Скачать xGhost Copilot</h2>
            <p className="text-sm text-[#94A3B8] mt-2">Нативные десктопные сборки со встроенной стелс-защитой.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto mb-10">
            {/* macOS */}
            <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Apple className="w-4 h-4 text-white fill-current" />
                    <span className="text-sm font-semibold text-white">macOS Universal</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Apple Silicon (M1–M5)
                  </span>
                </div>
                <p className="text-xs text-[#94A3B8] mb-4">Нативный DMG-пакет ARM64 для macOS 13+ (Ventura, Sonoma, Sequoia).</p>
                <div className="space-y-1.5 text-[11px] font-mono text-[#64748B] mb-5 bg-[#080a0f] p-3 rounded-xl border border-white/5">
                  <div className="flex justify-between"><span>Версия</span><span className="text-white">1.0.4 Release</span></div>
                  <div className="flex justify-between"><span>Архитектура</span><span className="text-emerald-400">arm64 (Native)</span></div>
                  <div className="flex justify-between"><span>Маскировка</span><span className="text-white">NSWindowSharingNone</span></div>
                </div>
              </div>
              <a
                href="https://github.com/Xalid-Go/xGhost/releases/download/v1.0.0/xGhost-Copilot-1.0.0-arm64.dmg"
                target="_blank"
                rel="noreferrer"
                className="relative overflow-hidden group/btn flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:scale-[1.01]"
              >
                <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-shimmer bg-gradient-to-r from-transparent via-black/10 to-transparent pointer-events-none" />
                <Download className="w-4 h-4" />
                <span>Скачать для macOS (.dmg, 97 МБ)</span>
              </a>
            </div>

            {/* Windows */}
            <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-sky-400" />
                    <span className="text-sm font-semibold text-white">Windows Standalone</span>
                  </div>
                  <span className="text-[11px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                    x64 Portable
                  </span>
                </div>
                <p className="text-xs text-[#94A3B8] mb-4">Портативный .exe без установки для Windows 10 &amp; 11 с DirectX-маскировкой.</p>
                <div className="space-y-1.5 text-[11px] font-mono text-[#64748B] mb-5 bg-[#080a0f] p-3 rounded-xl border border-white/5">
                  <div className="flex justify-between"><span>Версия</span><span className="text-white">1.0.0 Release</span></div>
                  <div className="flex justify-between"><span>Тип</span><span className="text-white">Portable (Без установки)</span></div>
                  <div className="flex justify-between"><span>Маскировка</span><span className="text-white">WDA_EXCLUDEFROMCAPTURE</span></div>
                </div>
              </div>
              <a
                href="https://github.com/Xalid-Go/xGhost/releases/download/v1.0.0/xGhost-Copilot-Setup-1.0.0.exe"
                target="_blank"
                rel="noreferrer"
                className="relative overflow-hidden group/btn flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#161920] hover:bg-[#1e232e] text-white font-semibold text-xs border border-white/10 transition-all hover:scale-[1.01]"
              >
                <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                <Download className="w-4 h-4 text-sky-400" />
                <span>Скачать для Windows (.exe, 73 МБ)</span>
              </a>
            </div>
          </div>

          {/* 30-Second Verification Test */}
          <div className="max-w-3xl mx-auto glass-panel border-white/10 rounded-2xl p-5">
            <div className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>30-секундный тест на скрытность</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-[#94A3B8]">
              <div className="bg-[#12151c] p-3.5 rounded-xl border border-white/5 hover:border-emerald-500/20 transition-colors">
                <span className="text-[10px] font-mono text-emerald-400 font-bold">01</span>
                <p className="mt-1 text-white font-medium text-[11px]">Запусти запись экрана</p>
                <p className="text-[10px] text-[#64748B] mt-0.5 leading-relaxed">Включи запись полного экрана в QuickTime, Zoom или OBS.</p>
              </div>
              <div className="bg-[#12151c] p-3.5 rounded-xl border border-white/5 hover:border-emerald-500/20 transition-colors">
                <span className="text-[10px] font-mono text-emerald-400 font-bold">02</span>
                <p className="mt-1 text-white font-medium text-[11px]">Открой xGhost</p>
                <p className="text-[10px] text-[#64748B] mt-0.5 leading-relaxed">Нажми ⌥Пробел или ⌘⇧Пробел. Окно суфлера отображается на твоем экране.</p>
              </div>
              <div className="bg-[#12151c] p-3.5 rounded-xl border border-white/5 hover:border-emerald-500/20 transition-colors">
                <span className="text-[10px] font-mono text-emerald-400 font-bold">03</span>
                <p className="mt-1 text-white font-medium text-[11px]">Проверь видео</p>
                <p className="text-[10px] text-[#64748B] mt-0.5 leading-relaxed">Останови и открой видеозапись: окно полностью исключено операционной системой.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 7. FREQUENTLY ASKED QUESTIONS (ACCORDION)                 */}
        {/* ======================================================== */}
        <section className="py-20 px-6 lg:px-12 max-w-4xl mx-auto w-full" id="faq">
          <div className="text-center mb-12">
            <span className="text-xs font-mono text-[#64748B] uppercase tracking-wider">Ответы на вопросы</span>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mt-1">Часто задаваемые вопросы</h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'Действительно ли окно не видно при демонстрации всего экрана в Zoom или Google Meet?',
                a: 'Да. На macOS приложение вызывает нативное API Apple NSWindow.sharingType = .none. Это указывает Quartz Compositor и диспетчеру окон операционной системы полностью исключить буфер окна из любого внешнего захвата экрана (включая Zoom, Teams, Google Meet, QuickTime и Slack). На Windows используется SetWindowDisplayAffinity(hwnd, WDA_EXCLUDEFROMCAPTURE), что дает аналогичное аппаратное исключение на уровне пайплайна DirectX.'
              },
              {
                q: 'Почему интервьюер не поймет, что я читаю подсказку нейросети?',
                a: 'Обычный ChatGPT выдает структурированные лекционные эссе со списками, вводными вежливостями ("Конечно! Давайте разберем...") и сухими выводами. xGhost использует анти-ИИ промптинг: выдает быстрый хук на 1-ю секунду, который вы можете сразу уверенно начать говорить, связный скрипт рассуждения от первого лица и готовые ответы на возможные каверзные вопросы.'
              },
              {
                q: 'Нужно ли платить ежемесячную подписку или передавать куда-то звук?',
                a: 'Нет. xGhost работает по строгой модели BYOK (Bring Your Own Key). Вы вставляете свой бесплатный API ключ Gemini 2.0 Flash или Groq в настройках. Ваши ключи шифруются локально в Keychain/DPAPI вашей системы. Ни аудиозаписи, ни скриншоты, ни текст собеседования никогда не отправляются ни на какие сторонние сервера.'
              },
              {
                q: 'Как режим суфлера под камеру помогает сохранять зрительный контакт?',
                a: 'Большинство кандидатов выдают себя бегающими глазами на второй монитор или в браузер. В xGhost есть режим ультракомпактного суфлера высотой всего 36px, который прикрепляется прямо под объектив вашей веб-камеры. Читая ключевые тезисы, вы смотрите ровно в объектив камеры, создавая уверенный зрительный контакт.'
              }
            ].map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div 
                  key={idx} 
                  className={`glass-panel rounded-xl overflow-hidden transition-all duration-300 ${
                    isOpen ? 'border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.08)]' : 'border-white/5 hover:border-white/10'
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 text-left flex items-center justify-between text-white font-medium text-xs hover:text-emerald-400 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-400' : 'text-[#64748B]'}`}>
                      <ChevronDown className="w-4 h-4 shrink-0 ml-2" />
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-[#94A3B8] text-xs leading-relaxed border-t border-white/5 animate-fadeIn">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* FLOATING PERSISTENT ACTION PILL */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#0c0f17]/90 backdrop-blur-2xl border border-emerald-500/30 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(16,185,129,0.15)] px-4 py-2 rounded-full flex items-center gap-3 animate-fadeInUp max-w-[95vw]">
          <div className="flex items-center gap-2 pr-1 border-r border-white/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-mono font-medium text-white hidden sm:inline">xGhost v1.0.4</span>
          </div>

          {onLaunchDemo && (
            <button
              onClick={onLaunchDemo}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#161920] hover:bg-[#1e232e] text-xs text-emerald-400 font-mono transition-all hover:scale-105 active:scale-95"
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Запустить веб-HUD</span>
            </button>
          )}

          <a
            href="#download"
            className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold shadow-md transition-all hover:scale-105 active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Скачать</span>
          </a>
        </div>

        {/* FOOTER */}
        <footer className="py-12 border-t border-white/5 text-xs text-[#64748B] bg-[#05070a]">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Logo size={20} />
              <span className="font-semibold text-white">xGhost Copilot</span>
              <span>•</span>
              <span>Опенсорсный невидимый ассистент</span>
            </div>

            <div className="flex items-center gap-5">
              <a href="https://github.com/Xalid-Go/xGhost" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
              <span>•</span>
              <a href="#stealth-cloak" className="hover:text-white transition-colors">Архитектура Cloak</a>
              <span>•</span>
              <a href="#download" className="hover:text-white transition-colors">Скачать</a>
            </div>

            <div className="font-mono text-[11px]">
              🛡️ 100% локальная приватность • Без телеметрии
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

