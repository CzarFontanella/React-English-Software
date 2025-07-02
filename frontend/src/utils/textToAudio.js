import api from "./api";
let lastAudioUrl = null;
export const criarArquivoAudio = async (text) => {
  try {
    const response = await api.post(
      "/api/text-to-speech/generate-audio",
      { text },
      { responseType: "blob" }
    );
    const audioBlob = response.data;
    if (lastAudioUrl) URL.revokeObjectURL(lastAudioUrl);
    const audioUrl = URL.createObjectURL(audioBlob);
    lastAudioUrl = audioUrl;
    return audioUrl;
  } catch (error) {
    if (import.meta.env.DEV) console.error("Erro ao gerar áudio:", error.message);
    return null;
  }
};
