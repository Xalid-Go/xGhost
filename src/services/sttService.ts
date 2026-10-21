// Speech-to-Text Service supporting Web Speech API & Groq/OpenAI Whisper

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export class SpeechService {
  private recognition: any = null;
  private isListening = false;
  private onTranscriptCallback: ((text: string, isFinal: boolean) => void) | null = null;
  private onVolumeCallback: ((volume: number) => void) | null = null;

  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private animationFrameId: number | null = null;

  constructor() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      this.recognition = new SpeechRec();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'ru-RU'; // Can also support en-US

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const text = finalTranscript || interimTranscript;
        if (text && this.onTranscriptCallback) {
          this.onTranscriptCallback(text, Boolean(finalTranscript));
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('[xGhost STT] Speech recognition warning/error:', event.error);
        if (event.error === 'not-allowed') {
          this.stop();
        }
      };

      this.recognition.onend = () => {
        // Auto-restart if user still wants it active
        if (this.isListening) {
          try {
            this.recognition.start();
          } catch (e) {
            // Already started or restarting
          }
        }
      };
    }
  }

  public setLanguage(lang: 'ru' | 'en') {
    if (this.recognition) {
      this.recognition.lang = lang === 'ru' ? 'ru-RU' : 'en-US';
    }
  }

  public async start(
    onTranscript: (text: string, isFinal: boolean) => void,
    onVolume?: (volume: number) => void
  ): Promise<boolean> {
    this.onTranscriptCallback = onTranscript;
    this.onVolumeCallback = onVolume || null;
    this.isListening = true;

    // Start Audio Level Analyser for Visual Waveform
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        if (!this.isListening || !this.analyser) return;
        this.analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalizedVolume = Math.min(1.0, average / 100);

        if (this.onVolumeCallback) {
          this.onVolumeCallback(normalizedVolume);
        }

        this.animationFrameId = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (err) {
      console.warn('[xGhost] Could not initialize audio meter:', err);
    }

    // Start Web Speech Recognition
    if (this.recognition) {
      try {
        this.recognition.start();
        return true;
      } catch (err) {
        console.error('[xGhost] Speech recognition start error:', err);
      }
    }
    return false;
  }

  public stop() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignored
      }
    }

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }

    if (this.onVolumeCallback) {
      this.onVolumeCallback(0);
    }
  }

  public getIsListening(): boolean {
    return this.isListening;
  }
}

export const speechService = new SpeechService();
