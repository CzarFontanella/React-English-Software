import "./Home.css";
import logoHome from "../../assets/logo-home.png";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const Home = React.memo(({ comecarPratica }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists() && userSnap.data().hasActivated) {
          setIsActivated(true);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="header-container">
      <div className="logo">
        <img src={logoHome} alt="Logomarca English Daily" />
      </div>
      <div className="header-text">
        <h1>
          A <span>nova maneira</span> de aprender inglês
        </h1>
          <Link
            to={user ? "/listening-writing" : "/auth"}
            className="practice-btn"
          >
            <h4>Começar</h4>
          </Link>
        <p>
          Aprimore seu entendimento em apenas alguns minutos! Com auxilio
          completo da melhor tecnologia de Inteligência Artificial
        </p>
        <p>
          No Listening & Writing, você ouvirá frases em inglês geradas por IA e
          precisará escrevê-las corretamente para aprimorar sua compreensão
          auditiva e ortografia.
          <br />
          <br />
          Já no Listening & Speaking, você praticará a pronúncia ao repetir
          frases geradas por IA, sendo avaliado por IA para melhorar sua
          fluência na fala.
          <br />
          <br />
          Com a Conversação IA, você poderá conversar livremente com a
          inteligência artificial, praticando a comunicação em tempo real. Fale
          por 30 minutos e ganhe 100 pontos para aprimorar ainda mais suas
          habilidades no idioma e subir no Ranking!
        </p>
      </div>
    </div>
  );
});

export default Home;
