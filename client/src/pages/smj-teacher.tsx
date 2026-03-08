import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Loader2,
  MessageCircle,
  Lightbulb,
  Sparkles,
  Clock,
  Target,
  Heart,
  Star,
  Music,
  HandHeart,
  ChevronRight,
} from "lucide-react";

interface SMJLessonSummary {
  id: string;
  lessonNumber: number;
  title: string;
  scripture: string;
  status: string;
}

interface SMJLessonDetail {
  id: string;
  lessonNumber: number;
  title: string;
  scripture: string;
  bibleTruth: string;
  lessonFocus: string;
  goalsForChildren: string[] | null;
  bibleStoryScenes: any[] | null;
  welcomeStory: string | null;
  catechismPairs: any[] | null;
  discussionQuestions: any[] | null;
  bibleVerses: any[] | null;
  closingPrayer: string | null;
  status: string;
}

type AssistantRequestType = "discussion" | "illustration" | "activity";

const LESSON_FLOW_STEPS = [
  { label: "Welcome", time: "5 min", icon: Heart, color: "bg-pink-100 text-pink-600" },
  { label: "Bible Time", time: "15 min", icon: BookOpen, color: "bg-blue-100 text-blue-600" },
  { label: "Talk Time", time: "10 min", icon: MessageCircle, color: "bg-green-100 text-green-600" },
  { label: "Sing, Make & Do", time: "10 min", icon: Music, color: "bg-purple-100 text-purple-600" },
  { label: "Final Focus", time: "5 min", icon: Star, color: "bg-amber-100 text-amber-600" },
];

