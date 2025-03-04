import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { formatDate } from "../Components/Hooks/Date";
import api from "./api"; // 🔹 Agora usando Axios

const db = getFirestore();

// 🔹 Verifica o limite de áudios do usuário
export const checkAudioLimit = async (userId) => {
  try {
    const response = await api.get(`/check-audio-limit/${userId}`);
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

  try {
    const userRef = doc(db, "audioLimits", userId);
    const userDoc = await getDoc(userRef);
    const now = new Date().toISOString();
    const today = formatDate(now);

    if (userDoc.exists()) {
      const data = userDoc.data();
      return data.lastAccessed === today ? data.audioCount < 10 : true;
    } else {
      await setDoc(userRef, { audioCount: 0, lastAccessed: today });
      return true;
    }
  } catch (error) {
    console.error("❌ Erro ao acessar Firestore:", error.message);
    return false;
  }
};

// 🔹 Incrementa a contagem de áudios
export const incrementAudioCount = async (userId) => {
  try {
    await api.post(`/increment-audio-count/${userId}`);
  } catch (error) {
    console.error("❌ Erro ao incrementar contagem no backend:", error.message);
  }

  try {
    const userRef = doc(db, "audioLimits", userId);
    const userDoc = await getDoc(userRef);
    const { audioCount, lastAccessed } = userDoc.data();
    await setDoc(
      userRef,
      { audioCount: audioCount + 1, lastAccessed },
      { merge: true }
    );
  } catch (error) {
    console.error(
      "❌ Erro ao incrementar contagem no Firestore:",
      error.message
    );
  }
};

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

export { checkAudioLimit, handlePlayAudio, incrementAudioCount };
