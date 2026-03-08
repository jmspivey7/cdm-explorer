import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Star, RotateCcw, Eye } from "lucide-react";
import type { SMJCatechismPair } from "@shared/schema";

interface Props {
  childName: string;
  catechismPairs: SMJCatechismPair[];
  onBack: () => void;
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function CatechismQuiz({ childName, catechismPairs, onBack }: Props) {
  const [cards, setCards] = useState<SMJCatechismPair[]>(catechismPairs);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);

  const currentCard = cards[currentIndex];
  const total = cards.length;

  const handleTTS = useCallback(async (text: string) => {
    try {
      setIsPlayingTTS(true);
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: "nova" }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => setIsPlayingTTS(false);
      audio.onerror = () => setIsPlayingTTS(false);
      audio.play();
    } catch (err) {
      console.error("TTS error:", err);
      setIsPlayingTTS(false);
    }
  }, []);

  useEffect(() => {
    if (currentCard && !isFlipped) {
      handleTTS(currentCard.question);
    }
  }, [currentIndex]);

  const showAnswer = () => {
    setIsFlipped(true);
    if (currentCard) {
      handleTTS(currentCard.answer);
    }
  };

  const nextCard = () => {
    if (currentIndex < total - 1) {
      setIsFlipped(false);
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsComplete(true);
    }
  };

  const tryAgainShuffled = () => {
    setCards(shuffleArray(catechismPairs));
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsComplete(false);
  };

  if (!catechismPairs || catechismPairs.length === 0) {
    return (
      <div className="min-h-screen bg-white p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h1 className="font-display text-3xl font-bold text-gray-800 mb-6">Catechism Quiz</h1>
          <p className="text-gray-600 font-display text-lg mb-8">No catechism questions available for this lesson yet</p>
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

  if (isComplete) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex justify-center gap-3 mb-6"
          >
            <Star className="w-8 h-8 text-se-green" fill="currentColor" />
            <Star className="w-8 h-8 text-se-blue" fill="currentColor" />
            <Star className="w-8 h-8 text-se-purple" fill="currentColor" />
          </motion.div>

          <h1 className="font-display text-4xl font-bold text-gray-800 mb-3">
            Amazing, {childName}!
          </h1>

          <div className="p-6 rounded-2xl bg-se-green/10 border-2 border-se-green mb-6">
            <p className="font-display text-2xl font-bold text-se-green">
              {total} of {total} cards completed!
            </p>
            <p className="text-gray-600 text-sm mt-2">You went through all the catechism questions!</p>
          </div>

          <div className="flex flex-col gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={tryAgainShuffled}
              className="px-6 py-3 rounded-2xl font-display font-bold text-white bg-se-blue hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Try Again (Shuffled)
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="px-6 py-3 rounded-2xl font-display font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
            >
              Back to Menu
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

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

        <h1 className="font-display text-3xl font-bold text-gray-800 text-center mb-2">
          Catechism Cards
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Learn the answers, {childName}!
        </p>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <p className="font-display font-semibold text-gray-700">
              Card {currentIndex + 1} of {total}
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTTS(isFlipped ? currentCard.answer : currentCard.question)}
              disabled={isPlayingTTS}
              className="p-2 rounded-xl bg-se-blue/10 text-se-blue hover:bg-se-blue/20 transition-colors disabled:opacity-50"
            >
              <Volume2 className="w-5 h-5" />
            </motion.button>
          </div>
          <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + 1) / total) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-se-blue"
            />
          </div>
        </div>

        <div className="relative" style={{ perspective: "1000px", minHeight: "280px" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentIndex}-${isFlipped ? "back" : "front"}`}
              initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className={`p-8 rounded-2xl border-4 ${
                isFlipped
                  ? "border-se-green bg-se-green/5"
                  : "border-se-blue bg-se-blue/5"
              }`}
              style={{ transformStyle: "preserve-3d" }}
            >
              {currentCard.questionNumber && (
                <p className={`text-xs font-display font-semibold uppercase mb-3 text-center ${
                  isFlipped ? "text-se-green" : "text-se-blue"
                }`}>
                  {isFlipped ? "Answer" : `Question ${currentCard.questionNumber}`}
                </p>
              )}
              {!currentCard.questionNumber && (
                <p className={`text-xs font-display font-semibold uppercase mb-3 text-center ${
                  isFlipped ? "text-se-green" : "text-se-blue"
                }`}>
                  {isFlipped ? "Answer" : "Question"}
                </p>
              )}

              <p className={`font-display text-2xl font-bold text-center ${
                isFlipped ? "text-se-green" : "text-gray-800"
              }`}>
                {isFlipped ? currentCard.answer : currentCard.question}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-6">
          {!isFlipped ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={showAnswer}
              className="w-full px-6 py-4 rounded-2xl font-display font-bold text-white bg-se-green text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <Eye className="w-5 h-5" />
              Show Answer
            </motion.button>
          ) : (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: 0.95 }}
              onClick={nextCard}
              className="w-full px-6 py-4 rounded-2xl font-display font-bold text-white bg-se-purple text-lg hover:opacity-90 transition-all"
            >
              {currentIndex === total - 1 ? "See Results ✨" : "Next Card →"}
            </motion.button>
          )}
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {cards.map((_, idx) => (
            <div
              key={idx}
              className={`w-3 h-3 rounded-full transition-colors ${
                idx === currentIndex
                  ? "bg-se-blue"
                  : idx < currentIndex
                  ? "bg-se-green"
                  : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
