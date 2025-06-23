import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ConteudoPratica from "./ConteudoPratica";
import "../../../global.css";
import "./ListeningWritingComponent.css";
import ProgressBar from "../ProgressBar";
import { auth } from "../../../firebaseConfig";
import ModalWriting from "../../Modal/ModalWriting";

const ListeningWritingComponent = () => {
  const [progresso, setProgresso] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [modalWritingOpen, setModalWritingOpen] = useState(false);
  const navigate = useNavigate();
  const user = auth.currentUser;

  /* ---------- lógica de progresso ---------- */
  const atualizarProgresso = () => {
    setProgresso(prev => {
      const novo = Math.min(prev + 10, 100);
      if (novo === 100) finalizarPratica();
      return novo;
    });
  };

  /* ---------- salva pontos no backend ---------- */
  const salvarPontosEscrita = async pontos => {
    if (!user) {
      console.error("❌ Usuário não autenticado!");
      return;
    }
    try {
      await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/update-writing-points`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.uid, pointsWriting: pontos }),
        }
      );
    } catch (err) {
      console.error("❌ Erro ao salvar pontos:", err);
    }
  };

  /* ---------- agora abre a modal ---------- */
  const finalizarPratica = async () => {
    const pontos = acertos * 10;
    await salvarPontosEscrita(pontos);
    setModalWritingOpen(true);        // ⬅️ AO INVÉS de navegar direto
  };

  /* ---------- navega após fechar a modal ---------- */
  const handleNavigateToFinal = () => {
    setModalWritingOpen(false);
    navigate("/tela-final-writing", { state: { pointsWriting: acertos * 10 } });
  };

  return (
    <div className="listening-writing-container">
      {/* Modal exibida quando a prática termina */}
      {modalWritingOpen && (
        <ModalWriting
          message="Parabéns! Você concluiu sua prática diária."
          acertos={acertos}
          onClose={handleNavigateToFinal}
          showDoneBtn={true}
        />
      )}

      {/* conteúdo principal da prática */}
      <div className="practice-content">
        <ProgressBar progresso={progresso} />
        <ConteudoPratica
          setProgresso={atualizarProgresso}
          setAcertos={setAcertos}
          finalizarPratica={finalizarPratica}
        />
      </div>
    </div>
  );
};

export default ListeningWritingComponent;
