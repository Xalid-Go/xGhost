# Contributing to xGhost Copilot 👻

First off, thank you for considering contributing to xGhost! It's people like you that make xGhost the ultimate stealth interview companion.

## 🌟 How to Contribute

There are many ways to contribute:
- **Add new LLM providers**: (e.g. DeepSeek, Ollama / Local LLMs, Mistral).
- **Prompt Engineering**: Improve system prompts to make responses even more natural, conversational, and tailored to specific engineering roles (System Design, Distributed Systems, ML Engineering).
- **Audio loopback drivers**: Enhance virtual audio capture for macOS (BlackHole) and Windows (WASAPI loopback).
- **OCR optimizations**: Faster localized code snippet detection.
- **Translations & Documentation**: Localize prompts and UI for Spanish, Chinese, German, etc.

## 🛠️ Local Development Setup

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x
- macOS (Apple Silicon or Intel) or Windows 10/11

### Steps
1. Fork the repo and clone your fork:
   ```bash
   git clone https://github.com/Xalid-Go/xGhost.git
   cd xghost
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server (Vite + Electron):
   ```bash
   npm run dev:electron
   ```
4. Or run just the web renderer in your browser:
   ```bash
   npm run dev
   ```

## 🏗️ Project Architecture

```
xghost/
├── electron/
│   ├── main.ts         # Main process, window stealth (setContentProtection), hotkeys, OCR IPC
│   └── preload.ts      # Context bridge exposing safe desktop APIs to renderer
├── src/
│   ├── components/     # React UI: HUD overlay, Teleprompter, Audio Visualizer, Settings
│   ├── services/
│   │   ├── aiService.ts       # Unified multi-LLM orchestrator (Gemini, Groq, OpenAI, Claude)
│   │   └── storageService.ts  # Secure local key store & settings
│   ├── types.ts        # TypeScript definitions for questions, answers, and configs
│   ├── App.tsx         # HUD root controller & keyboard handler
│   └── index.css       # Tailwind CSS & custom cyber-OLED animations
└── dist / release/     # Build and installer output directories (gitignored)
```

## 📜 Pull Request Guidelines

1. **Keep it stealth**: Never compromise `setContentProtection` or add telemetry/tracking.
2. **Keep it anti-AI**: Answers must sound like a real human engineer talking out loud, never robotic textbook definitions.
3. **Write clean TypeScript**: Ensure `npm run build` succeeds without type errors before submitting your PR.
4. **License**: By contributing, you agree that your contributions will be licensed under the MIT License.
