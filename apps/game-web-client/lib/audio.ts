/**
 * Audio utilities for Web Speech API
 */

/**
 * Speak text directly using Web Speech API
 * Bypasses hook sync issues for low-latency narration
 */
export const speakTextDirect = (text: string) => {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    // Try to find a high-quality English voice
    const englishVoice =
      voices.find((v) => v.lang.startsWith("en-US")) ||
      voices.find((v) => v.lang.startsWith("en"));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  }
};
