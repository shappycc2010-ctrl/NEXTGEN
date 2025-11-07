import React, { useState, useRef, useEffect } from 'react';
import './styles.css';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/v1/chat';
const API_KEY = process.env.REACT_APP_API_KEY || 'replace_me';
export default function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setInput(prev => prev ? `${prev} ${text}` : text);
    };
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
  }, []);
  const startListening = () => {
    if (!recognitionRef.current) return alert('SpeechRecognition not supported in this browser');
    recognitionRef.current.start();
    setListening(true);
  };
  const stopListening = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setListening(false);
  };
  async function send(use_live_web = false, voice=false) {
    const message = input.trim();
    if (!message) return;
    const userMsg = { role: 'user', text: message };
    setMessages(m => [...m, userMsg]);
    setInput('');
    try {
      const resp = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
        body: JSON.stringify({ session_id: 'sess-1', user_id: 'user-1', message, use_live_web, voice })
      });
      const j = await resp.json();
      const botMsg = { role: 'bot', text: j.answer, sources: j.sources || [] };
      setMessages(m => [...m, botMsg]);
      if (voice && 'speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(j.answer);
        window.speechSynthesis.speak(u);
      }
    } catch (e) {
      const errMsg = { role: 'bot', text: 'Error contacting NEXTGEN server.' };
      setMessages(m => [...m, errMsg]);
    }
  }
  return (
    <div className="app">
      <header className="header">
        <div className="logo">NEXT<span>GEN</span></div>
        <div className="wave" aria-hidden></div>
      </header>
      <main className="chat">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role === 'user' ? 'user' : 'bot'}`}>
            <div className="bubble">
              <div className="role">{m.role === 'user' ? 'You' : 'NEXTGEN'}</div>
              <div className="text">{m.text}</div>
              {m.sources && m.sources.length > 0 && (
                <div className="sources">
                  <i>Sources:</i>
                  <ul>
                    {m.sources.map((s, idx) => (<li key={idx}><a href={s.link} target="_blank" rel="noreferrer">{s.title}</a> — {s.snippet}</li>))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </main>
      <footer className="composer">
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask NEXTGEN..." />
        <div className="buttons">
          <button onClick={() => send(false,false)}>Send</button>
          <button onClick={() => send(true,false)}>Send & Live</button>
          <button onClick={() => send(true,true)}>Send & Read</button>
          {!listening ? <button onClick={startListening}>🎤</button> : <button onClick={stopListening}>⏹</button>}
        </div>
      </footer>
    </div>
  );
}
