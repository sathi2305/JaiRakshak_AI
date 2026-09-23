import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  RefreshCw,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const JalRakshakCopilot: React.FC = () => {
  const { isCopilotOpen, setIsCopilotOpen, telemetry, buildings, alerts } = useApp();

  const [messages, setMessages] = useState<{ sender: 'user' | 'ai'; text: string; time: string }[]>([
    {
      sender: 'ai',
      text: "Hello! I am your JalRakshak AI Water Copilot. I have live access to campus telemetry, pipe health indices, and hydraulic models. How can I assist you with water conservation or leak diagnosis today?",
      time: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestionPills = [
    "Where is water being wasted right now?",
    "Why is Block A showing high leak risk?",
    "What happens if we drop night pressure by 0.8 bar?",
    "Summarize today's water audit in 3 bullets",
    "How can we raise our Water Efficiency Score to 85?"
  ];

  useEffect(() => {
    if (isCopilotOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isCopilotOpen]);

  if (!isCopilotOpen) return null;

  const handleSend = async (userText: string) => {
    if (!userText.trim() || isTyping) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessages = [
      ...messages,
      { sender: 'user' as const, text: userText, time: timeStr }
    ];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const history = newMessages.map(m => ({ sender: m.sender, text: m.text }));
      const res = await api.sendCopilotMessage(userText, history);

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: res.reply || "I've processed your query against campus telemetry.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: "I encountered an error connecting to the Copilot inference endpoint. Please ensure the server is running.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        
        {/* Copilot Header */}
        <div className="p-4 bg-linear-to-r from-slate-900 to-cyan-950 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm">JalRakshak AI Copilot</h3>
                <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 px-1.5 py-0.2 rounded">
                  AI Assistant
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Context-grounded operational reasoning assistant
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCopilotOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Context Telemetry Pill */}
        <div className="bg-cyan-50 border-b border-cyan-100 px-4 py-2 flex items-center justify-between text-[11px] text-cyan-900">
          <span>Campus State: <strong>{telemetry.flowRateLpm} L/min</strong> | <strong>{telemetry.leakageRiskPercent}% Risk</strong></span>
          <span className="flex items-center gap-1 font-semibold text-cyan-700">
            <ShieldCheck className="w-3.5 h-3.5" />
            Grounded in Real Sensors
          </span>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-7 h-7 rounded-lg bg-cyan-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/80 shadow-2xs whitespace-pre-wrap'
                }`}
              >
                {m.text}
                <div
                  className={`text-[9px] mt-1 text-right ${
                    m.sender === 'user' ? 'text-slate-400' : 'text-slate-400'
                  }`}
                >
                  {m.time}
                </div>
              </div>

              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                  ME
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-400 pl-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-600" />
              <span>Analyzing hydraulic data and formulating recommendations...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="p-3 bg-slate-50 border-t border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Suggested Inquiries
          </span>
          <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            {suggestionPills.map((pill, i) => (
              <button
                key={i}
                onClick={() => handleSend(pill)}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-cyan-50 hover:border-cyan-200 hover:text-cyan-900 text-[11px] whitespace-nowrap transition-colors shadow-2xs font-medium"
              >
                {pill}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Input Field */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask JalRakshak Copilot anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
