import { motion } from "framer-motion";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    window.dispatchEvent(new Event("userUpdate"));

    if (!token && user) {
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("userUpdate"));
      console.log("⚠️ Token perdido, cerrando sesión automáticamente");
    }
  }, []);

  return (
    <div className="flex flex-col justify-center items-center h-screen text-center relative overflow-hidden">
      {/* ✨ Fondo de partículas */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-70 blur-[2px]"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* ✨ Título fijo */}
      <motion.h1
        className="text-6xl md:text-7xl font-bold text-white drop-shadow-[0_0_30px_#00ffcc]"
        animate={{
          textShadow: [
            "0 0 20px #ffffff",
            "0 0 40px #00ffcc",
            "0 0 20px #ffffff",
          ],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        Adventure Awaits You
      </motion.h1>

      <p className="text-lg md:text-xl text-black-200 mt-4 max-w-2xl">
        Step into the realm of magic and storytelling. Create, talk, and live your legend.
      </p>

      <motion.button
        whileHover={{
          scale: 1.1,
          boxShadow: "0 0 25px #ffffff, 0 0 45px #00ffcc",
        }}
        transition={{ duration: 0.3 }}
        className="mt-8 px-8 py-3 rounded-full font-semibold bg-white text-black hover:bg-gray-200 transition"
      >
        Start Now
      </motion.button>
    </div>
  );
}
