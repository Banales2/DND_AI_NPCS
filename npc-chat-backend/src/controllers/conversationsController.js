import { pool } from '../config/db.js';
import { generateGeminiResponse } from '../services/geminiService.js';
import { findNpcById } from './npcsController.js';
import { insertMessage } from './messagesController.js';

export async function createConversation(req, res) {
  try {
    const userId = req.user.id;
    const { title, image_url } = req.body; // ← usamos image_url

    if (!title) {
      return res.status(400).json({ error: 'Falta título' });
    }

    // Si no se envía image_url, será NULL
    const [result] = await pool.execute(
      `INSERT INTO conversations (title, user_id, image_url, created_at)
       VALUES (?, ?, ?, NOW())`,
      [title, userId, image_url || null]
    );

    res.status(201).json({
      message: 'Conversación creada',
      conversation: {
        id: result.insertId,
        title,
        user_id: userId,
        image_url: image_url || null,
        created_at: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('Error en createConversation:', err);
    res.status(500).json({ error: 'Error interno al crear la conversación' });
  }
}

export async function getConversations(req, res) {
  console.log("getConversations called");
  const [rows] = await pool.query('SELECT id, title, image_url FROM conversations');
  res.json(rows);
}

export async function getConversationById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [conversationRows] = await pool.query(
      `SELECT c.id, c.title, c.image_url, c.user_id, c.created_at
       FROM conversations c
       WHERE c.id = ? AND c.user_id = ?`,
      [id, userId]
    );

    if (conversationRows.length === 0) {
      return res.status(404).json({ error: "Conversación no encontrada" });
    }

    const conversation = conversationRows[0];

    const [participants] = await pool.query(
      `SELECT n.id, n.name, n.class, n.race, n.image_url
       FROM conversation_participants cp
       JOIN npcs n ON cp.participant_id = n.id
       WHERE cp.conversation_id = ?`,
      [id]
    );

    res.status(200).json({
      ...conversation,
      participants,
    });
  } catch (err) {
    console.error("Error en getConversationById:", err);
    res.status(500).json({ error: "Error interno al obtener la conversación" });
  }
}

export async function getUserConversations(req, res) {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `SELECT id, title, image_url, created_at
       FROM conversations
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error('Error en getUserConversations:', err);
    res.status(500).json({ error: 'Error al obtener las conversaciones del usuario' });
  }
}

export async function getMessagesByConversation(req, res) {
  try {
    const { id: conversationId } = req.params;
    const userId = req.user.id;

    const [conversation] = await pool.query(
      'SELECT * FROM conversations WHERE id = ? AND user_id = ?',
      [conversationId, userId]
    );

    if (conversation.length === 0) {
      return res.status(403).json({ error: 'No tienes acceso a esta conversación' });
    }

    const [messages] = await pool.query(`
      SELECT 
        m.id, 
        m.sender_type,
        m.sender_id,
        m.content,
        m.created_at,
        m.recipients,
        CASE 
          WHEN m.sender_type = 'npc' THEN n.name
          WHEN m.sender_type = 'user' THEN u.display_name
        END AS sender_name,
        CASE 
          WHEN m.sender_type = 'npc' THEN n.image_url
          WHEN m.sender_type = 'user' THEN u.profile_image_url
        END AS sender_image
      FROM messages m
      LEFT JOIN npcs n ON m.sender_type = 'npc' AND m.sender_id = n.id
      LEFT JOIN users u ON m.sender_type = 'user' AND m.sender_id = u.id
      WHERE m.conversation_id = ?
      ORDER BY m.created_at ASC
    `, [conversationId]);

    res.json(messages);
  } catch (err) {
    console.error('Error en getMessagesByConversation:', err);
    res.status(500).json({ error: 'Error al obtener los mensajes' });
  }
}


export async function sendMessage(req, res) {
  try {
    const { id: conversationId } = req.params;
    const { sender_type, sender_id, content, recipients, message_type } = req.body;

    if (!content || !sender_type) {
      return res.status(400).json({ error: 'Faltan datos del mensaje' });
    }

    // Normalizamos destinatarios
    const normalizedRecipients = Array.isArray(recipients)
      ? recipients
      : recipients
      ? [recipients]
      : [];

    let finalSenderId = sender_id;

    // 🧠 Si es humano (jugador)
    if (sender_type === 'user') {
      if (!req.user) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }
      finalSenderId = req.user.id;

      if (normalizedRecipients.length === 0) {
        return res.status(400).json({ error: 'Faltan destinatarios' });
      }

      if (normalizedRecipients.includes('all')) {
        console.log('📢 Mensaje global del usuario');
      }
    }

    // 🤖 Si es IA (NPC)
    if (sender_type === 'npc') {
      if (!sender_id) {
        return res.status(400).json({ error: 'Falta el ID del NPC para mensajes de IA' });
      }

      const [npcRows] = await pool.query('SELECT id FROM npcs WHERE id = ?', [sender_id]);
      if (npcRows.length === 0) {
        return res.status(404).json({ error: 'NPC no encontrado' });
      }

      if (normalizedRecipients.includes('all')) {
        return res.status(400).json({ error: 'Los NPC no pueden enviar mensajes globales' });
      }
    }

    const finalType =
      message_type || (normalizedRecipients.includes('all') ? 'player_to_all' : 'player_to_npc');

    console.log('🟢 Insertando mensaje:', {
      conversationId,
      sender_type,
      finalSenderId,
      content,
      normalizedRecipients,
      finalType,
    });

    // 🔹 Insertar mensaje principal
    await pool.execute(
      `INSERT INTO messages (conversation_id, sender_type, sender_id, content, recipients, message_type, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        conversationId,
        sender_type,
        finalSenderId,
        content,
        normalizedRecipients.length ? JSON.stringify(normalizedRecipients) : null,
        finalType,
      ]
    );

    // 🔹 Caso 1: Jugador → Todos
    if (finalType === 'player_to_all') {
      return res.status(201).json({ message: 'Mensaje de contexto guardado.' });
    }

    // 🔹 Caso 2: Jugador → NPC(s)
    if (finalType === 'player_to_npc' && normalizedRecipients.length) {
      for (const npcId of normalizedRecipients) {
        const npcData = await findNpcById(npcId);
        const conversationHistory = await getConversationContextForNPC(conversationId, npcId);

        const prompt = `
Eres ${npcData.name}, un personaje con esta historia:
${npcData.background}

Contexto reciente de la conversación:
${conversationHistory
  .map((m) => `${m.sender_type === 'user' ? 'Jugador' : npcData.name}: ${m.content}`)
  .join('\n')}

El jugador te dice: "${content}"

Responde de forma coherente con tu personalidad y contexto.
        `;

        const aiResponse = await generateGeminiResponse(prompt);

        await insertMessage(conversationId, 'npc', npcId, aiResponse, [req.user.id]);
      }
    }

    res.status(201).json({ message: 'Mensaje enviado correctamente.' });
  } catch (err) {
    console.error('❌ Error en sendMessage:', err);
    res.status(500).json({ error: 'Error interno al enviar el mensaje' });
  }
}

