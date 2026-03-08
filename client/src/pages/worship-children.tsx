import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, Star, Volume2, Loader2 } from "lucide-react";
import ElementExplorer from "../components/worship/children/element-explorer";
import MemoryVerse from "../components/worship/children/memory-verse";
import StoryQuiz from "../components/worship/children/story-quiz";
import CallResponse from "../components/worship/children/call-response";

type ChildView = "menu" | "explore" | "verse" | "quiz" | "callresponse" | "unitselect";

interface Unit {
  id: number;
  number: number;
  title: string;
}

export default function WorshipChildren() {
  const [, setLocation] = useLocation();
  const [currentView, setCurrentView] = useState<ChildView>("menu");
  const [childName, setChildName] = useState("");
  const [nameEntered, setNameEntered] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);

  const { data: units, isLoading: unitsLoading } = useQuery<Unit[]>({
    queryKey: ["/api/worship/units"],
    queryFn: async () => {
      const res = await fetch("/api/worship/units");
      return res.json();
    },
    enabled: currentView === "unitselect",
  });

  const activities: { id: ChildView; title: string; icon: typeof BookOpen; color: string; textColor: string }[] = [
    {
      id: "explore",
      title: "Worship Explorer",
      icon: BookOpen,
      color: "bg-se-blue/10 border-se-blue/30",
      textColor: "text-se-blue",
    },
    {
      id: "verse",
      title: "Memory Verse",
      icon: BookOpen,
      color: "bg-se-green/10 border-se-green/30",
      textColor: "text-se-green",
    },
    {
      id: "quiz",
      title: "Story Quiz",
      icon: Star,
      color: "bg-se-purple/10 border-se-purple/30",
      textColor: "text-se-purple",
    },
    {
      id: "callresponse",
      title: "Call & Response",
      icon: Volume2,
      color: "bg-se-brown/10 border-se-brown/30",
      textColor: "text-se-brown",
    },
  ];

  // Name entry screen
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
            <span className="font-accent text-4xl text-se-blue">Welcome!</span>
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
                         focus:outline-none focus:border-se-blue focus:bg-white
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

  // Activity menu or activity view
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3 sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <button
          onClick={() => {
            if (currentView !== "menu") {
              setCurrentView("menu");
            } else {
              setLocation("/worship");
            }
          }}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="font-display font-bold text-gray-800">
            <span className="font-accent text-2xl text-se-blue">Hi, {childName}!</span>
          </h1>
        </div>
      </div>

      {/* Activity View */}
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
                      setCurrentView("unitselect");
                      setSelectedUnitId(null);
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
        ) : currentView === "unitselect" ? (
          <motion.div
            key="unitselect"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-2xl mx-auto px-6 py-8"
          >
            {unitsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-gray-300 animate-spin" />
              </div>
            ) : !units || units.length === 0 ? (
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
            ) : units.length === 1 ? (
              (() => {
                const unit = units[0];
                setSelectedUnitId(unit.id);
                const selectedActivity = activities.find(a => currentView === a.id) || activities[0];
                const nextView = selectedActivity.id;
                setTimeout(() => setCurrentView(nextView), 0);
                return null;
              })()
            ) : (
              <div>
                <p className="text-gray-600 font-display text-center mb-8">Choose a unit:</p>
                <div className="grid grid-cols-1 gap-4">
                  {units.map((unit, index) => (
                    <motion.button
                      key={unit.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setSelectedUnitId(unit.id);
                        const selectedActivity = activities.find(a => a.id !== "menu") || activities[0];
                        setCurrentView(selectedActivity.id);
                      }}
                      className="bg-white border-2 border-se-blue/30 rounded-2xl p-6 hover:shadow-md transition-all text-left hover:bg-se-blue/5"
                    >
                      <h3 className="font-display font-bold text-gray-800 text-lg">
                        Unit {unit.number}: {unit.title}
                      </h3>
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
        ) : currentView === "explore" && selectedUnitId ? (
          <motion.div
            key="explore"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ElementExplorer
              childName={childName}
            />
          </motion.div>
        ) : currentView === "verse" && selectedUnitId ? (
          <motion.div
            key="verse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <MemoryVerse
              childName={childName}
              unitId={selectedUnitId}
              onBack={() => setCurrentView("menu")}
            />
          </motion.div>
        ) : currentView === "quiz" && selectedUnitId ? (
          <motion.div
            key="quiz"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StoryQuiz
              childName={childName}
              unitId={selectedUnitId}
              onBack={() => setCurrentView("menu")}
            />
          </motion.div>
        ) : currentView === "callresponse" && selectedUnitId ? (
          <motion.div
            key="callresponse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CallResponse
              childName={childName}
              unitId={selectedUnitId}
              onBack={() => setCurrentView("menu")}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
