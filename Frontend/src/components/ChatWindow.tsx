import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, X, Minimize2 } from 'lucide-react';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatWindow: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([{
    text: `Hi! 👋 I'm your property assistant. Ask me things like:\n• Show villa projects in Kompally\n• Plots above 5 acres\n• Projects with RERA approval\n• What is RERA?\n• How can I contact LandsDevelop?`,
    isUser: false,
    timestamp: new Date(),
  }]);
  const [isTyping, setIsTyping] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('http://localhost:5174/api/all')
      .then(res => res.json())
      .then(data => setProjects(data)) // ✅ Not data.projects
      .catch(err => console.error('Failed to fetch projects:', err));
  }, []);
  

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
  
    const userMsg: Message = { text: message, isUser: true, timestamp: new Date() };
    setChatHistory(prev => [...prev, userMsg]);
    setMessage('');
    setIsTyping(true);
  
    try {
      const res = await fetch('http://localhost:5174/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
  
      const data = await res.json();
      const botResponse: Message = { text: data.reply, isUser: false, timestamp: new Date() };
  
      setChatHistory(prev => [...prev, botResponse]);
    } catch (err) {
      setChatHistory(prev => [...prev, { text: '⚠️ Chat API error.', isUser: false, timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };
  
  const generateBotResponse = (query: string): Message => {
    const q = query.toLowerCase();

    // FAQ Responses
    if (q.includes('rera') && !q.includes('project')) {
      return botMsg('RERA stands for Real Estate Regulatory Authority. It ensures transparency and protects home buyers.');
    }
    if (q.includes('contact') || q.includes('call') || q.includes('reach')) {
      return botMsg('📞 You can call us at +91-9876543210 or email support@landsdevelop.com.');
    }
    if (q.includes('location') || q.includes('office')) {
      return botMsg('📍 Our office is located in Gachibowli, Hyderabad.');
    }

    // Filter Projects
    let results = [...projects];

    const areaMatch = q.match(/(\d+)\s*acre/);
    if (areaMatch) {
      const minArea = parseInt(areaMatch[1]);
      results = results.filter(p => parseInt(p.totalArea) >= minArea);
    }

    const ratioMatch = q.match(/(\d{2}):(\d{2})/);
    if (ratioMatch) {
      const ratio = `${ratioMatch[1]}:${ratioMatch[2]}`;
      results = results.filter(p => p.developerRatio.includes(ratio));
    }

    if (/villa|apartment|plotted|standalone|mixed/.test(q)) {
      const type = q.match(/villa|apartment|plotted|standalone|mixed/)?.[0];
      results = results.filter(p => p.developmentType.toLowerCase().includes(type!));
    }

    if (q.includes('rera')) {
      results = results.filter(p => p.reraStatus?.isApproved);
    }

    if (q.includes('clear title')) {
      results = results.filter(p => p.clearTitle?.isVerified);
    }

    if (q.includes('conversion') || q.includes('land')) {
      results = results.filter(p => p.landConversion?.isComplete);
    }

    if (q.includes('goodwill')) {
      const priceMatch = q.match(/less than (\d+)/);
      if (priceMatch) {
        const maxGoodwill = parseInt(priceMatch[1]);
        results = results.filter(p => parseInt(p.goodwill.replace(/\D/g, '')) < maxGoodwill);
      }
    }

    if (/in\s+([a-zA-Z\s]+)/.test(q)) {
      const loc = q.match(/in\s+([a-zA-Z\s]+)/)?.[1].trim().toLowerCase();
      results = results.filter(p => p.location.toLowerCase().includes(loc));
    }

    if (results.length === 0) {
      return botMsg("Sorry, I couldn't find any matching projects. Try using simpler keywords like location, area or type.");
    }

    const links = results.slice(0, 5).map(p => `• ${p.title} in ${p.location} (${p.totalArea})`);
    return botMsg(`I found ${results.length} project(s):\n${links.join('\n')}`);
  };

  const botMsg = (text: string): Message => ({ text, isUser: false, timestamp: new Date() });

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-teal-600 text-white p-4 rounded-full shadow-lg hover:bg-teal-700 flex items-center gap-2"
        >
          <MessageCircle className="h-5 w-5" /> <span className="hidden md:inline">Chat</span>
        </button>
      ) : (
        <div className="bg-white shadow-lg rounded-lg w-96 max-w-full">
          <div className="bg-teal-600 text-white p-4 flex justify-between items-center rounded-t-lg">
            <span className="font-semibold">Property Assistant</span>
            <div className="flex gap-2">
              <button onClick={() => setIsOpen(false)}><Minimize2 className="h-5 w-5" /></button>
              <button onClick={() => setIsOpen(false)}><X className="h-5 w-5" /></button>
            </div>
          </div>
          <div className="h-[400px] overflow-y-auto p-4 space-y-4">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-lg max-w-[80%] ${msg.isUser ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                  <p className="whitespace-pre-line text-sm">{msg.text}</p>
                  <div className="text-right text-xs mt-1 opacity-60">{formatTime(msg.timestamp)}</div>
                </div>
              </div>
            ))}
            {isTyping && <div className="text-sm text-gray-400">Assistant is typing...</div>}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="p-3 border-t flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about properties..."
              className="flex-1 px-3 py-2 border rounded focus:outline-none"
            />
            <button type="submit" disabled={!message.trim()} className="bg-teal-600 text-white px-4 py-2 rounded">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
