import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import bodyParser from "body-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});;

// ✅ Root route (prevents blank page on Render)
app.get("/", (req, res) => {
  res.send("NEXTGEN backend is running 🚀");
});

// ✅ CHAT ROUTE (Frontend must call /chat)
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({ reply: "No message received." });
    }

    // 🔑 OpenAI request
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are NEXTGEN, a futuristic AI assistant combining GPT, Siri, Google, and Grok. You are smart, friendly, and concise."
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        max_tokens: 150
      })
    });

    const data = await response.json();

    const aiReply =
      data.choices?.[0]?.message?.content ||
      "NEXTGEN could not respond right now.";

    res.json({ reply: aiReply });

  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ reply: "NEXTGEN backend error 🛑" });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`NEXTGEN backend running on port ${PORT}`);
});
