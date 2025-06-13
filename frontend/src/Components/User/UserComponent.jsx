import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig.js";
import "./UserComponent.css";
import { Navigate, redirect, useNavigate } from "react-router-dom";

const UserComponent = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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
      <img className="userview-img" src={user.photoURL} alt="Foto do usuário" />
      <h2>Total de Pontos: {user.totalPoints || 0}</h2>
      <button onClick={handleLogout}>Sair</button>
    </div>
  );
};

export default UserComponent;