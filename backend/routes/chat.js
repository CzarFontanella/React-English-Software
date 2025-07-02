const express = require("express");
const router = express.Router();
const axios = require("axios");

// POST /api/chat
router.post("/chat", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt ausente na requisição." });
  }

  try {
    const resposta = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Você é um assistente que conversa com o aluno para ajudá-lo a praticar inglês de forma amigável.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 100,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const mensagemGerada = resposta.data.choices[0].message.content;
    res.status(200).json({ resposta: mensagemGerada });
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Erro ao chamar a API da OpenAI:", err.response?.data || err);
    }
    res.status(500).json({ error: "Erro ao gerar resposta com IA." });
  }
});

module.exports = router;
