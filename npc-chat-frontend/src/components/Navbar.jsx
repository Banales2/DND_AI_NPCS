import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar({ toggleTheme, isDark }) {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const links = [
    { name: "Home", path: "/" },
    { name: "Conversations", path: "/conversations" },
    { name: "NPCs", path: "/npcs" },
    { name: "About", path: "/about" },
  ];

  // 🔹 Detecta usuario en localStorage al montar y en cambios de otras pestañas
  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (!storedToken) {
        localStorage.removeItem("user");
        setUser(null);
        return;
      }

      setUser(storedUser ? JSON.parse(storedUser) : null);
    };

    checkUser();

    window.addEventListener("userUpdate", checkUser);
    window.addEventListener("storage", checkUser);

    // 🔹 Nuevo: verificación periódica cada 5 segundos
    const interval = setInterval(checkUser, 5000);

    return () => {
      window.removeEventListener("userUpdate", checkUser);
      window.removeEventListener("storage", checkUser);
      clearInterval(interval);
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
              whileHover={{ scale: 1.1, textShadow: "0 0 10px #00ffcc, 0 0 25px #00ffcc" }}
              className={`cursor-pointer transition-all duration-300 ${
                location.pathname === link.path
                  ? "text-[#00ffcc] drop-shadow-[0_0_12px_#00ffcc]"
                  : "text-white hover:text-white hover:drop-shadow-[0_0_8px_#00ffcc]"
              }`}
            >
              <Link to={link.path}>{link.name}</Link>
            </motion.li>
          ))}

          {/* 🔹 Avatar si hay usuario, si no Login */}
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
              whileHover={{ scale: 1.1, textShadow: "0 0 10px #00ffcc, 0 0 25px #00ffcc" }}
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
