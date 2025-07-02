const express = require("express");
const { db } = require("../firebase-config");

const router = express.Router();

router.post("/create-user", async (req, res) => {
  const { uid, email, name } = req.body;

  if (!uid || !email) {
    return res
      .status(400)
      .json({ message: "Todos os campos são obrigatórios." });
  }

  try {
    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      await userRef.set({
        email,
        name: name || "Usuário",
        pointsSpeaking: 0,
        pointsWriting: 0,
        hasActivated: false,
        createdAt: new Date().toISOString(),
      });
      res
        .status(201)
        .json({ success: true, message: "Usuário criado com sucesso!" });
    } else {
      res.status(200).json({ success: true, message: "Usuário já existe." });
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("❌ Erro ao criar usuário:", error);
    }
    res.status(500).json({ message: "Erro no servidor ao criar usuário." });
  }
});

module.exports = router;
