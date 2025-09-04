import ListeningSpeakingComponent from "../../Components/Pratica/ListeningSpeaking/ListeningSpeakingComponent";
import React, { useEffect, useState } from "react";
import logoSpeak from "../../Assets/logo-speak.png";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import ModalAuth from "../../Components/ModalAuth/ModalAuth";
import "../Practice.css";
import { checkAudioLimit } from "../../utils/control";

const ListeningSpeaking = () => {
  const [praticando, setPraticando] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [user, setUser] = useState(null);

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

  const handleStart = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("❌ Você precisa estar logado para fazer as práticas.");
      return;
    }

    if (!isActivated) {
      setModalOpen(true);
      return;
    }

    const podeGerar = await checkAudioLimit(user.uid);
    if (!podeGerar) {
      alert("❌ Você atingiu o limite diário de geração de áudios.");
      return;
    }

    setPraticando(true);
  };

  const validarChaveDeAtivacao = async (activationKey) => {
    if (!user) return { success: false, message: "Usuário não autenticado" };

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
        setPraticando(true);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      if (import.meta.env.DEV) console.error("Erro ao validar chave:", err);
      return { success: false, message: "Erro ao validar chave." };
    }
  };

  return (
    <div className="practice-container">
      <ModalAuth
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={validarChaveDeAtivacao}
        onSuccess={() => {
          setIsActivated(true);
          setPraticando(true); // ✅ inicia prática automaticamente
        }}
      />

      {!praticando ? (
        <div className="start-section">
          <div className="logo">
            <img src={logoSpeak} alt="Logomarca Codi Academy" />
          </div>
          <p className="body-text">
            🔹 Nesta atividade, você ouvirá frases em inglês e precisará
            repeti-las corretamente para aprimorar sua pronúncia e compreensão
            auditiva.
            <br />
            <button className="start-button" onClick={handleStart}>
              Iniciar Prática de Listening & Speaking
            </button>
            <br />
            📜 Regras da Atividade:
            <br />
            <br />
            - Sua resposta deve ser o mais próxima possível da frase original.
            <br />
            - Pronúncia e entonação são avaliadas pela IA.
            <br />- Se errar, você poderá tentar novamente.
          </p>
        </div>
      ) : (
        <ListeningSpeakingComponent />
      )}
    </div>
  );
};

export default ListeningSpeaking;
