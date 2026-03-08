import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle, Star, RotateCcw, Loader2 } from "lucide-react";

interface Props {
  childName: string;
  unitId: number;
  onBack: () => void;
}

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface LessonData {
  id: number;
  number: number;
  title: string;
  preGeneratedQuiz?: Question[];
}

interface UnitDetail {
  id: number;
  number: number;
  title: string;
  lessons: LessonData[];
}

const EMOJI_SET = ["📖", "⭐", "📢", "🙌", "🎵", "🙏", "💡", "❤️"];

const SIMPLE_FALLBACK_QUESTIONS: Question[] = [
  {
    question: "What is worship?",
    options: ["Singing to God", "Playing games", "Sleeping"],
    correctIndex: 0,
    explanation: "Worship is how we show God we love Him!",
  },
];

type Phase = "select" | "quiz" | "complete";

export default function StoryQuiz({ childName, unitId, onBack }: Props) {
  const [phase, setPhase] = useState<Phase>("select");
  const [selectedLesson, setSelectedLesson] = useState<LessonData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);

  const { data: unit, isLoading: unitsLoading } = useQuery<UnitDetail>({
    queryKey: [`/api/worship/units/${unitId}`],
    queryFn: async () => {
      const res = await fetch(`/api/worship/units/${unitId}`);
      return res.json();
    },
  });

  const lessons = unit?.lessons || [];

  const startQuiz = async (lesson: LessonData) => {
    setSelectedLesson(lesson);
    setIsLoadingQuiz(true);

    try {
      if (lesson.preGeneratedQuiz && lesson.preGeneratedQuiz.length > 0) {
        setQuestions(lesson.preGeneratedQuiz);
      } else {
        const res = await fetch("/api/worship/ai/generate-quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessonId: lesson.id, difficulty: "easy" }),
        });
        const data = await res.json();

        if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
          setQuestions(data.questions);
        } else {
          setQuestions(SIMPLE_FALLBACK_QUESTIONS);
        }
      }
    } catch (err) {
      console.error("Error generating quiz:", err);
      setQuestions(SIMPLE_FALLBACK_QUESTIONS);
    }

    setPhase("quiz");
    setCurrentQuestion(0);
    setScore(0);
    setIsAnswered(false);
    setSelectedAnswer(null);
    setIsLoadingQuiz(false);
  };

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);

    if (answerIndex === questions[currentQuestion].correctIndex) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setPhase("complete");
    }
  };

  const resetQuiz = () => {
    setPhase("select");
    setSelectedLesson(null);
    setQuestions([]);
    setCurrentQuestion(0);
    setScore(0);
    setIsAnswered(false);
    setSelectedAnswer(null);
  };

  // LOADING STATE
  if (unitsLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-se-blue animate-spin" />
      </div>
    );
  }

  // NO LESSONS STATE
  if (lessons.length === 0) {
    return (
      <div className="min-h-screen bg-white p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h1 className="font-display text-3xl font-bold text-gray-800 mb-6">Story Quiz</h1>
          <p className="text-gray-600 font-display text-lg mb-8">No lessons available in this unit yet</p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="px-6 py-3 bg-gray-100 text-gray-700 font-display font-bold rounded-2xl hover:bg-gray-200 transition-all"
          >
            Back to Menu
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // SELECT PHASE
  if (phase === "select") {
    return (
      <div className="min-h-screen bg-white p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <button
            onClick={onBack}
            className="mb-6 px-4 py-2 rounded-2xl bg-gray-100 text-gray-700 font-display font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            ← Back
          </button>

          <h1 className="font-display text-3xl font-bold text-gray-800 text-center mb-2">
            Worship Quiz
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Pick a lesson, {childName}! Then answer questions about it.
          </p>

          <div className="grid grid-cols-1 gap-4">
            {lessons.map((lesson, idx) => {
              const emoji = EMOJI_SET[idx % EMOJI_SET.length];
              return (
                <motion.button
                  key={lesson.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => startQuiz(lesson)}
                  className="p-6 rounded-2xl border-2 border-se-blue bg-white hover:bg-se-blue/5 transition-all text-left"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{emoji}</span>
                    <div>
                      <h3 className="font-display font-bold text-gray-800 text-lg">
                        Lesson {lesson.number}
                      </h3>
                      <p className="text-gray-600 text-sm">{lesson.title}</p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>
    );
  }

  // QUIZ PHASE
  if (phase === "quiz" && questions.length > 0) {
    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-white p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-2xl mx-auto"
        >
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <p className="font-display font-semibold text-gray-700">
                Question {currentQuestion + 1} of {questions.length}
              </p>
              <p className="font-display font-bold text-se-blue">
                Score: {score}
              </p>
            </div>
            <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-se-blue"
              />
            </div>
          </div>

          {/* Question Card */}
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl border-2 border-se-blue bg-se-blue/5 mb-6"
          >
            <h2 className="font-display text-xl font-bold text-gray-800 text-center mb-6">
              {question.question}
            </h2>

            <div className="space-y-3">
              {question.options.map((option, idx) => (
                <motion.button
                  key={idx}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => !isAnswered && handleAnswer(idx)}
                  disabled={isAnswered}
                  className={`w-full p-4 rounded-2xl font-display font-bold text-left transition-all ${
                    selectedAnswer === idx
                      ? idx === question.correctIndex
                        ? "bg-se-green text-white border-2 border-se-green"
                        : "bg-red-300 text-white border-2 border-red-400"
                      : "bg-gray-100 text-gray-800 border-2 border-gray-200 hover:bg-gray-200"
                  }`}
                >
                  {option}
                  {isAnswered && idx === question.correctIndex && (
                    <span className="float-right">✓</span>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Explanation */}
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl border-2 mb-6 ${
                selectedAnswer === question.correctIndex
                  ? "bg-se-green/10 border-se-green"
                  : "bg-red-100 border-red-300"
              }`}
            >
              <p className={`font-display ${
                selectedAnswer === question.correctIndex
                  ? "text-se-green font-bold"
                  : "text-red-700"
              }`}>
                {selectedAnswer === question.correctIndex ? "✨ Great!" : "Not quite!"}
              </p>
              <p className="text-gray-700 text-sm mt-2">{question.explanation}</p>
            </motion.div>
          )}

          {/* Next button */}
          {isAnswered && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={nextQuestion}
              className="w-full px-6 py-3 rounded-2xl font-display font-bold text-white bg-se-purple hover:opacity-90 transition-all"
            >
              {currentQuestion === questions.length - 1 ? "See Results" : "Next Question"}
            </motion.button>
          )}
        </motion.div>
      </div>
    );
  }

  // LOADING QUIZ PHASE
  if (isLoadingQuiz) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-8 h-8 border-4 border-gray-200 border-t-se-blue rounded-full"
        />
      </div>
    );
  }

  // COMPLETE PHASE
  return (
    <div className="min-h-screen bg-white p-6 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-center max-w-md"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex justify-center gap-3 mb-6"
        >
          <Star className="w-8 h-8 text-se-green" fill="currentColor" />
          <Star className="w-8 h-8 text-se-blue" fill="currentColor" />
          <Star className="w-8 h-8 text-se-purple" fill="currentColor" />
        </motion.div>

        <h1 className="font-display text-4xl font-bold text-gray-800 mb-3">
          Excellent!
        </h1>

        <div className="p-6 rounded-2xl bg-se-blue/10 border-2 border-se-blue mb-6">
          <p className="font-display text-2xl font-bold text-se-blue">
            {score} out of {questions.length}
          </p>
          <p className="text-gray-600 text-sm mt-2">Great job, {childName}!</p>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={resetQuiz}
          className="px-6 py-3 rounded-2xl font-display font-bold text-white bg-se-green hover:opacity-90 transition-all flex items-center justify-center gap-2 mx-auto"
        >
          <RotateCcw className="w-5 h-5" />
          Try Another Quiz
        </motion.button>
      </motion.div>
    </div>
  );
}
