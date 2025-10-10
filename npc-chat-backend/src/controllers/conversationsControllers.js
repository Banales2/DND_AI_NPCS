import { pool } from '../config/db.js';

export async function createConversation(req, res) {
  try {
    // ID del usuario autenticado
    const userId = req.user.id;
 
    // Extraemos los datos del body
    const { title} = req.body;
 
    if (!title) {
      return res.status(400).json({ error: 'Falta titulo' });
    }

    // Insertamos en la base de datos
    const [result] = await pool.execute(
      `INSERT INTO conversations (title, user_id, created_at)
       VALUES (?,?,NOW())`,
      [
        title,
        userId
      ]
    );

    // Devolvemos el resultado
    res.status(201).json({
      message: 'Conversacion',
      npc: {
        id: result.insertId,
        title,
        user_id: userId,
        created_at: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('Error en createConversation:', err);
    res.status(500).json({ error: 'Error interno al crear Conversation' });
  }
}

export async function getConversations (req, res){
  console.log("getConversations called");
  const [rows] = await pool.query('SELECT id, title FROM conversations');
  res.json(rows);
};
