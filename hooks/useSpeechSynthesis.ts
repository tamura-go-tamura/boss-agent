export function useSpeechSynthesis() {
  const speak = (text: string, options?: {
    rate?: number;
    pitch?: number;
    volume?: number;
    voice?: SpeechSynthesisVoice;
    lang?: string;
  }) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set options
      if (options?.rate) utterance.rate = options.rate;
      if (options?.pitch) utterance.pitch = options.pitch;
      if (options?.volume) utterance.volume = options.volume;
      if (options?.voice) utterance.voice = options.voice;
      if (options?.lang) utterance.lang = options.lang;
      
      // Default settings for boss voice
      utterance.rate = options?.rate || 0.9;
      utterance.pitch = options?.pitch || 1.0;
      utterance.volume = options?.volume || 0.8;
      utterance.lang = options?.lang || 'en-US';
      
      window.speechSynthesis.speak(utterance);
      
      return new Promise<void>((resolve) => {
        utterance.onend = () => resolve();
      });
    } else {
      console.warn('Speech synthesis not supported');
      return Promise.resolve();
    }
  };

  const stop = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const getVoices = (): SpeechSynthesisVoice[] => {
    if ('speechSynthesis' in window) {
      return window.speechSynthesis.getVoices();
    }
    return [];
  };

  const isSupported = 'speechSynthesis' in window;

  return {
    speak,
    stop,
    getVoices,
    isSupported
  };
}
