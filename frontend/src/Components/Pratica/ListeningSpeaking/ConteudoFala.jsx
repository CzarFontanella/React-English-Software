import { useState, useEffect } from "react";
import { auth } from "../../../firebaseConfig";
import { checkAudioLimit, incrementAudioCount } from "../../../utils/control";
import { useConteudoPratica } from "../../Hooks/UseConteudoPratica";
import "../../../pages/Practice.css";

const ConteudoFala = ({
  setProgresso,
  setAcertos,
  finalizarPratica,
  setModalMessage: setParentModalMessage,
}) => {
  const { audioUrl, audioRef, gerarAudio, text } = useConteudoPratica();

  const [transcricao, setTranscricao] = useState("");
  const [gravando, setGravando] = useState(false);
  const [tentativas, setTentativas] = useState(0);
  const [audiosGerados, setAudiosGerados] = useState(0);
  const [user, setUser] = useState(null);
  const [acertos, setAcertosInterno] = useState(0);
  // Modal e mensagem agora controlados pelo pai

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const canGenerate = await checkAudioLimit(user.uid);
      if (!canGenerate) {
        alert("❌ Você atingiu o limite diário de 10 práticas de fala.");
        finalizarPratica();
        return;
      }
      await incrementAudioCount(user.uid);
      await gerarAudio();
      setAudiosGerados(0);
    })();
  }, [user]);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      const audio = audioRef.current;
      audio.pause();
      audio.load();
      audio.play().catch((e) => {
        if (import.meta.env.DEV) console.log("Erro ao reproduzir o áudio:", e);
      });
    }
  }, [audioUrl, audioRef]);

  const iniciarReconhecimentoVoz = async () => {
    // Permite a 10ª resposta ser computada normalmente
    if (audiosGerados >= 10) {
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
        alert(`✅ Correto! \nVocê disse: ${textoFalado}`);
        const novoAcerto = acertos + 1;
        const novoTotal = audiosGerados + 1;
        setAcertos(novoAcerto);
        setAcertosInterno(novoAcerto);
        setAudiosGerados(novoTotal);
        setProgresso((prev) => prev + 10);
        setTentativas(0);
        setTranscricao("");
        // Checa o limite no backend APÓS computar localmente
        const canGenerate = await checkAudioLimit(user?.uid);
        if (!canGenerate || novoTotal >= 10) {
          if (setParentModalMessage)
            setParentModalMessage(
              "Você finalizou a prática diária de 10 áudios!"
            );
          setTimeout(() => finalizarPratica(novoAcerto), 1000);
        } else {
          await incrementAudioCount(user.uid);
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
      setProgresso((prev) => prev + 10);
      setTranscricao("");
      setTentativas(0);
      const novoTotal = audiosGerados + 1;
      setAudiosGerados(novoTotal);
      if (novoTotal >= 10) {
        if (setParentModalMessage)
          setParentModalMessage(
            "Você finalizou a prática diária de 10 áudios!"
          );
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
    <div className="practice-container">
      <div className="texto-pratica">
        <p>Reproduza o <span>áudio</span> e fale o que <span>ouviu</span>:</p>
      </div>
      
      {audioUrl ? (
        <audio controls ref={audioRef}>
          <source src={audioUrl} type="audio/mpeg" />
          Seu navegador não suporta o elemento de áudio.
        </audio>
      ) : (
        <p>Carregando áudio...</p>
      )}

      <div className="footer-pratica">
        <button
          className="btn-continue"
          onClick={iniciarReconhecimentoVoz}
          disabled={gravando}
        >
          {gravando ? "Ouvindo..." : "Falar"}
        </button>

        {tentativas >= 3 && (
          <button className="btn-skip" onClick={pularFrase}>
            Pular
          </button>
        )}

        <button className="btn-end" onClick={() => finalizarPratica(acertos)}>
          Encerrar
        </button>
      </div>

      {transcricao && <p className="resumo">🗣️ <strong>Você disse</strong>: {transcricao}</p>}

      {/* Modal removido: controle total pelo pai */}
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
