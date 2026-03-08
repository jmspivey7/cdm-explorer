import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Star, Users } from "lucide-react";

export default function Worship() {
  const [, setLocation] = useLocation();

  const roles = [
    {
      id: "teacher",
      title: "Teacher",
      icon: BookOpen,
      subtitle: "Browse curriculum, prepare lessons, get AI-powered teaching ideas",
      accentColor: "se-blue",
      borderColor: "border-se-blue/30",
      hoverBg: "hover:bg-se-blue/5",
      textColor: "text-se-blue",
      path: "/worship/teacher",
    },
    {
      id: "children",
      title: "Children",
      icon: Star,
      subtitle: "Explore worship elements, play games, learn memory verses",
      accentColor: "se-green",
      borderColor: "border-se-green/30",
      hoverBg: "hover:bg-se-green/5",
      textColor: "text-se-green",
      path: "/worship/children",
    },
    {
      id: "parents",
      title: "Parents",
      icon: Users,
      subtitle: "At-home guides, family activities, and discussion starters",
      accentColor: "se-purple",
      borderColor: "border-se-purple/30",
      hoverBg: "hover:bg-se-purple/5",
      textColor: "text-se-purple",
      path: "/worship/parents",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3 sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <button
          onClick={() => setLocation("/")}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="font-display font-bold text-gray-800 text-lg">
            <span className="font-accent text-2xl text-se-green">Worship</span>{" "}
            <span className="font-accent text-2xl text-se-blue">Explorer</span>
          </h1>
        </div>
      </div>

      {/* Role Cards */}
      <div className="max-w-lg mx-auto px-6 py-8">
        <div className="space-y-3">
          {roles.map((role, index) => {
            const IconComponent = role.icon;
            return (
              <motion.button
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setLocation(role.path)}
                className={`w-full bg-white border-2 ${role.borderColor} rounded-2xl p-6
                           ${role.hoverBg} transition-all group shadow-sm text-left`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                              bg-${role.accentColor}/10`}>
                    <IconComponent className={`w-6 h-6 ${role.textColor}`} />
                  </div>
                  <div className="flex-1">
                    <h2 className={`font-display font-bold text-lg ${role.textColor} mb-1`}>
                      {role.title}
                    </h2>
                    <p className="text-gray-500 text-sm">
                      {role.subtitle}
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
