import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Volume2, Star, RotateCcw, Loader2 } from "lucide-react";

interface Props {
  childName: string;
  unitId: number;
  onBack: () => void;
}

interface Pair {
  leader: string;
  response: string;
  lesson: string;
}

interface Lesson {
  id: number;
  number: number;
  title: string;
  callAndResponse: { leader: string; response: string } | null;
}

interface UnitDetail {
  id: number;
  number: number;
  title: string;
  lessons: Lesson[];
}

type Phase = "ready" | "leader" | "respond" | "celebrate";

export default function CallResponse({ childName, unitId, onBack }: Props) {
  const [pairIndex, setPairIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("ready");
  const [isPlayingLeader, setIsPlayingLeader] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  const { data: unit, isLoading } = useQuery<UnitDetail>({
    queryKey: [`/api/worship/units/${unitId}`],
    queryFn: async () => {
      const res = await fetch(`/api/worship/units/${unitId}`);
      return res.json();
    },
  });

  const pairs = useMemo(() => {
    if (!unit) return [];
    return unit.lessons
      .filter((lesson) => lesson.callAndResponse)
      .map((lesson) => ({
        leader: lesson.callAndResponse!.leader,
        response: lesson.callAndResponse!.response,
        lesson: lesson.title,
      }));
  }, [unit]);

  const currentPair = pairs[pairIndex];

  const handleTTS = async (text: string, voice: "onyx" | "nova" = "nova") => {
    try {
      if (voice === "onyx") {
        setIsPlayingLeader(true);
      }

      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => {
        if (voice === "onyx") {
          setIsPlayingLeader(false);
        }
      };
      audio.play();
    } catch (err) {
      console.error("TTS error:", err);
      if (voice === "onyx") {
        setIsPlayingLeader(false);
      }
    }
  };

  const startPair = () => {
    setPhase("leader");
    handleTTS(currentPair.leader, "onyx");
  };

  const moveToRespond = () => {
    setPhase("respond");
  };

  const handleResponse = () => {
    handleTTS(currentPair.response, "nova");
    setPhase("celebrate");
  };

  const nextPair = () => {
    if (pairIndex < pairs.length - 1) {
      setPairIndex(pairIndex + 1);
      setPhase("ready");
    } else {
      setShowCompletion(true);
    }
  };

  const reset = () => {
    setPairIndex(0);
    setPhase("ready");
    setShowCompletion(false);
  };

  // LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-se-blue animate-spin" />
      </div>
    );
  }

  // NO PAIRS STATE
  if (pairs.length === 0) {
    return (
      <div className="min-h-screen bg-white p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h1 className="font-display text-3xl font-bold text-gray-800 mb-6">Call & Response</h1>
          <p className="text-gray-600 font-display text-lg mb-8">No call and response lessons available in this unit yet</p>
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

  // COMPLETION SCREEN
  if (showCompletion) {
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
            className="flex justify-center gap-4 mb-6"
          >
            <Star className="w-8 h-8 text-se-green" fill="currentColor" />
            <Star className="w-8 h-8 text-se-blue" fill="currentColor" />
            <Star className="w-8 h-8 text-se-purple" fill="currentColor" />
          </motion.div>

          <h1 className="font-display text-4xl font-bold text-gray-800 mb-2">
            Perfect, {childName}!
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            You practiced all the call and response!
          </p>

          <div className="p-6 rounded-2xl bg-se-green/10 border-2 border-se-green mb-6">
            <p className="text-gray-700 font-display">
              You're learning how to respond to God's call! Keep practicing and you'll remember it perfectly!
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={reset}
            className="px-6 py-3 rounded-2xl font-display font-bold text-white bg-se-blue hover:opacity-90 transition-all flex items-center justify-center gap-2 mx-auto"
          >
            <RotateCcw className="w-5 h-5" />
            Practice Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // READY PHASE
  if (phase === "ready") {
    return (
      <div className="min-h-screen bg-white p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-8">
            <p className="text-gray-600 font-display text-sm mb-2">
              {currentPair.lesson} • Pair {pairIndex + 1} of {pairs.length}
            </p>
            <h1 className="font-display text-3xl font-bold text-gray-800">
              Call and Response Practice
            </h1>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-6">
            {/* Leader Card - Dimmed */}
            <div className="p-6 rounded-2xl border-2 border-se-blue bg-white opacity-60">
              <p className="text-xs font-display font-semibold text-gray-600 uppercase mb-2">
                The Leader Says...
              </p>
              <p className="font-display text-lg font-bold text-gray-600">
                {currentPair.leader}
              </p>
            </div>

            {/* Response Card - Dimmed */}
            <div className="p-6 rounded-2xl border-2 border-se-green bg-white opacity-60">
              <p className="text-xs font-display font-semibold text-gray-600 uppercase mb-2">
                You Respond...
              </p>
              <p className="font-display text-lg font-bold text-gray-600">
                {currentPair.response}
              </p>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={startPair}
            className="w-full px-6 py-4 rounded-2xl font-display font-bold text-white bg-se-blue text-lg hover:opacity-90 transition-all"
          >
            Start 🚀
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // LEADER PHASE
  if (phase === "leader") {
    return (
      <div className="min-h-screen bg-white p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto h-screen flex flex-col justify-between"
        >
          <div className="text-center">
            <p className="text-gray-600 font-display text-sm mb-4">Listen carefully...</p>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center">
            {/* Leader Card - Highlighted */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-8 rounded-2xl border-4 border-se-blue bg-se-blue/10 w-full max-w-md"
            >
              <p className="text-xs font-display font-semibold text-se-blue uppercase mb-3 text-center">
                The Leader Says...
              </p>
              <motion.p
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="font-display text-2xl font-bold text-se-blue text-center"
              >
                {currentPair.leader}
              </motion.p>
            </motion.div>

            {/* Response Card - Dimmed */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="p-8 rounded-2xl border-2 border-gray-200 bg-gray-50 w-full max-w-md mt-6"
            >
              <p className="text-xs font-display font-semibold text-gray-500 uppercase mb-3 text-center">
                You'll say...
              </p>
              <p className="font-display text-xl font-bold text-gray-400 text-center">
                {currentPair.response}
              </p>
            </motion.div>
          </div>

          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTTS(currentPair.leader, "onyx")}
              disabled={isPlayingLeader}
              className="flex-1 px-6 py-3 rounded-2xl font-display font-bold text-white bg-se-blue hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Volume2 className="w-5 h-5" />
              {isPlayingLeader ? "Playing..." : "Hear Again"}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={moveToRespond}
              className="flex-1 px-6 py-3 rounded-2xl font-display font-bold text-white bg-se-green hover:opacity-90 transition-all"
            >
              Got It! →
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // RESPOND PHASE
  if (phase === "respond") {
    return (
      <div className="min-h-screen bg-white p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto h-screen flex flex-col justify-between"
        >
          <div className="text-center">
            <p className="text-gray-600 font-display text-sm mb-4">Now it's your turn!</p>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center">
            {/* Leader Card - Dimmed */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 rounded-2xl border-2 border-gray-200 bg-gray-50 w-full max-w-md"
            >
              <p className="text-xs font-display font-semibold text-gray-500 uppercase mb-3 text-center">
                The Leader Said...
              </p>
              <p className="font-display text-xl font-bold text-gray-600 text-center">
                {currentPair.leader}
              </p>
            </motion.div>

            {/* Response Card - Highlighted and Pulsing */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="p-8 rounded-2xl border-4 border-se-green bg-se-green/10 w-full max-w-md mt-6"
            >
              <p className="text-xs font-display font-semibold text-se-green uppercase mb-3 text-center">
                You Say...
              </p>
              <motion.p
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="font-display text-2xl font-bold text-se-green text-center"
              >
                {currentPair.response}
              </motion.p>
            </motion.div>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleResponse}
            className="w-full px-6 py-4 rounded-2xl font-display font-bold text-white bg-se-green text-lg hover:opacity-90 transition-all"
          >
            Say the Response! 🎤
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // CELEBRATE PHASE
  if (phase === "celebrate") {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex justify-center gap-3 mb-6"
          >
            <Star className="w-8 h-8 text-se-green" fill="currentColor" />
            <Star className="w-8 h-8 text-se-blue" fill="currentColor" />
            <Star className="w-8 h-8 text-se-green" fill="currentColor" />
          </motion.div>

          <h1 className="font-display text-3xl font-bold text-gray-800 mb-3">
            Wonderful!
          </h1>

          <div className="p-6 rounded-2xl bg-se-green/10 border-2 border-se-green mb-8 max-w-md">
            <p className="text-gray-700 font-display">
              You said the response perfectly!
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={nextPair}
            className="px-8 py-3 rounded-2xl font-display font-bold text-white bg-se-blue hover:opacity-90 transition-all"
          >
            {pairIndex === pairs.length - 1 ? "See All Completions ✨" : "Next Pair →"}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return null;
}
