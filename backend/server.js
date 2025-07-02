require("dotenv").config();

const express = require("express");
const cors = require("cors");

const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const pointsRoutes = require("./routes/points");
const rankingRoutes = require("./routes/ranking");
const textToSpeechRoutes = require("./routes/textToSpeech");
const chatRoute = require("./routes/chat");
const conversarRoute = require("./routes/conversar");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/points", pointsRoutes);
app.use("/api/points", rankingRoutes);
app.use("/api/text-to-speech", textToSpeechRoutes);
app.use("/api/chat", chatRoute);
app.use("/api/conversar", conversarRoute);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
  }
});
