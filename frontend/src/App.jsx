import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar/Navbar";
import Header from "./Components/Header/Header";
import Footer from "./Components/Footer/Footer";
import ListeningWriting from "./pages/ListeningWriting/ListeningWriting";
import ListeningSpeaking from "./pages/ListeningSpeaking/ListeningSpeaking";
import RankingComponent from "./Components/Ranking/RankingComponent";
import "./global.css";
import TelaFinalWriting from "./Components/TelaFinal/TelaFinalWriting";
import TelaFinalSpeaking from "./Components/TelaFinal/TelaFinalSpeaking";
import AuthPage from "./Components/AuthPage/AuthPage";
import React from "react";
import Talking from "./pages/Talking/Talking"; // ou o caminho correto para a page

const App = () => {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="container">
          <Routes>
            <Route path="/" element={<Header />} />
            <Route path="/listening-writing" element={<ListeningWriting />} />
            <Route path="/listening-speaking" element={<ListeningSpeaking />} />
            <Route path="/talking" element={<Talking />} />
            <Route path="/ranking" element={<RankingComponent />} />
            <Route path="/tela-final-writing" element={<TelaFinalWriting />} />
            <Route
              path="/tela-final-speaking"
              element={<TelaFinalSpeaking />}
            />
            <Route path="/auth" element={<AuthPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
