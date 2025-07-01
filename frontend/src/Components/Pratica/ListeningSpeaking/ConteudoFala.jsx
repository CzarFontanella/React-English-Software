import { useState, useEffect } from "react";
import { auth } from "../../../firebaseConfig";
import { checkAudioLimit, incrementAudioCount, handlePlayAudio } from "../../../utils/control";
import { useConteudoPratica } from "../../Hooks/UseConteudoPratica";
import "../../../pages/Practice.css"
import "./ConteudoFala.css";

const ConteudoFala = ({ setProgresso, setAcertos, finalizarPratica }) => {
  const { audioUrl, audioRef, gerarAudio, text } = useConteudoPratica();
  const [transcricao, setTranscricao] = useState("");
  const [gravando, setGravando] = useState(false);
  const [tentativas, setTentativas] = useState(0);
  const [audiosGerados, setAudiosGerados] = useState(0);
  const [user, setUser] = useState(null);

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
      setAudiosGerados(1);
    };

    gerarPrimeiroAudio();
  }, [user]); // só roda quando user estiver definido



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
    const user = auth.currentUser;
    if (!user) {
      alert("Você precisa estar logado para praticar.");
      return;
    }

    const canGenerate = await checkAudioLimit(user.uid);
    if (!canGenerate) {
      alert("❌ Você atingiu o limite diário de 10 práticas de fala.");
      finalizarPratica();
      return;
    }

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
        await incrementAudioCount(user.uid);
        setProgresso((prev) => prev + 10);
        setAcertos((prev) => prev + 1);
        setTentativas(0);
        setTranscricao("");

        if (audiosGerados + 1 >= 10) {
          await incrementAudioCount(user.uid);
          setAudiosGerados((prev) => prev + 1);
          finalizarPratica((acertos || 0) + 1);
          setModalMessage("Você finalizou a prática diária de 10 áudios!");
          setShowModal(true);
          setShowDoneBtn(true);
        } else {
          await incrementAudioCount(user.uid);
          setAudiosGerados((prev) => prev + 1);
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
    const user = auth.currentUser;
    const canGenerate = await checkAudioLimit(user.uid);

    if (canGenerate) {
      await incrementAudioCount(user.uid);
      setTranscricao("");
      setTentativas(0);
      setAudiosGerados((prev) => prev + 1);

      if (audiosGerados + 1 >= 10) {
        await incrementAudioCount(user.uid);
        setAudiosGerados((prev) => prev + 1);
        finalizarPratica(acertos);
      } else {
        await incrementAudioCount(user.uid);
        setAudiosGerados((prev) => prev + 1);
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
      <button className="botao-falar" onClick={iniciarReconhecimentoVoz} disabled={gravando}>
        {gravando ? "🎙️ Ouvindo..." : "🎤 Falar"}
      </button>
      {tentativas >= 3 && (
        <button onClick={pularFrase}>⏭️ Pular</button>
      )}
      {transcricao && <p className="feedback">🗣️ Você disse: {transcricao}</p>}
    </div>
  );
};

function normalizeText(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")   // Remove acentos
    .replace(/[^a-z0-9]/gi, "")        // Remove caracteres especiais e espaços
    .toLowerCase();                    // Converte para minúsculo
}

export default ConteudoFala;