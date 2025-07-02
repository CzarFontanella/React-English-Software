import { useState, useEffect } from "react";
import { useConteudoPratica } from "../../Hooks/UseConteudoPratica";
import Modal from "../../Modal/ModalWriting";
import {
  getAuth,
  onAuthStateChanged,
} from "firebase/auth";
import {
  checkAudioLimit,
  handlePlayAudio,
  incrementAudioCount,
} from "../../../utils/control"; // Funções de controle com firebase
import "../../../pages/Practice.css"
import "./ConteudoPratica.css";

const ConteudoPratica = ({ setProgresso, finalizarPratica }) => {
  const { audioUrl, audioRef, text, gerarAudio } = useConteudoPratica();
  const [inputText, setInputText] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [user, setUser] = useState(null);
  const [acertos, setAcertos] = useState(0);
  const [audiosGerados, setAudiosGerados] = useState(0);
  const [modalMessage, setModalMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDoneBtn, setShowDoneBtn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [plays, setPlays] = useState(0);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      // Quando o usuário estiver logado, tenta carregar o primeiro áudio
      if (user) {
        const canGenerate = await checkAudioLimit(user.uid);
        if (canGenerate) {
          setPlays((prevPlays) => prevPlays + 1);
          setIsLoading(true);
          await handlePlayAudio(user.uid, gerarAudio);
          setIsLoading(false);
        } else {
          setModalMessage("Você atingiu o limite de 10 áudios por dia.");
          setShowDoneBtn(true);
          setShowModal(true);
        }
      }
    });

    return () => unsubscribe();
  }, []);


  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.load();
      audioRef.current.play().catch((e) => {
        console.log("Erro ao tentar reproduzir o áudio:", e);
      });
    }
  }, [audioUrl]);

  const closeModal = () => {
    setShowModal(false);
  };

  const handleContinueClick = async () => {
    // Permitir a 10ª resposta mesmo se checkAudioLimit retornar false
    if (audiosGerados < 10) {
      if (normalizeText(inputText) === normalizeText(text)) {
        const novoAcertos = (acertos || 0) + 1;
        const novoAudiosGerados = (audiosGerados || 0) + 1;
        setProgresso((prevProgresso) => Math.min(prevProgresso + 10, 100));
        setAcertos(novoAcertos);
        setAudiosGerados(novoAudiosGerados);
        setInputText("");
        setAttempts(0);
        setModalMessage("Parabéns! Você acertou.");

        if (novoAudiosGerados >= 10) {
          // Última resposta, não gera novo áudio nem incrementa mais
          finalizarPratica(novoAcertos);
          setModalMessage("Você finalizou a prática diária de 10 áudios!");
          setShowModal(true);
          setShowDoneBtn(true);
        } else {
          await gerarAudio();
          await incrementAudioCount(user.uid);
        }
      } else {
        setAttempts((prevAttempts) => (prevAttempts || 0) + 1);
        setModalMessage("Você errou! Tente novamente.");
        setShowModal(true);
      }
    } else {
      setModalMessage("Você atingiu o limite de 10 áudios por dia.");
      setShowModal(true);
      setShowDoneBtn(true);
    }
  };

  // Pular sem contabilizar pontos
  const handleSkip = async () => {
    const canGenerate = await checkAudioLimit(user.uid);

    if (canGenerate) {
      await incrementAudioCount(user.uid);
      setInputText("");
      setAttempts(0);

      if (audiosGerados >= 10) {
        finalizarPratica(acertos);
      } else {
        await gerarAudio();
      }
    } else {
      setModalMessage("Você atingiu o limite de 10 áudios por dia.");
      setShowModal(true);
    }
  };

  return (
    <div className="container-pratica">
      {showModal && (
        <Modal
          message={modalMessage}
          onClose={closeModal}
          finalizarPratica={finalizarPratica}
          acertos={acertos}
          showDoneBtn={showDoneBtn}
        />
      )}
      <div className="texto-pratica">
        <p>
          Reproduza o <span>áudio</span> para ouvir sua <span>frase.</span>
        </p>
      </div>

      {audioUrl ? (
        <audio controls ref={audioRef}>
          <source src={audioUrl} type="audio/mpeg" />
          Seu navegador não suporta o elemento de áudio.
        </audio>
      ) : (
        <p>Carregando áudio...</p>
      )}


      <div className="input-pratica">
        <textarea
          placeholder="Digite o que você ouviu: "
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
      </div>

      <div className="footer-pratica">
        {plays > 0 && (
          <button className="btn-continue" onClick={handleContinueClick}>
            Continuar
          </button>
        )}

        {attempts >= 3 && (
          <button className="btn-skip" onClick={handleSkip}>
            Pular
          </button>
        )}
      </div>
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

export default ConteudoPratica;
