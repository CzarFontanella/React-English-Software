import React from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebaseConfig";
import api from "../../utils/api"; // 🔹 Importando Axios
import "./Modal.css";

const ModalSpeaking = ({ message, onClose, acertos = 0, showDoneBtn }) => {
  const navigate = useNavigate();

  const handleFinalize = async () => {
    const user = auth.currentUser;

    if (!user) {
      if (import.meta.env.DEV) console.error("❌ Usuário não autenticado!");
      return;
    }

    try {
      if (import.meta.env.DEV) {
        console.log(`🔹 Atualizando pontos de fala:`, {
          userId: user.uid,
          pointsSpeaking: acertos * 10,
        });
      }
      const response = await api.post("/api/points/update-speaking-points", {
        userId: user.uid,
        pointsSpeaking: acertos * 10,
      });
      if (import.meta.env.DEV) console.log("✅ Pontos de Fala salvos com sucesso:", response.data);

      // 🔹 Navega para a Tela Final de Speaking
      navigate("/tela-final-speaking", {
        state: { pointsSpeaking: acertos * 10 },
      });
    } catch (error) {
      if (import.meta.env.DEV) console.error("❌ Erro ao atualizar pontos de fala:", error.message);
      alert("Erro ao salvar os pontos. Tente novamente.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✖️
        </button>
        <p className="modal-text">{message}</p>
        {showDoneBtn && (
          <button className="btn-finalize" onClick={handleFinalize}>
            Ir para Tela Final de Fala
          </button>
        )}
      </div>
    </div>
  );
};

export default ModalSpeaking;
