import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

export default function Navbar({ toggleTheme, isDark }) {
  const links = [
    { name: "Home", path: "/" },
    { name: "Conversations", path: "/conversations" },
    { name: "NPCs", path: "/npcs" },
    { name: "About", path: "/about" },
    { name: "Login", path: "/login" },
  ];

  const location = useLocation();

  return (
    <nav className="flex justify-between items-center px-10 py-6 font-semibold absolute top-0 w-full z-50">
      {/* Logo */}
      <h1 className="text-3xl font-bold text-white select-none drop-shadow-[0_0_10px_#00ffcc]">
        ✦ DnD Chat ✦
      </h1>

      {/* Menú + Botón modo */}
      <div className="flex items-center space-x-10">
        <ul className="flex space-x-8 text-sm md:text-base">
          {links.map((link, i) => {
            const isActive = location.pathname === link.path;
            return (
              <motion.li
                key={i}
                whileHover={{
                  scale: 1.1,
                  textShadow: "0 0 10px #00ffcc, 0 0 25px #00ffcc",
                }}
                className={`cursor-pointer transition-all duration-300 ${
                  isActive
                    ? "text-[#00ffcc] drop-shadow-[0_0_12px_#00ffcc]"
                    : "text-white hover:text-white hover:drop-shadow-[0_0_8px_#00ffcc]"
                }`}
              >
                <Link to={link.path}>{link.name}</Link>
              </motion.li>
            );
          })}
        </ul>

        {/* Botón tema */}
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
