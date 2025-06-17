import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig.js";
import navlogo from "../../assets/nav-logo.png";
import "./Nav.css";
import React from "react";

const Navbar = ({ voltarParaInicio }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth).then(() => setUser(null));
  };

  return (
    <div className="nav-container">
      <div className="center-container">
        <div className={`nav-links ${menuOpen ? "show" : ""}`}>
          <Link
            to="/"
            className={`nav-item ${location.pathname === "/" ? "active" : ""}`}
          >
            <span className="material-symbols-outlined">
              home
            </span>
          </Link>
          <Link
            to="/listening-writing"
            className={`nav-item ${location.pathname === "/listening-writing" ? "active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            <span className="material-symbols-outlined">
              history_edu
            </span>
          </Link>
          <Link
            to="/listening-speaking"
            className={`nav-item ${location.pathname === "/listening-speaking" ? "active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            <span className="material-symbols-outlined">
              voice_selection
            </span>
          </Link>
          <Link 
          to="/talking" 
          className={`nav-item ${location.pathname === "/talking" ? "active" : ""}`}
          >
            <span className="material-symbols-outlined">
              robot_2
            </span>
          </Link>
          <Link
            to="/ranking"
            className={`nav-item ${location.pathname === "/ranking" ? "active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            <span className="material-symbols-outlined">
              trophy
            </span>
          </Link>

          {!user ? (
            <Link
              to="/auth"
              className={`nav-item ${location.pathname === "/auth" ? "active" : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              <span className="material-symbols-outlined">
                login
              </span>
            </Link>
          ) : (
            <Link
              to="/user"
              className={`nav-item ${location.pathname === "/user" ? "active" : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              {!user.photoURL ? (
                <span className="material-symbols-outlined">
                  account_circle
                </span>
              ) : (
                <img className="nav-item user-img" src={user.photoURL} />
              )}

            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
