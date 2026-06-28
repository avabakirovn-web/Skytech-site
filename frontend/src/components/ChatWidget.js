import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ChatWidget = () => {
  const { token, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && token) {
      fetchMessages();
    }
  }, [isOpen, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API}/chat/messages`, { headers: { Authorization: `Bearer ${token}` } });
      setMessages(res.data);
    } catch (error) {
      console.error('Xato:', error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || loading) return;

    try {
      setLoading(true);
      await axios.post(
        `${API}/chat/send`,
        { message: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMessage('');
      await fetchMessages();
    } catch (error) {
      console.error('Xato:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
        data-testid="chat-toggle"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[500px] bg-white dark:bg-[#0A2540] rounded-3xl shadow-2xl border border-black/5 dark:border-white/10 flex flex-col overflow-hidden" data-testid="chat-window">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">SkyTech Yordam</p>
                <p className="text-sm opacity-90">Onlayn</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F5F7FA] dark:bg-[#0A2540]/50">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#475569] dark:text-gray-300 text-sm">
                  Salom! Sizga qanday yordam bera olamiz?
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.is_support ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                      msg.is_support
                        ? 'bg-white dark:bg-white/10 text-[#0A2540] dark:text-white'
                        : 'bg-[#3B82F6] text-white'
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 border-t border-black/5 dark:border-white/10 bg-white dark:bg-[#0A2540]">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Xabar yozing..."
                className="flex-1 px-4 py-2 rounded-full border border-black/10 dark:border-white/10 bg-[#F5F7FA] dark:bg-white/5 text-[#0A2540] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
                data-testid="chat-input"
              />
              <button
                type="submit"
                disabled={loading || !newMessage.trim()}
                className="w-10 h-10 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-full flex items-center justify-center disabled:opacity-50 transition-all"
                data-testid="chat-send"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
