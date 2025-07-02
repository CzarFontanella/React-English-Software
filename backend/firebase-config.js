const admin = require("firebase-admin");

// 🔹 Lê e valida as credenciais do .env
if (!process.env.FIREBASE_CREDENTIALS) {
  if (process.env.NODE_ENV === 'development') {
    console.error("❌ Variável FIREBASE_CREDENTIALS não encontrada no .env!");
  }
  process.exit(1);
}

const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);

// 🔹 Inicializa o Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// 🔹 Função para validar chave de ativação
const validateActivationKey = async (userId, activationKey) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `🔍 Verificando chave: ${activationKey} para usuário: ${userId}`
      );
    }
    const keyRef = db.collection("activationKeys").doc(activationKey);
    const keyDoc = await keyRef.get();

    if (!keyDoc.exists) throw new Error("❌ Chave inválida!");
    if (keyDoc.data().isUsed) throw new Error("❌ Chave já utilizada!");

    await keyRef.update({ isUsed: true, assignedTo: userId });
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({
        hasActivated: true,
        createdAt: new Date().toISOString(),
      });
    } else {
      await userRef.update({ hasActivated: true });
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Chave ${activationKey} ativada com sucesso para ${userId}`);
    }
    return { success: true, message: "✅ Chave ativada com sucesso!" };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("❌ Erro ao validar chave:", error.message);
    }
    return { success: false, message: error.message };
  }
};

module.exports = { db, admin, validateActivationKey };
