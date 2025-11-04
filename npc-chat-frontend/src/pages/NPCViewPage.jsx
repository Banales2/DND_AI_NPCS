import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function NPCViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [npc, setNpc] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNpc = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No estás autenticado. Inicia sesión primero.");
        return;
      }

      try {
        const res = await axios.get(`http://localhost:3000/npcs/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNpc(res.data);
      } catch (err) {
        console.error(err);
        if (err.response?.status === 403) {
          setError("No tienes permiso para ver este NPC.");
        } else if (err.response?.status === 404) {
          setError("NPC no encontrado.");
        } else {
          setError("Error al cargar el NPC.");
        }
      }
    };

    fetchNpc();
  }, [id]);

  if (error)
    return (
      <div className="p-6 text-center text-red-400">
        <p>{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Volver
        </button>
      </div>
    );

  if (!npc)
    return <p className="text-center text-gray-400 mt-10">Cargando NPC...</p>;

  return (
    <div className="pt-28 px-6 p-6 flex flex-col items-center">
      <div className="max-w-2xl w-full bg-gradient-to-b from-gray-800 to-gray-900 text-white shadow-lg rounded-2xl p-6">
        <h1 className="text-3xl font-bold mb-4 text-center">{npc.name}</h1>

        {npc.image_url && (
          <img
            src={npc.image_url}
            alt={npc.name}
            className="w-40 h-40 object-cover rounded-full mx-auto mb-4 border border-gray-500 shadow-md"
          />
        )}

        <p><strong>Raza:</strong> {npc.race}</p>
        <p><strong>Clase:</strong> {npc.class}</p>
        <p><strong>Alineación:</strong> {npc.alignment}</p>

        <div className="mt-4">
          <h2 className="font-semibold text-lg mb-1">Personalidad</h2>
          <p className="text-gray-300 whitespace-pre-wrap">
            {npc.personality_traits || "Sin descripción"}
          </p>
        </div>

        <div className="mt-4">
          <h2 className="font-semibold text-lg mb-1">Historia</h2>
          <p className="text-gray-300 whitespace-pre-wrap">
            {npc.backstory || "Sin historia"}
          </p>
        </div>

        <div className="mt-6">
          <h2 className="font-semibold text-2xl mb-3 text-[#00ffcc] uppercase tracking-wider text-center">
            Estadísticas
          </h2>

          {(() => {
            let statsObj = {};

            try {
              statsObj =
                typeof npc.stats === "string" ? JSON.parse(npc.stats) : npc.stats || {};
            } catch {
              console.error("Error al parsear stats:", npc.stats);
            }

            // Si no hay estadísticas, mostrar mensaje
            if (Object.entries(statsObj).length === 0) {
              return (
                <p className="italic text-gray-400 text-center">
                  No hay estadísticas registradas.
                </p>
              );
            }

            // Íconos opcionales por tipo de stat
            const statIcons = {
              strength: "⚔️",
              dexterity: "🏹",
              constitution: "❤️",
              intelligence: "🧠",
              wisdom: "📜",
              charisma: "💫",
            };

            return (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 mt-4">
                {Object.entries(statsObj).map(([key, value]) => {
                  const icon = statIcons[key.toLowerCase()] || "⭐";
                  return (
                    <div
                      key={key}
                      className="relative group bg-[#01231b]/70 p-4 rounded-xl border border-[#00ffcc]/20 text-center 
                      shadow-lg hover:shadow-[0_0_20px_#00ffcc50] transition duration-300"
                    >
                      <div className="absolute inset-x-6 -top-[1px] h-[1px] bg-gradient-to-r from-transparent via-[#00ffcc80] to-transparent opacity-70"></div>

                      <p className="text-sm text-gray-300 uppercase tracking-widest mb-1 group-hover:text-[#00ffcc] transition">
                        {icon} {key}
                      </p>

                      <p className="text-3xl font-extrabold text-[#00ffcc] group-hover:scale-110 transition transform">
                        {value}
                      </p>

                      <div className="absolute inset-x-10 bottom-[3px] h-[1px] bg-gradient-to-r from-transparent via-[#00ffcc30] to-transparent"></div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={() => navigate(-1)}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}
