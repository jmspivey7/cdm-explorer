import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Star, RotateCcw, ArrowLeft } from "lucide-react";

interface SMJStorySequenceEvent {
  order: number;
  event: string;
}

interface Props {
  childName: string;
  lessonId: string;
  storySequenceEvents: SMJStorySequenceEvent[];
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

type Phase = "playing" | "complete";

export default function StoryRetelling({ childName, lessonId, storySequenceEvents, onBack }: Props) {
  const sorted = [...storySequenceEvents].sort((a, b) => a.order - b.order);
  const [phase, setPhase] = useState<Phase>("playing");
  const [remaining, setRemaining] = useState<SMJStorySequenceEvent[]>([]);
  const [completed, setCompleted] = useState<SMJStorySequenceEvent[]>([]);
  const [nextExpectedOrder, setNextExpectedOrder] = useState(0);
  const [wrongId, setWrongId] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState("");

  const initGame = useCallback(() => {
    const shuffled = shuffleArray(sorted);
    setRemaining(shuffled);
    setCompleted([]);
    setNextExpectedOrder(0);
    setPhase("playing");
    setWrongId(null);
    setFeedbackText("");
  }, [storySequenceEvents]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleTap = (event: SMJStorySequenceEvent) => {
    if (wrongId !== null) return;

    const expectedEvent = sorted[nextExpectedOrder];
    if (event.order === expectedEvent.order) {
      const newCompleted = [...completed, event];
      const newRemaining = remaining.filter((e) => e.order !== event.order);
      setCompleted(newCompleted);
      setRemaining(newRemaining);
      setNextExpectedOrder(nextExpectedOrder + 1);
      setFeedbackText("");

      if (newRemaining.length === 0) {
        setPhase("complete");
      }
    } else {
      setWrongId(event.order);
      setFeedbackText("Not quite — try another!");
      setTimeout(() => {
        setWrongId(null);
        setFeedbackText("");
      }, 1200);
    }
  };

  const totalEvents = sorted.length;
  const completedCount = completed.length;
  const progress = totalEvents > 0 ? (completedCount / totalEvents) * 100 : 0;

  if (phase === "complete") {
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
            Amazing, {childName}! 🎉
          </h1>
          <p className="text-gray-600 font-display text-lg mb-8">
            You put the whole story in order!
          </p>

          <div className="space-y-2 mb-8">
            {sorted.map((event, idx) => (
              <motion.div
                key={event.order}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-3 rounded-xl bg-se-green/10 border-2 border-se-green text-left flex items-center gap-3"
              >
                <CheckCircle className="w-5 h-5 text-se-green flex-shrink-0" />
                <span className="font-display text-sm text-gray-800">{event.event}</span>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={initGame}
              className="px-6 py-3 rounded-2xl font-display font-bold text-white bg-se-green hover:opacity-90 transition-all flex items-center justify-center gap-2 mx-auto"
            >
              <RotateCcw className="w-5 h-5" />
              Shuffle and Play Again
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="px-6 py-3 rounded-2xl font-display font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all mx-auto"
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
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="font-display text-3xl font-bold text-gray-800 text-center mb-2">
          Story Retelling 📖
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Tap the events in the right order, {childName}!
        </p>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <p className="font-display font-semibold text-gray-700">
              {completedCount} of {totalEvents} events placed
            </p>
          </div>
          <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-se-green"
            />
          </div>
        </div>

        {completed.length > 0 && (
          <div className="mb-6 space-y-2">
            <p className="font-display font-semibold text-se-green text-sm mb-2">✅ Completed:</p>
            {completed.map((event, idx) => (
              <motion.div
                key={event.order}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 rounded-xl bg-se-green/10 border-2 border-se-green flex items-center gap-3"
              >
                <CheckCircle className="w-5 h-5 text-se-green flex-shrink-0" />
                <span className="font-display text-sm text-gray-800">{event.event}</span>
              </motion.div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {feedbackText && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 rounded-xl bg-amber-50 border-2 border-amber-300 text-center"
            >
              <p className="font-display font-bold text-amber-700">{feedbackText}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-3">
          <p className="font-display font-semibold text-gray-500 text-sm">
            What happens next? Tap the correct event:
          </p>
          {remaining.map((event) => (
            <motion.button
              key={event.order}
              whileTap={{ scale: 0.98 }}
              animate={
                wrongId === event.order
                  ? { x: [0, -10, 10, -10, 10, 0] }
                  : {}
              }
              transition={
                wrongId === event.order
                  ? { duration: 0.4 }
                  : {}
              }
              onClick={() => handleTap(event)}
              className={`w-full p-4 rounded-2xl font-display font-bold text-left transition-all ${
                wrongId === event.order
                  ? "bg-red-100 border-2 border-red-300 text-red-700"
                  : "bg-gray-100 text-gray-800 border-2 border-gray-200 hover:bg-se-blue/5 hover:border-se-blue"
              }`}
            >
              {event.event}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
