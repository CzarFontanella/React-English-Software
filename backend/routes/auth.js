const express = require("express");
const router = express.Router();
const { validateActivationKey } = require("../firebase-config");

// 🔹 Rota para validar chave de ativação
router.post("/validate-key", async (req, res) => {
  const { userId, activationKey } = req.body;

  if (!userId || !activationKey) {
    return res
      .status(400)
      .json({ success: false, message: "Dados incompletos!" });
  }

  try {
    const response = await validateActivationKey(userId, activationKey);
    if (response.success) {
      res.json(response);
    } else {
      res.status(400).json(response);
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Erro ao validar chave de ativação:', error);
    }
    res.status(500).json({ success: false, message: 'Erro interno ao validar chave.' });
  }
});

module.exports = router;