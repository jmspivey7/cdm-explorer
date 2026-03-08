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
  CheckCircle2,
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dark header bar */}
      <div className="bg-[#1B2A4A] text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-50">
        <button
          onClick={() => setLocation("/worship")}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <BookOpen className="w-5 h-5 text-se-green" />
        <h1 className="font-display font-bold text-lg">Teacher Dashboard</h1>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column — Unit list */}
          <div className="lg:col-span-1">
            <h2 className="font-display font-bold text-lg mb-3 text-gray-800">Curriculum Units</h2>
            <div className="space-y-2">
              {!allUnits ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
                </div>
              ) : allUnits.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No units uploaded yet</p>
              ) : (
                allUnits.map((u) => {
                  const isActive = selectedUnitId === u.id;
                  return (
                    <div
                      key={u.id}
                      className={`rounded-xl border p-3 transition-all cursor-pointer
                        ${isActive
                          ? "border-se-green bg-se-green/5 hover:bg-se-green/10"
                          : "border-gray-200 bg-white hover:bg-gray-50"
                        }`}
                      onClick={() => {
                        setSelectedUnitId(u.id);
                        setSelectedLessonId(null);
                        setAiContent(null);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold text-gray-400">Unit {u.number}</span>
                          <h3 className="font-display font-bold text-sm text-gray-800">{u.title}</h3>
                        </div>
                        {isActive ? (
                          <CheckCircle2 className="w-4 h-4 text-se-green flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right column — Unit overview or Lesson detail */}
          <div className="lg:col-span-2">
            {unit ? (
              selectedLesson ? (
                <div>
                  {/* Back button */}
                  <button
                    onClick={() => {
                      setSelectedLessonId(null);
                      setAiContent(null);
                    }}
                    className="text-sm text-se-green font-semibold mb-4 flex items-center gap-1 hover:underline"
                  >
                    <ArrowLeft className="w-3 h-3" /> Back to Unit {unit.number}
                  </button>

                  {/* Lesson detail card */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
                    <span className="text-xs font-semibold text-se-green">Lesson {selectedLesson.number}</span>
                    <h2 className="font-display text-2xl font-bold mt-1 text-gray-800">{selectedLesson.title}</h2>

                    <div className="mt-4 space-y-4">
                      {/* Main Idea */}
                      {selectedLesson.mainIdea && (
                        <div>
                          <h4 className="font-display font-bold text-sm text-gray-400 mb-1">Main Idea</h4>
                          <p className="text-sm leading-relaxed text-gray-700">{selectedLesson.mainIdea}</p>
                        </div>
                      )}

                      {/* Sidebar meta: Scripture, Lesson Focus, Bible Truth, Goals */}
                      {sidebar?.scripture && (
                        <div>
                          <h4 className="font-display font-bold text-sm text-gray-400 mb-1 flex items-center gap-2">
                            <BookOpen className="w-3.5 h-3.5" />
                            Scripture
                          </h4>
                          <p className="text-se-blue font-display font-bold text-sm">{sidebar.scripture}</p>
                          {sidebar.scriptureText && (
                            <p className="text-gray-600 text-sm italic mt-1 leading-relaxed">{sidebar.scriptureText}</p>
                          )}
                        </div>
                      )}

                      {sidebar?.lessonFocus && (
                        <div>
                          <h4 className="font-display font-bold text-sm text-gray-400 mb-1 flex items-center gap-2">
                            <Target className="w-3.5 h-3.5" />
                            Lesson Focus
                          </h4>
                          <p className="text-gray-700 text-sm">{sidebar.lessonFocus}</p>
                        </div>
                      )}

                      {sidebar?.bibleTruth && (
                        <div>
                          <h4 className="font-display font-bold text-sm text-gray-400 mb-1 flex items-center gap-2">
                            <Heart className="w-3.5 h-3.5" />
                            Bible Truth
                          </h4>
                          <p className="text-gray-700 text-sm">{sidebar.bibleTruth}</p>
                        </div>
                      )}

                      {sidebar?.goalsForChildren && (
                        <div>
                          <h4 className="font-display font-bold text-sm text-gray-400 mb-1 flex items-center gap-2">
                            <GraduationCap className="w-3.5 h-3.5" />
                            Goals for Children
                          </h4>
                          <p className="text-gray-700 text-sm">{sidebar.goalsForChildren}</p>
                        </div>
                      )}

                      {/* Memory Verse */}
                      {(sidebar?.memoryVerse || selectedLesson.memoryVerse) && (
                        <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-4">
                          <h4 className="font-display font-bold text-sm text-amber-700 mb-1 flex items-center gap-2">
                            Memory Verse
                            <button
                              onClick={() => speakText(sidebar?.memoryVerse || selectedLesson.memoryVerse)}
                              className="p-1 hover:bg-amber-100 rounded-lg transition-colors"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </h4>
                          <p className="text-sm italic text-gray-700">
                            "{sidebar?.memoryVerse || selectedLesson.memoryVerse}"
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {sidebar?.memoryVerseReference || selectedLesson.memoryVerseReference}
                          </p>
                        </div>
                      )}

                      {/* Worship Sign */}
                      {(sidebar?.worshipSign || selectedLesson.worshipSign) && (
                        <div>
                          <h4 className="font-display font-bold text-sm text-gray-400 mb-1">Worship Sign</h4>
                          <p className="text-sm leading-relaxed text-gray-700">{sidebar?.worshipSign || selectedLesson.worshipSign}</p>
                        </div>
                      )}

                      {/* Call & Response */}
                      {selectedLesson.callAndResponse && (
                        <div className="bg-se-blue/5 border border-se-blue/20 rounded-xl p-4">
                          <h4 className="font-display font-bold text-sm text-se-blue mb-2">Call and Response</h4>
                          <div className="space-y-1 text-sm">
                            <p><span className="font-bold">Leader:</span> {selectedLesson.callAndResponse.leader}</p>
                            <p><span className="font-bold">Children:</span> {selectedLesson.callAndResponse.response}</p>
                          </div>
                        </div>
                      )}

                      {/* Preparation */}
                      {selectedLesson.preparation && (
                        <div>
                          <h4 className="font-display font-bold text-sm text-gray-400 mb-1 flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" />
                            Preparation
                          </h4>
                          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{selectedLesson.preparation}</p>
                        </div>
                      )}

                      {/* Bible Background */}
                      {selectedLesson.bibleBackground && (
                        <div>
                          <h4 className="font-display font-bold text-sm text-gray-400 mb-1 flex items-center gap-2">
                            <ScrollText className="w-3.5 h-3.5" />
                            Bible Background
                          </h4>
                          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{selectedLesson.bibleBackground}</p>
                        </div>
                      )}

                      {/* Activities */}
                      {selectedLesson.activities && selectedLesson.activities.length > 0 && (
                        <div>
                          <h4 className="font-display font-bold text-sm text-gray-400 mb-2">Activities</h4>
                          <div className="space-y-2">
                            {selectedLesson.activities.map((activity, idx) => (
                              <div key={idx} className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">{activity}</div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Prayer Focus */}
                      {selectedLesson.prayerFocus && (
                        <div>
                          <h4 className="font-display font-bold text-sm text-gray-400 mb-1">Prayer Focus</h4>
                          <p className="text-sm italic leading-relaxed text-gray-700">{selectedLesson.prayerFocus}</p>
                        </div>
                      )}

                      {/* Song Suggestions */}
                      {selectedLesson.songSuggestions && selectedLesson.songSuggestions.length > 0 && (
                        <div>
                          <h4 className="font-display font-bold text-sm text-gray-400 mb-1">Song Suggestions</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedLesson.songSuggestions.map((song, idx) => (
                              <span key={idx} className="bg-pink-100/60 text-pink-700 text-sm px-3 py-1 rounded-full">{song}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Element-based sections */}
                  {hasElementSections && (
                    <div className="space-y-3 mb-6">
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
                  )}

                  {/* Legacy 6-section fallback */}
                  {hasOldStructuredSections && (
                    <div className="space-y-3 mb-6">
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
                  )}

                  {/* AI Teaching Assistant */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h3 className="font-display font-bold text-lg flex items-center gap-2 mb-4 text-gray-800">
                      <Sparkles className="w-5 h-5 text-se-green" />
                      AI Teaching Assistant
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Generate supplementary content for this lesson using AI.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                      <button
                        onClick={() => handleAiAssistant("discussion")}
                        disabled={aiLoading}
                        className="flex items-center gap-2 bg-se-green/10 border border-se-green/30 rounded-xl p-3 hover:bg-se-green/20 transition-all disabled:opacity-50 text-sm font-semibold text-gray-700"
                      >
                        {aiLoading && activeAiType === "discussion" ? (
                          <Loader2 className="w-4 h-4 text-se-green animate-spin" />
                        ) : (
                          <MessageCircle className="w-4 h-4 text-se-green" />
                        )}
                        Discussion Questions
                      </button>
                      <button
                        onClick={() => handleAiAssistant("illustration")}
                        disabled={aiLoading}
                        className="flex items-center gap-2 bg-amber-50 border border-amber-200/60 rounded-xl p-3 hover:bg-amber-100/50 transition-all disabled:opacity-50 text-sm font-semibold text-gray-700"
                      >
                        {aiLoading && activeAiType === "illustration" ? (
                          <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
                        ) : (
                          <Lightbulb className="w-4 h-4 text-amber-600" />
                        )}
                        Object Lessons
                      </button>
                      <button
                        onClick={() => handleAiAssistant("activity")}
                        disabled={aiLoading}
                        className="flex items-center gap-2 bg-se-blue/10 border border-se-blue/30 rounded-xl p-3 hover:bg-se-blue/20 transition-all disabled:opacity-50 text-sm font-semibold text-gray-700"
                      >
                        {aiLoading && activeAiType === "activity" ? (
                          <Loader2 className="w-4 h-4 text-se-blue animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4 text-se-blue" />
                        )}
                        Extra Activities
                      </button>
                    </div>

                    <AnimatePresence mode="wait">
                      {aiLoading && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-center py-8"
                        >
                          <Loader2 className="w-6 h-6 animate-spin text-se-green mr-2" />
                          <span className="text-sm text-gray-400">Generating {activeAiType} ideas...</span>
                        </motion.div>
                      )}
                      {!aiLoading && aiContent && (
                        <motion.div
                          key={activeAiType}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                        >
                          {aiContent.error ? (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
                              {aiContent.error}
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {aiContent.type === "discussion" && aiContent.questions && (
                                aiContent.questions.map((q: any, i: number) => (
                                  <div key={i} className="bg-se-green/5 border border-se-green/20 rounded-xl p-4">
                                    <p className="font-semibold text-sm text-gray-800">
                                      {typeof q === "string" ? q : q.question || q.text || JSON.stringify(q)}
                                    </p>
                                    {typeof q === "object" && q.followUp && (
                                      <p className="text-xs text-gray-400 mt-1">Follow-up: {q.followUp}</p>
                                    )}
                                    {typeof q === "object" && q.connection && (
                                      <p className="text-xs text-se-green mt-1">Connection: {q.connection}</p>
                                    )}
                                  </div>
                                ))
                              )}
                              {aiContent.type === "illustration" && aiContent.illustrations && (
                                aiContent.illustrations.map((ill: any, i: number) => (
                                  <div key={i} className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-4">
                                    <h5 className="font-bold text-sm text-gray-800">{ill.title || `Illustration ${i + 1}`}</h5>
                                    {ill.materials && (
                                      <p className="text-xs text-gray-400 mt-1">
                                        Materials: {Array.isArray(ill.materials) ? ill.materials.join(", ") : ill.materials}
                                      </p>
                                    )}
                                    <p className="text-sm mt-2 text-gray-700">
                                      {typeof ill === "string" ? ill : ill.description || ill.explanation || JSON.stringify(ill)}
                                    </p>
                                  </div>
                                ))
                              )}
                              {aiContent.type === "activity" && aiContent.activities && (
                                aiContent.activities.map((act: any, i: number) => (
                                  <div key={i} className="bg-se-blue/5 border border-se-blue/20 rounded-xl p-4">
                                    <h5 className="font-bold text-sm text-gray-800">{act.title || `Activity ${i + 1}`}</h5>
                                    {act.materials && (
                                      <p className="text-xs text-gray-400 mt-1">
                                        Materials: {Array.isArray(act.materials) ? act.materials.join(", ") : act.materials}
                                      </p>
                                    )}
                                    <p className="text-sm mt-2 text-gray-700">
                                      {typeof act === "string" ? act : act.description || act.instructions || JSON.stringify(act)}
                                    </p>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                /* Unit overview — no lesson selected */
                <div>
                  <div className="bg-se-green/10 border border-se-green/30 rounded-2xl p-6 mb-6">
                    <span className="text-xs font-semibold text-se-green">Unit {unit.number}</span>
                    <h2 className="font-display text-2xl font-bold mt-1 text-gray-800">{unit.title}</h2>
                    <p className="text-gray-500 mt-2 text-sm leading-relaxed">{unit.description}</p>

                    {unit.elementSpotlight && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
                        <h3 className="font-display font-bold text-blue-800 text-sm mb-2 flex items-center gap-2">
                          <Star className="w-4 h-4 text-blue-600" />
                          Element of Worship Spotlight
                        </h3>
                        <p className="text-blue-900 text-sm leading-relaxed whitespace-pre-line">
                          {unit.elementSpotlight}
                        </p>
                      </div>
                    )}
                  </div>

                  <h3 className="font-display font-bold text-lg mb-3 text-gray-800">Lessons</h3>
                  <div className="space-y-3">
                    {unit.lessons.map((lesson) => (
                      <motion.button
                        key={lesson.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => {
                          setSelectedLessonId(lesson.id);
                          setAiContent(null);
                        }}
                        className="w-full text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-se-green/50 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold text-se-green">Lesson {lesson.number}</span>
                            <h4 className="font-display font-bold text-gray-800">{lesson.title}</h4>
                            <p className="text-gray-400 text-sm mt-1 line-clamp-2">{lesson.mainIdea}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )
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
