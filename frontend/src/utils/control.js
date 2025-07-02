import api from "./api";

// Verifica o limite de áudios do usuário
export const checkAudioLimit = async (userId) => {
  try {
    const response = await api.get(`/api/text-to-speech/check-audio-limit/${userId}`);
    return response.data?.canGenerateAudio;
  } catch (error) {
    if (import.meta.env.DEV) console.error("Erro ao buscar limite de áudio:", error.message);
  }
};

// Incrementa a contagem de áudios
export const incrementAudioCount = async (userId) => {
  try {
    await api.post(`/api/text-to-speech/increment-audio-count/${userId}`);
  } catch (error) {
    if (import.meta.env.DEV) console.error("Erro ao incrementar contagem no backend:", error.message);
  }
};

// Função para tocar áudio
export const handlePlayAudio = async (userId, gerarAudio) => {
  if (!userId) {
    if (import.meta.env.DEV) console.error("Usuário não autenticado!");
    return;
  }
  const canGenerate = await checkAudioLimit(userId);
  if (canGenerate) {
    await gerarAudio();
    await incrementAudioCount(userId);
  } else {
    if (import.meta.env.DEV) console.warn("Limite de áudios atingido.");
  }
};
