import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  ChevronRight,
  BookOpen,
  MessageCircle,
  Heart,
} from "lucide-react";

interface SMJLesson {
  id: string;
  lessonNumber: number;
  title: string;
  scripture: string;
  status: string;
}

interface ParentGuide {
  summary: string;
  catechismPractice: { question: string; answer: string; tip?: string }[];
  versesToReview: { reference: string; text: string }[];
  familyDiscussion: string[];
  closingPrayer: string;
}

export default function SMJParents() {
  const [, setLocation] = useLocation();
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<SMJLesson | null>(null);
  const [guideData, setGuideData] = useState<ParentGuide | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: lessons } = useQuery<SMJLesson[]>({
    queryKey: ["/api/smj/lessons"],
    queryFn: async () => {
      const res = await fetch("/api/smj/lessons");
      return res.json();
    },
  });

  const completedLessons = lessons?.filter((l) => l.status === "ready" || l.status === "complete") || [];

  async function generateParentGuide(lesson: SMJLesson) {
    setSelectedLessonId(lesson.id);
    setSelectedLesson(lesson);
    setLoading(true);
    setGuideData(null);
    setError(null);

    try {
      const res = await fetch("/api/smj/ai/parent-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: lesson.id }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to generate guide");
      }
      const data = await res.json();
      setGuideData(data);
    } catch (err: any) {
      setError(err.message || "Failed to generate guide. Make sure OPENAI_API_KEY is set.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
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
            <span className="text-gray-400 text-sm ml-2">Parents</span>
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {!selectedLessonId ? (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="font-display font-bold text-gray-800 mb-2">
                At-Home Guide
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                Select a lesson to generate a take-home guide for your family.
              </p>

              {!lessons ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-gray-300 animate-spin" />
                </div>
              ) : completedLessons.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No lessons available yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {completedLessons.map((lesson) => (
                    <motion.button
                      key={lesson.id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => generateParentGuide(lesson)}
                      className="w-full text-left px-4 py-3 rounded-xl border border-se-green/20
                               bg-se-green/5 hover:bg-se-green/10 hover:border-se-green/40
                               transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-display font-bold text-gray-700">
                            Lesson {lesson.lessonNumber}: {lesson.title}
                          </p>
                          <p className="text-sm text-gray-500">{lesson.scripture}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-se-green flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-se-blue animate-spin mb-3" />
            <p className="text-gray-600 font-display">Generating at-home guide...</p>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <button
              onClick={() => {
                setSelectedLessonId(null);
                setSelectedLesson(null);
                setGuideData(null);
                setError(null);
              }}
              className="text-se-blue hover:text-se-blue/70 text-sm font-display font-bold flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Lessons
            </button>
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <p className="text-red-600">{error}</p>
            </div>
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
                setSelectedLesson(null);
                setGuideData(null);
              }}
              className="text-se-blue hover:text-se-blue/70 text-sm font-display font-bold flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Lessons
            </button>

            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="font-display font-bold text-gray-800 mb-2">
                This Week's Lesson
              </h2>
              {selectedLesson && (
                <h3 className="text-se-blue font-display font-bold text-lg mb-3">
                  Lesson {selectedLesson.lessonNumber}: {selectedLesson.title}
                </h3>
              )}
              <p className="text-gray-600">{guideData.summary}</p>
            </div>

            {guideData.catechismPractice && guideData.catechismPractice.length > 0 && (
              <div className="bg-white border-2 border-se-green/30 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-se-green" />
                  <h2 className="font-display font-bold text-se-green">Catechism Practice</h2>
                </div>
                <div className="space-y-3">
                  {guideData.catechismPractice.map((pair, idx) => (
                    <div key={idx} className="bg-se-green/5 border border-se-green/20 rounded-xl p-4">
                      <p className="font-display font-bold text-gray-800 mb-1">
                        {pair.question}
                      </p>
                      <p className="text-gray-700 mb-2">{pair.answer}</p>
                      {pair.tip && (
                        <p className="text-sm text-se-green italic">💡 {pair.tip}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {guideData.versesToReview && guideData.versesToReview.length > 0 && (
              <div className="bg-white border-2 border-se-blue/30 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-se-blue" />
                  <h2 className="font-display font-bold text-se-blue">Bible Verses to Review</h2>
                </div>
                <div className="space-y-3">
                  {guideData.versesToReview.map((verse, idx) => (
                    <div key={idx} className="bg-se-blue/5 border border-se-blue/20 rounded-xl p-4">
                      <p className="text-gray-700 italic text-lg mb-1">"{verse.text}"</p>
                      <p className="text-gray-400 text-sm">— {verse.reference}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {guideData.familyDiscussion && guideData.familyDiscussion.length > 0 && (
              <div className="bg-white border-2 border-se-purple/30 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MessageCircle className="w-5 h-5 text-se-purple" />
                  <h2 className="font-display font-bold text-se-purple">Family Discussion</h2>
                </div>
                <p className="text-gray-500 text-sm mb-3">
                  Try these conversation starters at dinner or bedtime:
                </p>
                <div className="space-y-3">
                  {guideData.familyDiscussion.map((starter, idx) => (
                    <div key={idx} className="flex gap-3">
                      <span className="text-se-purple font-bold flex-shrink-0">•</span>
                      <p className="text-gray-700">{starter}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {guideData.closingPrayer && (
              <div className="bg-white border-2 border-se-green/30 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-5 h-5 text-se-green" />
                  <h2 className="font-display font-bold text-se-green">Closing Prayer</h2>
                </div>
                <p className="text-gray-500 text-sm mb-3">
                  Pray this together with your child:
                </p>
                <p className="text-gray-700 italic leading-relaxed">{guideData.closingPrayer}</p>
              </div>
            )}
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
