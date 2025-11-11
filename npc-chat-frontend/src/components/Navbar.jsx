import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar({ toggleTheme, isDark }) {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const backendURL = "http://localhost:3000";

  const links = [
    { name: "Home", path: "/" },
    { name: "Conversations", path: "/conversations" },
    { name: "NPCs", path: "/npcs" },
    { name: "About", path: "/about" },
  ];

  // ✅ Función para verificar si el token sigue siendo válido
  const verifyToken = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      localStorage.removeItem("user");
      setUser(null);
      return;
    }

    try {
      const response = await fetch(`${backendURL}/auth/verify`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const storedUser = localStorage.getItem("user");
        setUser(storedUser ? JSON.parse(storedUser) : data.user);
      } else {
        // 🔹 Token inválido → limpiar todo
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      }
    } catch (error) {
      console.error("Error verificando token:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  // 🔹 Verificar token al montar y en intervalos
  useEffect(() => {
    verifyToken();

    const interval = setInterval(verifyToken, 10000); // cada 10 segundos
    window.addEventListener("storage", verifyToken);
    window.addEventListener("userUpdate", verifyToken);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", verifyToken);
      window.removeEventListener("userUpdate", verifyToken);
    };
  }, []);

  const handleProfileClick = () => {
    if (user) navigate("/account");
  };

  return (
    <nav className="flex justify-between items-center px-10 py-6 font-semibold absolute top-0 w-full z-50">
      <h1 className="text-3xl font-bold text-white select-none drop-shadow-[0_0_10px_#00ffcc]">
        ✦ DnD Chat ✦
      </h1>

      <div className="flex items-center space-x-10">
        <ul className="flex space-x-8 text-sm md:text-base">
          {links.map((link, i) => (
            <motion.li
              key={i}
              whileHover={{
                scale: 1.1,
                textShadow: "0 0 10px #00ffcc, 0 0 25px #00ffcc",
              }}
              className={`cursor-pointer transition-all duration-300 ${
                location.pathname === link.path
                  ? "text-[#00ffcc] drop-shadow-[0_0_12px_#00ffcc]"
                  : "text-white hover:text-white hover:drop-shadow-[0_0_8px_#00ffcc]"
              }`}
            >
              <Link to={link.path}>{link.name}</Link>
            </motion.li>
          ))}

          {/* 🔹 Si hay usuario → mostrar avatar, si no → login */}
          {user ? (
            <li>
              <div
                onClick={handleProfileClick}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#00ffcc] cursor-pointer hover:scale-110 transition-all"
                title="Ver perfil"
              >
                {user.profile_image_url ? (
                  <img
                    src={user.profile_image_url}
                    alt="avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target.src = "/default-avatar.png")}
                  />
                ) : (
                  <div className="bg-[#00ffcc] text-black w-full h-full flex items-center justify-center font-bold">
                    {user.display_name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
              </div>
            </li>
          ) : (
            <motion.li
              whileHover={{
                scale: 1.1,
                textShadow: "0 0 10px #00ffcc, 0 0 25px #00ffcc",
              }}
              className={`cursor-pointer transition-all duration-300 ${
                location.pathname === "/login"
                  ? "text-[#00ffcc] drop-shadow-[0_0_12px_#00ffcc]"
                  : "text-white hover:text-white hover:drop-shadow-[0_0_8px_#00ffcc]"
              }`}
            >
              <Link to="/login">Login</Link>
            </motion.li>
          )}
        </ul>

        <button
          onClick={toggleTheme}
          className={`ml-6 text-xl hover:scale-110 transition ${
            isDark
              ? "text-[#00ffcc] drop-shadow-[0_0_10px_#00ffcc]"
              : "text-[#003322] hover:text-[#006644]"
          } bg-transparent border-none focus:outline-none`}
        >
          {isDark ? "☀️" : "🌙"}
        </button>
      </div>
    </nav>
  );
}
