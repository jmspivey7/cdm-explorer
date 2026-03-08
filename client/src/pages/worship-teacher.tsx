import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Volume2,
  Loader2,
  MessageCircle,
  Lightbulb,
  Sparkles,
  ChevronDown,
  ChevronRight,
  HandHeart,
  BookOpenCheck,
  MessageSquare,
  Music,
  Scissors,
  Star,
  ScrollText,
  Target,
  Heart,
  GraduationCap,
  Clock,
} from "lucide-react";
import type { LessonSections, SidebarMeta, LessonSectionData } from "@shared/schema";

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
  lessonSections?: LessonSections | null;
  sidebarMeta?: SidebarMeta | null;
  preparation?: string;
  bibleBackground?: string;
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

const SECTION_CONFIG = [
  { key: "welcome" as const, label: "Welcome", icon: HandHeart, iconBg: "bg-se-green/10", iconText: "text-se-green", numBg: "bg-se-green/10", numText: "text-se-green" },
  { key: "bibleTime" as const, label: "Bible Time", icon: BookOpenCheck, iconBg: "bg-se-blue/10", iconText: "text-se-blue", numBg: "bg-se-blue/10", numText: "text-se-blue" },
  { key: "talkAndMemorize" as const, label: "Talk and Memorize", icon: MessageSquare, iconBg: "bg-se-purple/10", iconText: "text-se-purple", numBg: "bg-se-purple/10", numText: "text-se-purple" },
  { key: "sing" as const, label: "Sing", icon: Music, iconBg: "bg-se-blue/10", iconText: "text-se-blue", numBg: "bg-se-blue/10", numText: "text-se-blue" },
  { key: "makeAndDo" as const, label: "Make and Do", icon: Scissors, iconBg: "bg-se-green/10", iconText: "text-se-green", numBg: "bg-se-green/10", numText: "text-se-green" },
  { key: "finalFocus" as const, label: "Final Focus", icon: Star, iconBg: "bg-se-purple/10", iconText: "text-se-purple", numBg: "bg-se-purple/10", numText: "text-se-purple" },
];

