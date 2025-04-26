import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { toast } from "react-hot-toast";
import { FaTasks, FaRocket, FaRobot } from "react-icons/fa";

const genAi = new GoogleGenerativeAI("AIzaSyAu3-x3T0-ZP8rHPKHuywK79EZ2PczcvXY");
const model = genAi.getGenerativeModel({ model: "gemini-1.5-pro" });

const LandingPage = () => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const navigate = useNavigate();
  const heroText = "Welcome to Zeno Planner ✨";

  useEffect(() => {
    let i = 0;
    setText("");
    const interval = setInterval(() => {
      setText(heroText.slice(0, i + 1));
      i++;
      if (i >= heroText.length) clearInterval(interval);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const isPlanningRelated = (text) => {
    const planningKeywords = [
      'plan', 'schedule', 'task', 'todo', 'organize', 
      'time management', 'agenda', 'calendar', 'reminder',
      'goal', 'priority', 'deadline', 'meeting', 'appointment',
      'routine', 'daily', 'weekly', 'monthly', 'timeline',
      'productivity', 'efficiency', 'workflow', 'arrange',
      'prepare', 'allocate', 'manage time', 'to-do',
      'planner', 'organizer', 'time block', 'event',
      'exam', 'study', 'morning', 'evening', 'day', 'week',
      'prep', 'revision', 'fitness', 'workout', 'health',
      'habit', 'chore', 'errand', 'session', 'preparation',
      'timetable', 'regimen', 'program', 'checklist'
    ];
    
    const lowerText = text.toLowerCase();
    return planningKeywords.some(keyword => 
      lowerText.includes(keyword) || 
      keyword.includes(lowerText)
    );
  };

  const handleSubmit = async () => {
    if (!input.trim()) {
      toast.error("Please input a task or goal.");
      return;
    }

    if (!isPlanningRelated(input)) {
      toast.error("Please ask about planning or scheduling.");
      setResponse({
        error: "I specialize in creating plans and routines. Please ask me about:\n\n- Daily/weekly routines\n- Study/exam plans\n- Work schedules\n- Fitness regimens\n- Time management strategies\n- Task organization"
      });
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const prompt = `
You are Zeno Planner - an AI planning assistant specialized in creating structured routines and schedules. 

ACCEPTABLE REQUESTS INCLUDE:
- Daily/weekly/monthly routines (morning, evening, etc.)
- Study/exam preparation plans (1 day, 3 days, 1 week, etc.)
- Work schedules and task organization
- Fitness/health routines
- Time management strategies
- Habit building plans

For valid requests, create a detailed plan with this flexible format:

{
  "task": "task_name",
  "duration": "total time or period needed (e.g., '2 hours' or '3 days')",
  "priority": "low/medium/high",
  "reminders": ["motivational quote about productivity"],
  "steps": [
    {
      "step": "Step Title",
      "description": "Detailed instructions",
      "time_allocation": "e.g. 30 minutes or Day 1 Morning",
      "timeline": "9:00 AM - 9:30 AM or Day 1: Morning"
    }
  ],
  "pro_tips": "Productivity tip related to the task"
}

For multi-day plans, structure steps with day numbers (Day 1, Day 2, etc.).

USER REQUEST: "${input}"
`;

      const res = await model.generateContent(prompt);
      const responseText = res.response?.text();
      
      if (!responseText) {
        throw new Error("Failed to generate plan. Please try again.");
      }

      // More flexible response handling
      let jsonResponse;
      try {
        const jsonMatch = responseText.match(/(\{[\s\S]*\})/);
        if (jsonMatch) {
          jsonResponse = JSON.parse(jsonMatch[1]);
        } else {
          // If no JSON found but response looks structured, create a simplified plan
          if (responseText.includes("Step") || responseText.includes("Day")) {
            jsonResponse = {
              task: input,
              duration: "Custom duration",
              steps: responseText.split('\n')
                .filter(line => line.trim().length > 0)
                .map((line, index) => ({
                  step: `Step ${index + 1}`,
                  description: line.trim(),
                  time_allocation: "Custom time",
                  timeline: "Flexible schedule"
                }))
            };
          } else {
            throw new Error("I specialize in creating plans. Try being more specific about your routine needs.");
          }
        }
      } catch (e) {
        console.error("JSON parse error:", e);
        throw new Error("Let me help structure that better. Could you clarify your planning needs?");
      }

      setResponse(jsonResponse);
      toast.success("Plan generated successfully! 🚀");
    } catch (error) {
      console.error("Error:", error.message);
      setResponse({ 
        error: error.message.includes("specialize") 
          ? error.message 
          : "Planning error - please try again with more details"
      });
      if (!error.message.includes("specialize")) {
        toast.error("Planning error - please try again");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white">
      
      {/* Navbar */}
      <nav className="w-full py-6 px-10 flex justify-between items-center backdrop-blur-lg bg-black/30 sticky top-0 z-50">
        <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 text-transparent bg-clip-text">
          Zeno Planner
        </div>
        <div className="space-x-6 text-lg hidden md:flex">
          <a href="#home" className="hover:text-cyan-400">Home</a>
          <a href="#about" className="hover:text-cyan-400">About</a>
          <a href="#features" className="hover:text-cyan-400">Features</a>
          <button
            onClick={() => navigate("/chat")}
            className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 px-4 py-2 rounded-full font-semibold hover:scale-105 transition-all"
          >
            Talk to Zeno
          </button>
        </div>
      </nav>

      {/* Home Section */}
      <section id="home" className="flex flex-col items-center justify-center text-center py-24">
        <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 animate-bounce mb-6">
          {text}
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl mb-10">
          Your smarter way to plan tasks, routines, and achieve goals, powered by AI.
        </p>
        <a href="#get-started" className="bg-cyan-500 hover:bg-cyan-600 px-6 py-3 rounded-xl text-white text-lg font-semibold transition-all">
          Get Started Now
        </a>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 w-full max-w-5xl px-6">
        <h2 className="text-4xl font-bold text-center text-cyan-400 mb-8">About Zeno Planner</h2>
        <p className="text-center text-gray-400 text-lg leading-relaxed">
          Zeno Planner transforms your goals into actionable routines using smart AI planning. 
          It creates morning/evening routines, study schedules, workout plans, and more - 
          with optimal time slots and step-by-step guidance. Focus better. Stress less. Achieve more. 🚀
        </p>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 w-full bg-gray-800/40 rounded-3xl mt-10 px-6">
        <h2 className="text-4xl font-bold text-center text-purple-400 mb-8">Features You'll Love</h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6 bg-gray-900 rounded-2xl shadow-lg hover:scale-105 transition-all">
            <FaTasks className="text-5xl mx-auto text-cyan-400 mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Smart Routines</h3>
            <p>Custom morning/evening routines tailored to your needs.</p>
          </div>
          <div className="p-6 bg-gray-900 rounded-2xl shadow-lg hover:scale-105 transition-all">
            <FaRocket className="text-5xl mx-auto text-yellow-400 mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Study Plans</h3>
            <p>Effective exam preparation schedules for any timeframe.</p>
          </div>
          <div className="p-6 bg-gray-900 rounded-2xl shadow-lg hover:scale-105 transition-all">
            <FaRobot className="text-5xl mx-auto text-pink-400 mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Habit Building</h3>
            <p>Structured plans to develop and maintain healthy habits.</p>
          </div>
        </div>
      </section>

      {/* Get Started Section */}
      <section id="get-started" className="py-20 w-full max-w-2xl px-6">
        <h2 className="text-3xl font-bold text-center text-blue-400 mb-8">Create Your Plan 🚀</h2>
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full p-5 bg-gray-900/70 backdrop-blur-md rounded-xl border border-gray-700 focus:ring-4 focus:ring-cyan-500 placeholder-gray-400 text-white text-lg"
            placeholder="📝 What would you like to plan? (e.g. 'Morning routine', '3-day study plan', 'Workout schedule')"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <button
            onClick={handleSubmit}
            className="absolute right-3 top-3 bottom-3 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 px-6 rounded-xl font-semibold hover:scale-105 transition-all disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Planning..." : "Create Plan"}
          </button>
        </div>
        <p className="text-gray-400 text-sm mt-2 text-center">
          Examples: "Morning routine for workdays", "3-day exam study plan", "Weekly workout schedule"
        </p>
      </section>

      {/* Output Section */}
      {response && (
        <section className="w-full max-w-2xl p-6 mt-10 bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-blue-400/20">
          {response.error ? (
            <div className="text-center">
              <p className="text-red-400 text-lg mb-2">{response.error}</p>
              <p className="text-cyan-300">Try asking about:</p>
              <ul className="list-disc list-inside text-left mt-2 text-gray-300">
                <li>Morning/evening routines</li>
                <li>Study plans for exams</li>
                <li>Weekly workout schedules</li>
                <li>Time management strategies</li>
                <li>Multi-day preparation plans</li>
              </ul>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-cyan-400 mb-4">🗓 Your Custom Plan:</h2>
              <div className="mb-6">
                <p><strong className="text-pink-400">Task:</strong> {response.task || input}</p>
                <p><strong className="text-yellow-400">Duration:</strong> {response.duration || "Custom duration"}</p>
                <p><strong className="text-green-400">Priority:</strong> <span className="capitalize">{response.priority || "medium"}</span></p>
                {response.reminders && (
                  <p><strong className="text-purple-400">Reminder:</strong> {response.reminders[0]}</p>
                )}
              </div>

              {response.steps && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-blue-300 mb-3">Plan Details:</h3>
                  <ul className="space-y-3">
                    {response.steps.map((step, index) => (
                      <li key={index} className="p-4 bg-gray-900/70 rounded-lg">
                        <p className="font-medium text-lg">{step.step || `Step ${index + 1}`}</p>
                        <p className="mt-1">{step.description}</p>
                        {(step.time_allocation || step.timeline) && (
                          <p className="text-sm text-gray-400 mt-2">
                            {step.time_allocation && `⏱ ${step.time_allocation}`}
                            {step.time_allocation && step.timeline && " — "}
                            {step.timeline && `🕒 ${step.timeline}`}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {response.pro_tips && (
                <div className="mt-6 p-4 bg-yellow-900/20 rounded-lg border-l-4 border-yellow-400">
                  <p className="font-semibold text-yellow-300">💡 Pro Tip:</p>
                  <p>{response.pro_tips}</p>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* Footer */}
      <footer className="mt-16 p-6 text-center text-gray-400 text-sm">
        Shraddha Yadav - 12310923 | Paul - 12301317<br />
        © 2025 Zeno Planner. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;