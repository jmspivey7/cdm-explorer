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
  Clock,
  ScrollText,
  Megaphone,
  HandHeart,
  Music,
  BookOpenCheck,
  Footprints,
  HeartCrack,
  Sun,
  Shield,
  Droplets,
  Gift,
  Hand,
  type LucideIcon,
  Bookmark,
  Target,
  Heart,
  GraduationCap,
  Star,
} from "lucide-react";
import type {
  WorshipElementSections,
  WorshipElementKey,
  ElementSectionData,
  LessonSidebarMeta,
  LessonSections,
  LessonSectionData,
  SidebarMeta,
} from "@shared/schema";

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
  elementSections?: WorshipElementSections | null;
  elementSidebarMeta?: LessonSidebarMeta | null;
}

interface UnitDetail {
  id: number;
  number: number;
  title: string;
  description: string;
  worshipElement: string;
  elementSpotlight?: string;
  lessons: Lesson[];
}

type AssistantRequestType = "discussion" | "illustration" | "activity";

interface ElementConfig {
  key: WorshipElementKey;
  label: string;
  icon: LucideIcon;
  iconBg: string;
  iconText: string;
  numBg: string;
  numText: string;
  core: boolean;
}

const ELEMENT_CONFIG: ElementConfig[] = [
  { key: "callToWorship", label: "Call to Worship", icon: Megaphone, iconBg: "bg-emerald-100", iconText: "text-emerald-600", numBg: "bg-emerald-100", numText: "text-emerald-700", core: true },
  { key: "prayer", label: "Prayer", icon: HandHeart, iconBg: "bg-amber-100", iconText: "text-amber-600", numBg: "bg-amber-100", numText: "text-amber-700", core: true },
  { key: "praise", label: "Praise", icon: Music, iconBg: "bg-sky-100", iconText: "text-sky-600", numBg: "bg-sky-100", numText: "text-sky-700", core: true },
  { key: "readingTheWord", label: "Reading the Word", icon: BookOpenCheck, iconBg: "bg-red-100", iconText: "text-red-500", numBg: "bg-red-100", numText: "text-red-600", core: true },
  { key: "walkingInTheWord", label: "Walking in the Word", icon: Footprints, iconBg: "bg-green-100", iconText: "text-green-600", numBg: "bg-green-100", numText: "text-green-700", core: true },
  { key: "confessionOfSin", label: "Confession of Sin", icon: HeartCrack, iconBg: "bg-purple-100", iconText: "text-purple-600", numBg: "bg-purple-100", numText: "text-purple-700", core: false },
  { key: "assuranceOfPardon", label: "Assurance of Pardon", icon: Sun, iconBg: "bg-orange-100", iconText: "text-orange-500", numBg: "bg-orange-100", numText: "text-orange-600", core: false },
  { key: "confessionOfFaith", label: "Confession of Faith", icon: Shield, iconBg: "bg-rose-100", iconText: "text-rose-500", numBg: "bg-rose-100", numText: "text-rose-600", core: false },
  { key: "sacraments", label: "Sacraments", icon: Droplets, iconBg: "bg-cyan-100", iconText: "text-cyan-600", numBg: "bg-cyan-100", numText: "text-cyan-700", core: false },
  { key: "tithesAndOfferings", label: "Tithes & Offerings", icon: Gift, iconBg: "bg-yellow-100", iconText: "text-yellow-600", numBg: "bg-yellow-100", numText: "text-yellow-700", core: false },
  { key: "benediction", label: "Benediction / Closing", icon: Hand, iconBg: "bg-pink-100", iconText: "text-pink-500", numBg: "bg-pink-100", numText: "text-pink-600", core: false },
];

