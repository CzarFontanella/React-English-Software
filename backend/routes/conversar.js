const express = require("express");
const axios = require("axios");
const router = express.Router();

// Variaveis de Ambiente
const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
const elevenLabsVoiceId = process.env.ELEVENLABS_VOICE_ID;
const openaiApiKey = process.env.OPENAI_API_KEY;

// Logs para troubleshooting das variaveis de ambiente
console.log("Environment variables check in conversar.js:");
console.log("- OpenAI API Key:", openaiApiKey ? "defined" : "undefined");
console.log(
  "- ElevenLabs API Key:",
  elevenLabsApiKey ? "defined" : "undefined"
);
console.log(
  "- ElevenLabs Voice ID:",
  elevenLabsVoiceId ? "defined" : "undefined"
);

router.post("/", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) return res.status(400).json({ error: "Prompt ausente." });

  // Check if all required API keys are available
  if (!openaiApiKey || !elevenLabsApiKey || !elevenLabsVoiceId) {
    console.error("Missing required API keys. Check environment variables.");
    return res.status(500).json({
      error: "Erro de configuração do servidor. Contate o administrador.",
      details: "Missing API keys",
    });
  }

  try {
    // 🔹 Passo 1: ChatGPT gera a resposta
    const chatRes = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Você é um assistente educacional amigável para prática de inglês conversacional.",
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

    // 🔹 Passo 2: ElevenLabs converte a resposta em áudio
    const audioRes = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${elevenLabsVoiceId}`,
      {
        text: resposta,
        voice_settings: {
          stability: 0.4,
          similarity_boost: 0.8,
        },
      },
      {
        headers: {
          "xi-api-key": elevenLabsApiKey,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      }
    );

    // 🔹 Envia o áudio em base64 + texto
    const audioBase64 = Buffer.from(audioRes.data, "binary").toString("base64");

    res.status(200).json({
      resposta,
      audioBase64,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("🔥 Erro completo:", error); // <-- log completo
      console.error("🔥 Erro da API:", error.response?.data); // <-- erro da OpenAI ou ElevenLabs
    }
    res.status(500).json({ error: "Erro ao gerar resposta com voz." });
  }
});

module.exports = router;
