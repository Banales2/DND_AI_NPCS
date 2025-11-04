import { motion } from "framer-motion";

export default function About() {
  const team = [
    {
      name: "Bañales",
      role: "Creador, desarrollador y Dungeon Master digital",
      image: "https://media.licdn.com/dms/image/v2/D4E03AQEVX8s9YV54MA/profile-displayphoto-shrink_200_200/B4EZX.P_mZHYAc-/0/1743727360711?e=2147483647&v=beta&t=iRu4aenkc57wsrVF1n-pkWkzf5A6t_gU5vDLzZj6oP4", // cambia por tu imagen si deseas
      description:
        "Apasionado por los mundos fantásticos, el código limpio y las tiradas de 20. Dio vida a DnD Chat para combinar magia y tecnología.",
    },
    {
      name: "ChatGPT",
      role: "Asistente arcano de desarrollo",
      image: "https://www.fategate.com/res/photo/eshop_item/thumbs/large/sidebs-rst10-atomls_01.jpg",
      description:
        "Entidad digital invocada para ayudar en código, diseño y equilibrio narrativo. Vive entre bits y líneas de comando.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#001a10] to-[#002b1a] text-white flex flex-col items-center justify-center px-6 py-20">
      {/* Título */}
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-5xl md:text-6xl font-extrabold text-[#00ffcc] mb-10 drop-shadow-[0_0_15px_#00ffcc]"
      >
        ✦ About DnD Chat ✦
      </motion.h1>

      {/* Caja de introducción */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.3 }}
        className="max-w-3xl bg-white/10 backdrop-blur-md border border-[#00ffcc]/40 rounded-2xl shadow-[0_0_25px_#00ffcc] p-10 text-center"
      >
        <p className="text-lg md:text-xl text-gray-200 leading-relaxed">
          <span className="text-[#00ffcc] font-semibold">DnD Chat</span> nació
          con la idea de unir la magia de las campañas de{" "}
          <span className="italic">Dungeons & Dragons</span> con la comodidad
          del mundo digital. 🌌
        </p>

        <p className="mt-6 text-gray-300">
          Aquí puedes crear tus propios NPCs, registrar conversaciones, y
          compartir historias con tu grupo de aventureros sin perder el toque
          de fantasía que caracteriza a cada partida. 🧙‍♂️✨
        </p>

        <p className="mt-6 text-gray-400 text-sm italic">
          “May your rolls be high, your lore deep, and your code bug-free.”
        </p>
      </motion.div>

      {/* Línea decorativa */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "80%" }}
        transition={{ duration: 1.5, delay: 1 }}
        className="mt-16 h-[1px] bg-gradient-to-r from-transparent via-[#00ffcc] to-transparent"
      />

      {/* Sección del equipo */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 1.2 }}
        className="text-3xl md:text-4xl font-bold text-[#00ffcc] mt-16 mb-10 drop-shadow-[0_0_10px_#00ffcc]"
      >
        ✦ The Party ✦
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl">
        {team.map((member, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.4 + index * 0.3 }}
            className="bg-white/10 backdrop-blur-md border border-[#00ffcc]/30 rounded-2xl p-8 text-center shadow-[0_0_15px_#00ffcc]/30 hover:shadow-[0_0_30px_#00ffcc] transition-all hover:scale-105"
          >
            <div className="flex justify-center mb-6">
              <img
                src={member.image}
                alt={member.name}
                className="w-24 h-24 rounded-full border-2 border-[#00ffcc] shadow-[0_0_15px_#00ffcc] object-cover"
                onError={(e) => (e.target.src = "/default-avatar.png")}
              />
            </div>
            <h3 className="text-2xl font-semibold text-[#00ffcc] mb-2">
              {member.name}
            </h3>
            <p className="text-sm text-gray-400 mb-3">{member.role}</p>
            <p className="text-gray-300 text-sm">{member.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 2 }}
        className="mt-20 text-gray-500 text-sm text-center"
      >
        © {new Date().getFullYear()} DnD Chat — Built by Bañales & ChatGPT ⚡
      </motion.footer>
    </div>
  );
}
