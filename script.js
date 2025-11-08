// NEXTGEN frontend script - welcome -> main transition + chat logic
(() => {
  const WELCOME_MS = 2500; // show welcome for 2.5s
  const welcome = document.getElementById('welcome-screen');
  const main = document.getElementById('main-content');
  const sendBtn = document.getElementById('send-btn');
  const micBtn = document.getElementById('mic-btn');
  const input = document.getElementById('user-input');
  const chatBox = document.getElementById('chat-box');

  // show welcome then reveal main
  window.addEventListener('load', () => {
    setTimeout(() => {
      welcome.classList.add('hidden');
      // reveal main content
      main.classList.remove('page-hidden');
      main.classList.add('page-visible');
    }, WELCOME_MS);
  });

  // helper to append messages
  function appendMessage(role, text){
    // remove last 'thinking' if exists when adding real bot response
    if(role === 'bot' && chatBox.lastElementChild && chatBox.lastElementChild.dataset.role === 'thinking'){
      chatBox.lastElementChild.remove();
    }
    const el = document.createElement('div');
    el.className = `message ${role}`;
    el.textContent = text;
    el.dataset.role = role;
    chatBox.appendChild(el);
    chatBox.scrollTop = chatBox.scrollHeight;
    return el;
  }

  // show thinking bubble
  function appendThinking(){
    const el = document.createElement('div');
    el.className = 'message bot';
    el.textContent = 'NEXTGEN is thinking...';
    el.dataset.role = 'thinking';
    chatBox.appendChild(el);
    chatBox.scrollTop = chatBox.scrollHeight;
    return el;
  }

  // API URL (set in index.html)
  const API_URL = window.NEXTGEN_API_URL || '/api/chat';

  // send message to backend
  async function sendToServer(text){
    try {
      const r = await fetch(API_URL, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ message: text })
      });
      if (!r.ok) {
        const txt = await r.text();
        throw new Error(`Server error: ${r.status} ${txt}`);
      }
      const j = await r.json();
      // expect { reply: "..." } from server
      return j.reply || j.answer || j.text || 'No response';
    } catch (err){
      console.error('Chat error', err);
      return 'Sorry, I could not reach the server.';
    }
  }

  // main send flow
  async function sendFlow(){
    const text = input.value.trim();
    if(!text) return;
    appendMessage('user', text);
    input.value = '';
    const thinkingEl = appendThinking();
    const reply = await sendToServer(text);
    // replace thinking with reply
    thinkingEl.remove();
    appendMessage('bot', reply);
  }

  // send on click or Enter
  sendBtn.addEventListener('click', sendFlow);
  input.addEventListener('keypress', (e) => { if(e.key === 'Enter') sendFlow(); });

  // Basic mic support (Web Speech API)
  let recognition = null;
  if('webkitSpeechRecognition' in window || 'SpeechRecognition' in window){
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.onresult = (ev) => {
      const t = ev.results[0][0].transcript;
      input.value = input.value ? `${input.value} ${t}` : t;
    };
    recognition.onend = () => { micBtn.textContent = '🎤'; };
  } else {
    micBtn.title = 'Microphone not supported';
    micBtn.disabled = true;
  }

  micBtn.addEventListener('click', () => {
    if(!recognition) return;
    if(micBtn.dataset.listening === '1'){
      recognition.stop();
      micBtn.dataset.listening = '0';
      micBtn.textContent = '🎤';
    } else {
      recognition.start();
      micBtn.dataset.listening = '1';
      micBtn.textContent = '⏹';
    }
  });

})();
