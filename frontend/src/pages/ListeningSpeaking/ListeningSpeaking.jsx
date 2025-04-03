import ListeningSpeakingComponent from "../../Components/Pratica/ListeningSpeaking/ListeningSpeakingComponent";
import "./ListeningSpeaking.css";
import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import ModalAuth from "../../Components/ModalAuth/ModalAuth";

const ListeningSpeaking = () => {
  const [praticando, setPraticando] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists() && userSnap.data().hasActivated) {
          setIsActivated(true);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleStart = () => {
    if (isActivated) {
      setPraticando(true);
    } else {
      setModalOpen(true);
    }
  };

  return (
    <div className="listening-speaking-page">
      <ModalAuth
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={() => {
          setIsActivated(true);
          setModalOpen(false);
          setPraticando(true);
        }}
      />

      {!praticando ? (
        <div className="start-section">
          <p className="body-text">
            🔹 Nesta atividade, você ouvirá frases em inglês e precisará
            repeti-las corretamente para aprimorar sua pronúncia e compreensão
            auditiva.
            <br />
            <br />
            📜 Regras da Atividade:
            <br />
            <br />
            - Você pode reproduzir o áudio quantas vezes quiser antes de
            repetir.
            <br />
            <br />
            - Sua resposta deve ser o mais próxima possível da frase original.
            <br />
            <br />
            - Pronúncia e entonação são avaliadas pela IA.
            <br />
            <br />
            - Se errar, você poderá tentar novamente.
            <br />
            <br />
            🎯 Objetivo: Melhore sua escuta e fala treinando diariamente.
          </p>

          <button className="start-button" onClick={handleStart}>
            Iniciar Prática de Listening & Speaking
          </button>
        </div>
      ) : (
        <ListeningSpeakingComponent />
      )}
    </div>
  );
};

export default ListeningSpeaking;
