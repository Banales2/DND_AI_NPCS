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
  const [rows] = await pool.query('SELECT id, email, display_name FROM users');
  res.json(rows);
};
