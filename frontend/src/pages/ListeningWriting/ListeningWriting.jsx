import React, { useState, useEffect } from "react";
import logoWrite from "../../assets/logo-write.png";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import ModalAuth from "../../Components/ModalAuth/ModalAuth";
import ListeningWritingComponent from "../../Components/Pratica/ListeningWriting/ListeningWritingComponent";
import { checkAudioLimit } from "../../utils/control";
import "../Practice.css";

const ListeningWriting = () => {
  const [praticando, setPraticando] = useState(false);
  const [isActivated, setIsActivated] = useState(true); // Temporariamente true para periodo gratuito
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

  const iniciarPratica = async () => {
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
    if (!user) {
      alert("❌ Você precisa estar logado para fazer as práticas.");
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
          setPraticando(true); // ✅ inicia automaticamente
        }}
      />

      {!praticando ? (
        <div className="start-section">
          <div className="logo">
            <img src={logoWrite} alt="Logomarca Codi Academy" />
          </div>
          <p className="body-text">
            🔹 Nesta atividade, você ouvirá frases em inglês e precisará
            digitá-las corretamente para aprimorar sua compreensão auditiva e
            ortografia.
            <br />
            <button className="start-button" onClick={iniciarPratica}>
              Iniciar Prática de Listening & Writing
            </button>
            <br />
            📜 Regras da Atividade:
            <br />
            <br />
            - Sua resposta deve ser exatamente igual ao áudio.
            <br />- Se errar, você poderá tentar novamente antes de avançar.
          </p>
        </div>
      ) : (
        <ListeningWritingComponent />
      )}
    </div>
  );
};

export default ListeningWriting;
