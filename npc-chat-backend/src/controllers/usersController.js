import bcrypt from 'bcrypt';
import { pool } from '../config/db.js';   // tu archivo de conexión existente


export async function registerUser(req, res){
  const { email, password, display_name } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)',
      [email, hash, display_name]
    );
    res.status(201).json({ id: result.insertId, email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error registering user' });
  }
};

export async function getUsers (req, res){ //solo id, email y display_name
  console.log("getUsers called");
  const [rows] = await pool.query('SELECT id, email, display_name FROM users');
  res.json(rows);
};

export async function getUserById(req, res) {
  const { id } = req.params;

  try {
    const [rows] = await pool.execute('SELECT id, email, display_name, created_at FROM users WHERE id=?', [id]);
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