function LessonSectionCard({ config, section }: { config: typeof SECTION_CONFIG[number]; section: LessonSectionData }) {
  const [expanded, setExpanded] = useState(false);
  const IconComp = config.icon;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className={`w-8 h-8 rounded-lg ${config.iconBg} flex items-center justify-center flex-shrink-0`}>
          <IconComp className={`w-4 h-4 ${config.iconText}`} />
        </div>
        <span className="font-display font-bold text-gray-800 flex-1 text-left">
          {section.title || config.label}
        </span>
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-3">
              {section.content && (
                <p className="text-gray-600 text-sm leading-relaxed">{section.content}</p>
              )}

              {section.materials && section.materials.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">Materials</p>
                  <ul className="space-y-1">
                    {section.materials.map((m, i) => (
                      <li key={i} className="text-amber-800 text-sm flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {section.instructions && section.instructions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Instructions</p>
                  <ol className="space-y-2">
                    {section.instructions.map((inst, i) => (
                      <li key={i} className="text-gray-700 text-sm flex gap-3">
                        <span className={`${config.numText} font-bold text-xs mt-0.5 flex-shrink-0 w-5 h-5 rounded-full ${config.numBg} flex items-center justify-center`}>
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{inst}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
      setSelectedUnitId(allUnits[0].id);
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

  const hasStructuredSections = selectedLesson?.lessonSections &&
    Object.values(selectedLesson.lessonSections).some(
      (s) => s !== null && s !== undefined && (s.content?.trim() || (s.instructions && s.instructions.length > 0))
    );

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
    <div className="min-h-screen bg-gray-50">
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

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
                ) : allUnits.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">No units uploaded yet</p>
                ) : (
                  allUnits.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setSelectedUnitId(u.id);
                        setSelectedLessonId(null);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all border
                              ${
                                selectedUnitId === u.id
                                  ? "bg-se-blue/10 border-se-blue/30"
                                  : "border-gray-200 hover:bg-gray-50"
                              }`}
                    >
                      <div className="flex items-center gap-2">
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

          <div className="lg:col-span-3">
            {unit ? (
              <div className="space-y-6">
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

                <AnimatePresence mode="wait">
                  {selectedLesson && (
                    <motion.div
                      key={selectedLesson.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <button
                        onClick={() => setSelectedLessonId(null)}
                        className="text-se-blue hover:text-se-blue/70 text-sm font-display font-bold flex items-center gap-2 mb-4"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Lessons
                      </button>

                      <h2 className="font-display font-bold text-2xl text-gray-800 mb-6">
                        {selectedLesson.title}
                      </h2>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                          {selectedLesson.preparation && (
                            <div className="bg-white border border-gray-200 rounded-2xl p-5">
                              <h3 className="font-display font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-500" />
                                Preparation
                              </h3>
                              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{selectedLesson.preparation}</p>
                            </div>
                          )}

                          {selectedLesson.bibleBackground && (
                            <div className="bg-white border border-gray-200 rounded-2xl p-5">
                              <h3 className="font-display font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <ScrollText className="w-4 h-4 text-gray-500" />
                                Bible Background
                              </h3>
                              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{selectedLesson.bibleBackground}</p>
                            </div>
                          )}

                          {hasStructuredSections ? (
                            <div className="space-y-3">
                              <h3 className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider px-1">
                                Lesson Sections
                              </h3>
                              {SECTION_CONFIG.map((config) => {
                                const section = selectedLesson.lessonSections?.[config.key];
                                if (!section || (!section.content?.trim() && (!section.instructions || section.instructions.length === 0))) return null;
                                return (
                                  <LessonSectionCard
                                    key={config.key}
                                    config={config}
                                    section={section}
                                  />
                                );
                              })}
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                                <h3 className="font-display font-bold text-gray-700 mb-2">Main Idea</h3>
                                <p className="text-gray-600 text-sm">{selectedLesson.mainIdea}</p>
                              </div>

                              {selectedLesson.memoryVerse && (
                                <div className="bg-white border-2 border-se-green/30 rounded-2xl p-5">
                                  <div className="flex items-start gap-3 mb-2">
                                    <h3 className="font-display font-bold text-se-green">Memory Verse</h3>
                                    <button
                                      onClick={() => speakText(selectedLesson.memoryVerse)}
                                      className="p-1.5 hover:bg-se-green/10 rounded-lg transition-colors"
                                      title="Hear verse"
                                    >
                                      <Volume2 className="w-4 h-4 text-se-green" />
                                    </button>
                                  </div>
                                  <p className="text-gray-700 italic mb-1 text-sm">{selectedLesson.memoryVerse}</p>
                                  <p className="text-gray-400 text-xs">{selectedLesson.memoryVerseReference}</p>
                                </div>
                              )}

                              {selectedLesson.worshipSign && (
                                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                                  <h3 className="font-display font-bold text-gray-700 mb-2">Worship Sign</h3>
                                  <p className="text-gray-600 text-sm">{selectedLesson.worshipSign}</p>
                                </div>
                              )}

                              {selectedLesson.callAndResponse && (
                                <div className="bg-white border-2 border-se-purple/30 rounded-2xl p-5">
                                  <h3 className="font-display font-bold text-se-purple mb-3">Call & Response</h3>
                                  <div className="space-y-2">
                                    <div>
                                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Leader</p>
                                      <p className="text-gray-700 text-sm">{selectedLesson.callAndResponse.leader}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Response</p>
                                      <p className="text-gray-700 text-sm">{selectedLesson.callAndResponse.response}</p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {selectedLesson.activities && selectedLesson.activities.length > 0 && (
                                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                                  <h3 className="font-display font-bold text-gray-700 mb-2">Activities</h3>
                                  <ul className="space-y-1">
                                    {selectedLesson.activities.map((activity, idx) => (
                                      <li key={idx} className="text-gray-600 text-sm flex gap-2">
                                        <span className="text-se-blue font-bold">•</span>
                                        <span>{activity}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {selectedLesson.prayerFocus && (
                                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                                  <h3 className="font-display font-bold text-gray-700 mb-2">Prayer Focus</h3>
                                  <p className="text-gray-600 text-sm">{selectedLesson.prayerFocus}</p>
                                </div>
                              )}

                              {selectedLesson.songSuggestions && selectedLesson.songSuggestions.length > 0 && (
                                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                                  <h3 className="font-display font-bold text-gray-700 mb-2">Song Suggestions</h3>
                                  <ul className="space-y-1">
                                    {selectedLesson.songSuggestions.map((song, idx) => (
                                      <li key={idx} className="text-gray-600 text-sm">{song}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="bg-se-blue/5 border border-se-blue/30 rounded-2xl p-5">
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
                                  ) : aiContent.type === "discussion" && aiContent.questions ? (
                                    <div className="space-y-4">
                                      {aiContent.questions.map((q: any, idx: number) => (
                                        <div key={idx} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                                          <p className="font-display font-bold text-gray-800 text-sm mb-1">
                                            {idx + 1}. {q.question}
                                          </p>
                                          {q.followUp && (
                                            <p className="text-gray-500 text-xs ml-4 mb-1">
                                              <span className="font-semibold">Follow-up:</span> {q.followUp}
                                            </p>
                                          )}
                                          {q.connection && (
                                            <p className="text-se-blue text-xs ml-4">
                                              <span className="font-semibold">Connection:</span> {q.connection}
                                            </p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  ) : aiContent.type === "illustration" && aiContent.illustrations ? (
                                    <div className="space-y-4">
                                      {aiContent.illustrations.map((ill: any, idx: number) => (
                                        <div key={idx} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                                          <p className="font-display font-bold text-gray-800 text-sm mb-1">
                                            {ill.title}
                                          </p>
                                          {ill.materials && ill.materials.length > 0 && (
                                            <p className="text-gray-500 text-xs mb-1">
                                              <span className="font-semibold">Materials:</span> {ill.materials.join(", ")}
                                            </p>
                                          )}
                                          <p className="text-gray-600 text-sm mb-1">{ill.description}</p>
                                          {ill.connection && (
                                            <p className="text-se-blue text-xs">
                                              <span className="font-semibold">Worship connection:</span> {ill.connection}
                                            </p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  ) : aiContent.type === "activity" && aiContent.activities ? (
                                    <div className="space-y-4">
                                      {aiContent.activities.map((act: any, idx: number) => (
                                        <div key={idx} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                                          <p className="font-display font-bold text-gray-800 text-sm mb-1">
                                            {act.title}
                                            {act.duration && (
                                              <span className="text-gray-400 font-normal ml-2">({act.duration})</span>
                                            )}
                                          </p>
                                          {act.materials && act.materials.length > 0 && (
                                            <p className="text-gray-500 text-xs mb-1">
                                              <span className="font-semibold">Materials:</span> {act.materials.join(", ")}
                                            </p>
                                          )}
                                          <p className="text-gray-600 text-sm mb-1">{act.instructions}</p>
                                          {act.worshipConnection && (
                                            <p className="text-se-blue text-xs">
                                              <span className="font-semibold">Worship connection:</span> {act.worshipConnection}
                                            </p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-gray-700 text-sm prose prose-sm max-w-none">
                                      <pre className="whitespace-pre-wrap font-sans">
                                        {JSON.stringify(aiContent, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        <div className="lg:col-span-1 space-y-4">
                          <div className="sticky top-20 space-y-4">
                            {selectedLesson.sidebarMeta ? (
                              <>
                                {selectedLesson.sidebarMeta.scripture && (
                                  <div className="bg-white border-2 border-se-blue/20 rounded-2xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <BookOpen className="w-4 h-4 text-se-blue" />
                                      <h4 className="font-display font-bold text-se-blue text-sm">Scripture</h4>
                                    </div>
                                    <p className="font-display font-bold text-gray-800 text-sm mb-1">
                                      {selectedLesson.sidebarMeta.scripture}
                                    </p>
                                    {selectedLesson.sidebarMeta.scriptureText && (
                                      <p className="text-gray-600 text-xs italic leading-relaxed">
                                        {selectedLesson.sidebarMeta.scriptureText}
                                      </p>
                                    )}
                                  </div>
                                )}

                                {selectedLesson.sidebarMeta.lessonFocus && (
                                  <div className="bg-white border border-gray-200 rounded-2xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Target className="w-4 h-4 text-se-green" />
                                      <h4 className="font-display font-bold text-se-green text-sm">Lesson Focus</h4>
                                    </div>
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                      {selectedLesson.sidebarMeta.lessonFocus}
                                    </p>
                                  </div>
                                )}

                                {selectedLesson.sidebarMeta.bibleTruths && (
                                  <div className="bg-white border border-gray-200 rounded-2xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Heart className="w-4 h-4 text-se-purple" />
                                      <h4 className="font-display font-bold text-se-purple text-sm">Bible Truths</h4>
                                    </div>
                                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                                      {selectedLesson.sidebarMeta.bibleTruths}
                                    </p>
                                  </div>
                                )}

                                {selectedLesson.sidebarMeta.goalsForChildren && (
                                  <div className="bg-white border border-gray-200 rounded-2xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <GraduationCap className="w-4 h-4 text-se-blue" />
                                      <h4 className="font-display font-bold text-se-blue text-sm">Goals for Children</h4>
                                    </div>
                                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                                      {selectedLesson.sidebarMeta.goalsForChildren}
                                    </p>
                                  </div>
                                )}

                                {selectedLesson.sidebarMeta.memoryMinute && (
                                  <div className="bg-se-green/5 border-2 border-se-green/20 rounded-2xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Volume2 className="w-4 h-4 text-se-green" />
                                      <h4 className="font-display font-bold text-se-green text-sm">Memory Minute</h4>
                                    </div>
                                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                                      {selectedLesson.sidebarMeta.memoryMinute}
                                    </p>
                                    {selectedLesson.memoryVerse && (
                                      <div className="mt-3 pt-3 border-t border-se-green/20">
                                        <p className="text-gray-800 text-sm italic">{selectedLesson.memoryVerse}</p>
                                        <p className="text-gray-500 text-xs mt-1">{selectedLesson.memoryVerseReference}</p>
                                        <button
                                          onClick={() => speakText(selectedLesson.memoryVerse)}
                                          className="mt-2 p-1.5 hover:bg-se-green/10 rounded-lg transition-colors"
                                          title="Hear verse"
                                        >
                                          <Volume2 className="w-4 h-4 text-se-green" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </>
                            ) : (
                              <>
                                {selectedLesson.memoryVerse && (
                                  <div className="bg-se-green/5 border-2 border-se-green/20 rounded-2xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Volume2 className="w-4 h-4 text-se-green" />
                                      <h4 className="font-display font-bold text-se-green text-sm">Memory Verse</h4>
                                    </div>
                                    <p className="text-gray-800 text-sm italic">{selectedLesson.memoryVerse}</p>
                                    <p className="text-gray-500 text-xs mt-1">{selectedLesson.memoryVerseReference}</p>
                                    <button
                                      onClick={() => speakText(selectedLesson.memoryVerse)}
                                      className="mt-2 p-1.5 hover:bg-se-green/10 rounded-lg transition-colors"
                                      title="Hear verse"
                                    >
                                      <Volume2 className="w-4 h-4 text-se-green" />
                                    </button>
                                  </div>
                                )}

                                {selectedLesson.mainIdea && (
                                  <div className="bg-white border border-gray-200 rounded-2xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Target className="w-4 h-4 text-se-green" />
                                      <h4 className="font-display font-bold text-se-green text-sm">Main Idea</h4>
                                    </div>
                                    <p className="text-gray-700 text-sm">{selectedLesson.mainIdea}</p>
                                  </div>
                                )}

                                {selectedLesson.prayerFocus && (
                                  <div className="bg-white border border-gray-200 rounded-2xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Heart className="w-4 h-4 text-se-purple" />
                                      <h4 className="font-display font-bold text-se-purple text-sm">Prayer Focus</h4>
                                    </div>
                                    <p className="text-gray-700 text-sm">{selectedLesson.prayerFocus}</p>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
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
