import bcrypt from 'bcrypt';
import { pool } from '../config/db.js';   // tu archivo de conexión existente


export async function registerUser(req, res){
  const { email, password, display_name, profile_image_url } = req.body; // 🔹 añadimos profile_image_url
  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (email, password_hash, display_name, profile_image_url) VALUES (?, ?, ?, ?)',
      [email, hash, display_name, profile_image_url || null] // 🔹 null si no se envía
    );
    res.status(201).json({ 
      id: result.insertId, 
      email,
      display_name,
      profile_image_url: profile_image_url || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error registering user' });
  }
};

export async function getUsers(req, res){
  console.log("getUsers called");
  const [rows] = await pool.query('SELECT * FROM users');
  res.json(rows);
}

export async function getUserById(req, res) {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute(
      'SELECT id, email, display_name, profile_image_url, created_at FROM users WHERE id=?', 
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
}

export async function getUserNPCs(req, res) {
  try {
    const userId = req.user.id;
    const [rows] = await pool.execute('SELECT * FROM npcs WHERE user_id=?', [userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los NPCs del usuario' });
  }
}

export async function getStats(req, res) {
  try {
    const userId = req.user.id;

    const [convCount] = await pool.query(
      "SELECT COUNT(*) AS total FROM conversations WHERE user_id = ?",
      [userId]
    );
    const [npcCount] = await pool.query(
      "SELECT COUNT(*) AS total FROM npcs WHERE user_id = ?",
      [userId]
    );

    res.json({
      conversations: convCount[0]?.total || 0,
      npcs: npcCount[0]?.total || 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener estadísticas." });
  }
}

export async function updateProfile(req, res) {
  const userId = req.user.id;
  const { display_name, profile_image_url } = req.body;

  try {
    if (!display_name && !profile_image_url) {
      return res.status(400).json({ error: "No hay campos para actualizar." });
    }

    const updates = [];
    const params = [];

    if (display_name) {
      updates.push("display_name = ?");
      params.push(display_name);
    }
    if (profile_image_url) {
      updates.push("profile_image_url = ?");
      params.push(profile_image_url);
    }

    params.push(userId);

    const sql = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;
    await pool.query(sql, params);

    const [rows] = await pool.query(
      "SELECT id, email, display_name, profile_image_url FROM users WHERE id = ?",
      [userId]
    );

    res.json({ message: "Perfil actualizado correctamente.", user: rows[0] });
  } catch (err) {
    console.error("Error al actualizar perfil:", err);
    res.status(500).json({ error: "Error al actualizar perfil." });
  }
}

export async function updateUserProfile(req, res) {
  const { id } = req.params;
  const { display_name, profile_image_url } = req.body;

  // opcional: seguridad — solo el propio usuario puede editar su perfil
  if (req.user.id !== Number(id)) {
    return res.status(403).json({ error: 'No autorizado para editar este perfil' });
  }

  try {
    await pool.execute(
      'UPDATE users SET display_name = ?, profile_image_url = ? WHERE id = ?',
      [display_name, profile_image_url, id]
    );

    const [rows] = await pool.execute(
      'SELECT id, email, display_name, profile_image_url FROM users WHERE id = ?',
      [id]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el perfil' });
  }
}

export async function getCurrentUser(req, res) {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      "SELECT id, email, display_name, profile_image_url, created_at FROM users WHERE id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener el perfil del usuario" });
  }
}


export async function deleteUser(req, res) {
  const { id } = req.params;

  // opcional: seguridad — solo el propio usuario o admin
  if (req.user.id !== Number(id)) {
    return res.status(403).json({ error: 'No autorizado para eliminar este usuario' });
  }

  try {
    const [result] = await pool.execute('DELETE FROM users WHERE id=?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
}

