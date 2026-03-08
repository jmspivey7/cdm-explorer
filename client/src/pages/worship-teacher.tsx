import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Lock,
  Volume2,
  Loader2,
  MessageCircle,
  Lightbulb,
  Sparkles,
} from "lucide-react";

interface Lesson {
  id: number;
  number: number;
  title: string;
  mainIdea: string;
  memoryVerse: string;
  memoryVerseReference: string;
  worshipSign: string;
  callAndResponse: { leader: string; response: string } | null;
  activities: string[] | null;
  prayerFocus: string;
  songSuggestions: string[] | null;
}

interface UnitDetail {
  id: number;
  number: number;
  title: string;
  description: string;
  worshipElement: string;
  lessons: Lesson[];
}

type AssistantRequestType = "discussion" | "illustration" | "activity";

export default function WorshipTeacher() {
  const [, setLocation] = useLocation();
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [aiContent, setAiContent] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [activeAiType, setActiveAiType] = useState<AssistantRequestType | null>(null);

  const { data: allUnits } = useQuery<any[]>({
    queryKey: ["/api/worship/units"],
    queryFn: async () => {
      const res = await fetch("/api/worship/units");
      return res.json();
    },
  });

  useEffect(() => {
    if (allUnits && allUnits.length > 0 && selectedUnitId === null) {
      setSelectedUnitId(allUnits[0].number);
    }
  }, [allUnits]);

  const { data: unit } = useQuery<UnitDetail>({
    queryKey: [`/api/worship/units/${selectedUnitId}`],
    queryFn: async () => {
      const res = await fetch(`/api/worship/units/${selectedUnitId}`);
      return res.json();
    },
    enabled: !!selectedUnitId,
  });

  const selectedLesson = unit?.lessons.find((l) => l.id === selectedLessonId);

  async function handleAiAssistant(type: AssistantRequestType) {
    if (!selectedLessonId) return;
    setAiLoading(true);
    setActiveAiType(type);
    setAiContent(null);

    try {
      const res = await fetch("/api/worship/ai/teacher-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: selectedLessonId,
          requestType: type,
        }),
      });
      const data = await res.json();
      setAiContent(data.result);
    } catch (err: any) {
      setAiContent({
        error: err.message || "Failed to generate content. Make sure OPENAI_API_KEY is set.",
      });
    } finally {
      setAiLoading(false);
    }
  }

  async function speakText(text: string) {
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: "nova" }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
    } catch {
      // Fallback to browser TTS
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  }

  const aiRequestTypes: { type: AssistantRequestType; label: string; icon: typeof MessageCircle }[] = [
    { type: "discussion", label: "Discussion Questions", icon: MessageCircle },
    { type: "illustration", label: "Object Lessons", icon: Lightbulb },
    { type: "activity", label: "Extra Activities", icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3 sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <button
          onClick={() => setLocation("/worship")}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="font-display font-bold text-gray-800 text-lg">
            <span className="font-accent text-xl text-se-green">Worship</span>{" "}
            <span className="font-accent text-xl text-se-blue">Explorer</span>
            <span className="text-gray-400 text-sm ml-2">Teacher</span>
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Unit Browser */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-2xl p-4 sticky top-20">
              <h2 className="font-display font-bold text-gray-700 text-sm uppercase tracking-wider mb-4">
                Units
              </h2>

              <div className="space-y-2">
                {!allUnits ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
                  </div>
                ) : (
                  allUnits.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        if (u.id === 2) {
                          setSelectedUnitId(u.id);
                          setSelectedLessonId(null);
                        }
                      }}
                      disabled={u.id !== 2}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all border
                              ${
                                selectedUnitId === u.id
                                  ? "bg-se-blue/10 border-se-blue/30"
                                  : u.id === 2
                                  ? "border-gray-200 hover:bg-gray-50"
                                  : "border-gray-200 opacity-60 cursor-not-allowed"
                              }`}
                    >
                      <div className="flex items-center gap-2">
                        {u.id !== 2 && <Lock className="w-4 h-4 text-gray-400" />}
                        <div className="flex-1 min-w-0">
                          <p className="font-display font-bold text-sm text-gray-700">
                            Unit {u.number}
                          </p>
                          <p className="text-xs text-gray-400 truncate">{u.title}</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right: Lessons & Detail */}
          <div className="lg:col-span-2">
            {unit ? (
              <div className="space-y-6">
                {/* Lessons List */}
                {!selectedLessonId && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-gray-200 rounded-2xl p-6"
                  >
                    <h2 className="font-display font-bold text-gray-800 mb-4">
                      {unit.title}
                    </h2>
                    <p className="text-gray-600 text-sm mb-6">{unit.description}</p>

                    <div className="space-y-2">
                      {unit.lessons.map((lesson) => (
                        <button
                          key={lesson.id}
                          onClick={() => setSelectedLessonId(lesson.id)}
                          className="w-full text-left px-4 py-3 rounded-xl border border-gray-200
                                   hover:bg-se-blue/5 hover:border-se-blue/30 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <BookOpen className="w-5 h-5 text-se-blue flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-display font-bold text-gray-700">
                                Lesson {lesson.number}: {lesson.title}
                              </p>
                              <p className="text-sm text-gray-400">{lesson.mainIdea}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Lesson Detail */}
                <AnimatePresence mode="wait">
                  {selectedLesson && (
                    <motion.div
                      key={selectedLesson.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <button
                        onClick={() => setSelectedLessonId(null)}
                        className="text-se-blue hover:text-se-blue/70 text-sm font-display font-bold flex items-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Lessons
                      </button>

                      {/* Main Idea */}
                      <div className="bg-white border border-gray-200 rounded-2xl p-6">
                        <h3 className="font-display font-bold text-gray-700 mb-2">Main Idea</h3>
                        <p className="text-gray-600">{selectedLesson.mainIdea}</p>
                      </div>

                      {/* Memory Verse */}
                      <div className="bg-white border-2 border-se-green/30 rounded-2xl p-6">
                        <div className="flex items-start gap-3 mb-3">
                          <h3 className="font-display font-bold text-se-green">Memory Verse</h3>
                          <button
                            onClick={() => speakText(selectedLesson.memoryVerse)}
                            className="p-1.5 hover:bg-se-green/10 rounded-lg transition-colors"
                            title="Hear verse"
                          >
                            <Volume2 className="w-4 h-4 text-se-green" />
                          </button>
                        </div>
                        <p className="text-gray-700 italic mb-2">{selectedLesson.memoryVerse}</p>
                        <p className="text-gray-400 text-sm">{selectedLesson.memoryVerseReference}</p>
                      </div>

                      {/* Worship Sign */}
                      <div className="bg-white border border-gray-200 rounded-2xl p-6">
                        <h3 className="font-display font-bold text-gray-700 mb-2">Worship Sign</h3>
                        <p className="text-gray-600">{selectedLesson.worshipSign}</p>
                      </div>

                      {/* Call & Response */}
                      {selectedLesson.callAndResponse && (
                        <div className="bg-white border-2 border-se-purple/30 rounded-2xl p-6">
                          <h3 className="font-display font-bold text-se-purple mb-4">
                            Call & Response
                          </h3>
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                                Leader
                              </p>
                              <p className="text-gray-700">{selectedLesson.callAndResponse.leader}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                                Response
                              </p>
                              <p className="text-gray-700">{selectedLesson.callAndResponse.response}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Activities */}
                      {selectedLesson.activities && selectedLesson.activities.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-2xl p-6">
                          <h3 className="font-display font-bold text-gray-700 mb-3">Activities</h3>
                          <ul className="space-y-2">
                            {selectedLesson.activities.map((activity, idx) => (
                              <li key={idx} className="text-gray-600 flex gap-3">
                                <span className="text-se-blue font-bold">•</span>
                                <span>{activity}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Prayer Focus */}
                      <div className="bg-white border border-gray-200 rounded-2xl p-6">
                        <h3 className="font-display font-bold text-gray-700 mb-2">Prayer Focus</h3>
                        <p className="text-gray-600">{selectedLesson.prayerFocus}</p>
                      </div>

                      {/* Songs */}
                      {selectedLesson.songSuggestions && selectedLesson.songSuggestions.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-2xl p-6">
                          <h3 className="font-display font-bold text-gray-700 mb-3">
                            Song Suggestions
                          </h3>
                          <ul className="space-y-1">
                            {selectedLesson.songSuggestions.map((song, idx) => (
                              <li key={idx} className="text-gray-600 text-sm">
                                {song}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* AI Assistant */}
                      <div className="bg-se-blue/5 border border-se-blue/30 rounded-2xl p-6">
                        <h3 className="font-display font-bold text-se-blue mb-4">
                          Teaching Assistant
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                          {aiRequestTypes.map((req) => {
                            const IconComp = req.icon;
                            return (
                              <motion.button
                                key={req.type}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleAiAssistant(req.type)}
                                disabled={aiLoading}
                                className="px-4 py-3 bg-white border border-se-blue/30 rounded-xl
                                         hover:bg-se-blue/10 transition-all disabled:opacity-50 text-sm
                                         font-display font-bold text-se-blue flex items-center justify-center gap-2"
                              >
                                {aiLoading && activeAiType === req.type ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <IconComp className="w-4 h-4" />
                                )}
                                {req.label}
                              </motion.button>
                            );
                          })}
                        </div>

                        <AnimatePresence mode="wait">
                          {aiContent && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="bg-white rounded-xl p-4 border border-se-blue/20"
                            >
                              {aiContent.error ? (
                                <p className="text-red-500 text-sm">{aiContent.error}</p>
                              ) : (
                                <div className="text-gray-700 text-sm prose prose-sm max-w-none">
                                  {typeof aiContent === "string" ? (
                                    <p>{aiContent}</p>
                                  ) : (
                                    <pre className="whitespace-pre-wrap font-sans">
                                      {JSON.stringify(aiContent, null, 2)}
                                    </pre>
                                  )}
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center justify-center h-96">
                <Loader2 className="w-6 h-6 text-gray-300 animate-spin" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
