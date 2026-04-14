import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook dùng Web Speech API để đọc text.
 *
 * const { speak, stop, speaking } = useTTS();
 * speak('perseverance');                        // đọc với default config
 * speak('Hello world', { rate: 0.8, lang: 'en-GB' }); // custom
 */
export const useTTS = () => {
  const [speaking, setSpeaking] = useState(false);
  const utteranceRef = useRef(null);

  // Dọn dẹp khi unmount
  useEffect(() => {
    return () => window.speechSynthesis?.cancel();
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  const speak = useCallback((text, options = {}) => {
    if (!window.speechSynthesis) {
      console.warn('Web Speech API is not supported in this browser.');
      return;
    }

    // Dừng nếu đang đọc dở
    window.speechSynthesis.cancel();

    const {
      lang     = 'en-US',
      rate     = 0.85,   // chậm hơn tí để rõ chữ
      pitch    = 1,
      volume   = 1,
      voiceURI = null,   // null = dùng voice mặc định của browser
    } = options;

    const utterance      = new SpeechSynthesisUtterance(text);
    utterance.lang       = lang;
    utterance.rate       = rate;
    utterance.pitch      = pitch;
    utterance.volume     = volume;

    // Chọn voice nếu có chỉ định
    if (voiceURI) {
      const voices        = window.speechSynthesis.getVoices();
      const matchedVoice  = voices.find((v) => v.voiceURI === voiceURI);
      if (matchedVoice) utterance.voice = matchedVoice;
    }

    utterance.onstart = () => setSpeaking(true);
    utterance.onend   = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  return { speak, stop, speaking };
};

/**
 * Lấy danh sách voices tiếng Anh có sẵn trên browser.
 * Dùng để cho user chọn giọng đọc nếu muốn.
 */
export const getEnglishVoices = () => {
  if (!window.speechSynthesis) return [];
  return window.speechSynthesis
    .getVoices()
    .filter((v) => v.lang.startsWith('en'));
};