export default function SMJTeacher() {
  const [, setLocation] = useLocation();
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [aiContent, setAiContent] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [activeAiType, setActiveAiType] = useState<AssistantRequestType | null>(null);

  const { data: lessons } = useQuery<SMJLessonSummary[]>({
    queryKey: ["/api/smj/lessons"],
    queryFn: async () => {
      const res = await fetch("/api/smj/lessons");
      return res.json();
    },
  });

  const completeLessons = lessons?.filter((l) => l.status === "ready" || l.status === "complete") || [];

  const { data: selectedLesson } = useQuery<SMJLessonDetail>({
    queryKey: [`/api/smj/lessons/${selectedLessonId}`],
    queryFn: async () => {
      const res = await fetch(`/api/smj/lessons/${selectedLessonId}`);
      return res.json();
    },
    enabled: !!selectedLessonId,
  });

  async function handleAiAssistant(type: AssistantRequestType) {
    if (!selectedLessonId) return;
    setAiLoading(true);
    setActiveAiType(type);
    setAiContent(null);

    try {
      const res = await fetch("/api/smj/ai/teacher-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: selectedLessonId,
          requestType: type,
        }),
      });
      const data = await res.json();
      if (data.error || data.message) {
        setAiContent({ error: data.error || data.message });
      } else {
        setAiContent({ type, ...data });
      }
    } catch (err: any) {
      setAiContent({
        error: err.message || "Failed to generate content. Make sure OPENAI_API_KEY is set.",
      });
    } finally {
      setAiLoading(false);
    }
  }

  const aiRequestTypes: { type: AssistantRequestType; label: string; icon: typeof MessageCircle }[] = [
    { type: "discussion", label: "Discussion Questions", icon: MessageCircle },
    { type: "illustration", label: "Object Lesson Ideas", icon: Lightbulb },
    { type: "activity", label: "Activity Ideas", icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-3 flex items-center gap-3 sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <button
          onClick={() => setLocation("/smj")}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="font-display font-bold text-gray-800 text-lg">
            <span className="font-accent text-xl text-se-green">SMJ</span>{" "}
            <span className="font-accent text-xl text-se-blue">Explorer</span>
            <span className="text-gray-400 text-sm ml-2">Teacher</span>
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-2xl p-4 sticky top-20">
              <h2 className="font-display font-bold text-gray-700 text-sm uppercase tracking-wider mb-4">
                Lessons
              </h2>
              <div className="space-y-2">
                {!lessons ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
                  </div>
                ) : completeLessons.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">No lessons uploaded yet</p>
                ) : (
                  completeLessons
                    .sort((a, b) => a.lessonNumber - b.lessonNumber)
                    .map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => {
                          setSelectedLessonId(lesson.id);
                          setAiContent(null);
                          setActiveAiType(null);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all border
                          ${
                            selectedLessonId === lesson.id
                              ? "bg-se-blue/10 border-se-blue/30"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-se-blue flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-display font-bold text-sm text-gray-700">
                              Lesson {lesson.lessonNumber}
                            </p>
                            <p className="text-xs text-gray-400 truncate">{lesson.title}</p>
                          </div>
                        </div>
                      </button>
                    ))
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {!selectedLessonId ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-400 font-display">Select a lesson to view details</p>
                </div>
              </div>
            ) : !selectedLesson ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-se-blue animate-spin" />
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedLesson.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-se-blue/10 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-6 h-6 text-se-blue" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-se-blue font-bold uppercase tracking-wider mb-1">
                          Lesson {selectedLesson.lessonNumber}
                        </p>
                        <h2 className="font-display font-bold text-2xl text-gray-800 mb-2">
                          {selectedLesson.title}
                        </h2>
                        {selectedLesson.scripture && (
                          <p className="text-gray-500 text-sm mb-4">{selectedLesson.scripture}</p>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {selectedLesson.bibleTruth && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
                                Bible Truth
                              </p>
                              <p className="text-amber-900 text-sm">{selectedLesson.bibleTruth}</p>
                            </div>
                          )}
                          {selectedLesson.lessonFocus && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                              <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
                                Lesson Focus
                              </p>
                              <p className="text-blue-900 text-sm">{selectedLesson.lessonFocus}</p>
                            </div>
                          )}
                        </div>

                        {selectedLesson.goalsForChildren && selectedLesson.goalsForChildren.length > 0 && (
                          <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-3">
                            <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2">
                              Goals for Children
                            </p>
                            <ul className="space-y-1">
                              {selectedLesson.goalsForChildren.map((goal, i) => (
                                <li key={i} className="text-green-900 text-sm flex items-start gap-2">
                                  <Target className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span>{goal}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h3 className="font-display font-bold text-gray-700 mb-4 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      Lesson Flow
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {LESSON_FLOW_STEPS.map((step, i) => {
                        const IconComp = step.icon;
                        return (
                          <div key={i} className="flex items-center gap-2">
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${step.color.split(" ")[0]} border border-gray-100`}>
                              <IconComp className={`w-4 h-4 ${step.color.split(" ")[1]}`} />
                              <div>
                                <p className="font-display font-bold text-xs text-gray-700">{step.label}</p>
                                <p className="text-[10px] text-gray-400">{step.time}</p>
                              </div>
                            </div>
                            {i < LESSON_FLOW_STEPS.length - 1 && (
                              <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h3 className="font-display font-bold text-gray-700 mb-4 flex items-center gap-2">
                      <HandHeart className="w-4 h-4 text-gray-500" />
                      AI Teaching Assistant
                    </h3>
                    <div className="flex flex-wrap gap-3 mb-4">
                      {aiRequestTypes.map(({ type, label, icon: Icon }) => (
                        <button
                          key={type}
                          onClick={() => handleAiAssistant(type)}
                          disabled={aiLoading}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-display font-bold text-sm transition-all border
                            ${
                              activeAiType === type
                                ? "bg-se-blue text-white border-se-blue"
                                : "bg-white text-gray-600 border-gray-200 hover:border-se-blue/30 hover:bg-se-blue/5"
                            }
                            ${aiLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <Icon className="w-4 h-4" />
                          {label}
                        </button>
                      ))}
                    </div>

                    {aiLoading && (
                      <div className="flex items-center gap-3 py-8 justify-center">
                        <Loader2 className="w-5 h-5 text-se-blue animate-spin" />
                        <p className="text-gray-500 text-sm">Generating ideas...</p>
                      </div>
                    )}

                    {aiContent && !aiLoading && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                      >
                        {aiContent.error ? (
                          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <p className="text-red-700 text-sm">{aiContent.error}</p>
                          </div>
                        ) : aiContent.type === "discussion" && aiContent.questions ? (
                          aiContent.questions.map((q: any, i: number) => (
                            <div key={i} className="bg-green-50 border border-green-200 rounded-xl p-4">
                              <p className="font-display font-bold text-green-800 text-sm mb-1">
                                {i + 1}. {q.question}
                              </p>
                              {q.followUp && (
                                <p className="text-green-700 text-xs mb-1">
                                  <span className="font-bold">Follow-up:</span> {q.followUp}
                                </p>
                              )}
                              {q.connection && (
                                <p className="text-green-600 text-xs italic">{q.connection}</p>
                              )}
                            </div>
                          ))
                        ) : aiContent.type === "illustration" && aiContent.ideas ? (
                          aiContent.ideas.map((idea: any, i: number) => (
                            <div key={i} className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                              <p className="font-display font-bold text-amber-800 text-sm mb-1">
                                {idea.title || `Idea ${i + 1}`}
                              </p>
                              {idea.materials && (
                                <p className="text-amber-700 text-xs mb-1">
                                  <span className="font-bold">Materials:</span> {Array.isArray(idea.materials) ? idea.materials.join(", ") : idea.materials}
                                </p>
                              )}
                              <p className="text-amber-900 text-sm">{idea.description || idea.instructions}</p>
                              {idea.connection && (
                                <p className="text-amber-600 text-xs italic mt-1">{idea.connection}</p>
                              )}
                            </div>
                          ))
                        ) : aiContent.type === "activity" && aiContent.activities ? (
                          aiContent.activities.map((act: any, i: number) => (
                            <div key={i} className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                              <p className="font-display font-bold text-purple-800 text-sm mb-1">
                                {act.title || act.name || `Activity ${i + 1}`}
                              </p>
                              {act.materials && (
                                <p className="text-purple-700 text-xs mb-1">
                                  <span className="font-bold">Materials:</span> {Array.isArray(act.materials) ? act.materials.join(", ") : act.materials}
                                </p>
                              )}
                              <p className="text-purple-900 text-sm">{act.description || act.instructions}</p>
                              {act.connection && (
                                <p className="text-purple-600 text-xs italic mt-1">{act.connection}</p>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                            <pre className="text-gray-700 text-sm whitespace-pre-wrap">
                              {JSON.stringify(aiContent, null, 2)}
                            </pre>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
