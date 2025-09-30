import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Target, TrendingUp, Zap, MessageSquare } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

type Message = {
  id: number;
  sender: "user" | "bot";
  content: string;
};

export default function GoalBot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now(), sender: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/generate-goal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput: input }),
      });
      const data = await res.json();

      let botContent = "";
      if (data.message) {
        botContent = data.message;
      } else {
        botContent = `${data.platform}\nGoal: ${data.goal}\nTarget: ${data.target}\nTimeline: ${data.timeline}`;
        if (data.steps?.length > 0) {
          botContent +=
            "\nSteps:\n" + data.steps.map((s: { day: string; action: string }) => `${s.day}: ${s.action}`).join("\n");
        }
      }

      const botMsg: Message = { id: Date.now() + 1, sender: "bot", content: botContent };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Error fetching goal:", err);
      const botMsg: Message = { id: Date.now() + 1, sender: "bot", content: "⚠️ Something went wrong. Please try again." };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  }

  const quickPrompts = [
    { icon: Target, text: "Create a sales goal", color: "from-purple-500 to-pink-500" },
    { icon: TrendingUp, text: "Boost engagement by 20%", color: "from-blue-500 to-cyan-500" },
    { icon: Zap, text: "Launch new campaign", color: "from-orange-500 to-yellow-500" },
  ];

  return (
    <DashboardLayout>
      <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-8 flex flex-col">
        <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 mb-6 flex items-center gap-2">
          <Sparkles className="w-8 h-8" /> Store-iq AI Bot
        </h1>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-800/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <div className="relative mb-8">
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-2xl opacity-50 absolute inset-0 animate-pulse"></div>
                  <div className="relative w-32 h-32 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-xl">
                    <MessageSquare className="w-16 h-16 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Welcome to Store-iq AI</h2>
                <p className="text-gray-400 mb-8 max-w-md">
                  I'm here to help you create and achieve your business goals. Let's turn your vision into actionable steps!
                </p>

                {/* Quick Prompts */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
                  {quickPrompts.map((prompt, idx) => (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => setInput(prompt.text)}
                      className="group relative bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-xl p-4 transition-all duration-300 hover:scale-105"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${prompt.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity`}></div>
                      <prompt.icon className={`w-8 h-8 mb-2 bg-gradient-to-br ${prompt.color} bg-clip-text text-transparent`} />
                      <p className="text-white text-sm font-medium">{prompt.text}</p>
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : (
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl whitespace-pre-wrap break-words shadow-lg ${
                        msg.sender === "user"
                          ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-br-sm"
                          : "bg-gray-800/80 backdrop-blur-sm text-gray-100 border border-gray-700 rounded-bl-sm"
                      }`}
                    >
                      {msg.sender === "bot" && (
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-700">
                          <Sparkles className="w-4 h-4 text-purple-400" />
                          <span className="text-xs font-semibold text-purple-400">Store-iq AI</span>
                        </div>
                      )}
                      <p className="text-sm md:text-base leading-relaxed">{msg.content}</p>
                    </div>
                  </motion.div>
                ))}

                {loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 p-4 rounded-2xl rounded-bl-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></div>
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-200"></div>
                        </div>
                        <span className="text-gray-400 text-sm">Analyzing your request...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="border-t border-gray-700/50 bg-gray-800/50 backdrop-blur-sm p-4 flex gap-2">
            <input
              type="text"
              placeholder="Describe your goal or ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 p-4 rounded-xl bg-gray-900/50 border border-gray-700 text-white outline-none placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all disabled:opacity-50"
            />
            <motion.button
              type="submit"
              disabled={loading || !input.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
