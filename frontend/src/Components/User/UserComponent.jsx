import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig.js";
import "./UserComponent.css";
import { Navigate, redirect, useNavigate } from "react-router-dom";
import api from "../../utils/api.js";

const UserComponent = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const [pontuacao, setPontuacao] = useState({ totalPoints: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        // Se não estiver logado, redireciona
        navigate("/");
      }
    });

    // Cleanup: desinscreve o listener quando o componente desmontar
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchUserPoints = async () => {
      if (!user) return;

      try {
        console.log("🔍 Buscando pontos do usuario...");
        const response = await api.get(`/api/points/userPoints/${user.uid}`);
        setPontuacao(response.data);
      } catch (error) {
        console.error("❌ Erro ao buscar pontos:", error);
        setError("Erro ao carregar pontos. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserPoints();
  }, [user]); // ⚠️ precisa esperar o `user` ser definido

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate("/");
      })
      .catch((error) => {
        console.error("Erro ao fazer logout:", error);
      });
  };

  // Evita renderização até o estado do usuário ser carregado
  if (!user) {
    return <p>Carregando usuário...</p>;
  }

  return (
    <div className="user-container">
      <h1>Bem-vindo {user.displayName}!</h1>
      {!user.photoURL ? (
        <img className="userview-img" src="https://i0.wp.com/digitalhealthskills.com/wp-content/uploads/2022/11/3da39-no-user-image-icon-27.png?fit=500%2C500&ssl=1" alt="Foto do usuário" />
      ) : (
        <img className="userview-img" src={user.photoURL} alt="Foto do usuário" />
      )}
      {loading ? (
        <p>Carregando pontos...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div id="div-pontos">
          <h3>Pontos de Writing: {pontuacao.pointsWriting || 0}</h3>
          <h3>Pontos de Speaking: {pontuacao.pointsSpeaking || 0}</h3>
          <h3>Total de Pontos: {pontuacao.totalPoints || 0}</h3>
        </div>
      )}
      <button className="logout-button" onClick={handleLogout}>Sair</button>
    </div>
  );
};

export default UserComponent;