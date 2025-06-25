import React, { useState, useEffect } from "react";
import ModalAuth from "../../Components/ModalAuth/ModalAuth";
import TalkingComponent from "../../Components/Pratica/Talking/TalkingComponent";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../Practice.css";

const Talking = () => {
  const [emConversacao, setEmConversacao] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [pointsSpeaking, setPointsSpeaking] = useState(0);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists() && userSnap.data().hasActivated) {
          setIsActivated(true);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleStartClick = () => {
    if (!user) {
      alert("❌ Você precisa estar logado para fazer as práticas.");
      return;
    }
    if (isActivated) {
      setEmConversacao(true);
    } else {
      setModalOpen(true);
    }
  };

  const validarChaveDeAtivacao = async (activationKey) => {
    if (!user) {
      return { success: false, message: "Usuário não autenticado." };
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
        setIsActivated(true);
        setModalOpen(false);
        setEmConversacao(true); // ✅ já inicia conversa
        return { success: true };
      } else {
        return {
          success: false,
          message: data.message || "Erro na validação.",
        };
      }
    } catch (error) {
      console.error("❌ Erro ao validar chave:", error);
      return { success: false, message: "Erro de conexão com o servidor." };
    }
  };
  const finalizarPratica = () => {
    if (!user) return;
    fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/points/update-speaking-points`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          pointsSpeaking,
        }),
      }
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Erro na resposta: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        // Enviando para tela final com a pontuação total atualizada retornada pela API
        navigate("/tela-final-speaking", {
          state: {
            pointsSpeaking: data.pointsSpeaking,
          },
        });
      })
      .catch((err) => {
        console.error("Erro ao salvar pontos:", err);
        alert("❌ Erro ao salvar sua pontuação.");
      });
  };

  return (
    <div className="practice-container">
      <ModalAuth
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={validarChaveDeAtivacao}
        onSuccess={() => {
          setIsActivated(true);
          setEmConversacao(true);
        }}
      />

      {!emConversacao ? (
        <div className="start-section">
          <p className="body-text">
            🔹 Nesta atividade, você terá uma conversa em inglês com a IA por
            até 30 minutos.
            <br />
            <br />
            📜 Regras:
            <br />
            <br />- Fale sobre qualquer assunto.
            <br />
            <br />- A IA responde por voz.
            <br />
            <br />- Você ganhará pontos ao longo da conversa.
            <br />
            <br />- 🎯 Objetivo: Melhore sua escuta e fala treinando
            diariamente.
          </p>
          
          <button className="start-button" onClick={handleStartClick}>
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
