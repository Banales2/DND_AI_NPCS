import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import InputField from "../components/InputField";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState({});
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const backendURL = "http://localhost:3000";

  const validate = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

    if (!emailRegex.test(email))
      errors.email = "Correo inválido (ej: nombre@dominio.com)";

    // 🔹 Solo validar contraseña compleja en modo registro
    if (!isLogin && !passwordRegex.test(password))
      errors.password =
        "La contraseña debe tener al menos 8 caracteres, una letra, un número y un símbolo.";

    if (!isLogin && displayName.trim().length < 3)
      errors.displayName = "El nombre debe tener al menos 3 caracteres";

    setError(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (isLogin) {
        const res = await axios.post(`${backendURL}/auth/login`, {
          email,
          password,
        });

        const displayName = res.data?.user?.display_name || "aventurero";
        setMessage(`Bienvenido, ${displayName}!`);
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        // 🔹 Redirige después de 1 segundo
        setTimeout(() => navigate("/conversations"), 1000);
      } else {
        const res = await axios.post(`${backendURL}/users/register`, {
          email,
          password,
          display_name: displayName,
        });
        setMessage(`Usuario ${res.data.email} registrado correctamente.`);
      }
    } catch (err) {
      console.error(err);
      if (isLogin) {
        setError({ password: "Contraseña incorrecta o usuario no encontrado" });
      } else {
        setMessage("Error al procesar la solicitud.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#002b1a] to-black text-white px-4">
      <div className="bg-[#001a10]/80 backdrop-blur-md p-10 rounded-2xl shadow-[0_0_25px_#00ffcc] w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-[#00ffcc] mb-6">
          {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
        </h2>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <InputField
              label="Nombre de usuario"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              error={error.displayName}
            />
          )}

          <InputField
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error.email}
          />

          <InputField
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error.password}
          />

          <button
            type="submit"
            className="w-full mt-4 py-2 bg-[#00ffcc] text-black font-bold rounded-lg hover:bg-[#00bfa6] transition-all"
          >
            {isLogin ? "Entrar" : "Registrarse"}
          </button>
        </form>

        {message && (
          <p className="text-center mt-4 text-sm text-[#b0ffcc]">{message}</p>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes una cuenta?"}
          </p>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage("");
              setError({});
            }}
            className="mt-2 text-[#00ffcc] font-semibold hover:text-white transition-all"
          >
            {isLogin ? "Crear cuenta" : "Iniciar sesión"}
          </button>
        </div>
      </div>
    </div>
  );
}
