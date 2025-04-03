import React, { useState, useEffect } from "react";
import ModalAuth from "../../Components/ModalAuth/ModalAuth";
import TalkingComponent from "../../Components/Pratica/Talking/TalkingComponent";
import "./Talking.css";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Talking = () => {
  const [emConversacao, setEmConversacao] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [pointsSpeaking, setPointsSpeaking] = useState(0);
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    const verificarAtivacao = async () => {
      if (!user) return;

      try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists() && userDoc.data().hasActivated) {
          setIsActivated(true);
        } else {
          setModalOpen(true);
        }
      } catch (error) {
        console.error("❌ Erro ao verificar ativação:", error);
      }
    };

    verificarAtivacao();
  }, [user]);

  const validarChaveDeAtivacao = async (activationKey) => {
    if (!user) {
      alert("❌ Você precisa estar logado para ativar sua conta!");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/validate-key`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.uid, activationKey }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        alert(data.message);
        setIsActivated(true);
        setModalOpen(false);
      } else {
        alert(
          `❌ Erro: ${data.message || "Erro desconhecido ao validar chave."}`
        );
      }
    } catch (error) {
      alert(
        "❌ Erro ao validar chave. Verifique sua conexão e tente novamente."
      );
      console.error("❌ Erro no fetch:", error);
    }
  };

  const comecarConversa = () => {
    if (!isActivated) {
      alert("⚠️ Você precisa ativar sua conta antes de iniciar as atividades.");
      return;
    }

    setEmConversacao(true);

    // Finaliza automaticamente após 30 minutos
    setTimeout(() => {
      finalizarPratica();
    }, 30 * 60 * 1000);
  };

  const finalizarPratica = () => {
    if (!user) return;

    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/update-points`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.uid,
        pointsSpeaking,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        navigate("/tela-final", {
          state: {
            pointsSpeaking,
          },
        });
      })
      .catch((err) => {
        console.error("Erro ao salvar pontos:", err);
        alert("❌ Erro ao salvar sua pontuação.");
      });
  };

  return (
    <div className="talking-page">
      <ModalAuth
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={validarChaveDeAtivacao}
      />

      {!emConversacao ? (
        <div className="start-section">
          <p className="body-text">
            🔹 Nesta atividade, você terá uma conversa em inglês com a IA por
            até 30 minutos.
            <br />
            <br />
            📜 Regras:
            <br />- Fale sobre qualquer assunto.
            <br />- A IA responde por voz.
            <br />- Você ganhará pontos ao longo da conversa.
          </p>
          <button className="start-button" onClick={comecarConversa}>
            Iniciar Conversa com a IA
          </button>
        </div>
      ) : (
        <TalkingComponent
          setPointsSpeaking={setPointsSpeaking}
          finalizarPratica={finalizarPratica}
        />
      )}
    </div>
  );
};

export default Talking;
