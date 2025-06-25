const express = require("express");
const gTTS = require("gtts");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

// 🔹 Garante que o Firebase foi inicializado corretamente
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Criar pasta temporária para armazenar áudios gerados
const tempDir = path.join(__dirname, "../temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// 🔹 Rota para gerar áudio a partir de texto
router.post("/generate-audio", async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Texto não fornecido!" });
  }

  try {
    const gtts = new gTTS(text, "en");
    const filePath = path.join(tempDir, `audio_${Date.now()}.mp3`);

    gtts.save(filePath, (err) => {
      if (err) {
        console.error("❌ Erro ao salvar áudio:", err);
        return res.status(500).json({ error: "Erro ao gerar áudio!" });
      }

      res.sendFile(filePath, () => {
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error("⚠️ Erro ao remover arquivo temporário:", unlinkErr);
          }
        });
      });
    });
  } catch (error) {
    console.error("❌ Erro ao processar solicitação de áudio:", error);
    res.status(500).json({ error: "Erro interno no servidor!" });
  }
});

// 🔹 Rota para verificar o limite de áudios por usuário
router.get("/check-audio-limit/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const userRef = db.collection("audioLimits").doc(userId); // 🔹 Corrigido
    const userDoc = await userRef.get(); // 🔹 Corrigido
    const today = new Date().toISOString().split("T")[0];

    if (userDoc.exists) {
      const data = userDoc.data();
      return res.json({
        canGenerateAudio: data.lastAccessed !== today || data.audioCount < 10,
      });
    } else {
      await userRef.set({ audioCount: 0, lastAccessed: today });
      return res.json({ canGenerateAudio: true });
    }
  } catch (error) {
    console.error("❌ Erro ao buscar limite de áudio:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
});

// 🔹 Rota para incrementar a contagem de áudios gerados
router.post("/increment-audio-count/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    console.log(`🔹 Incrementando áudio para o usuário: ${userId}`); // Log para debug

    const userRef = db.collection("audioLimits").doc(userId);
    const userDoc = await userRef.get();
    const today = new Date().toISOString().split("T")[0];

    if (userDoc.exists) {
      const { audioCount, lastAccessed } = userDoc.data();
      const newCount = lastAccessed === today ? audioCount + 1 : 1;

      await userRef.set(
        { audioCount: newCount, lastAccessed: today },
        { merge: true }
      );
    } else {
      await userRef.set({ audioCount: 1, lastAccessed: today });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("❌ Erro ao incrementar contagem:", error);
    return res
      .status(500)
      .json({ error: "Erro interno no servidor", details: error.message });
  }
});

module.exports = router;
