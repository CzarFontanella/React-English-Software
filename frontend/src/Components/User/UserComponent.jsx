import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig.js";
import "./UserComponent.css";
import { Navigate, redirect, useNavigate } from "react-router-dom";

const UserComponent = () => {

  const user = auth.currentUser;
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate("/");
      })
      .catch((error) => {
        console.error("Erro ao fazer logout:", error);
      });
  };

  return (
    <div className="user-container">
      <h1 className="">Bem vindo {user.displayName}!</h1>
      <img className="userview-img" src={user.photoURL} />
      <h2>Total de Pontos: {user.totalPoints || 0}</h2>
      <button onClick={handleLogout}>Sair</button>
    </div>
  );
}

export default UserComponent;