export async function getConversationContextForNPC(conversationId, npcId) {
  try {
    const [rows] = await pool.query(`
      SELECT content
      FROM messages
      WHERE conversation_id = ?
        AND (
          JSON_CONTAINS(recipients, JSON_QUOTE(CAST(? AS CHAR))) -- convertir a string antes de pasar a JSON_QUOTE
          OR JSON_CONTAINS(recipients, '["all"]')
          OR (sender_type = 'npc' AND sender_id = ?)
        )
      ORDER BY created_at DESC
      LIMIT 10
    `, [conversationId, npcId, npcId]);
    // Devuelve solo los textos en orden cronológico
    return rows.map((r) => r.content).reverse();
  } catch (err) {
    console.error('Error obteniendo contexto para NPC:', err);
    return [];
  }
}


export async function addParticipantToConversation(req, res) {
  try {
    const conversationId = req.params.id;
    const { npcId } = req.body;
    const userId = req.user.id; // viene del token

    if (!npcId) {
      return res.status(400).json({ error: "npcId es requerido" });
    }

    // Verificamos que la conversación pertenezca al usuario
    const [conv] = await pool.query(
      "SELECT * FROM conversations WHERE id = ? AND user_id = ?",
      [conversationId, userId]
    );
    if (conv.length === 0)
      return res.status(403).json({ error: "No tienes acceso a esta conversación" });

    // Verificamos que el NPC pertenezca al usuario
    const [npc] = await pool.query(
      "SELECT * FROM npcs WHERE id = ? AND user_id = ?",
      [npcId, userId]
    );
    if (npc.length === 0)
      return res.status(404).json({ error: "El NPC no existe o no pertenece al usuario" });

    // Revisar si ya existe en la conversación
    const [exists] = await pool.query(
      "SELECT * FROM conversation_participants WHERE conversation_id = ? AND participant_id = ?",
      [conversationId, npcId]
    );
    if (exists.length > 0)
      return res.status(400).json({ error: "El NPC ya está en la conversación" });

    // Insertar el participante
    await pool.query(
      "INSERT INTO conversation_participants (conversation_id, participant_id) VALUES (?, ?)",
      [conversationId, npcId]
    );

    res.status(201).json({ message: "NPC agregado a la conversación" });
  } catch (err) {
    console.error("Error en addParticipant:", err);
    res.status(500).json({ error: "Error al agregar participante" });
  }
}

