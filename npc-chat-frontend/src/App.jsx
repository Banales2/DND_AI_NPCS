import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Conversations from "./pages/Conversations";
import NPCs from "./pages/NPCs";
import AuthPage from "./pages/AuthPage";
import About from "./pages/About";
import NPCViewPage from "./pages/NPCViewPage";
import Account from "./pages/Account";
import ConversationDetail from "./pages/ConversationDetail";
import "./index.css";

function App() {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.body.classList.toggle("light-mode");
  };

  return (
    <Router>
      <AppContent toggleTheme={toggleTheme} isDark={isDark} />
    </Router>
  );
}

function AppContent({ toggleTheme, isDark }) {
  const location = useLocation();

  // Oculta la navbar en ConversationDetail
  const hideNavbarRoutes = ["/conversations/"];
  const shouldHideNavbar = hideNavbarRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  return (
    <>
      {!shouldHideNavbar && <Navbar toggleTheme={toggleTheme} isDark={isDark} />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/conversations" element={<Conversations />} />
        <Route path="/npcs" element={<NPCs />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/account" element={<Account />} />
        <Route path="/npc/:id" element={<NPCViewPage />} />
        <Route path="/conversations/:id" element={<ConversationDetail />} />
      </Routes>
    </>
  );
}

export default App;


