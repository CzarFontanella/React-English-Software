import { useNavigate, useLocation } from "react-router-dom";
import "./TelaFinal.css";
import React from "react";

const TelaFinalSpeaking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pointsSpeaking = location.state?.pointsSpeaking ?? "Ainda não concluiu";

  if (import.meta.env.DEV) console.log("📌 Tela Final Speaking - pontosSpeaking:", pointsSpeaking);

  return (
    <div className="container-final">
      <h1>🎉 Prática de Fala Concluída!</h1>
      <p>Volte amanhã para continuar evoluindo! 🚀</p>

      <p>🗣️ Pontos de Fala: {pointsSpeaking}</p>

      <button onClick={() => navigate("/")} className="btn-finalize">
        Voltar ao Início
      </button>
    </div>
  );
};

export default TelaFinalSpeaking;
