const express = require("express");
const router = express.Router();
const { db } = require("../firebase-config");

// 🔹 Rota para obter os 10 usuários com mais pontos totais
router.get("/ranking", async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log("🔍 Buscando ranking dos usuários..."); // Log para debug
    }

    const snapshot = await db.collection("users").get();

    let ranking = snapshot.docs.map((doc) => {
      const userData = doc.data();
      return {
        id: doc.id,
        name: userData.name || "Usuário Anônimo",
        pointsSpeaking: userData.pointsSpeaking || 0,
        pointsWriting: userData.pointsWriting || 0,
        totalPoints:
          (userData.pointsSpeaking || 0) + (userData.pointsWriting || 0), // 🔥 Soma dos pontos
      };
    });

    // 🔹 Ordenar os usuários pela maior pontuação total
    ranking.sort((a, b) => b.totalPoints - a.totalPoints);

    return res.json(ranking.slice(0, 10));
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("❌ Erro ao buscar ranking:", error);
    }
    return res.status(500).json({ message: "Erro ao buscar ranking", error });
  }
});

module.exports = router;