export async function updateConversation(req, res) {
  try {
    const conversationId = req.params.id;
    const userId = req.user.id;
    const { title, image_url } = req.body;

    // Verificar que la conversación exista y pertenezca al usuario
    const [conv] = await pool.query(
      "SELECT * FROM conversations WHERE id = ? AND user_id = ?",
      [conversationId, userId]
    );

    if (conv.length === 0) {
      return res.status(404).json({ error: "Conversación no encontrada o sin acceso" });
    }

    // Actualizar con valores opcionales
    await pool.query(
      "UPDATE conversations SET title = ?, image_url = ? WHERE id = ?",
      [title || conv[0].title, image_url || conv[0].image_url, conversationId]
    );

    res.json({ message: "Conversación actualizada correctamente" });
  } catch (err) {
    console.error("Error en updateConversation:", err);
    res.status(500).json({ error: "Error al actualizar la conversación" });
  }
}

export async function removeParticipantFomConversation(req, res) {
  try {
    const { id: conversationId, npcId } = req.params;
    const userId = req.user.id;

    // Verificar que la conversación pertenezca al usuario
    const [conv] = await pool.query(
      "SELECT * FROM conversations WHERE id = ? AND user_id = ?",
      [conversationId, userId]
    );
    if (conv.length === 0)
      return res.status(403).json({ error: "No tienes acceso a esta conversación" });

    // Eliminar el participante
    const [result] = await pool.query(
      "DELETE FROM conversation_participants WHERE conversation_id = ? AND participant_id = ?",
      [conversationId, npcId]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "El NPC no estaba en la conversación" });

    res.json({ message: "NPC eliminado de la conversación" });
  } catch (err) {
    console.error("Error en removeParticipant:", err);
    res.status(500).json({ error: "Error al eliminar participante" });
  }
}

export async function deleteConversation(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [result] = await pool.execute(
      'DELETE FROM conversations WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Conversación no encontrada o no pertenece al usuario' });
    }

    res.json({ message: 'Conversación eliminada correctamente' });
  } catch (err) {
    console.error('Error en deleteConversation:', err);
    res.status(500).json({ error: 'Error al eliminar conversación' });
  }
}
