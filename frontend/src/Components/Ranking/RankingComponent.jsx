import React, { useEffect, useState } from "react";
import "./RankingComponent.css";
import api from "../../utils/api";

const RankingComponent = () => {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // 🔹 Estado para capturar erros

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        console.log("🔍 Buscando ranking...");
        const response = await api.get("/api/points/ranking"); // ✅ Caminho corrigido
        setRanking(response.data);
      } catch (error) {
        console.error("❌ Erro ao buscar ranking:", error);
        setError("Erro ao carregar ranking. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, []);

  return (
    <div className="ranking-container">
      <h2>🏆 Ranking dos Melhores Usuários</h2>
      {loading ? (
        <p>Carregando ranking...</p>
      ) : error ? (
        <p className="error-message">{error}</p> // 🔹 Mostra erro caso aconteça
      ) : ranking.length === 0 ? (
        <p>Nenhum usuário no ranking ainda.</p>
      ) : (
        <ol className="ranking-list">
          {ranking.map((user, index) => (
            <li key={user.id} className={`rank-${index + 1}`}>
              <span
                className={`ranking-medal ${
                  index === 0
                    ? "gold"
                    : index === 1
                    ? "silver"
                    : index === 2
                    ? "bronze"
                    : "default"
                }`}
              >
                {index === 0
                  ? "🥇"
                  : index === 1
                  ? "🥈"
                  : index === 2
                  ? "🥉"
                  : "🏅"}{" "}
                {index + 1}.
              </span>
              <span className="user-name">
                {user.name || "Usuário Anônimo"}
              </span>
              <span className="points">
                🎙️ {user.pointsSpeaking || 0} | ✍️ {user.pointsWriting || 0} |
                🏆 Total: {user.totalPoints || 0}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default RankingComponent;
