import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

export async function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ valid: false, error: 'Token no proporcionado' });
  }

  try {
    // 1️⃣ Verificamos el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 2️⃣ Buscamos al usuario real en la base de datos
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [decoded.id]);

    if (rows.length === 0) {
      return res.status(401).json({ valid: false, error: 'Usuario no encontrado' });
    }

    // 3️⃣ Guardamos al usuario completo en req.user
    req.user = rows[0];

    next();
  } catch (err) {
    console.error('Error en requireAuth:', err);
    res.status(403).json({ valid: false, error: 'Token inválido o expirado' });
  }
}
