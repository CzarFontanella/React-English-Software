import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth, provider } from "../../firebaseConfig";
import "./AuthPage.css";
import api from "../../utils/api";
import React from "react";
import GoogleButton from 'react-google-button';

const AuthPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const registerUserInDatabase = async (user, displayName) => {
    try {
      const payload = {
        uid: user.uid,
        email: user.email,
        name: displayName || "Usuário",
      };

      console.log("📡 Enviando usuário para o backend:", payload);

      const response = await api.post("/api/users/create-user", payload);

      console.log("✅ Resposta do backend:", response.data);
    } catch (err) {
      console.error(
        "❌ Erro ao salvar usuário no banco de dados:",
        err.response?.data || err.message
      );
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let userCredential;
      if (isRegistering) {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        if (name.trim()) {
          await updateProfile(user, { displayName: name });
          console.log("✅ Nome atualizado no Firebase:", name);
        }

        await registerUserInDatabase(user, name);
      } else {
        userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        console.log("✅ Usuário logado:", userCredential.user);
      }

      navigate("/");
    } catch (err) {
      console.error("🔥 Erro ao autenticar:", err.code, err.message);
      setError(`Erro Firebase: ${err.message}`);
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("✅ Usuário autenticado com Google:", user);

      await registerUserInDatabase(user, user.displayName);
      navigate("/");
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError("Você fechou a janela de login do Google.");
      } else {
        setError("Erro ao autenticar com Google.");
      }
      console.error(err);
    }
    setLoading(false);
  };


  return (
    <>
      <div className="auth-container">
        <h2>{isRegistering ? "Criar Conta" : "Entrar"}</h2>
        <form onSubmit={handleEmailAuth}>
          {isRegistering && (
            <input
              type="text"
              placeholder="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Carregando..." : isRegistering ? "Cadastrar" : "Entrar"}
          </button>
        </form>
        {/* <button id="btn-google" onClick={handleGoogleLogin} disabled={loading}>
        {loading ? "Carregando..." : "Login com Google"}
      </button> */}
        <p onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? "Já tem conta? Entrar" : "Criar conta"}
        </p>

        <div id="btn-google">
          <GoogleButton
            shape="pill"
            type="light"
            onClick={handleGoogleLogin}
            disabled={loading}
            label={loading ? "Carregando..." : "Login com Google"}
          />
        </div>

      </div>
      {error && 
      <div className="alert alert-danger">
        {error}
      </div>
      }
    </>
  );
};

export default AuthPage;
