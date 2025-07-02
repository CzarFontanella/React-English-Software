const express = require("express");
const { db } = require("../firebase-config");

const router = express.Router();

/**
 * 🔹 Atualizar SOMENTE pontos de escrita
 */
router.post("/update-writing-points", async (req, res) => {
  try {
    const { userId, pointsWriting } = req.body;

    if (!userId || pointsWriting === undefined) {
      return res.status(400).json({ error: "Dados insuficientes fornecidos." });
    }

    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    const userData = userDoc.data();
    const newPointsWriting = (userData.pointsWriting || 0) + pointsWriting;

    await userRef.update({ pointsWriting: newPointsWriting });

    res.json({
      message: "✅ Pontuação de escrita atualizada com sucesso!",
      pointsWriting: newPointsWriting,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("❌ Erro ao atualizar pontos de escrita:", error);
    }
    res.status(500).json({ error: "Erro ao atualizar pontos." });
  }
});

/**
 * 🔹 Atualizar SOMENTE pontos de fala
 */
router.post("/update-speaking-points", async (req, res) => {
  try {
    const { userId, pointsSpeaking } = req.body;

    if (!userId || pointsSpeaking === undefined) {
      return res.status(400).json({ error: "Dados insuficientes fornecidos." });
    }

    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    const userData = userDoc.data();
    const newPointsSpeaking = (userData.pointsSpeaking || 0) + pointsSpeaking;

    await userRef.update({ pointsSpeaking: newPointsSpeaking });

    res.json({
      message: "✅ Pontuação de fala atualizada com sucesso!",
      pointsSpeaking: newPointsSpeaking,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("❌ Erro ao atualizar pontos de fala:", error);
    }
    res.status(500).json({ error: "Erro ao atualizar pontos." });
  }
});

router.get("/userPoints/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(`🔍 Buscando pontuação do usuário: ${userId}`);

    const doc = await db.collection("users").doc(userId).get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const userData = doc.data();

    const userPoints = {
      id: doc.id,
      pointsSpeaking: userData.pointsSpeaking || 0,
      pointsWriting: userData.pointsWriting || 0,
      totalPoints:
        (userData.pointsSpeaking || 0) + (userData.pointsWriting || 0),
    };

    return res.json(userPoints);

  } catch (error) {
    console.error("❌ Erro ao buscar pontuação do usuário:", error);
    return res.status(500).json({ message: "Erro ao buscar usuário", error });
  }
});

module.exports = router;
