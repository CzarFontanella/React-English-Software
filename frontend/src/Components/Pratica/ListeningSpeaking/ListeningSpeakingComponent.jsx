import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ConteudoFala from "./ConteudoFala";
import ProgressBar from "../ProgressBar";
import { auth } from "../../../firebaseConfig";
import ModalSpeaking from "../../Modal/ModalSpeaking";
import "../../../global.css";

const ListeningSpeakingComponent = () => {
  const [progresso, setProgresso] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [modalSpeakingOpen, setModalSpeakingOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const navigate = useNavigate();
  const user = auth.currentUser;

  const atualizarProgresso = () => {
    setProgresso((prev) => {
      const novo = Math.min(prev + 10, 100);
      if (novo === 100) finalizarPratica();
      return novo;
    });
  };

  const salvarPontosSpeaking = async (pontos) => {
    if (!user) return console.error("❌ Usuário não autenticado!");
    try {
      await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/points/update-speaking-points`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.uid, pointsSpeaking: pontos }),
        }
      );
    } catch (err) {
      console.error("❌ Erro ao salvar pontos:", err);
    }
  };

  const finalizarPratica = async () => {
    await salvarPontosSpeaking(acertos * 10);
    setModalSpeakingOpen(true);
    setModalMessage((msg) => msg || "Parabéns! Você concluiu sua prática diária.");
  };

  const handleNavigateToFinal = () => {
    setModalSpeakingOpen(false);
    navigate("/tela-final-speaking", { state: { pointsSpeaking: acertos * 10 } });
  };

  return (
    <div className="listening-speaking-container">
      {modalSpeakingOpen && (
        <ModalSpeaking
          message={modalMessage}
          acertos={acertos}
          onClose={handleNavigateToFinal}
          showDoneBtn={true}
        />
      )}

      <div className="practice-content">
        <ProgressBar progresso={progresso} />
        <ConteudoFala
          setProgresso={atualizarProgresso}
          setAcertos={setAcertos}
          finalizarPratica={finalizarPratica}
          setModalMessage={setModalMessage}
        />
      </div>
    </div>
  );
};

export default ListeningSpeakingComponent;
