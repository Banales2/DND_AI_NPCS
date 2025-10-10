import { pool } from '../config/db.js';

export async function createMessages(req, res) {
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

export async function createMessage(req, res) {
  const { conversation_id, sender_type, sender_id, content } = req.body;

  if (!conversation_id || !sender_type || !sender_id || !content) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO messages (conversation_id, sender_type, sender_id, content) VALUES (?, ?, ?, ?)',
      [conversation_id, sender_type, sender_id, content]
    );

    res.status(201).json({
      id: result.insertId,
      conversation_id,
      sender_type,
      sender_id,
      content,
    });
  } catch (err) {
    console.error('Error al crear mensaje:', err);
    res.status(500).json({ error: 'Error al crear el mensaje' });
  }
}

export async function getMessagesByConversation(req, res) {
  const { conversationId } = req.params;

  try {
    const [rows] = await pool.execute(
      'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
      [conversationId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No hay mensajes en esta conversación' });
    }

    res.json(rows);
  } catch (err) {
    console.error('Error al obtener mensajes:', err);
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
}

// Obtener los mensajes de un remitente (usuario o NPC) en una conversación
export const getMessagesBySenderInConversation = async (req, res) => {
  try {
    const { conversationId, senderId } = req.params;
    const { sender_type } = req.query; // lo pasas como query param (?sender_type=user o ?sender_type=npc)

    if (!sender_type) {
      return res.status(400).json({ message: 'Falta sender_type (user o npc).' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM messages WHERE conversation_id = ? AND sender_id = ? AND sender_type = ? ORDER BY created_at ASC',
      [conversationId, senderId, sender_type]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No se encontraron mensajes para este remitente en la conversación.' });
    }

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener mensajes del remitente:', error);
    res.status(500).json({ message: 'Error al obtener mensajes del remitente.' });
  }
};