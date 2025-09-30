const express = require("express");
const axios = require("axios");

const router = express.Router();

router.post("/generate-goal", async (req, res) => {
  const { userInput } = req.body;

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `
              You are "Store-iq AI Bot", a social media assistant.
              Always respond strictly as JSON if the user asks for a goal. The JSON must have these fields:
              { "platform": "...", "goal": "...", "target": "...", "timeline": "...", "steps": [ {"day":"...", "action":"..."} ] }
              Do not include markdown, code blocks, or commentary inside the JSON.
              If the user just greets or asks something unrelated to social media, respond with { "message": "..." }.
            `
          },
          { role: "user", content: userInput }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const content = response.data.choices[0].message.content.trim();

    let parsed;
    try {
      // Remove any triple backticks or markdown artifacts
      const cleaned = content.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // If not JSON, treat as plain message
      return res.json({ message: content });
    }

    // Safety: steps must be an array
    if (!Array.isArray(parsed.steps)) parsed.steps = [];

    res.json(parsed);
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
    res.status(500).json({ error: "Failed to generate goal" });
  }
});

module.exports = router;
