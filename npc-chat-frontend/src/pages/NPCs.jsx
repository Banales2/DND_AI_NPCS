import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";


export default function NPCPage() {
  const [npcs, setNpcs] = useState([]);
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    race: "",
    class: "",
    backstory: "",
    personality_traits: "",
    image_url: "",
  });

  // 🔹 NUEVOS ESTADOS
  const [stats, setStats] = useState({
    strength: 10,
    dexterity: 10,
    intelligence: 10,
    charisma: 10,
  });
  const [alignment, setAlignment] = useState("True Neutral");
  const [aiConfig, setAiConfig] = useState({
    model: "gemini-1.5-flash",
    temperature: 0.7,
    style: "neutral",
  });

  const backendURL = "http://localhost:3000";
  const token = localStorage.getItem("token");

  // 🔹 Obtener NPCs
  const fetchNPCs = async () => {
    try {
      const res = await axios.get(`${backendURL}/npcs/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNpcs(res.data);
    } catch (err) {
      console.error("Error al obtener NPCs:", err);
    }
  };

  useEffect(() => {
    fetchNPCs();
  }, []);

  // 🔹 Crear o editar NPC
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        race: form.race,
        class: form.class,
        backstory: form.backstory,
        personality_traits: form.personality_traits,
        stats,
        ai_model_config: aiConfig,
        alignment,
        image_url: form.image_url,
      };

      if (editingId) {
        await axios.put(`${backendURL}/npcs/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${backendURL}/npcs`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      // Resetear estados
      setForm({
        name: "",
        race: "",
        class: "",
        backstory: "",
        personality_traits: "",
      });
      setStats({
        strength: 10,
        dexterity: 10,
        intelligence: 10,
        charisma: 10,
      });
      setAiConfig({
        model: "gemini-1.5-flash",
        temperature: 0.7,
        style: "neutral",
      });
      setAlignment("True Neutral");
      setEditingId(null);
      setShowForm(false);
      fetchNPCs();
    } catch (err) {
      console.error("Error al guardar NPC:", err);
      alert("Error al guardar NPC. Revisa la consola del navegador.");
    }
  };

  // 🔹 Editar NPC existente
  const handleEdit = async (npc) => {
    try {
      const res = await axios.get(`${backendURL}/npcs/${npc.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const full = res.data;

      setEditingId(full.id);
      setForm({
        name: full.name || "",
        race: full.race || "",
        class: full.class || "",
        backstory: full.backstory || "",
        personality_traits: full.personality_traits || "",
      });
      setStats(full.stats || { strength: 10, dexterity: 10, intelligence: 10, charisma: 10 });
      setAiConfig(full.ai_model_config || { model: "gemini-1.5-flash", temperature: 0.7, style: "neutral" });
      setAlignment(full.alignment || "True Neutral");
      setShowForm(true);
    } catch (err) {
      console.error("Error al cargar NPC completo:", err);
      alert("No se pudo cargar el NPC para editar. Revisa la consola.");
    }
  };

  // 🔹 Eliminar NPC
  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este NPC?")) return;
    try {
      await axios.delete(`${backendURL}/npcs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNPCs();
    } catch (err) {
      console.error("Error al eliminar NPC:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#001a10] to-black text-white pt-28 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-[#00ffcc] mb-8 text-center">Tus NPCs</h1>

        {/* Botón Crear */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setForm({
                name: "",
                race: "",
                class: "",
                backstory: "",
                personality_traits: "",
              });
              setStats({
                strength: 10,
                dexterity: 10,
                intelligence: 10,
                charisma: 10,
              });
              setAiConfig({
                model: "gemini-1.5-flash",
                temperature: 0.7,
                style: "neutral",
              });
              setAlignment("True Neutral");
            }}
            className="bg-[#00ffcc] text-black px-5 py-2 rounded-full font-bold hover:bg-[#00bfa6] transition"
          >
            {showForm ? "Cancelar" : "+ Crear NPC"}
          </button>
        </div>

        {/* Formulario */}
        <AnimatePresence>
          {showForm && (
            <motion.form
              key="npc-form"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              onSubmit={handleSubmit}
              className="bg-[#002b1a]/60 p-6 rounded-xl shadow-[0_0_20px_#00ffcc] mb-10 space-y-3 overflow-hidden"
            >
              <input
                type="text"
                placeholder="Nombre"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full p-2 rounded bg-[#001a10] border border-[#00ffcc] text-white"
                required
              />
              <input
                type="text"
                placeholder="Raza"
                value={form.race}
                onChange={(e) => setForm({ ...form, race: e.target.value })}
                className="w-full p-2 rounded bg-[#001a10] border border-[#00ffcc] text-white"
                required
              />
              <input
                type="text"
                placeholder="Clase"
                value={form.class}
                onChange={(e) => setForm({ ...form, class: e.target.value })}
                className="w-full p-2 rounded bg-[#001a10] border border-[#00ffcc] text-white"
              />

              {/* Historia */}
              <textarea
                placeholder="Historia"
                value={form.backstory}
                onChange={(e) => setForm({ ...form, backstory: e.target.value })}
                className="w-full p-2 rounded bg-[#001a10] border border-[#00ffcc] text-white resize-none"
                style={{ minHeight: "120px" }}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
              />

              {/* Rasgos */}
              <textarea
                placeholder="Rasgos de personalidad"
                value={form.personality_traits}
                onChange={(e) =>
                  setForm({ ...form, personality_traits: e.target.value })
                }
                className="w-full p-2 rounded bg-[#001a10] border border-[#00ffcc] text-white resize-none"
                style={{ minHeight: "100px" }}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
              />

              {/* Stats */}
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-[#00ffcc] mb-2">Estadísticas</h3>
                {Object.keys(stats).map((key) => (
                  <div key={key} className="flex items-center mb-2">
                    <label className="w-1/2 capitalize text-sm">{key}</label>
                    <input
                      type="number"
                      value={stats[key]}
                      onChange={(e) =>
                        setStats({ ...stats, [key]: parseInt(e.target.value) })
                      }
                      className="w-1/2 bg-[#001a10] border border-[#00ffcc] rounded p-1 text-white"
                    />
                  </div>
                ))}
                {/* Boton nueva stat */}
                <button
                  type="button"
                  className="text-[#00ffcc] hover:text-white text-sm"
                  onClick={() => {
                    const key = prompt("Nombre del nuevo atributo (ej: charisma):");
                    if (key) setStats({ ...stats, [key.toLowerCase()]: 10 });
                  }}
                >
                  + Agregar Atributo
                </button>
              </div>

              {/* Alineación */}
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-[#00ffcc] mb-2">Alineación</h3>
                <select
                  value={alignment}
                  onChange={(e) => setAlignment(e.target.value)}
                  className="w-full bg-[#001a10] border border-[#00ffcc] rounded p-2 text-white"
                >
                  <option>Lawful Good</option>
                  <option>Neutral Good</option>
                  <option>Chaotic Good</option>
                  <option>Lawful Neutral</option>
                  <option>True Neutral</option>
                  <option>Chaotic Neutral</option>
                  <option>Lawful Evil</option>
                  <option>Neutral Evil</option>
                  <option>Chaotic Evil</option>
                </select>
              </div>
                  {/* Imagen */}
              <label className="block mb-2">Image URL:</label>
              <input
                type="text"
                name="image_url"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                className="w-full p-2 border rounded mb-4 bg-gray-800 text-white"
              />
              {/* Configuración IA */}
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-[#00ffcc] mb-2">Configuración de IA</h3>
                <label className="block text-sm mb-1">Modelo</label>
                <input
                  type="text"
                  value={aiConfig.model}
                  onChange={(e) =>
                    setAiConfig({ ...aiConfig, model: e.target.value })
                  }
                  className="w-full bg-[#001a10] border border-[#00ffcc] rounded p-2 text-white mb-2"
                />
                <label className="block text-sm mb-1">Temperatura</label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={aiConfig.temperature}
                  onChange={(e) =>
                    setAiConfig({
                      ...aiConfig,
                      temperature: parseFloat(e.target.value),
                    })
                  }
                  className="w-full bg-[#001a10] border border-[#00ffcc] rounded p-2 text-white mb-2"
                />
                <label className="block text-sm mb-1">Estilo</label>
                <select
                  value={aiConfig.style}
                  onChange={(e) =>
                    setAiConfig({ ...aiConfig, style: e.target.value })
                  }
                  className="w-full bg-[#001a10] border border-[#00ffcc] rounded p-2 text-white"
                >
                  <option value="neutral">Neutral</option>
                  <option value="friendly">Amigable</option>
                  <option value="aggressive">Agresivo</option>
                  <option value="sarcastic">Sarcástico</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-[#00ffcc] text-black font-bold py-2 rounded-lg hover:bg-[#00bfa6] transition"
              >
                {editingId ? "Actualizar NPC" : "Crear NPC"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Listado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {npcs.map((npc) => (
            <motion.div
              key={npc.id}
              className="relative bg-[#001a10]/70 border border-[#00ffcc]/40 p-5 rounded-2xl shadow-lg hover:shadow-[0_0_15px_#00ffcc] transition cursor-pointer"
              whileHover={{ scale: 1.03 }}
              onClick={() => navigate(`/npc/${npc.id}`)} // 👈 ir a vista detallada
            >
              <div className="w-24 h-24 mx-auto mb-4 rounded-full border-2 border-[#00ffcc] bg-[#003322] flex items-center justify-center text-[#00ffcc] text-xl font-bold">
                {npc.image_url && (
                  <img
                    src={npc.image_url}
                    alt={npc.name}
                    className="w-20 h-20 object-cover rounded-full border border-gray-500"
                  />
                )}
              </div>
              <h3 className="text-xl font-bold text-[#00ffcc] text-center">{npc.name}</h3>
              <p className="text-center text-sm text-gray-300">
                {npc.race} — {npc.class || "Sin clase"}
              </p>

              <div className="flex justify-center gap-3 mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(npc);
                  }}
                  className="bg-[#00bfa6] text-black px-3 py-1 rounded hover:bg-[#00ffcc]"
                >
                  Editar
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(npc.id);
                  }}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {npcs.length === 0 && (
          <p className="text-center text-gray-400 mt-8">
            No tienes NPCs creados aún.
          </p>
        )}
      </div>
    </div>
  );
}
