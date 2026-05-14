import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API = 'http://localhost:8000';

const SUGGESTIONS = [
  'Help me plan my day',
  'Review my code',
  'Write a professional email',
  'Brainstorm ideas with me',
];

function Message({ role, content }) {
  return (
    <div className={`message-row ${role}`}>
      <div className="avatar">{role === 'user' ? 'Me' : 'AI'}</div>
      <div className="bubble"><p>{content}</p></div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="message-row assistant">
      <div className="avatar">AI</div>
      <div className="bubble typing-bubble">
        <span></span><span></span><span></span>
      </div>
    </div>
  );
}

export default function App() {
  const [sessions, setSessions] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadSessions = async () => {
    const res = await axios.get(`${API}/sessions`);
    setSessions(res.data);
  };

  const loadMessages = async (sessionId) => {
    const res = await axios.get(`${API}/sessions/${sessionId}/messages`);
    setMessages(res.data);
  };

  const selectSession = async (id) => {
    setActiveId(id);
    await loadMessages(id);
  };

  const newChat = async () => {
    const res = await axios.post(`${API}/sessions`, { title: 'New Chat' });
    setSessions(prev => [res.data, ...prev]);
    setActiveId(res.data.id);
    setMessages([]);
  };

  const deleteSession = async (e, id) => {
    e.stopPropagation();
    await axios.delete(`${API}/sessions/${id}`);
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeId === id) {
      setActiveId(null);
      setMessages([]);
    }
  };

  const sendMessage = async (text) => {
    const content = text || input;
    if (!content.trim() || loading) return;

    let sessionId = activeId;
    if (!sessionId) {
      const res = await axios.post(`${API}/sessions`, { title: 'New Chat' });
      sessionId = res.data.id;
      setActiveId(sessionId);
      setSessions(prev => [res.data, ...prev]);
    }

    const userMsg = { role: 'user', content };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const res = await axios.post(`${API}/chat`, {
        session_id: sessionId,
        messages: updatedMessages,
      });

      const assistantMsg = { role: 'assistant', content: res.data.reply };
      setMessages([...updatedMessages, assistantMsg]);
      await loadSessions();
    } catch {
      setMessages([...updatedMessages, {
        role: 'assistant',
        content: 'Something went wrong. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="logo">
            <div className="logo-icon">✦</div>
            <span>AI Chat</span>
          </div>
          <button className="new-chat-btn" onClick={newChat}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Chat
          </button>
        </div>

        <div className="session-list">
          <p className="session-label">Recent Chats</p>
          {sessions.map(s => (
            <button
              key={s.id}
              className={`session-item ${s.id === activeId ? 'active' : ''}`}
              onClick={() => selectSession(s.id)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
              <span className="session-title">{s.title}</span>
              <span className="delete-btn" onClick={(e) => deleteSession(e, s.id)}>✕</span>
            </button>
          ))}
        </div>
      </aside>

      <main className="main">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✦</div>
            <h1>How can I help you today?</h1>
            <p>Ask me anything or try one of the suggestions below</p>
            <div className="suggestions">
              {SUGGESTIONS.map((s, i) => (
                <button key={i} className="suggestion-chip" onClick={() => sendMessage(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="chat-window">
            {messages.map((msg, i) => (
              <Message key={i} role={msg.role} content={msg.content} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}

        <div className="input-wrapper">
          <div className="input-box">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Type a message... (Shift+Enter for new line)"
              rows={1}
            />
            <button
              className={`send-btn ${input.trim() && !loading ? 'active' : ''}`}
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="19" x2="12" y2="5"/>
                <polyline points="5 12 12 5 19 12"/>
              </svg>
            </button>
          </div>
          <p className="input-hint">AI can make mistakes. Please verify important information.</p>
        </div>
      </main>
    </div>
  );
}