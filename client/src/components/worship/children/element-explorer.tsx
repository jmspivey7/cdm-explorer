import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Megaphone,
  HandHeart,
  Music,
  ScrollText,
  HeartCrack,
  Sun,
  BookOpen,
  MessageCircle,
  Droplets,
  Hand,
  Star,
  Lightbulb,
  Volume2,
  Sparkles,
} from "lucide-react";
import type { WorshipElement } from "@shared/curriculum-data";

interface Props {
  childName: string;
}

const ICON_MAP: Record<string, any> = {
  megaphone: Megaphone,
  "hand-heart": HandHeart,
  music: Music,
  "scroll-text": ScrollText,
  "heart-crack": HeartCrack,
  sun: Sun,
  "book-open": BookOpen,
  "message-circle": MessageCircle,
  droplets: Droplets,
  hand: Hand,
  star: Star,
  lightbulb: Lightbulb,
};

export default function ElementExplorer({ childName }: Props) {
  const [elements, setElements] = useState<WorshipElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<WorshipElement | null>(null);
  const [story, setStory] = useState<string | null>(null);
  const [isLoadingStory, setIsLoadingStory] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchElements = async () => {
      try {
        const res = await fetch("/api/worship/elements");
        const data = await res.json();
        setElements(data);
      } catch (err) {
        setError("Failed to load worship elements");
        console.error(err);
      }
    };
    fetchElements();
  }, []);

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

  const handleGenerateStory = async () => {
    if (!selectedElement) return;
    try {
      setIsLoadingStory(true);
      const res = await fetch("/api/worship/ai/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ elementId: selectedElement.id }),
      });
      const data = await res.json();
      setStory(data.story);
    } catch (err) {
      console.error("Error generating story:", err);
      setError("Failed to generate story");
    } finally {
      setIsLoadingStory(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <p className="text-gray-600 text-center">{error}</p>
      </div>
    );
  }

  if (!selectedElement) {
    return (
      <div className="min-h-screen bg-white p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-display text-3xl font-bold text-gray-800 mb-2">
            Explore Worship Elements
          </h1>
          <p className="text-gray-600">
            Hi {childName}! Tap on an element to learn more about it.
          </p>
        </motion.div>

        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          {elements.map((element, idx) => {
            const IconComponent = ICON_MAP[element.icon] || Sparkles;
            return (
              <motion.button
                key={element.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedElement(element)}
                className="flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all hover:shadow-lg"
                style={{ borderColor: element.color, backgroundColor: `${element.color}15` }}
              >
                <div
                  className="p-3 rounded-full text-white"
                  style={{ backgroundColor: element.color }}
                >
                  <IconComponent className="w-5 h-5" />
                </div>
                <p className="text-xs font-display font-bold text-gray-800 text-center leading-tight">
                  {element.name}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  const ElementIcon = ICON_MAP[selectedElement.icon] || Sparkles;

  return (
    <div className="min-h-screen bg-white p-6">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setSelectedElement(null);
          setStory(null);
        }}
        className="mb-6 px-4 py-2 rounded-2xl bg-gray-100 text-gray-700 font-display font-semibold hover:bg-gray-200 transition-colors"
      >
        ← Back
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        {/* Detail Card */}
        <div
          className="p-6 rounded-2xl border-2 mb-6"
          style={{ borderColor: selectedElement.color, backgroundColor: `${selectedElement.color}08` }}
        >
          <div className="flex items-start gap-4 mb-4">
            <div
              className="p-4 rounded-full text-white flex-shrink-0"
              style={{ backgroundColor: selectedElement.color }}
            >
              <ElementIcon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="font-display text-2xl font-bold text-gray-800 mb-2">
                {selectedElement.name}
              </h2>
              <p className="text-gray-600 font-medium">{selectedElement.shortDescription}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-display font-semibold text-gray-700 mb-1">What does it mean?</p>
              <p className="text-gray-700 leading-relaxed">{selectedElement.childFriendlyExplanation}</p>
            </div>

            {selectedElement.handMotion && (
              <div>
                <p className="text-sm font-display font-semibold text-gray-700 mb-1">Hand Motion</p>
                <p className="text-gray-700 italic">{selectedElement.handMotion}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleTTS(selectedElement.childFriendlyExplanation)}
                disabled={isPlayingAudio}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-display font-bold text-white transition-all disabled:opacity-50"
                style={{ backgroundColor: selectedElement.color }}
              >
                <Volume2 className="w-5 h-5" />
                {isPlayingAudio ? "Playing..." : "Read to Me"}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleGenerateStory}
                disabled={isLoadingStory}
                className="flex-1 px-4 py-3 rounded-2xl font-display font-bold text-white bg-se-green hover:opacity-90 transition-all disabled:opacity-50"
              >
                {isLoadingStory ? "Creating..." : "Tell Me a Story!"}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Story Card */}
        {story && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl border-2 border-se-green bg-se-green/5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-se-green" />
              <h3 className="font-display font-bold text-gray-800">A Story About {selectedElement.name}</h3>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">{story}</p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTTS(story)}
              disabled={isPlayingAudio}
              className="w-full px-4 py-3 rounded-2xl font-display font-bold text-white bg-se-blue hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Volume2 className="w-5 h-5" />
              {isPlayingAudio ? "Playing..." : "Read Story Aloud"}
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
