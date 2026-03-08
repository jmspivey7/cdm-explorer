import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, CheckCircle, RotateCcw, Star, ArrowLeft, BookOpen, Shuffle, PenTool } from "lucide-react";

interface BibleVerse {
  reference: string;
  text: string;
}

interface Props {
  childName: string;
  verses: BibleVerse[];
  onBack: () => void;
}

type Mode = "learn" | "order" | "fillin";

export default function BibleVersePractice({ childName, verses, onBack }: Props) {
  const [selectedVerseIndex, setSelectedVerseIndex] = useState(0);
  const [mode, setMode] = useState<Mode>("learn");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [orderedWords, setOrderedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [filledBlanks, setFilledBlanks] = useState<Record<number, string>>({});
  const [blankIndices, setBlankIndices] = useState<number[]>([]);
  const [fillinAvailableWords, setFillinAvailableWords] = useState<string[]>([]);
  const [orderComplete, setOrderComplete] = useState(false);
  const [fillinComplete, setFillinComplete] = useState(false);
  const [showOrderFeedback, setShowOrderFeedback] = useState<"correct" | "incorrect" | null>(null);

  const currentVerse = verses[selectedVerseIndex];
  const VERSE = currentVerse?.text || "";
  const REFERENCE = currentVerse?.reference || "";

  const WORDS = useMemo(() => {
    if (!VERSE) return [];
    return VERSE.split(/\s+/).map(w => w.trim()).filter(w => w.length > 0);
  }, [VERSE]);

  const CLEAN_WORDS = useMemo(() => {
    return WORDS.map(w => w.replace(/[.,;:!?"'()]/g, ""));
  }, [WORDS]);

  const handleTTS = useCallback(async (text: string) => {
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
  }, []);

  const selectVerse = (idx: number) => {
    setSelectedVerseIndex(idx);
    setMode("learn");
    resetState();
  };

  const resetState = () => {
    setOrderedWords([]);
    setAvailableWords([]);
    setFilledBlanks({});
    setBlankIndices([]);
    setFillinAvailableWords([]);
    setOrderComplete(false);
    setFillinComplete(false);
    setShowOrderFeedback(null);
  };

  const startOrderMode = () => {
    const shuffled = [...CLEAN_WORDS].sort(() => Math.random() - 0.5);
    setAvailableWords(shuffled);
    setOrderedWords([]);
    setOrderComplete(false);
    setShowOrderFeedback(null);
    setMode("order");
  };

  const startFillinMode = () => {
    const indices: number[] = [];
    const totalBlanks = Math.max(2, Math.floor(WORDS.length * 0.4));
    const candidateIndices = WORDS.map((_, i) => i).filter(i => CLEAN_WORDS[i].length > 2);
    const shuffledCandidates = [...candidateIndices].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(totalBlanks, shuffledCandidates.length); i++) {
      indices.push(shuffledCandidates[i]);
    }
    indices.sort((a, b) => a - b);
    setBlankIndices(indices);
    setFilledBlanks({});
    const blankedWords = indices.map(i => CLEAN_WORDS[i]);
    setFillinAvailableWords([...blankedWords].sort(() => Math.random() - 0.5));
    setFillinComplete(false);
    setMode("fillin");
  };

  const addWordToOrder = (word: string, idx: number) => {
    const newOrdered = [...orderedWords, word];
    setOrderedWords(newOrdered);
    setAvailableWords(availableWords.filter((_, i) => i !== idx));

    if (newOrdered.length === CLEAN_WORDS.length) {
      const isCorrect = newOrdered.every((w, i) => w.toLowerCase() === CLEAN_WORDS[i].toLowerCase());
      if (isCorrect) {
        setOrderComplete(true);
        setShowOrderFeedback("correct");
        handleTTS("Great job! You put all the words in the right order!");
      } else {
        setShowOrderFeedback("incorrect");
      }
    }
  };

  const removeWordFromOrder = (idx: number) => {
    const word = orderedWords[idx];
    setOrderedWords(orderedWords.filter((_, i) => i !== idx));
    setAvailableWords([...availableWords, word]);
    setShowOrderFeedback(null);
  };

  const handleFillinTap = (word: string, wordIdx: number) => {
    const nextBlankIdx = blankIndices.find(bi => filledBlanks[bi] === undefined);
    if (nextBlankIdx === undefined) return;

    const correctWord = CLEAN_WORDS[nextBlankIdx];
    if (word.toLowerCase() === correctWord.toLowerCase()) {
      const newFilled = { ...filledBlanks, [nextBlankIdx]: WORDS[nextBlankIdx] };
      setFilledBlanks(newFilled);
      setFillinAvailableWords(fillinAvailableWords.filter((_, i) => i !== wordIdx));

      if (Object.keys(newFilled).length === blankIndices.length) {
        setFillinComplete(true);
        handleTTS("Amazing! You filled in all the words correctly!");
      }
    }
  };

  const goBackToLearn = () => {
    setMode("learn");
    resetState();
  };

  if (!verses || verses.length === 0) {
    return (
      <div className="min-h-screen bg-white p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h1 className="font-display text-3xl font-bold text-gray-800 mb-6">Bible Verse Practice</h1>
          <p className="text-gray-600 font-display text-lg mb-8">No Bible verses available for this lesson yet</p>
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

  if (orderComplete || fillinComplete) {
    return (
      <div className="min-h-screen bg-white p-6 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="flex justify-center gap-4 mb-6"
          >
            <Star className="w-8 h-8 text-se-green" fill="currentColor" />
            <Star className="w-8 h-8 text-se-blue" fill="currentColor" />
            <Star className="w-8 h-8 text-se-purple" fill="currentColor" />
          </motion.div>

          <h1 className="font-display text-4xl font-bold text-gray-800 mb-3">
            Amazing, {childName}!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {orderComplete ? "You put all the words in order!" : "You filled in all the blanks!"}
          </p>

          <div className="p-6 rounded-2xl border-2 border-se-green bg-se-green/5 mb-8 max-w-md mx-auto">
            <p className="text-lg font-display font-bold text-center text-gray-800 leading-relaxed mb-2">
              {VERSE}
            </p>
            <p className="text-center text-se-green font-display font-semibold">— {REFERENCE}</p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
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
              onClick={goBackToLearn}
              className="px-6 py-3 rounded-2xl font-display font-bold text-white bg-se-green hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Try Again
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="px-6 py-3 rounded-2xl font-display font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Menu
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

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
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <h1 className="font-display text-3xl font-bold text-gray-800 text-center mb-8">
            Bible Verse Practice
          </h1>

          {verses.length > 1 && (
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
              {verses.map((verse, idx) => (
                <motion.button
                  key={idx}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => selectVerse(idx)}
                  className={`px-4 py-2 rounded-xl font-display font-semibold whitespace-nowrap transition-all ${
                    selectedVerseIndex === idx
                      ? "bg-se-blue text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {verse.reference}
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
              onClick={() => handleTTS(`${VERSE}. ${REFERENCE}`)}
              disabled={isPlayingAudio}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-display font-bold text-white bg-se-blue hover:opacity-90 transition-all disabled:opacity-50"
            >
              <Volume2 className="w-5 h-5" />
              {isPlayingAudio ? "Playing..." : "Listen"}
            </motion.button>
          </div>

          <div className="flex gap-2 mb-6 bg-gray-100 rounded-2xl p-1">
            <button
              onClick={() => setMode("learn")}
              className="flex-1 px-4 py-2 rounded-xl font-display font-bold text-sm transition-all bg-white text-gray-800 shadow-sm"
            >
              <BookOpen className="w-4 h-4 inline mr-1" /> Learn
            </button>
            <button
              onClick={startOrderMode}
              className="flex-1 px-4 py-2 rounded-xl font-display font-bold text-sm transition-all text-gray-500 hover:text-gray-700"
            >
              <Shuffle className="w-4 h-4 inline mr-1" /> Order
            </button>
            <button
              onClick={startFillinMode}
              className="flex-1 px-4 py-2 rounded-xl font-display font-bold text-sm transition-all text-gray-500 hover:text-gray-700"
            >
              <PenTool className="w-4 h-4 inline mr-1" /> Fill In
            </button>
          </div>

          <p className="text-center text-gray-600 text-sm mt-4">
            Hi {childName}! Let's learn this verse together. Listen first, then try the games!
          </p>
        </motion.div>
      </div>
    );
  }

  if (mode === "order") {
    return (
      <div className="min-h-screen bg-white p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-2xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={goBackToLearn}
              className="px-4 py-2 rounded-2xl bg-gray-100 text-gray-700 font-display font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <p className="text-sm text-gray-500 font-display">{REFERENCE}</p>
          </div>

          <div className="flex gap-2 mb-6 bg-gray-100 rounded-2xl p-1">
            <button
              onClick={goBackToLearn}
              className="flex-1 px-4 py-2 rounded-xl font-display font-bold text-sm transition-all text-gray-500 hover:text-gray-700"
            >
              <BookOpen className="w-4 h-4 inline mr-1" /> Learn
            </button>
            <button
              className="flex-1 px-4 py-2 rounded-xl font-display font-bold text-sm transition-all bg-white text-gray-800 shadow-sm"
            >
              <Shuffle className="w-4 h-4 inline mr-1" /> Order
            </button>
            <button
              onClick={startFillinMode}
              className="flex-1 px-4 py-2 rounded-xl font-display font-bold text-sm transition-all text-gray-500 hover:text-gray-700"
            >
              <PenTool className="w-4 h-4 inline mr-1" /> Fill In
            </button>
          </div>

          <h2 className="font-display text-2xl font-bold text-gray-800 text-center mb-6">
            Put the Words in Order
          </h2>

          <div className="p-4 rounded-2xl border-2 border-se-green bg-se-green/5 mb-6 min-h-24 flex flex-wrap items-center gap-2">
            {orderedWords.length === 0 ? (
              <p className="text-gray-400 w-full text-center font-display">Tap words below to arrange them</p>
            ) : (
              orderedWords.map((word, idx) => (
                <motion.button
                  key={`ordered-${idx}`}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => removeWordFromOrder(idx)}
                  className="px-3 py-2 rounded-xl bg-se-green text-white font-display font-bold text-sm hover:opacity-80 transition-all"
                >
                  {word}
                </motion.button>
              ))
            )}
          </div>

          <div className="p-4 rounded-2xl border-2 border-gray-200 bg-gray-50 mb-6">
            <p className="text-sm font-display font-semibold text-gray-700 mb-3">Tap words to use them:</p>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {availableWords.map((word, idx) => (
                  <motion.button
                    key={`avail-${idx}-${word}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addWordToOrder(word, idx)}
                    className="px-3 py-2 rounded-xl bg-white border border-gray-300 font-display font-bold text-sm text-gray-800 hover:bg-gray-100 transition-all"
                  >
                    {word}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {showOrderFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl mb-4 ${
                showOrderFeedback === "correct"
                  ? "bg-se-green/10 border-2 border-se-green"
                  : "bg-red-50 border-2 border-red-300"
              }`}
            >
              <p className="text-gray-700 font-display text-center">
                {showOrderFeedback === "correct"
                  ? "🎉 Perfect! You got it right!"
                  : "Not quite right — tap words to remove and try again!"}
              </p>
              {showOrderFeedback === "incorrect" && (
                <div className="flex justify-center mt-3">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={startOrderMode}
                    className="px-4 py-2 rounded-xl bg-se-blue text-white font-display font-bold text-sm"
                  >
                    <RotateCcw className="w-4 h-4 inline mr-1" /> Shuffle & Restart
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  if (mode === "fillin") {
    return (
      <div className="min-h-screen bg-white p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-2xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={goBackToLearn}
              className="px-4 py-2 rounded-2xl bg-gray-100 text-gray-700 font-display font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <p className="text-sm text-gray-500 font-display">{REFERENCE}</p>
          </div>

          <div className="flex gap-2 mb-6 bg-gray-100 rounded-2xl p-1">
            <button
              onClick={goBackToLearn}
              className="flex-1 px-4 py-2 rounded-xl font-display font-bold text-sm transition-all text-gray-500 hover:text-gray-700"
            >
              <BookOpen className="w-4 h-4 inline mr-1" /> Learn
            </button>
            <button
              onClick={startOrderMode}
              className="flex-1 px-4 py-2 rounded-xl font-display font-bold text-sm transition-all text-gray-500 hover:text-gray-700"
            >
              <Shuffle className="w-4 h-4 inline mr-1" /> Order
            </button>
            <button
              className="flex-1 px-4 py-2 rounded-xl font-display font-bold text-sm transition-all bg-white text-gray-800 shadow-sm"
            >
              <PenTool className="w-4 h-4 inline mr-1" /> Fill In
            </button>
          </div>

          <h2 className="font-display text-2xl font-bold text-gray-800 text-center mb-6">
            Fill in the Missing Words
          </h2>

          <div className="p-6 rounded-2xl border-2 border-se-purple bg-se-purple/5 mb-6">
            <p className="text-center text-gray-800 font-display text-lg leading-relaxed mb-4 flex flex-wrap justify-center gap-1">
              {WORDS.map((word, idx) => (
                <span key={idx}>
                  {blankIndices.includes(idx) ? (
                    filledBlanks[idx] ? (
                      <motion.span
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="font-bold text-se-purple"
                      >
                        {filledBlanks[idx]}
                      </motion.span>
                    ) : (
                      <span className="inline-block min-w-16 border-b-2 border-se-purple mx-1 text-center text-gray-300">
                        ___
                      </span>
                    )
                  ) : (
                    <span>{word}</span>
                  )}
                </span>
              ))}
            </p>
            <p className="text-center text-se-purple font-display font-semibold">— {REFERENCE}</p>
          </div>

          <div className="p-4 rounded-2xl border-2 border-gray-200 bg-gray-50 mb-6">
            <p className="text-sm font-display font-semibold text-gray-700 mb-3">Tap the correct word:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <AnimatePresence>
                {fillinAvailableWords.map((word, idx) => (
                  <motion.button
                    key={`fillin-${idx}-${word}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleFillinTap(word, idx)}
                    className="px-4 py-2 rounded-xl bg-white border-2 border-se-purple font-display font-bold text-sm text-se-purple hover:bg-se-purple/10 transition-all"
                  >
                    {word}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 font-display">
            <CheckCircle className="w-4 h-4" />
            {Object.keys(filledBlanks).length} / {blankIndices.length} words filled
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}