function ElementSectionCard({ config, section }: { config: ElementConfig; section: ElementSectionData }) {
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
        {config.core && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex-shrink-0">
            Core
          </span>
        )}
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
              {section.teacherScript && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">Teacher Script</p>
                  <div className="text-blue-900 text-sm leading-relaxed whitespace-pre-line">
                    {section.teacherScript}
                  </div>
                </div>
              )}

              {section.content && (
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{section.content}</p>
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

function hasContent(section: ElementSectionData | null | undefined): section is ElementSectionData {
  if (!section) return false;
  return !!(
    section.content?.trim() ||
    section.teacherScript?.trim() ||
    (section.instructions && section.instructions.length > 0)
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

  const hasElementSections = selectedLesson?.elementSections &&
    Object.values(selectedLesson.elementSections).some(hasContent);

  const hasOldStructuredSections = !hasElementSections && selectedLesson?.lessonSections &&
    Object.values(selectedLesson.lessonSections).some(
      (s) => s !== null && s !== undefined && (s.content?.trim() || (s.instructions && s.instructions.length > 0))
    );

  const sidebar = selectedLesson?.elementSidebarMeta || null;

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
                    <h2 className="font-display font-bold text-gray-800 mb-1">
                      {unit.title}
                    </h2>
                    {unit.worshipElement && (
                      <p className="text-se-blue font-display font-bold text-sm mb-3">
                        Element: {unit.worshipElement}
                      </p>
                    )}
                    <p className="text-gray-600 text-sm mb-4">{unit.description}</p>

                    {unit.elementSpotlight && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                        <h3 className="font-display font-bold text-blue-800 text-sm mb-2 flex items-center gap-2">
                          <Star className="w-4 h-4 text-blue-600" />
                          Element of Worship Spotlight
                        </h3>
                        <p className="text-blue-900 text-sm leading-relaxed whitespace-pre-line">
                          {unit.elementSpotlight}
                        </p>
                      </div>
                    )}

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

                      <h2 className="font-display font-bold text-2xl text-gray-800 mb-1">
                        {selectedLesson.title}
                      </h2>
                      {selectedLesson.mainIdea && (
                        <p className="text-gray-500 text-sm mb-6">{selectedLesson.mainIdea}</p>
                      )}

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

                          {hasElementSections ? (
                            <div className="space-y-3">
                              <h3 className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider px-1">
                                Elements of Worship
                              </h3>
                              {ELEMENT_CONFIG.map((config) => {
                                const section = selectedLesson.elementSections?.[config.key];
                                if (!hasContent(section)) return null;
                                return (
                                  <ElementSectionCard
                                    key={config.key}
                                    config={config}
                                    section={section}
                                  />
                                );
                              })}
                            </div>
                          ) : hasOldStructuredSections ? (
                            <div className="space-y-3">
                              <h3 className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider px-1">
                                Lesson Sections
                              </h3>
                              <p className="text-gray-400 text-xs px-1">This lesson uses the older format. Re-upload to get element-based sections.</p>
                              {selectedLesson.lessonSections && (Object.entries(selectedLesson.lessonSections) as [string, LessonSectionData | null][]).map(([key, section]) => {
                                if (!section || (!section.content?.trim() && (!section.instructions || section.instructions.length === 0))) return null;
                                return (
                                  <div key={key} className="bg-white border border-gray-200 rounded-2xl p-5">
                                    <h4 className="font-display font-bold text-gray-700 mb-2">{section.title || key}</h4>
                                    {section.content && <p className="text-gray-600 text-sm">{section.content}</p>}
                                    {section.instructions && section.instructions.length > 0 && (
                                      <ul className="mt-2 space-y-1">
                                        {section.instructions.map((inst: string, i: number) => (
                                          <li key={i} className="text-gray-600 text-sm flex gap-2">
                                            <span className="text-se-blue font-bold text-xs">{i + 1}.</span>
                                            <span>{inst}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="space-y-4">
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
                                <div className="bg-white border-2 border-purple-300 rounded-2xl p-5">
                                  <h3 className="font-display font-bold text-purple-700 mb-3">Call & Response</h3>
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
                                  key={activeAiType}
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -5 }}
                                  className="bg-white rounded-xl border border-se-blue/20 p-4"
                                >
                                  {aiContent.error ? (
                                    <p className="text-red-500 text-sm">{aiContent.error}</p>
                                  ) : (
                                    <div className="space-y-3">
                                      {aiContent.type === "discussion" && aiContent.questions && (
                                        <>
                                          <h4 className="font-display font-bold text-gray-700 text-sm">Discussion Questions</h4>
                                          <ol className="space-y-2">
                                            {aiContent.questions.map((q: string, i: number) => (
                                              <li key={i} className="text-gray-600 text-sm flex gap-2">
                                                <span className="text-se-blue font-bold">{i + 1}.</span>
                                                <span>{q}</span>
                                              </li>
                                            ))}
                                          </ol>
                                        </>
                                      )}
                                      {aiContent.type === "illustration" && aiContent.illustrations && (
                                        <>
                                          <h4 className="font-display font-bold text-gray-700 text-sm">Object Lessons</h4>
                                          {aiContent.illustrations.map((ill: any, i: number) => (
                                            <div key={i} className="border-l-2 border-se-blue/30 pl-3">
                                              <p className="font-display font-bold text-gray-700 text-sm">{ill.title || `Illustration ${i + 1}`}</p>
                                              <p className="text-gray-600 text-sm mt-1">{ill.description || ill}</p>
                                              {ill.materials && <p className="text-gray-400 text-xs mt-1">Materials: {ill.materials}</p>}
                                            </div>
                                          ))}
                                        </>
                                      )}
                                      {aiContent.type === "activity" && aiContent.activities && (
                                        <>
                                          <h4 className="font-display font-bold text-gray-700 text-sm">Extra Activities</h4>
                                          {aiContent.activities.map((act: any, i: number) => (
                                            <div key={i} className="border-l-2 border-se-green/30 pl-3">
                                              <p className="font-display font-bold text-gray-700 text-sm">{act.title || `Activity ${i + 1}`}</p>
                                              <p className="text-gray-600 text-sm mt-1">{act.description || act}</p>
                                              {act.materials && <p className="text-gray-400 text-xs mt-1">Materials: {act.materials}</p>}
                                            </div>
                                          ))}
                                        </>
                                      )}
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        <div className="lg:col-span-1">
                          <div className="sticky top-20 space-y-4">
                            {sidebar ? (
                              <>
                                {sidebar.scripture && (
                                  <div className="bg-white border border-gray-200 rounded-2xl p-5">
                                    <h3 className="font-display font-bold text-gray-700 text-sm mb-2 flex items-center gap-2">
                                      <BookOpen className="w-4 h-4 text-se-blue" />
                                      Scripture
                                    </h3>
                                    <p className="text-se-blue font-display font-bold text-sm">{sidebar.scripture}</p>
                                    {sidebar.scriptureText && (
                                      <p className="text-gray-600 text-sm italic mt-2 leading-relaxed">{sidebar.scriptureText}</p>
                                    )}
                                  </div>
                                )}

                                {sidebar.lessonFocus && (
                                  <div className="bg-white border border-gray-200 rounded-2xl p-5">
                                    <h3 className="font-display font-bold text-gray-700 text-sm mb-2 flex items-center gap-2">
                                      <Target className="w-4 h-4 text-se-green" />
                                      Lesson Focus
                                    </h3>
                                    <p className="text-gray-600 text-sm">{sidebar.lessonFocus}</p>
                                  </div>
                                )}

                                {sidebar.bibleTruth && (
                                  <div className="bg-white border border-gray-200 rounded-2xl p-5">
                                    <h3 className="font-display font-bold text-gray-700 text-sm mb-2 flex items-center gap-2">
                                      <Heart className="w-4 h-4 text-red-400" />
                                      Bible Truth
                                    </h3>
                                    <p className="text-gray-600 text-sm">{sidebar.bibleTruth}</p>
                                  </div>
                                )}

                                {sidebar.goalsForChildren && (
                                  <div className="bg-white border border-gray-200 rounded-2xl p-5">
                                    <h3 className="font-display font-bold text-gray-700 text-sm mb-2 flex items-center gap-2">
                                      <GraduationCap className="w-4 h-4 text-purple-500" />
                                      Goals for Children
                                    </h3>
                                    <p className="text-gray-600 text-sm">{sidebar.goalsForChildren}</p>
                                  </div>
                                )}

                                {(sidebar.memoryVerse || selectedLesson.memoryVerse) && (
                                  <div className="bg-white border-2 border-se-green/30 rounded-2xl p-5">
                                    <div className="flex items-start gap-2 mb-2">
                                      <h3 className="font-display font-bold text-se-green text-sm flex items-center gap-2">
                                        <Bookmark className="w-4 h-4" />
                                        Memory Verse
                                      </h3>
                                      <button
                                        onClick={() => speakText(sidebar.memoryVerse || selectedLesson.memoryVerse)}
                                        className="p-1 hover:bg-se-green/10 rounded-lg transition-colors"
                                        title="Hear verse"
                                      >
                                        <Volume2 className="w-3.5 h-3.5 text-se-green" />
                                      </button>
                                    </div>
                                    <p className="text-gray-700 italic text-sm">{sidebar.memoryVerse || selectedLesson.memoryVerse}</p>
                                    <p className="text-gray-400 text-xs mt-1">{sidebar.memoryVerseReference || selectedLesson.memoryVerseReference}</p>
                                  </div>
                                )}

                                {(sidebar.worshipSign || selectedLesson.worshipSign) && (
                                  <div className="bg-white border border-gray-200 rounded-2xl p-5">
                                    <h3 className="font-display font-bold text-gray-700 text-sm mb-2 flex items-center gap-2">
                                      <Hand className="w-4 h-4 text-amber-500" />
                                      Worship Sign
                                    </h3>
                                    <p className="text-gray-600 text-sm">{sidebar.worshipSign || selectedLesson.worshipSign}</p>
                                  </div>
                                )}
                              </>
                            ) : (
                              <>
                                {selectedLesson.memoryVerse && (
                                  <div className="bg-white border-2 border-se-green/30 rounded-2xl p-5">
                                    <div className="flex items-start gap-2 mb-2">
                                      <h3 className="font-display font-bold text-se-green text-sm flex items-center gap-2">
                                        <Bookmark className="w-4 h-4" />
                                        Memory Verse
                                      </h3>
                                      <button
                                        onClick={() => speakText(selectedLesson.memoryVerse)}
                                        className="p-1 hover:bg-se-green/10 rounded-lg transition-colors"
                                        title="Hear verse"
                                      >
                                        <Volume2 className="w-3.5 h-3.5 text-se-green" />
                                      </button>
                                    </div>
                                    <p className="text-gray-700 italic text-sm">{selectedLesson.memoryVerse}</p>
                                    <p className="text-gray-400 text-xs mt-1">{selectedLesson.memoryVerseReference}</p>
                                  </div>
                                )}

                                {selectedLesson.worshipSign && (
                                  <div className="bg-white border border-gray-200 rounded-2xl p-5">
                                    <h3 className="font-display font-bold text-gray-700 text-sm mb-2">Worship Sign</h3>
                                    <p className="text-gray-600 text-sm">{selectedLesson.worshipSign}</p>
                                  </div>
                                )}

                                {selectedLesson.prayerFocus && (
                                  <div className="bg-white border border-gray-200 rounded-2xl p-5">
                                    <h3 className="font-display font-bold text-gray-700 text-sm mb-2">Prayer Focus</h3>
                                    <p className="text-gray-600 text-sm">{selectedLesson.prayerFocus}</p>
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
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-gray-300 animate-spin" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
