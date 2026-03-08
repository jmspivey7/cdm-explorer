import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, Star, Volume2, Loader2, ListOrdered, BookOpenCheck } from "lucide-react";
import BibleStoryExplorer from "../components/smj/children/bible-story-explorer";
import CatechismQuiz from "../components/smj/children/catechism-quiz";
import BibleVersePractice from "../components/smj/children/bible-verse-practice";
import StoryRetelling from "../components/smj/children/story-retelling";

type ChildView = "menu" | "lessonselect" | "story" | "catechism" | "verse" | "retelling";

interface SMJLessonSummary {
  id: string;
  lessonNumber: number;
  title: string;
  scripture: string;
  status: string;
}

export default function SMJChildren() {
  const [, setLocation] = useLocation();
  const [currentView, setCurrentView] = useState<ChildView>("menu");
  const [childName, setChildName] = useState("");
  const [nameEntered, setNameEntered] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [pendingActivity, setPendingActivity] = useState<ChildView | null>(null);

  const { data: lessons, isLoading: lessonsLoading } = useQuery<SMJLessonSummary[]>({
    queryKey: ["/api/smj/lessons"],
    queryFn: async () => {
      const res = await fetch("/api/smj/lessons");
      return res.json();
    },
    enabled: currentView === "lessonselect",
  });

  const completedLessons = lessons?.filter((l) => l.status === "ready" || l.status === "complete") ?? [];

  const { data: lessonDetail } = useQuery<any>({
    queryKey: [`/api/smj/lessons/${selectedLessonId}`],
    queryFn: async () => {
      const res = await fetch(`/api/smj/lessons/${selectedLessonId}`);
      return res.json();
    },
    enabled: !!selectedLessonId && currentView !== "menu" && currentView !== "lessonselect",
  });

  useEffect(() => {
    if (currentView === "lessonselect" && completedLessons.length === 1 && pendingActivity) {
      setSelectedLessonId(completedLessons[0].id);
      setCurrentView(pendingActivity);
      setPendingActivity(null);
    }
  }, [currentView, completedLessons, pendingActivity]);

  const activities: { id: ChildView; title: string; icon: typeof BookOpen; color: string; textColor: string }[] = [
    {
      id: "story",
      title: "Bible Story Explorer",
      icon: BookOpen,
      color: "bg-se-blue/10 border-se-blue/30",
      textColor: "text-se-blue",
    },
    {
      id: "catechism",
      title: "Catechism Quiz",
      icon: Star,
      color: "bg-se-green/10 border-se-green/30",
      textColor: "text-se-green",
    },
    {
      id: "verse",
      title: "Bible Verse Practice",
      icon: BookOpenCheck,
      color: "bg-se-purple/10 border-se-purple/30",
      textColor: "text-se-purple",
    },
    {
      id: "retelling",
      title: "Story Retelling",
      icon: ListOrdered,
      color: "bg-se-brown/10 border-se-brown/30",
      textColor: "text-se-brown",
    },
  ];

  if (!nameEntered) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-xs"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
            className="text-5xl mb-6"
          >
            👋
          </motion.div>

          <h1 className="font-display text-3xl font-extrabold text-gray-800 mb-2">
            <span className="font-accent text-4xl text-se-green">Welcome!</span>
          </h1>

          <p className="text-gray-600 font-display text-lg mb-8">
            What is your name?
          </p>

          <div className="w-full">
            <input
              type="text"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && childName.trim()) setNameEntered(true);
              }}
              placeholder="Type your name..."
              className="w-full text-center text-xl font-display font-bold
                         bg-white border-2 border-gray-200 rounded-2xl px-6 py-4
                         text-gray-800 placeholder:text-gray-400
                         focus:outline-none focus:border-se-green focus:bg-white
                         transition-all"
              autoFocus
            />

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (childName.trim()) setNameEntered(true);
              }}
              disabled={!childName.trim()}
              className="mt-6 w-full px-6 py-4 bg-se-green text-white
                         font-display font-bold text-lg rounded-2xl
                         hover:bg-se-green/90 transition-all
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Let's Go!
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 py-3 flex items-center gap-3 sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <button
          onClick={() => {
            if (currentView !== "menu") {
              setCurrentView("menu");
            } else {
              setLocation("/smj");
            }
          }}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="font-display font-bold text-gray-800">
            <span className="font-accent text-2xl text-se-green">Hi, {childName}!</span>
          </h1>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {currentView === "menu" ? (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-2xl mx-auto px-6 py-8"
          >
            <p className="text-gray-600 font-display text-center mb-8">Choose an activity:</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activities.map((activity, index) => {
                const IconComponent = activity.icon;
                return (
                  <motion.button
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setPendingActivity(activity.id);
                      setCurrentView("lessonselect");
                      setSelectedLessonId(null);
                    }}
                    className={`bg-white border-2 ${activity.color} rounded-2xl p-6
                               hover:shadow-md transition-all text-left`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                                  ${activity.color.split(' border')[0]}`}>
                        <IconComponent className={`w-6 h-6 ${activity.textColor}`} />
                      </div>
                      <div>
                        <h2 className={`font-display font-bold text-lg ${activity.textColor}`}>
                          {activity.title}
                        </h2>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ) : currentView === "lessonselect" ? (
          <motion.div
            key="lessonselect"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-2xl mx-auto px-6 py-8"
          >
            {lessonsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-gray-300 animate-spin" />
              </div>
            ) : completedLessons.length === 0 ? (
              <div className="text-center">
                <p className="text-gray-600 font-display text-lg mb-6">No lessons available yet</p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentView("menu")}
                  className="px-6 py-3 bg-gray-100 text-gray-700 font-display font-bold rounded-2xl hover:bg-gray-200 transition-all"
                >
                  Back to Menu
                </motion.button>
              </div>
            ) : completedLessons.length === 1 ? (
              pendingActivity ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-gray-300 animate-spin" />
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 font-display text-lg mb-6">Something went wrong</p>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentView("menu")}
                    className="px-6 py-3 bg-gray-100 text-gray-700 font-display font-bold rounded-2xl hover:bg-gray-200 transition-all"
                  >
                    Back to Menu
                  </motion.button>
                </div>
              )
            ) : (
              <div>
                <p className="text-gray-600 font-display text-center mb-8">Choose a lesson:</p>
                <div className="grid grid-cols-1 gap-4">
                  {completedLessons.map((lesson, index) => (
                    <motion.button
                      key={lesson.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setSelectedLessonId(lesson.id);
                        if (pendingActivity) {
                          setCurrentView(pendingActivity);
                          setPendingActivity(null);
                        } else {
                          setCurrentView("menu");
                        }
                      }}
                      className="bg-white border-2 border-se-green/30 rounded-2xl p-6 hover:shadow-md transition-all text-left hover:bg-se-green/5"
                    >
                      <h3 className="font-display font-bold text-gray-800 text-lg">
                        Lesson {lesson.lessonNumber}: {lesson.title}
                      </h3>
                      {lesson.scripture && (
                        <p className="text-sm text-gray-500 mt-1">{lesson.scripture}</p>
                      )}
                    </motion.button>
                  ))}
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentView("menu")}
                  className="w-full mt-6 px-6 py-3 bg-gray-100 text-gray-700 font-display font-bold rounded-2xl hover:bg-gray-200 transition-all"
                >
                  Back to Menu
                </motion.button>
              </div>
            )}
          </motion.div>
        ) : currentView === "story" && selectedLessonId ? (
          <motion.div
            key="story"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <BibleStoryExplorer
              childName={childName}
              lessonId={selectedLessonId}
              onBack={() => setCurrentView("menu")}
            />
          </motion.div>
        ) : currentView === "catechism" && selectedLessonId ? (
          <motion.div
            key="catechism"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {!lessonDetail ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-se-green animate-spin" />
              </div>
            ) : lessonDetail?.catechismPairs?.length > 0 ? (
              <CatechismQuiz
                childName={childName}
                catechismPairs={lessonDetail.catechismPairs}
                onBack={() => setCurrentView("menu")}
              />
            ) : (
              <div className="max-w-2xl mx-auto px-6 py-8 text-center">
                <p className="text-gray-400 font-display mb-4">No catechism questions available for this lesson.</p>
                <button onClick={() => setCurrentView("menu")} className="px-6 py-3 bg-gray-100 text-gray-700 font-display font-bold rounded-2xl">Back to Menu</button>
              </div>
            )}
          </motion.div>
        ) : currentView === "verse" && selectedLessonId ? (
          <motion.div
            key="verse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {!lessonDetail ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-se-purple animate-spin" />
              </div>
            ) : lessonDetail?.bibleVerses?.length > 0 ? (
              <BibleVersePractice
                childName={childName}
                verses={lessonDetail.bibleVerses}
                onBack={() => setCurrentView("menu")}
              />
            ) : (
              <div className="max-w-2xl mx-auto px-6 py-8 text-center">
                <p className="text-gray-400 font-display mb-4">No Bible verses available for this lesson.</p>
                <button onClick={() => setCurrentView("menu")} className="px-6 py-3 bg-gray-100 text-gray-700 font-display font-bold rounded-2xl">Back to Menu</button>
              </div>
            )}
          </motion.div>
        ) : currentView === "retelling" && selectedLessonId ? (
          <motion.div
            key="retelling"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {!lessonDetail ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-se-brown animate-spin" />
              </div>
            ) : lessonDetail?.storySequenceEvents?.length > 0 ? (
              <StoryRetelling
                childName={childName}
                lessonId={selectedLessonId}
                storySequenceEvents={lessonDetail.storySequenceEvents}
                onBack={() => setCurrentView("menu")}
              />
            ) : (
              <div className="max-w-2xl mx-auto px-6 py-8 text-center">
                <p className="text-gray-400 font-display mb-4">No story events available for this lesson.</p>
                <button onClick={() => setCurrentView("menu")} className="px-6 py-3 bg-gray-100 text-gray-700 font-display font-bold rounded-2xl">Back to Menu</button>
              </div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
