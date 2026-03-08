import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  ChevronRight,
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

interface UnitSummary {
  id: number;
  number: number;
  title: string;
  worshipElement: string;
  lessonsCount: number;
}

interface UnitDetail {
  id: number;
  number: number;
  title: string;
  description: string;
  worshipElement: string;
  lessons: Lesson[];
}

interface ParentGuide {
  lessonTitle?: string;
  summary: string;
  memoryVerse?: string;
  memoryVersePractice: string[] | string;
  familyActivities?: { title: string; materials: string | string[]; instructions: string }[];
  activities?: { title: string; duration?: string; materials: string | string[]; instructions: string }[];
  discussionStarters?: string[];
  prayerFocus?: string;
}

export default function WorshipParents() {
  const [, setLocation] = useLocation();
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [guideData, setGuideData] = useState<ParentGuide | null>(null);
  const [loading, setLoading] = useState(false);
  const [lessonData, setLessonData] = useState<Lesson | null>(null);

  const { data: allUnits } = useQuery<UnitSummary[]>({
    queryKey: ["/api/worship/units"],
    queryFn: async () => {
      const res = await fetch("/api/worship/units");
      return res.json();
    },
  });

  const { data: selectedUnit } = useQuery<UnitDetail>({
    queryKey: [`/api/worship/units/${selectedUnitId}`],
    queryFn: async () => {
      const res = await fetch(`/api/worship/units/${selectedUnitId}`);
      return res.json();
    },
    enabled: !!selectedUnitId,
  });

  async function generateParentGuide(lessonId: number) {
    setLoading(true);
    setGuideData(null);

    try {
      const res = await fetch("/api/worship/ai/parent-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId }),
      });
      const data = await res.json();
      setGuideData(data.guide || data);
    } catch (err: any) {
      setGuideData({
        lessonTitle: "Error",
        summary: err.message || "Failed to generate guide. Make sure OPENAI_API_KEY is set.",
        memoryVerse: "",
        memoryVersePractice: "",
        familyActivities: [],
        discussionStarters: [],
        prayerFocus: "",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleSelectLesson(lesson: Lesson) {
    setSelectedLessonId(lesson.id);
    setLessonData(lesson);
    generateParentGuide(lesson.id);
  }

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
            <span className="text-gray-400 text-sm ml-2">Parents</span>
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {!selectedLessonId ? (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="font-display font-bold text-gray-800 mb-4">
                Select a Lesson to Get Started
              </h2>

              {!allUnits ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-gray-300 animate-spin" />
                </div>
              ) : (
                <div className="space-y-2">
                  {allUnits.map((unit) => (
                    <button
                      key={unit.id}
                      onClick={() => setSelectedUnitId(unit.id)}
                      className="w-full text-left px-4 py-3 rounded-xl border border-gray-200
                               hover:bg-gray-50 hover:border-gray-300 transition-all"
                    >
                      <p className="font-display font-bold text-gray-700">
                        Unit {unit.number}: {unit.title}
                      </p>
                      <p className="text-sm text-gray-400">{unit.lessonsCount || 0} lessons</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedUnitId && selectedUnit && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-2xl p-6"
              >
                <h2 className="font-display font-bold text-gray-800 mb-4">
                  {selectedUnit.title}
                </h2>

                <div className="space-y-2">
                  {selectedUnit.lessons.map((lesson) => (
                    <motion.button
                      key={lesson.id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => handleSelectLesson(lesson)}
                      className="w-full text-left px-4 py-3 rounded-xl border border-se-green/20
                               bg-se-green/5 hover:bg-se-green/10 hover:border-se-green/40
                               transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-display font-bold text-gray-700">
                            Lesson {lesson.number}: {lesson.title}
                          </p>
                          <p className="text-sm text-gray-500">{lesson.mainIdea}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-se-green flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-se-blue animate-spin mb-3" />
            <p className="text-gray-600 font-display">Generating parent guide...</p>
          </div>
        ) : guideData ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <button
              onClick={() => {
                setSelectedLessonId(null);
                setGuideData(null);
              }}
              className="text-se-blue hover:text-se-blue/70 text-sm font-display font-bold flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Lessons
            </button>

            {/* This Week's Lesson */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="font-display font-bold text-gray-800 mb-2">
                This Week's Lesson
              </h2>
              {(guideData.lessonTitle || lessonData?.title) && (
                <h3 className="text-se-blue font-display font-bold text-lg mb-3">
                  {guideData.lessonTitle || lessonData?.title}
                </h3>
              )}
              <p className="text-gray-600">{guideData.summary}</p>
            </div>

            {/* Memory Verse */}
            {(guideData.memoryVerse || lessonData?.memoryVerse || guideData.memoryVersePractice) && (
              <div className="bg-white border-2 border-se-green/30 rounded-2xl p-6">
                <h2 className="font-display font-bold text-se-green mb-3">Memory Verse</h2>
                {(guideData.memoryVerse || lessonData?.memoryVerse) && (
                  <p className="text-gray-700 italic mb-2 text-lg">
                    {guideData.memoryVerse || lessonData?.memoryVerse}
                    {lessonData?.memoryVerseReference && (
                      <span className="text-gray-400 text-sm not-italic ml-2">— {lessonData.memoryVerseReference}</span>
                    )}
                  </p>
                )}
                {guideData.memoryVersePractice && (
                  <div className="bg-se-green/5 border border-se-green/20 rounded-xl p-4">
                    <p className="text-xs font-bold text-se-green uppercase tracking-wider mb-2">Practice Tips</p>
                    {Array.isArray(guideData.memoryVersePractice) ? (
                      <ul className="space-y-1">
                        {guideData.memoryVersePractice.map((tip, i) => (
                          <li key={i} className="text-sm text-gray-700 flex gap-2">
                            <span className="text-se-green font-bold">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-700">{guideData.memoryVersePractice}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Family Activities */}
            {(() => {
              const acts = guideData.familyActivities || guideData.activities || [];
              return acts.length > 0 ? (
                <div className="bg-white border-2 border-se-blue/30 rounded-2xl p-6">
                  <h2 className="font-display font-bold text-se-blue mb-4">Family Activities</h2>
                  <div className="space-y-4">
                    {acts.map((activity, idx) => (
                      <div key={idx} className="bg-se-blue/5 border border-se-blue/20 rounded-xl p-4">
                        <h3 className="font-display font-bold text-gray-800 mb-2">
                          {activity.title}
                          {activity.duration && <span className="text-gray-400 text-sm font-normal ml-2">({activity.duration})</span>}
                        </h3>
                        <div className="space-y-2 text-sm text-gray-700">
                          {activity.materials && (
                            <div>
                              <span className="font-bold text-gray-800">Materials:</span>{" "}
                              {Array.isArray(activity.materials) ? activity.materials.join(", ") : activity.materials}
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-gray-800">Instructions:</span>{" "}
                            {activity.instructions}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}

            {/* Discussion Starters */}
            {guideData.discussionStarters?.length > 0 && (
              <div className="bg-white border-2 border-se-purple/30 rounded-2xl p-6">
                <h2 className="font-display font-bold text-se-purple mb-4">Discussion Starters</h2>
                <div className="space-y-3">
                  {guideData.discussionStarters.map((starter, idx) => (
                    <div key={idx} className="flex gap-3">
                      <span className="text-se-purple font-bold flex-shrink-0">•</span>
                      <p className="text-gray-700">{starter}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prayer Focus */}
            {guideData.prayerFocus && (
              <div className="bg-white border-2 border-se-green/30 rounded-2xl p-6">
                <h2 className="font-display font-bold text-se-green mb-3">Prayer Focus</h2>
                <p className="text-gray-700">{guideData.prayerFocus}</p>
              </div>
            )}
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
