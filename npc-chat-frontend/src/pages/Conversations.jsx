import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Conversations() {
  const [conversations, setConversations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const navigate = useNavigate();
  const backendURL = "http://localhost:3000";

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${backendURL}/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setConversations(data);
      } catch (err) {
        console.error("Error al cargar conversaciones:", err);
      }
    };
    fetchConversations();
  }, []);

  const handleCreate = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${backendURL}/conversations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: newTitle }),
    });

    const result = await res.json();

    // 🔁 Refetch de todas las conversaciones después de crear
    const listRes = await fetch(`${backendURL}/conversations`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const updated = await listRes.json();

    // 🔎 Busca la conversación recién creada por su título
    const newest = updated.find((c) => c.title === newTitle);

    setConversations(updated);
    setShowForm(false);
    setNewTitle("");

    if (newest?.id) {
      navigate(`/conversations/${newest.id}`);
    } else {
      console.warn("No se encontró la conversación recién creada:", updated);
    }
  } catch (err) {
    console.error("Error al crear conversación:", err);
  }
};


  return (
    <div className="min-h-screen bg-gray-900 text-white pt-28 px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-emerald-400">Tus Conversaciones</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg"
        >
          Nueva conversación
        </button>
      </div>

      {showForm && (
        <div className="mb-8 flex gap-3">
          <input
            type="text"
            placeholder="Título de la conversación"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="p-2 rounded-lg w-1/2 text-white"
          />
          <button
            onClick={handleCreate}
            className="bg-emerald-700 px-4 py-2 rounded-lg hover:bg-emerald-800"
          >
            Crear
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-6">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => navigate(`/conversations/${conv.id}`)}
            className="bg-gray-800 hover:bg-gray-700 cursor-pointer p-4 rounded-lg border border-emerald-600"
          >
            {conv.image_url ? (
              <img
                src={conv.image_url}
                alt={conv.title}
                className="w-full h-40 object-cover rounded-lg mb-4"
              />
            ) : (
              <div className="w-full h-40 bg-emerald-800 rounded-lg flex items-center justify-center text-3xl font-bold">
                {conv.title ? conv.title.charAt(0) : "?"}
              </div>
            )}
            <h2 className="text-xl font-semibold">{conv.title || "Untitled"}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}
