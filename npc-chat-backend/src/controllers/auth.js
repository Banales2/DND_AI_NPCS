import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';   // tu archivo de conexión existente

export async function register(req, res) {
  const { email, password, display_name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Faltan datos' });

  try {
    console.log('Request body:', req.body);

    // 🔹 Test rápido de conexión a la DB
    const [test] = await pool.query('SELECT 1 + 1 AS result');
    console.log('DB test:', test); // Debe mostrar [{ result: 2 }]

    const hash = await bcrypt.hash(password, 10);
    console.log('Hash generado:', hash);

    await pool.execute(
      'INSERT INTO users (email, password_hash, display_name) VALUES (?,?,?)',
      [email, hash, display_name]
    );

    console.log('Usuario insertado correctamente');
    res.status(201).json({ message: 'Usuario creado' });
  } catch (err) {
    console.error('Error real en register:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email ya registrado' });
    }
    res.status(500).json({ error: 'Error interano' });
  }
}


export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Faltan datos' });

  const [rows] = await pool.execute('SELECT * FROM users WHERE email=?', [email]);
  const user = rows[0];
  if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

  // 🔹 Enviar también el display_name y el id del usuario
  res.json({
    message: "Inicio de sesión exitoso",
    token,
    user: {
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      profile_image_url: user.profile_image_url || null
    }
  });
}
