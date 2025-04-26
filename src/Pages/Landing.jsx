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
      'planner', 'organizer', 'time block', 'event'
    ];
    
    const lowerText = text.toLowerCase();
    return planningKeywords.some(keyword => lowerText.includes(keyword));
  };

  const handleSubmit = async () => {
    if (!input.trim()) {
      toast.error("Please input a task or goal.");
      return;
    }

    // Strictly reject non-planning related queries
    if (!isPlanningRelated(input)) {
      toast.error("Please ask about daily planning or scheduling only.");
      setResponse({
        error: "I specialize exclusively in daily planning and scheduling. Please ask me about:\n\n- Creating daily/weekly plans\n- Organizing tasks\n- Time management strategies\n- Prioritizing your schedule\n- Setting up reminders\n- Productivity tips for your routine"
      });
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const prompt = `
You are Zeno Planner - an AI daily planning assistant. Your ONLY purpose is to help users plan their daily tasks, schedule, and time management. 

STRICT RULES:
1. ONLY respond to queries about planning, scheduling, and organizing daily activities
2. REJECT all other topics with: "I specialize in daily planning. How can I help organize your schedule?"
3. NEVER answer programming, technical, or unrelated questions
4. FORMAT all responses as structured planning advice
5. REJECT casual conversation like greetings or small talk

For valid planning requests, create a detailed plan with this EXACT format:

{
  "task": "task_name",
  "suggested_time": "total time needed",
  "priority": "low/medium/high",
  "reminders": ["motivational quote about productivity"],
  "steps": [
    {
      "step": "Step Title",
      "description": "Detailed instructions",
      "time_allocation": "e.g. 30 minutes",
      "timeline": "9:00 AM - 9:30 AM"
    }
  ],
  "pro_tips": "Productivity tip related to the task"
}

User input: "${input}"
`;

      const res = await model.generateContent(prompt);
      const responseText = res.response?.text();
      
      if (!responseText) {
        throw new Error("Failed to generate plan. Please try again.");
      }

      // Additional check for off-topic responses
      if (responseText.includes("I specialize in daily planning") || 
          responseText.includes("I can't answer that")) {
        throw new Error("I specialize in daily planning. How can I help organize your schedule?");
      }

      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
      if (!jsonMatch) {
        throw new Error("I couldn't create a proper plan. Please try being more specific about your scheduling needs.");
      }

      const jsonResponse = JSON.parse(jsonMatch[1]);
      setResponse(jsonResponse);
      toast.success("Plan generated successfully! 🚀");
    } catch (error) {
      console.error("Error:", error.message);
      setResponse({ error: error.message });
      if (!error.message.includes("specialize in daily planning")) {
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
          Your smarter way to plan tasks and achieve goals, powered by AI.
        </p>
        <a href="#get-started" className="bg-cyan-500 hover:bg-cyan-600 px-6 py-3 rounded-xl text-white text-lg font-semibold transition-all">
          Get Started Now
        </a>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 w-full max-w-5xl px-6">
        <h2 className="text-4xl font-bold text-center text-cyan-400 mb-8">About Zeno Planner</h2>
        <p className="text-center text-gray-400 text-lg leading-relaxed">
          Zeno Planner transforms your big goals into small, actionable tasks using smart AI planning. It suggests optimal time slots, breaks down tasks step-by-step, and even motivates you with personalized pro tips! 
          Focus better. Stress less. Achieve more. 🚀
        </p>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 w-full bg-gray-800/40 rounded-3xl mt-10 px-6">
        <h2 className="text-4xl font-bold text-center text-purple-400 mb-8">Features You'll Love</h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6 bg-gray-900 rounded-2xl shadow-lg hover:scale-105 transition-all">
            <FaTasks className="text-5xl mx-auto text-cyan-400 mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Task Breakdown</h3>
            <p>Clear, actionable steps for any goal you input.</p>
          </div>
          <div className="p-6 bg-gray-900 rounded-2xl shadow-lg hover:scale-105 transition-all">
            <FaRocket className="text-5xl mx-auto text-yellow-400 mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Boosted Productivity</h3>
            <p>Smart scheduling keeps your momentum alive every day.</p>
          </div>
          <div className="p-6 bg-gray-900 rounded-2xl shadow-lg hover:scale-105 transition-all">
            <FaRobot className="text-5xl mx-auto text-pink-400 mb-4" />
            <h3 className="text-2xl font-semibold mb-2">AI Motivation</h3>
            <p>Daily tips and reminders that keep you inspired and consistent.</p>
          </div>
        </div>
      </section>

      {/* Get Started Section */}
      <section id="get-started" className="py-20 w-full max-w-2xl px-6">
        <h2 className="text-3xl font-bold text-center text-blue-400 mb-8">Plan Your Day 🚀</h2>
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full p-5 bg-gray-900/70 backdrop-blur-md rounded-xl border border-gray-700 focus:ring-4 focus:ring-cyan-500 placeholder-gray-400 text-white text-lg"
            placeholder="📝 What's your goal today? (e.g. 'Plan my workday', 'Organize study schedule')"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <button
            onClick={handleSubmit}
            className="absolute right-3 top-3 bottom-3 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 px-6 rounded-xl font-semibold hover:scale-105 transition-all disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Planning..." : "Plan Now"}
          </button>
        </div>
        <p className="text-gray-400 text-sm mt-2 text-center">
          Examples: "Work project deadline", "Gym routine", "Study plan for exams"
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
                <li>Daily work schedule</li>
                <li>Study plan for exams</li>
                <li>Fitness routine</li>
                <li>Time management strategies</li>
              </ul>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-cyan-400 mb-4">🗓 Your Smart Plan:</h2>
              <div className="mb-6">
                <p><strong className="text-pink-400">Task:</strong> {response.task}</p>
                <p><strong className="text-yellow-400">Suggested Time:</strong> {response.suggested_time}</p>
                <p><strong className="text-green-400">Priority:</strong> <span className="capitalize">{response.priority}</span></p>
                <p><strong className="text-purple-400">Reminder:</strong> {response.reminders?.[0] || "Stay focused!"}</p>
              </div>

              {response.steps && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-blue-300 mb-3">Step-by-Step:</h3>
                  <ul className="space-y-3">
                    {response.steps.map((step, index) => (
                      <li key={index} className="p-4 bg-gray-900/70 rounded-lg">
                        <p className="font-medium text-lg">Step {index + 1}: {step.step}</p>
                        <p className="mt-1">{step.description}</p>
                        <p className="text-sm text-gray-400 mt-2">⏱ {step.time_allocation} — 🕒 {step.timeline}</p>
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