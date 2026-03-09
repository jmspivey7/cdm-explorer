import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Volume2, VolumeX, Loader2, PartyPopper } from "lucide-react";

interface SMJBibleStoryScene {
  sceneNumber: number;
  title: string;
  narrative: string;
  imageUrl: string | null;
  imagePrompt: string;
}

interface LessonDetail {
  id: string;
  title: string;
  scripture: string;
  bibleStoryScenes: SMJBibleStoryScene[] | null;
}

interface Props {
  childName: string;
  lessonId: string;
  onBack: () => void;
}

const KEN_BURNS_EFFECTS = [
  "scale-100 hover:scale-110",
  "scale-105 hover:scale-100",
  "scale-100 hover:scale-105 translate-x-0 hover:-translate-x-2",
  "scale-100 hover:scale-105 translate-x-0 hover:translate-x-2",
];

export default function BibleStoryExplorer({ childName, lessonId, onBack }: Props) {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: lesson, isLoading } = useQuery<LessonDetail>({
    queryKey: ["/api/smj/lessons", lessonId],
    queryFn: async () => {
      const res = await fetch(`/api/smj/lessons/${lessonId}`);
      return res.json();
    },
  });

  const scenes = lesson?.bibleStoryScenes ?? [];
  const scene = scenes[currentScene];
  const totalScenes = scenes.length;

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlayingAudio(false);
  }, []);

  const playTTS = useCallback(async (text: string) => {
    stopAudio();
    if (isMuted) return;

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
      audioRef.current = audio;
      audio.onended = () => {
        setIsPlayingAudio(false);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => setIsPlayingAudio(false);
      audio.play().catch(() => setIsPlayingAudio(false));
    } catch {
      setIsPlayingAudio(false);
    }
  }, [isMuted, stopAudio]);

  const goToScene = useCallback((index: number) => {
    stopAudio();
    if (index >= totalScenes) {
      setShowCelebration(true);
    } else {
      setCurrentScene(index);
    }
  }, [totalScenes, stopAudio]);

  useEffect(() => {
    if (scene?.narrative && !isMuted) {
      const timer = setTimeout(() => playTTS(scene.narrative), 600);
      return () => clearTimeout(timer);
    }
  }, [currentScene, scene?.narrative]);

  const toggleMute = () => {
    setIsMuted((m) => {
      const newMuted = !m;
      if (audioRef.current) {
        audioRef.current.muted = newMuted;
      }
      return newMuted;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-se-green animate-spin" />
      </div>
    );
  }

  if (!scenes.length) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 text-center">
        <p className="text-gray-500 font-display mb-6">No story scenes available for this lesson.</p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="px-6 py-3 bg-gray-100 text-gray-700 font-display font-bold rounded-2xl hover:bg-gray-200 transition-all"
        >
          Back to Menu
        </motion.button>
      </div>
    );
  }

  if (showCelebration) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: 2 }}
            className="text-7xl mb-6"
          >
            🎉
          </motion.div>
          <h2 className="font-display text-3xl font-extrabold text-gray-800 mb-3">
            Amazing, {childName}!
          </h2>
          <p className="text-gray-600 font-display text-lg mb-8">
            You finished the whole Bible story!
          </p>
          <div className="flex flex-col gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setCurrentScene(0);
                setShowCelebration(false);
              }}
              className="w-full px-6 py-4 bg-se-green text-white font-display font-bold text-lg rounded-2xl hover:bg-se-green/90 transition-all"
            >
              Read Again
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onBack}
              className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-display font-bold rounded-2xl hover:bg-gray-200 transition-all"
            >
              Back to Activities
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!scene) return null;

  const kenBurnsIndex = currentScene % KEN_BURNS_EFFECTS.length;

  return (
    <div className="pb-28">
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-100">
        {scene.imageUrl ? (
          <motion.img
            key={`scene-img-${currentScene}`}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
            src={scene.imageUrl}
            alt={scene.title}
            className={`w-full h-full object-cover transition-transform duration-[8000ms] ease-linear ${KEN_BURNS_EFFECTS[kenBurnsIndex]}`}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-se-green/20 via-se-blue/10 to-se-purple/20 flex items-center justify-center">
            <span className="text-6xl">📖</span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/60 to-transparent" />

        <div className="absolute top-4 left-4 bg-white/85 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm">
          <span className="text-gray-700 text-xs font-display font-bold">
            Scene {currentScene + 1} of {totalScenes}
          </span>
        </div>

        <button
          onClick={toggleMute}
          className="absolute top-4 right-4 bg-white/85 backdrop-blur-sm rounded-full p-2 hover:bg-white/95 transition-colors shadow-sm"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-gray-600" />
          ) : (
            <Volume2 className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>

      <div className="px-5 -mt-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={`scene-content-${currentScene}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="font-display text-2xl font-extrabold text-gray-800 mb-4">
              {scene.title}
            </h2>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-4">
              <p className="text-gray-700 font-story text-sm leading-relaxed">
                {scene.narrative}
              </p>
            </div>

          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-center gap-2 mt-6 px-5">
        {scenes.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToScene(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              idx === currentScene
                ? "bg-se-green scale-125"
                : idx < currentScene
                  ? "bg-se-green/40"
                  : "bg-gray-300"
            }`}
          />
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 px-5 pb-5 pt-8 bg-gradient-to-t from-white via-white/95 to-transparent">
        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => goToScene(currentScene - 1)}
            disabled={currentScene === 0}
            className="flex-1 rounded-2xl p-4 bg-gray-100 flex items-center justify-center gap-2
                       hover:bg-gray-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
            <span className="font-display font-bold text-gray-600 text-sm">Back</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => goToScene(currentScene + 1)}
            className="flex-1 rounded-2xl p-4 bg-se-green flex items-center justify-center gap-2
                       hover:bg-se-green/90 transition-all shadow-lg shadow-se-green/20"
          >
            <span className="font-display font-bold text-white text-sm">
              {currentScene + 1 >= totalScenes ? "Finish Story" : "Next Scene"}
            </span>
            <ChevronRight className="w-4 h-4 text-white" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
