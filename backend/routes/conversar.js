const express = require("express");
const axios = require("axios");
const { PassThrough } = require("stream");
const gTTS = require("gtts");
const router = express.Router();

// Variáveis de ambiente
const openaiApiKey = process.env.OPENAI_API_KEY;

// Logs para troubleshooting das variáveis de ambiente
console.log("Environment variables check in conversar.js:");
console.log("- OpenAI API Key:", openaiApiKey ? "defined" : "undefined");

router.post("/", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) return res.status(400).json({ error: "Prompt ausente." });

  if (!openaiApiKey) {
    console.error("Missing required API keys. Check environment variables.");
    return res.status(500).json({
      error: "Erro de configuração do servidor. Contate o administrador.",
      details: "Missing OpenAI API key",
    });
  }

  try {
    // Passo 1: ChatGPT gera a resposta
    const chatRes = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Você é um assistente educacional amigável para prática de inglês conversacional. As respostas devem conter no máximo 480 caracteres.",
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
          Authorization: `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const resposta = chatRes.data.choices[0].message.content;

    // Passo 2: Gerar áudio usando gTTS
    const gtts = new gTTS(resposta, "en");

    // Converter stream de áudio para buffer para enviar base64
    const buffer = await new Promise((resolve, reject) => {
      const buffers = [];
      gtts.stream()
        .on("data", (chunk) => buffers.push(chunk))
        .on("end", () => resolve(Buffer.concat(buffers)))
        .on("error", reject);
    });

    const audioBase64 = buffer.toString("base64");

    // Enviar resposta + áudio base64
    res.status(200).json({
      resposta,
      audioBase64,
    });
  } catch (error) {
    console.error("🔥 Erro completo:", error);
    if (error.response?.data) {
      try {
        console.error("🔥 Erro da API:", Buffer.from(error.response.data).toString("utf8"));
      } catch {}
    }

    res.status(500).json({ error: "Erro ao gerar resposta com voz." });
  }
});

module.exports = router;