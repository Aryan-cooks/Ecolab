import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';

export default function Chat() {
  const { user, sendChatMessage } = useStore();
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: "SYSTEM_INITIALIZATION: CarbonCoach terminal loaded. Ready to route advice. Telemetry from your node is synchronized. Ask me how to optimize transport, nutrition, home energy, or consumption coefficients.",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim() || sending) return;

    if (!textToSend) setInputText('');
    
    // Append user message
    const userMsg = { sender: 'user', text, timestamp: new Date().toISOString() };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setSending(true);

    try {
      // Send chat message (includes context auto injection)
      const reply = await sendChatMessage(text, newHistory);
      setMessages(prev => [...prev, {
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toISOString()
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        sender: 'assistant',
        text: "OPERATOR_ERROR: CONNECTION_TIMEOUT. SERVER IS UNRESPONSIVE.",
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  const quickCommands = [
    { label: "HELP_DECODE_TRANSPORT", text: "How can I reduce my transportation emissions? Give me specific options." },
    { label: "ADVISE_ON_DIET", text: "What dietary changes have the biggest carbon impact in India?" },
    { label: "EXPLAIN_GRID_BASES", text: "Why is electricity emission factor so high in India?" },
    { label: "GET_RATING_RECOMMENDATIONS", text: "Analyze my Green Score and tell me how to get to Guardian tier." }
  ];

  return (
    <main className="p-4 md:p-8 min-h-screen flex flex-col justify-between max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="border-b border-neon-green/30 pb-4 mb-4">
        <h2 className="text-xl font-bold text-neon-green terminal-glow">[ NODE_SYNC_CHAT ]</h2>
        <p className="text-[10px] text-neon-amber mt-1">Converse with CarbonCoach AI Advisor // Session: 0x{user?.uid.slice(0, 6).toUpperCase()}</p>
      </div>

      {/* Terminal Screen */}
      <div className="flex-1 border-2 border-neon-green bg-surface p-4 flex flex-col justify-between min-h-[400px] max-h-[50vh] md:max-h-[60vh] overflow-y-auto mb-4 relative select-text font-mono text-xs">
        <div className="space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-2 mb-1 text-[8px] opacity-50 uppercase">
                <span>{msg.sender === 'user' ? 'operator_input' : 'carbon_coach_reply'}</span>
                <span>//</span>
                <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className={`p-3 max-w-[85%] border leading-relaxed ${
                msg.sender === 'user'
                  ? 'border-neon-amber bg-neon-amber/5 text-neon-amber'
                  : msg.text.startsWith('OPERATOR_ERROR') 
                    ? 'border-neon-red bg-neon-red/5 text-neon-red'
                    : 'border-neon-green bg-black/40 text-neon-green'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex items-start flex-col animate-pulse">
              <div className="text-[8px] opacity-50 uppercase mb-1">carbon_coach_reply // routing...</div>
              <div className="p-3 border border-neon-green bg-black/40 text-neon-green flex items-center gap-2">
                <span className="material-symbols-outlined text-xs animate-spin">sync</span>
                <span>GENERATING_RESPONSE_PULSE...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Commands & Inputs */}
      <div className="space-y-4">
        
        {/* Quick Commands */}
        <div className="space-y-1.5">
          <div className="text-[8px] uppercase text-neon-green/50 font-bold">Quick Diagnostics Commands:</div>
          <div className="flex flex-wrap gap-2">
            {quickCommands.map((cmd) => (
              <button
                key={cmd.label}
                onClick={() => handleSend(cmd.text)}
                disabled={sending}
                className="border border-neon-green/35 text-neon-green hover:border-neon-amber hover:text-neon-amber px-2.5 py-1 text-[8px] font-bold uppercase transition-all bg-black/40"
              >
                {cmd.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={sending}
            placeholder="Type query to CarbonCoach... e.g. how do I reduce food waste?"
            className="flex-1 text-sm py-3 px-4 focus:outline-none placeholder-neon-green/30"
          />
          <button
            onClick={() => handleSend()}
            disabled={sending}
            className="border-2 border-neon-green bg-neon-green text-black hover:bg-black hover:text-neon-green py-3 px-6 font-bold uppercase transition-all text-xs tracking-wider"
          >
            SEND
          </button>
        </div>
      </div>

    </main>
  );
}
