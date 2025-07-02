import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebaseConfig";
import api from "../../utils/api"; // 🔹 Importando Axios
import "./Modal.css";

const ModalWriting = ({ message, onClose, acertos = 0, showDoneBtn }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false); // 🔹 Estado para controlar o botão

  const handleFinalize = async () => {
    const user = auth.currentUser;

    if (!user) {
      if (import.meta.env.DEV) console.error("❌ Usuário não autenticado!");
      alert("Você precisa estar logado para salvar seus pontos.");
      return;
    }

    try {
      setIsLoading(true); // 🔹 Desabilita o botão enquanto processa
      if (import.meta.env.DEV) {
        console.log(`🔹 Atualizando pontos de escrita:`, {
          userId: user.uid,
          pointsWriting: acertos * 10,
        });
      }
      const response = await api.post("/api/points/update-writing-points", {
        userId: user.uid,
        pointsWriting: acertos * 10,
      });
      if (import.meta.env.DEV) console.log("✅ Pontos de Escrita salvos com sucesso:", response.data);

      // 🔹 Navega para a Tela Final de Writing
      navigate("/tela-final-writing", {
        state: { pointsWriting: acertos * 10 },
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(
          "❌ Erro ao atualizar pontos de escrita:",
          error.response?.data || error.message
        );
      }
      alert(
        `Erro ao salvar os pontos: ${
          error.response?.data?.error || "Tente novamente."
        }`
      );
    } finally {
      setIsLoading(false); // 🔹 Reabilita o botão após a requisição
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
          <button
            className="btn-finalize"
            onClick={handleFinalize}
            disabled={isLoading}
          >
            {isLoading ? "Salvando..." : "Ir para Tela Final de Escrita"}
          </button>
        )}
      </div>
    </div>
  );
};

export default ModalWriting;
