import express from 'express';
import fetch from 'node-fetch';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
app.use(bodyParser.json());
const PORT = process.env.PORT || 4000;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CX = process.env.GOOGLE_CX;
const LLM_API_KEY = process.env.LLM_API_KEY;
const LLM_ENDPOINT = process.env.LLM_ENDPOINT;
function requireApiKey(req, res, next) {
  const key = req.header('x-api-key');
  if (!key || key !== process.env.APP_API_KEY) return res.status(401).json({ error: 'Unauthorized' });
  next();
}
async function googleSearch(q) {
  if (!GOOGLE_API_KEY || !GOOGLE_CX) return [];
  const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(q)}`;
  const r = await fetch(url);
  const j = await r.json();
  return (j.items || []).slice(0,3).map(i => ({ title: i.title, link: i.link, snippet: i.snippet }));
}
async function callLLM(prompt) {
  if (!LLM_ENDPOINT || !LLM_API_KEY) return "LLM endpoint not configured. Replace LLM_ENDPOINT and LLM_API_KEY in .env.";
  const res = await fetch(LLM_ENDPOINT, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${LLM_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, max_tokens: 700 })
  });
  const j = await res.json();
  return j.text || j.output || (j.choices && j.choices[0].text) || '';
}
app.post('/v1/chat', requireApiKey, async (req, res) => {
  try {
    const { session_id, user_id, message, use_live_web } = req.body;
    let sources = [];
    if (use_live_web) {
      sources = await googleSearch(message);
    }
    let prompt = `User: ${message}\n`;
    if (sources.length) {
      prompt += '\nSources:\n';
      for (const s of sources) prompt += `- ${s.title} (${s.link}): ${s.snippet}\n`;
      prompt += '\nAnswer using these sources and cite them inline.\n';
    }
    const answer = await callLLM(prompt);
    res.json({ answer, sources, confidence: 0.85 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});
app.listen(PORT, () => console.log(`NEXTGEN server running on ${PORT}`));
