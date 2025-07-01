import { useState, useEffect } from "react";
import { auth } from "../../../firebaseConfig";
import {
  checkAudioLimit,
  incrementAudioCount,
} from "../../../utils/control";
import { useConteudoPratica } from "../../Hooks/UseConteudoPratica";
import "../../../pages/Practice.css";
import "./ConteudoFala.css";

const ConteudoFala = ({ setProgresso, setAcertos, finalizarPratica }) => {
  const { audioUrl, audioRef, gerarAudio, text } = useConteudoPratica();

  const [transcricao, setTranscricao] = useState("");
  const [gravando, setGravando] = useState(false);
  const [tentativas, setTentativas] = useState(0);
  const [audiosGerados, setAudiosGerados] = useState(0);
  const [user, setUser] = useState(null);
  const [acertos, setAcertosInterno] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showDoneBtn, setShowDoneBtn] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const gerarPrimeiroAudio = async () => {
      if (!user) return;
      const canGenerate = await checkAudioLimit(user.uid);
      if (!canGenerate) {
        alert("❌ Você atingiu o limite diário de 10 práticas de fala.");
        finalizarPratica();
        return;
      }
      await incrementAudioCount(user.uid);
      await gerarAudio();
      setAudiosGerados(0);
    };
    gerarPrimeiroAudio();
  }, [user]);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
      audioRef.current.play().catch((e) => {
        console.log("Erro ao reproduzir o áudio:", e);
      });
    }
  }, [audioUrl]);

  const iniciarReconhecimentoVoz = async () => {
    console.log("Acertos: " + acertos);
    console.log("Audios Gerados: " + audiosGerados);

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Seu navegador não suporta reconhecimento de voz.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();
    setGravando(true);

    recognition.onresult = async (event) => {
      const textoFalado = event.results[0][0].transcript;
      setTranscricao(textoFalado);
      recognition.stop();
      setGravando(false);

      const respostaUsuario = normalizeText(textoFalado);
      const respostaCorreta = normalizeText(text);

      if (respostaUsuario === respostaCorreta) {
        alert("✅ Correto!");

        const novoAcerto = acertos + 1;
        const novoTotal = audiosGerados + 1;

        setAcertos(novoAcerto);
        setAcertosInterno(novoAcerto);
        setAudiosGerados(novoTotal);
        setProgresso((prev) => prev + 10);
        setTentativas(0);
        setTranscricao("");

        await incrementAudioCount(user.uid);

        if (novoTotal >= 10) {
          setModalMessage("Você finalizou a prática diária de 10 áudios!");
          setShowModal(true);
          setShowDoneBtn(true);
          setTimeout(() => finalizarPratica(novoAcerto), 1000);
        } else {
          await gerarAudio();
        }
      } else {
        setTentativas((prev) => prev + 1);
        alert("❌ Tente novamente.");
      }
    };

    recognition.onerror = () => {
      setGravando(false);
      alert("Erro no reconhecimento de voz.");
    };
  };

 const pularFrase = async () => {
  const canGenerate = await checkAudioLimit(user?.uid);
  if (canGenerate) {
    await incrementAudioCount(user.uid);
    setProgresso((prev) => prev + 10); // ✅ agora incrementa o progresso
    setTranscricao("");
    setTentativas(0);

    const novoTotal = audiosGerados + 1;
    setAudiosGerados(novoTotal);

    if (novoTotal >= 10) {
      setModalMessage("Você finalizou a prática diária de 10 áudios!");
      setShowModal(true);
      setShowDoneBtn(true);
      setTimeout(() => finalizarPratica(acertos), 1000);
    } else {
      await gerarAudio();
    }
  } else {
    alert("❌ Você atingiu o limite diário de 10 práticas de fala.");
    finalizarPratica();
  }
};

  return (
    <div className="conteudo-fala">
      <p>Reproduza o áudio e fale o que ouviu:</p>
      {audioUrl ? (
        <audio controls ref={audioRef}>
          <source src={audioUrl} type="audio/mpeg" />
          Seu navegador não suporta o elemento de áudio.
        </audio>
      ) : (
        <p>Carregando áudio...</p>
      )}

      <button
        className="botao-falar"
        onClick={iniciarReconhecimentoVoz}
        disabled={gravando}
      >
        {gravando ? "🎙️ Ouvindo..." : "🎤 Falar"}
      </button>

      {tentativas >= 3 && <button onClick={pularFrase}>⏭️ Pular</button>}

      {transcricao && <p className="feedback">🗣️ Você disse: {transcricao}</p>}

      {showModal && (
        <div className="modal">
          <p>{modalMessage}</p>
          {!showDoneBtn && (
            <button onClick={() => setShowModal(false)}>Fechar</button>
          )}
        </div>
      )}
    </div>
  );
};

function normalizeText(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();
}

export default ConteudoFala;