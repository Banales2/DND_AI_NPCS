import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";

// 🔹 Registro de usuario
export async function register(req, res) {
  const { email, password, display_name } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Faltan datos" });

  try {
    const hash = await bcrypt.hash(password, 10);

    await pool.execute(
      "INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)",
      [email, hash, display_name]
    );

    res.status(201).json({ message: "Usuario creado correctamente" });
  } catch (err) {
    console.error("Error en register:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Email ya registrado" });
    }
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

// 🔹 Inicio de sesión
export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Faltan datos" });

  const [rows] = await pool.execute("SELECT * FROM users WHERE email=?", [email]);
  const user = rows[0];
  if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: "Credenciales inválidas" });

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({
    message: "Inicio de sesión exitoso",
    token,
    user: {
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      profile_image_url: user.profile_image_url || null,
    },
  });
}

// 🔹 Verificación de token
export async function verifyToken(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ valid: false, error: "Token requerido" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await pool.execute(
      "SELECT id, email, display_name, profile_image_url FROM users WHERE id = ?",
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ valid: false, error: "Usuario no encontrado" });
    }

    return res.status(200).json({ valid: true, user: rows[0] });

  } catch (err) {
    console.error("Error al verificar token:", err);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ valid: false, error: "Token expirado" });
    }

    return res.status(401).json({ valid: false, error: "Token inválido" });
  }
}
