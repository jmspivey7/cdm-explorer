import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Volume2, CheckCircle, RotateCcw, Star, Loader2 } from "lucide-react";

interface Props {
  childName: string;
  unitId: number;
  onBack: () => void;
}

interface Lesson {
  id: number;
  number: number;
  title: string;
  memoryVerse: string;
  memoryVerseReference: string;
}

interface UnitDetail {
  id: number;
  number: number;
  title: string;
  lessons: Lesson[];
}

type Mode = "learn" | "order" | "fillin" | "complete";

export default function MemoryVerse({ childName, unitId, onBack }: Props) {
  const [mode, setMode] = useState<Mode>("learn");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [orderedWords, setOrderedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [filledBlanks, setFilledBlanks] = useState<Record<number, string>>({});
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);

  const { data: unit, isLoading } = useQuery<UnitDetail>({
    queryKey: [`/api/worship/units/${unitId}`],
    queryFn: async () => {
      const res = await fetch(`/api/worship/units/${unitId}`);
      return res.json();
    },
  });

  const currentLesson = unit?.lessons[selectedLessonIndex];

  const VERSE = currentLesson?.memoryVerse || "";
  const REFERENCE = currentLesson?.memoryVerseReference || "";
  const WORDS = useMemo(() => {
    if (!VERSE) return [];
    return VERSE.replace(/[.,;:!?]/g, "").split(/\s+/);
  }, [VERSE]);

  const handleTTS = async (text: string) => {
    try {
      setIsPlayingAudio(true);
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: "nova" }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => setIsPlayingAudio(false);
      audio.play();
    } catch (err) {
      console.error("TTS error:", err);
      setIsPlayingAudio(false);
    }
  };

  const startOrderMode = () => {
    const shuffled = [...WORDS].sort(() => Math.random() - 0.5);
    setAvailableWords(shuffled);
    setOrderedWords([]);
    setMode("order");
  };

  const startFillinMode = () => {
    setFilledBlanks({});
    setMode("fillin");
  };

  const addWordToOrder = (word: string, idx: number) => {
    setOrderedWords([...orderedWords, word]);
    setAvailableWords(availableWords.filter((_, i) => i !== idx));
  };

  const removeWordFromOrder = (idx: number) => {
    const word = orderedWords[idx];
    setOrderedWords(orderedWords.filter((_, i) => i !== idx));
    setAvailableWords([...availableWords, word]);
  };

  const checkOrder = () => {
    if (orderedWords.join(" ") + "!" === VERSE) {
      setShowExplanation(true);
    } else {
      setShowExplanation(true);
    }
  };

  const checkFillin = () => {
    const filledVerse = WORDS.map((word, idx) => filledBlanks[idx] || "_").join(" ");
    if (Object.keys(filledBlanks).length === WORDS.length) {
      handleTTS("Great job! You filled in the whole verse!");
      setMode("complete");
    } else {
      setShowExplanation(true);
    }
  };

  const resetLearnMode = () => {
    setMode("learn");
    setShowExplanation(false);
  };

  // LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-se-blue animate-spin" />
      </div>
    );
  }

  // NO LESSONS STATE
  if (!unit || unit.lessons.length === 0) {
    return (
      <div className="min-h-screen bg-white p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h1 className="font-display text-3xl font-bold text-gray-800 mb-6">Memory Verse</h1>
          <p className="text-gray-600 font-display text-lg mb-8">No lessons available in this unit yet</p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="px-6 py-3 bg-gray-100 text-gray-700 font-display font-bold rounded-2xl hover:bg-gray-200 transition-all"
          >
            Back to Menu
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // LEARN MODE
  if (mode === "learn") {
    return (
      <div className="min-h-screen bg-white p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <button
            onClick={onBack}
            className="mb-6 px-4 py-2 rounded-2xl bg-gray-100 text-gray-700 font-display font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            ← Back
          </button>

          <h1 className="font-display text-3xl font-bold text-gray-800 text-center mb-8">
            Memory Verse
          </h1>

          {unit.lessons.length > 1 && (
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
              {unit.lessons.map((lesson, idx) => (
                <motion.button
                  key={lesson.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedLessonIndex(idx);
                    setMode("learn");
                  }}
                  className={`px-4 py-2 rounded-xl font-display font-semibold whitespace-nowrap transition-all ${
                    selectedLessonIndex === idx
                      ? "bg-se-blue text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Lesson {lesson.number}
                </motion.button>
              ))}
            </div>
          )}

          <div className="p-6 rounded-2xl border-2 border-se-blue bg-se-blue/5 mb-6">
            <p className="text-2xl font-display font-bold text-center text-gray-800 mb-3 leading-relaxed">
              {VERSE}
            </p>
            <p className="text-center text-se-blue font-display font-semibold">— {REFERENCE}</p>
          </div>

          <div className="flex gap-3 mb-6">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTTS(VERSE)}
              disabled={isPlayingAudio}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-display font-bold text-white bg-se-blue hover:opacity-90 transition-all disabled:opacity-50"
            >
              <Volume2 className="w-5 h-5" />
              {isPlayingAudio ? "Playing..." : "Listen"}
            </motion.button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={startOrderMode}
              className="p-4 rounded-2xl bg-se-green text-white font-display font-bold hover:opacity-90 transition-all"
            >
              📚 Word Order Game
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={startFillinMode}
              className="p-4 rounded-2xl bg-se-purple text-white font-display font-bold hover:opacity-90 transition-all"
            >
              ✏️ Fill in the Blanks
            </motion.button>
          </div>

          <p className="text-center text-gray-600 text-sm mt-6">
            Hi {childName}! Let's learn this verse together. Listen first, then try the games!
          </p>
        </motion.div>
      </div>
    );
  }

  // ORDER MODE
  if (mode === "order") {
    return (
      <div className="min-h-screen bg-white p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-2xl mx-auto"
        >
          <button
            onClick={resetLearnMode}
            className="mb-6 px-4 py-2 rounded-2xl bg-gray-100 text-gray-700 font-display font-semibold hover:bg-gray-200 transition-colors"
          >
            ← Back
          </button>

          <h2 className="font-display text-2xl font-bold text-gray-800 text-center mb-6">
            Put the Words in Order
          </h2>

          {/* Ordered words display */}
          <div className="p-4 rounded-2xl border-2 border-se-green bg-se-green/5 mb-6 min-h-24 flex flex-wrap items-center gap-2">
            {orderedWords.length === 0 ? (
              <p className="text-gray-400 w-full text-center">Tap words below to arrange them</p>
            ) : (
              orderedWords.map((word, idx) => (
                <motion.button
                  key={idx}
                  layoutId={`word-${idx}`}
                  onClick={() => removeWordFromOrder(idx)}
                  className="px-3 py-2 rounded-xl bg-se-green text-white font-display font-bold text-sm hover:opacity-80 transition-all"
                >
                  {word}
                </motion.button>
              ))
            )}
          </div>

          {/* Available words */}
          <div className="p-4 rounded-2xl border-2 border-gray-200 bg-gray-50 mb-6">
            <p className="text-sm font-display font-semibold text-gray-700 mb-3">Tap words to use them:</p>
            <div className="flex flex-wrap gap-2">
              {availableWords.map((word, idx) => (
                <motion.button
                  key={idx}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addWordToOrder(word, idx)}
                  className="px-3 py-2 rounded-xl bg-white border border-gray-300 font-display font-bold text-sm text-gray-800 hover:bg-gray-100 transition-all"
                >
                  {word}
                </motion.button>
              ))}
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={checkOrder}
            disabled={orderedWords.length === 0}
            className="w-full px-6 py-3 rounded-2xl font-display font-bold text-white bg-se-blue hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Check My Answer
          </motion.button>

          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-2xl bg-se-purple/10 border-2 border-se-purple"
            >
              <p className="text-gray-700 font-display">
                {orderedWords.join(" ") + "!" === VERSE
                  ? "🎉 Perfect! You got it right!"
                  : "Try again! The words should form the whole verse."}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  // FILLIN MODE
  if (mode === "fillin") {
    return (
      <div className="min-h-screen bg-white p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-2xl mx-auto"
        >
          <button
            onClick={resetLearnMode}
            className="mb-6 px-4 py-2 rounded-2xl bg-gray-100 text-gray-700 font-display font-semibold hover:bg-gray-200 transition-colors"
          >
            ← Back
          </button>

          <h2 className="font-display text-2xl font-bold text-gray-800 text-center mb-6">
            Fill in the Missing Words
          </h2>

          <div className="p-6 rounded-2xl border-2 border-se-purple bg-se-purple/5 mb-6">
            <p className="text-center text-gray-800 font-display leading-relaxed mb-4">
              {WORDS.map((word, idx) => (
                <span key={idx}>
                  {filledBlanks[idx] ? (
                    <span className="font-bold text-se-purple">{filledBlanks[idx]} </span>
                  ) : (
                    <span className="inline-block w-20 border-b-2 border-se-purple mx-1 h-6 align-middle"></span>
                  )}
                </span>
              ))}
            </p>
            <p className="text-center text-se-purple font-display font-semibold">— {REFERENCE}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-6">
            {WORDS.map((word, idx) => (
              <motion.div key={idx} whileTap={{ scale: 0.95 }}>
                <input
                  type="text"
                  placeholder={`Word ${idx + 1}`}
                  value={filledBlanks[idx] || ""}
                  onChange={(e) => setFilledBlanks({ ...filledBlanks, [idx]: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 bg-white font-display text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-se-purple"
                />
              </motion.div>
            ))}
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={checkFillin}
            className="w-full px-6 py-3 rounded-2xl font-display font-bold text-white bg-se-blue hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Check My Answer
          </motion.button>

          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-2xl bg-se-purple/10 border-2 border-se-purple"
            >
              <p className="text-gray-700 font-display">
                {Object.keys(filledBlanks).length === WORDS.length
                  ? "Almost there! Check your spelling."
                  : "You need to fill in more words. Keep going!"}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  // COMPLETE MODE
  return (
    <div className="min-h-screen bg-white p-6 flex flex-col items-center justify-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex justify-center gap-4 mb-6"
        >
          <Star className="w-8 h-8 text-se-green" fill="currentColor" />
          <Star className="w-8 h-8 text-se-blue" fill="currentColor" />
          <Star className="w-8 h-8 text-se-purple" fill="currentColor" />
        </motion.div>

        <h1 className="font-display text-4xl font-bold text-gray-800 mb-3">
          Amazing, {childName}!
        </h1>
        <p className="text-xl text-gray-600 mb-8">You learned the whole verse!</p>

        <div className="p-6 rounded-2xl border-2 border-se-green bg-se-green/5 mb-8 max-w-md">
          <p className="text-lg font-display font-bold text-center text-gray-800 leading-relaxed mb-2">
            {VERSE}
          </p>
          <p className="text-center text-se-green font-display font-semibold">— {REFERENCE}</p>
        </div>

        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleTTS(VERSE)}
            disabled={isPlayingAudio}
            className="px-6 py-3 rounded-2xl font-display font-bold text-white bg-se-blue hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Volume2 className="w-5 h-5" />
            {isPlayingAudio ? "Playing..." : "Hear It Again"}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={resetLearnMode}
            className="px-6 py-3 rounded-2xl font-display font-bold text-white bg-se-green hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Try Again
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
