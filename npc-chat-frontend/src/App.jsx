import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Conversations from "./pages/Conversations";
import NPCs from "./pages/NPCs";
import AuthPage from "./pages/AuthPage";
import About from "./pages/About";
import Login from "./pages/Login";
import "./index.css";

function App() {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.body.classList.toggle("light-mode");
  };

  return (
    <Router>
      <Navbar toggleTheme={toggleTheme} isDark={isDark} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/conversations" element={<Conversations />} />
        <Route path="/npcs" element={<NPCs />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<AuthPage />} />
      </Routes>
    </Router>
  );
}

export default App;
