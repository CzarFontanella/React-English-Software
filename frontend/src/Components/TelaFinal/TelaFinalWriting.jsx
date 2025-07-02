import { useNavigate, useLocation } from "react-router-dom";
import "./TelaFinal.css";
import React from "react";

const TelaFinalWriting = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pointsWriting = location.state?.pointsWriting ?? "Ainda não concluiu";

  if (import.meta.env.DEV) console.log("📌 Tela Final Writing - pontosWriting:", pointsWriting);

  return (
    <div className="container-final">
      <h1>🎉 Prática de Escrita Concluída!</h1>
      <p>Volte amanhã para continuar evoluindo! 🚀</p>

      <p>✍️ Pontos de Escrita: {pointsWriting}</p>

      <button className="btn-inicio" onClick={() => navigate("/")}>
        Voltar ao Início
      </button>
    </div>
  );
};

export default TelaFinalWriting;
