import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { formatDate } from "../Components/Hooks/Date";
import api from "./api"; // 🔹 Agora usando Axios

const db = getFirestore();

// 🔹 Verifica o limite de áudios do usuário
export const checkAudioLimit = async (userId) => {
  try {
    const response = await api.get(
      `/api/text-to-speech/check-audio-limit/${userId}`
    ); // ✅ Caminho corrigido
    if (response.data) {
      console.log("🔹 Dados do Backend:", response.data);
      return response.data.canGenerateAudio;
    }
  } catch (error) {
    console.error(
      "❌ Erro ao buscar limite de áudio no backend:",
      error.message
    );
  }

};

// 🔹 Incrementa a contagem de áudios
export const incrementAudioCount = async (userId) => {
   try {
     await api.post(`/api/text-to-speech/increment-audio-count/${userId}`); // ✅ Caminho corrigido
   } catch (error) {
     console.error("❌ Erro ao incrementar contagem no backend:", error.message);
   }
};

// 🔹 Função para tocar áudio
export const handlePlayAudio = async (userId, gerarAudio) => {
  if (!userId) {
    console.error("❌ Usuário não autenticado!");
    return;
  }

  const canGenerate = await checkAudioLimit(userId);
  if (canGenerate) {
    await gerarAudio();
    await incrementAudioCount(userId);
  } else {
    console.warn("⚠️ Limite de áudios atingido.");
  }
};
