import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../utils/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import ProgressBar from "./ProgressBar";
import ModalAuth from "../ModalAuth/ModalAuth";
import ModalSpeaking from "../Modal/ModalSpeaking"; // 🔹 Importação do ModalSpeaking
import "./ListeningSpeakingComponent.css";

const frases = [
  "The quick brown fox jumps over the lazy dog.",
  "I love programming in JavaScript.",
  "Practice makes perfect.",
];

const ListeningSpeakingComponent = () => {
  const [fraseAtualIndex, setFraseAtualIndex] = useState(0);
  const [transcricao, setTranscricao] = useState("");
  const [pointsSpeaking, setPointsSpeaking] = useState(0);
  const [gravando, setGravando] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [praticaIniciada, setPraticaIniciada] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSpeakingOpen, setModalSpeakingOpen] = useState(false); // 🔹 Estado do modal de speaking
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
  }, []);

  const iniciarPratica = () => {
    if (!isActivated) {
      alert("⚠️ Você precisa ativar sua conta antes de iniciar as atividades.");
      return;
    }

    setPraticaIniciada(true);
  };

  const iniciarReconhecimentoVoz = () => {
    if (!isActivated) {
      alert("⚠️ Você precisa ativar sua conta antes de iniciar as atividades.");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Seu navegador não suporta reconhecimento de voz. Tente no Chrome."
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();
    setGravando(true);

    recognition.onresult = (event) => {
      const textoFalado = event.results[0][0].transcript;
      console.log("🗣️ Transcrição:", textoFalado);
      setTranscricao(textoFalado);
      recognition.stop();
      setGravando(false);

      // 🔹 Normalização de texto para comparação
      const limparTexto = (texto) =>
        texto
          .toLowerCase()
          .trim()
          .replace(/[.,!?]/g, "");

      const respostaUsuario = limparTexto(textoFalado);
      const respostaCorreta = limparTexto(frases[fraseAtualIndex]);

      // 🔹 Comparação
      if (respostaUsuario === respostaCorreta) {
        alert("✅ Correto! Próxima frase...");
        setPointsSpeaking((prevPoints) => prevPoints + 10);
        setProgresso(((fraseAtualIndex + 1) / frases.length) * 100);

        if (fraseAtualIndex < frases.length - 1) {
          setFraseAtualIndex((prevIndex) => prevIndex + 1);
        } else {
          finalizarPratica();
        }
      } else {
        alert("❌ Tente novamente! Sua resposta não está correta.");
      }
    };

    recognition.onerror = (event) => {
      setGravando(false);
      if (event.error === "no-speech") {
        alert("Nenhum som detectado! Fale mais alto e tente novamente.");
      }
    };
  };

  // 🔹 Envia os pontos de fala para o backend
  const salvarPontosSpeaking = async (pontos) => {
    if (!user) {
      console.error("❌ Usuário não autenticado!");
      return;
    }

    console.log("🔹 Enviando pontos de fala para o backend:", {
      userId: user.uid,
      pointsSpeaking: pontos,
    });

    try {
      const response = await fetch(
        "http://localhost:3000/points/update-speaking-points",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.uid,
            pointsSpeaking: pontos,
          }),
        }
      );

      const data = await response.json();
      console.log("✅ Pontos de Fala salvos no backend:", data);
      return data;
    } catch (error) {
      console.error("❌ Erro ao salvar pontos:", error);
    }
  };

  // 🔹 Finaliza a prática e abre o modal de Speaking
  const finalizarPratica = async () => {
    const pontos = pointsSpeaking;
    await salvarPontosSpeaking(pontos);
    setModalSpeakingOpen(true); // 🔹 Abre o modal Speaking ao finalizar
  };

  // 🔹 Função chamada pelo botão do `ModalSpeaking`
  const handleNavigateToFinal = () => {
    setModalSpeakingOpen(false);
    navigate("/tela-final-speaking", { state: { pointsSpeaking } });
  };

  return (
    <div className="listening-speaking-container">
      {/* 🔹 Modal de Ativação */}
      <ModalAuth isOpen={modalOpen} onClose={() => setModalOpen(false)} />

      {/* 🔹 ModalSpeaking aparece ao finalizar a prática */}
      {modalSpeakingOpen && (
        <ModalSpeaking
          message="Parabéns! Você concluiu sua prática diária."
          onClose={handleNavigateToFinal}
          acertos={pointsSpeaking / 10}
          showDoneBtn={true}
        />
      )}

      {!praticaIniciada ? (
        <div className="start-section">
          <p className="body-text">
            {" "}
            🔹 Nesta atividade, você ouvirá frases em inglês e precisará
            repeti-las corretamente para aprimorar sua pronúncia e compreensão
            auditiva. <br /> <br /> 📜 Regras da Atividade: <br /> <br /> - Você
            pode reproduzir o áudio quantas vezes quiser antes de repetir.{" "}
            <br /> <br /> - Sua resposta deve ser o mais próxima possível da
            frase original. <br /> <br /> - Pronúncia e entonação são avaliadas
            pela IA. <br /> <br /> - Se errar, você poderá tentar novamente
            antes de avançar. <br /> <br /> 🎯 Objetivo: Melhore sua escuta e
            fala treinando diariamente.{" "}
          </p>
          <button className="start-button" onClick={iniciarPratica}>
            Iniciar Prática de Listening & Speaking
          </button>
        </div>
      ) : (
        <div className="practice-content">
          <ProgressBar progresso={progresso} />
          <p className="frase">{frases[fraseAtualIndex]}</p>
          <button
            className="btn-speak"
            onClick={iniciarReconhecimentoVoz}
            disabled={gravando}
          >
            {gravando ? "🎙️ Ouvindo..." : "🎤 Falar"}
          </button>
          {transcricao && (
            <p className="transcricao">🗣️ Você disse: {transcricao}</p>
          )}
          <p className="pointsSpeaking">⭐ Pontuação: {pointsSpeaking}</p>
        </div>
      )}
    </div>
  );
};

export default ListeningSpeakingComponent;
