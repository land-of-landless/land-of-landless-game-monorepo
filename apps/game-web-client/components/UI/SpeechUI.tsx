import { useEffect, useState } from "react";
import { useSpeech } from "rooks";
import { Volume2, StopCircle } from "lucide-react";

/**
 * Text-to-Speech Settings UI Component
 */
export const SpeechUI = () => {
  const [text, setText] = useState(
    "Greetings, welcome to the grand central hall of landless.",
  );
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState<number>(0);

  useEffect(() => {
    const updateVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      // Auto-select English if available
      const enIdx = availableVoices.findIndex((v) =>
        v.lang.startsWith("en-US"),
      );
      if (enIdx !== -1) setSelectedVoiceIndex(enIdx);
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const selectedVoice = voices[selectedVoiceIndex] || null;

  const { start, stop, isPlaying } = useSpeech({
    text,
    voiceURI: selectedVoice?.voiceURI,
    language: selectedVoice?.lang || "en-US",
  });

  return (
    <div className="absolute bottom-5 right-5 text-white bg-slate-950/80 p-4 rounded-xl flex flex-col gap-2 min-w-[240px] z-40 pointer-events-auto border border-slate-700/50 shadow-2xl backdrop-blur-md transition hover:border-pink-500/20">
      <h2 className="font-display text-xs font-bold tracking-widest text-pink-400 flex items-center gap-2 uppercase">
        <Volume2 size={16} />
        Acoustic Guide
      </h2>

      {voices.length > 0 && (
        <select
          value={selectedVoiceIndex}
          onChange={(e) => setSelectedVoiceIndex(parseInt(e.target.value))}
          className="bg-slate-900 border border-slate-700 rounded p-1 text-[10px] text-slate-200 focus:outline-none"
        >
          {voices.map((voice, index) => (
            <option key={index} value={index}>
              {voice.name.length > 25
                ? voice.name.slice(0, 25) + "..."
                : voice.name}{" "}
              ({voice.lang})
            </option>
          ))}
        </select>
      )}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="bg-slate-900 border border-slate-700 rounded p-1.5 text-[11px] text-white focus:outline-none focus:border-pink-500 h-14 resize-none font-sans"
        placeholder="Enter announcement text..."
      />

      <div className="flex gap-2">
        <button
          onClick={start}
          disabled={isPlaying || !text.trim()}
          className={`flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-bold transition cursor-pointer ${
            isPlaying || !text.trim()
              ? "bg-slate-800 text-slate-500 cursor-not-allowed opacity-50"
              : "bg-pink-600 hover:bg-pink-500 text-white"
          }`}
        >
          <Volume2 size={12} />
          {isPlaying ? "Speaking..." : "Broadcast"}
        </button>

        <button
          onClick={stop}
          disabled={!isPlaying}
          className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-bold transition cursor-pointer ${
            !isPlaying
              ? "bg-slate-850 text-slate-700 cursor-not-allowed opacity-30"
              : "bg-slate-800 hover:bg-slate-700 text-red-400 border border-red-900/30"
          }`}
        >
          <StopCircle size={12} />
          Stop
        </button>
      </div>
    </div>
  );
};
