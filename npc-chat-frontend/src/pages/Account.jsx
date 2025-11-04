import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const backendURL = "http://localhost:3000";
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No estás autenticado. Inicia sesión primero.");
        return;
      }

      try {
        const res = await axios.get("http://localhost:3000/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        setDisplayName(res.data.display_name);
        setImageUrl(res.data.profile_image_url || "");
      } catch (err) {
        console.error(err);
        setError("Error al cargar el perfil del usuario.");
      }
    };

    fetchUser();
  }, []);

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.patch(
        `http://localhost:3000/users/${user.id}/profile`,
        { display_name: displayName, profile_image_url: imageUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(res.data);
      setIsEditing(false);
      window.dispatchEvent(new Event("userUpdate"));
    } catch (err) {
      console.error(err);
      alert("Error al guardar los cambios.");
    }
  };

  const handleLogout = () => {
    if (window.confirm("¿Seguro que quieres cerrar sesión?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("userUpdate"));
      navigate("/login");
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("⚠️ Esto eliminará tu cuenta permanentemente. ¿Continuar?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${backendURL}/users/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("userUpdate"));
      navigate("/login");
    } catch (err) {
      console.error("Error al eliminar cuenta:", err);
      alert("Hubo un problema al eliminar tu cuenta.");
    }
  };


  if (error)
    return (
      <div className="p-6 text-center text-red-400">
        <p>{error}</p>
      </div>
    );

  if (!user)
    return <p className="text-center text-gray-400 mt-10">Cargando perfil...</p>;

  return (
    <div className="pt-28 px-6 p-6 flex flex-col items-center">
      <div className="max-w-2xl w-full bg-gradient-to-b from-gray-800 to-gray-900 text-white shadow-lg rounded-2xl p-6 relative">
        {/* Botón Editar */}
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="absolute top-4 right-4 text-sm bg-emerald-700 hover:bg-emerald-800 px-3 py-1 rounded-md"
        >
          {isEditing ? "Cancelar" : "Editar"}
        </button>

        {/* Imagen */}
        <div className="flex flex-col items-center">
          <img
            src={imageUrl}
            alt="Foto de perfil"
            className="w-40 h-40 object-cover rounded-full border-2 border-emerald-500 shadow-md mb-4"
          />

          {isEditing && (
            <input
              type="text"
              className="w-3/4 p-2 bg-emerald-950 border border-emerald-600 rounded-md text-white text-center mb-3"
              placeholder="URL de imagen"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          )}

          {/* Nombre */}
          {isEditing ? (
            <input
              type="text"
              className="text-center text-2xl font-semibold text-emerald-400 bg-transparent border-b border-emerald-600 focus:outline-none w-3/4"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          ) : (
            <h1 className="text-3xl font-bold mb-4 text-center text-emerald-400">
              {user.display_name}
            </h1>
          )}

          <p className="text-gray-300">{user.email}</p>

          {/* Guardar */}
          {isEditing && (
            <button
              onClick={handleSave}
              className="mt-5 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 rounded-lg transition"
            >
              Guardar cambios
            </button>
          )}

          {/* Logout y Eliminar cuenta */}
          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={handleLogout}
              className="w-full py-2 bg-transparent border border-[#00ffcc]/60 text-gray-300 rounded-lg hover:bg-[#00ffcc]/10 transition-all"
            >
              Cerrar sesión
            </button>

            <button
              onClick={handleDeleteAccount}
              className="w-full py-2 bg-red-600/80 text-white font-semibold rounded-lg hover:bg-red-700 transition-all"
            >
              Eliminar cuenta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
