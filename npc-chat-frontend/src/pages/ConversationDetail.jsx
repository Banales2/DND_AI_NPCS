import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ConversationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const backendURL = "http://localhost:3000";

  const [conversation, setConversation] = useState(null);
  const [npcs, setNpcs] = useState([]);
  const [allNPCs, setAllNPCs] = useState([]);
  const [messages, setMessages] = useState([]);
  const [sendersMap, setSendersMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [updatedTitle, setUpdatedTitle] = useState("");
  const [updatedImage, setUpdatedImage] = useState("");
  const [selectedNPCs, setSelectedNPCs] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showRecipientMenu, setShowRecipientMenu] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState([]);


  // ------------------- Fetch conversation -------------------
  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${backendURL}/conversations/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setConversation(data);
        setUpdatedTitle(data.title);
        setUpdatedImage(data.image_url || "");
        setSelectedNPCs(data.participants?.map((npc) => npc.id) || []);
      } catch (err) {
        console.error("Error al obtener conversación:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversation();
  }, [id]);

  // ------------------- Fetch participants (NPCs activos) -------------------
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${backendURL}/participants/conversation/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setNpcs(data);
      } catch (err) {
        console.error("Error al obtener participantes:", err);
      }
    };
    fetchParticipants();
  }, [id]);

  // ------------------- Fetch user's NPCs for editing -------------------
  useEffect(() => {
    if (!editing) return;

    const fetchUserNPCs = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${backendURL}/users/npcs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setAllNPCs(data);
      } catch (err) {
        console.error("Error al obtener NPCs:", err);
      }
    };
    fetchUserNPCs();
  }, [editing]);

  // ------------------- Fetch messages -------------------
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${backendURL}/conversations/${id}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("Error al obtener mensajes:", err);
      }
    };
    fetchMessages();
  }, [id]);

  

  // ------------------- Fetch sender info -------------------
  useEffect(() => {
    const npcMap = {};
    npcs.forEach((npc) => {
      npcMap[npc.id] = npc;
    });

    const fetchSender = async (msg) => {
      if (msg.sender_type === "npc") {
        return npcMap[msg.sender_id] || { name: "NPC desconocido", image_url: "" };
      } else {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch(`${backendURL}/users/${msg.sender_id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error("Usuario no encontrado");
          const data = await res.json();
          return {
            id: data.id,
            name: data.display_name || "Tú",
            image_url: data.profile_image_url || "",
          };
        } catch (err) {
          console.error(err);
          return { id: null, name: "Tú", image_url: "" };
        }
      }
    };

    const loadSenders = async () => {
      const map = {};
      for (const msg of messages) {
        const key = `${msg.sender_type}-${msg.sender_id}`;
        if (!map[key]) {
          map[key] = await fetchSender(msg);
        }
      }
      setSendersMap(map);
    };

    if (messages.length > 0) loadSenders();
  }, [messages, npcs]);

  // ------------------- Enviar mensaje -------------------
   // ✉️ Modificar el envío para incluir destinatarios
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    if (selectedRecipients.length === 0) {
      alert("Selecciona al menos un destinatario o 'Todos'.");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${backendURL}/conversations/${id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sender_type: "user",
          content: newMessage,
          recipients: selectedRecipients,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        console.error("Error enviando mensaje:", result);
        return;
      }

      setNewMessage("");
      setIsSending(true);

      setTimeout(async () => {
        const msgRes = await fetch(`${backendURL}/conversations/${id}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const updatedMessages = await msgRes.json();
        setMessages(updatedMessages);
        setIsSending(false);
      }, 300);
    } catch (err) {
      console.error("Error enviando mensaje:", err);
    }
  };

  const toggleRecipientMenu = () => setShowRecipientMenu((prev) => !prev);

  // 🧠 Manejar selección de NPC o "todos"
  const handleRecipientToggle = (npcId) => {
    if (npcId === "all") {
      setSelectedRecipients(["all"]);
    } else {
      setSelectedRecipients((prev) => {
        if (prev.includes("all")) return [npcId]; // desactiva "all"
        return prev.includes(npcId)
          ? prev.filter((id) => id !== npcId)
          : [...prev, npcId];
      });
    }
  };

  // ------------------- Handle select NPC -------------------
  const handleSelectNPC = async (npcId) => {
    const token = localStorage.getItem("token");
    try {
      if (selectedNPCs.includes(npcId)) {
        await fetch(`${backendURL}/conversations/${id}/participants/${npcId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        setSelectedNPCs((prev) => prev.filter((id) => id !== npcId));
        setConversation((prev) => ({
          ...prev,
          participants: prev.participants.filter((npc) => npc.id !== npcId),
        }));
        setNpcs((prev) => prev.filter((npc) => npc.id !== npcId));
      } else {
        await fetch(`${backendURL}/conversations/${id}/participants`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ npcId }),
        });
        const addedNPC = allNPCs.find((npc) => npc.id === npcId);
        setSelectedNPCs((prev) => [...prev, npcId]);
        setConversation((prev) => ({
          ...prev,
          participants: [...prev.participants, addedNPC],
        }));
        setNpcs((prev) => [...prev, addedNPC]);
      }
    } catch (err) {
      console.error("Error al modificar participantes:", err);
    }
  };

  // ------------------- Handle delete -------------------
  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${backendURL}/conversations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Error al eliminar la conversación");
      navigate("/conversations");
    } catch (err) {
      console.error(err);
    }
  };

  // ------------------- Handle save -------------------
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${backendURL}/conversations/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ title: updatedTitle, image_url: updatedImage }),
      });
      const res = await fetch(`${backendURL}/conversations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setConversation(data);
      setEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-white text-center mt-40">Cargando...</div>;
  if (!conversation)
    return <div className="text-red-400 text-center mt-40">Conversación no encontrada</div>;

  // ------------------- NPC Map -------------------
  const npcMap = {};
  npcs.forEach((npc) => (npcMap[npc.id] = npc));

  // ------------------- Render -------------------
  return (
    <div className="flex h-screen text-white">
      {/* Sección izquierda */}
      <div className="w-1/3 bg-gray-900 border-r border-gray-800 p-6 flex flex-col relative">
        <button onClick={() => navigate("/conversations")} className="absolute top-4 left-4 text-gray-400 hover:text-white">
          ⬅ Regresar
        </button>
        <button onClick={() => setEditing(!editing)} className="absolute top-4 right-4 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded">
          {editing ? "Cerrar" : "Editar"}
        </button>

        <div className="flex flex-col items-start mt-10 w-full">
          {conversation.image_url && (
            <img src={conversation.image_url} alt={conversation.title} className="w-40 h-40 rounded-lg object-cover mb-4 border border-emerald-500" />
          )}
          <h1 className="text-3xl font-bold text-emerald-400 mb-6">{conversation.title}</h1>
          <h2 className="text-xl text-gray-300 mb-3">Participantes:</h2>
          <div className="flex flex-col gap-4 w-full pr-2">
            {conversation.participants?.map((npc) => (
              <div key={npc.id} className="flex items-center gap-3 bg-gray-800 p-3 rounded-lg border border-emerald-700 w-full">
                {npc.image_url ? (
                  <img src={npc.image_url} alt={npc.name} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-emerald-700 flex items-center justify-center text-white text-xl font-bold">{npc.name.charAt(0)}</div>
                )}
                <div>
                  <p className="font-semibold">{npc.name}</p>
                  <p className="text-sm text-gray-400">{npc.class}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sección derecha (chat) */}
      <div className="w-2/3 bg-gray-950 flex flex-col p-4 overflow-y-auto">
        <div className="flex flex-col gap-4 w-full max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
          {messages.map((msg) => {
            const key = `${msg.sender_type}-${msg.sender_id}`;
            const sender = sendersMap[key] || { name: "Tú", image_url: "" };
            const isUser = msg.sender_type === "user";
            const hasImage = sender.image_url && sender.image_url !== "";

            return (
              <div key={msg.id} className={`flex items-start gap-3 ${isUser ? "justify-end text-right" : "justify-start text-left"}`}>
                {!isUser && (
                  hasImage ? (
                    <img src={sender.image_url} alt={sender.name} className="w-12 h-12 rounded-full object-cover border border-gray-700" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-emerald-700 flex items-center justify-center text-white text-xl font-bold border border-gray-700">
                      {sender.name.charAt(0)}
                    </div>
                  )
                )}

                <div className={`max-w-[65%] rounded-2xl p-3 ${isUser ? "bg-blue-600 text-white rounded-br-none" : "bg-gray-800 text-gray-100 rounded-bl-none"}`}>
                  <p className="text-sm font-semibold mb-1">{sender.name}</p>
                  <p className="text-base whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                </div>

                {isUser && (
                  hasImage ? (
                    <img src={sender.image_url} alt={sender.name} className="w-12 h-12 rounded-full object-cover border border-gray-700" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-emerald-700 flex items-center justify-center text-white text-xl font-bold border border-gray-700">
                      {sender.name?.charAt(0) || "T"}
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
        
        {/* 🆕 Input de nuevo mensaje */}
        <div className="flex mt-auto gap-2 p-4 bg-gray-900 border-t border-gray-700 relative">
          {/* 🧭 Botón de destinatarios */}
          <div className="relative">
            <button
              onClick={toggleRecipientMenu}
              className="bg-gray-800 text-white px-3 py-2 rounded-lg hover:bg-gray-700"
              title="Seleccionar destinatarios"
            >
              ☰
            </button>

            {/* 🧩 Panel desplegable hacia arriba */}
            {showRecipientMenu && (
              <div className="absolute bottom-14 left-0 bg-gray-900 border border-gray-700 rounded-lg shadow-lg p-3 w-52 flex flex-col gap-2 max-h-60 overflow-y-auto z-50">
                <button
                  onClick={() => handleRecipientToggle("all")}
                  className={`p-2 rounded text-left ${
                    selectedRecipients.includes("all")
                      ? "bg-emerald-700 text-white"
                      : "bg-gray-800 text-gray-200 hover:bg-gray-700"
                  }`}
                >
                  🌐 Todos
                </button>

                {npcs.map((npc) => (
                  <button
                    key={npc.id}
                    onClick={() => handleRecipientToggle(npc.id)}
                    className={`p-2 rounded text-left ${
                      selectedRecipients.includes(npc.id)
                        ? "bg-emerald-700 text-white"
                        : "bg-gray-800 text-gray-200 hover:bg-gray-700"
                    }`}
                  >
                    {npc.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 📝 Input de texto */}
          <input
            type="text"
            placeholder="Escribe un mensaje..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 p-3 bg-gray-800 rounded-lg text-white focus:outline-none"
          />

          {/* 🚀 Botón enviar */}
          <button
            onClick={handleSendMessage}
            disabled={isSending}
            className={`bg-emerald-600 px-4 py-2 rounded-lg ${
              isSending ? "opacity-50 cursor-not-allowed" : "hover:bg-emerald-700"
            }`}
          >
            {isSending ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </div>

      {/* Panel de edición */}
      {editing && (
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-80 flex justify-center items-center">
          <div className="bg-gray-900 p-6 rounded-lg w-[500px] max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">Editar conversación</h2>

            <label className="block mb-2 text-gray-300">Título:</label>
            <input type="text" value={updatedTitle} onChange={(e) => setUpdatedTitle(e.target.value)} className="w-full p-2 rounded bg-gray-800 text-white mb-4" />

            <label className="block mb-2 text-gray-300">URL de imagen:</label>
            <input type="text" value={updatedImage} onChange={(e) => setUpdatedImage(e.target.value)} className="w-full p-2 rounded bg-gray-800 text-white mb-4" />

            <h3 className="text-lg text-gray-300 mb-2">NPCs disponibles:</h3>
            <div className="max-h-64 overflow-y-auto space-y-2 mb-6">
              {allNPCs.map((npc) => {
                const isSelected = selectedNPCs.includes(npc.id);
                return (
                  <div key={npc.id} onClick={() => handleSelectNPC(npc.id)} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer border transition-colors duration-200 ${isSelected ? "bg-emerald-700 border-emerald-500" : "bg-gray-800 border-gray-700"}`}>
                    {npc.image_url ? (
                      <img src={npc.image_url} alt={npc.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center text-white text-lg font-bold">{npc.name.charAt(0)}</div>
                    )}
                    <span>{npc.name}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-4">
              <button onClick={() => { if (window.confirm("⚠️ ¿Estás seguro de que deseas eliminar esta conversación? Esta acción no se puede deshacer.")) handleDelete(); }} className="px-4 py-2 bg-red-700 rounded hover:bg-red-600 left-4">
                Eliminar
              </button>
              <button onClick={() => setEditing(false)} className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600">Cancelar</button>
              <button onClick={handleSave} className="px-4 py-2 bg-emerald-600 rounded hover:bg-emerald-700">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
