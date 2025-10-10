import { pool } from '../config/db.js';

export async function addParticipant(req, res) {
    console.log('Body recibido:', req.body);
  const { conversation_id, participant_id } = req.body;

  try {
    // 1️⃣ Verificar que exista la conversación
    const [conv] = await pool.query(
      'SELECT id FROM conversations WHERE id = ?',
      [conversation_id]
    );
    if (conv.length === 0)
      return res.status(404).json({ error: 'Conversación no encontrada' });

    // 2️⃣ Verificar que exista el NPC
    const [npc] = await pool.query(
      'SELECT id FROM npcs WHERE id = ?',
      [participant_id]
    );
    if (npc.length === 0)
      return res.status(404).json({ error: 'NPC no encontrado' });

    // 3️⃣ Verificar si ya está agregado
    const [exists] = await pool.query(
      'SELECT * FROM conversation_participants WHERE conversation_id = ? AND participant_id = ?',
      [conversation_id, participant_id]
    );
    if (exists.length > 0)
      return res.status(400).json({ error: 'El NPC ya está en la conversación' });

    // 4️⃣ Insertar el nuevo participante
    await pool.query(
      'INSERT INTO conversation_participants (conversation_id, participant_id) VALUES (?, ?)',
      [conversation_id, participant_id]
    );

    res.status(201).json({
      message: 'Participante agregado correctamente',
      conversation_id,
      participant_id,
    });
  } catch (err) {
    console.error('Error al agregar participante:', err);
    res.status(500).json({ error: 'Error al agregar participante' });
  }
}

export async function getParticipants (req,res){
  const [rows] = await pool.query('SELECT conversation_id, participant_id FROM conversation_participants');
  res.json(rows);
};

export async function getParticipantsByConversationId(req, res) {
  const { conversationId } = req.params;

  try {
    const [rows] = await pool.query(`
      SELECT n.id, n.name, n.race, n.user_id
      FROM conversation_participants cp
      JOIN npcs n ON cp.participant_id = n.id
      WHERE cp.conversation_id = ?
    `, [conversationId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No hay participantes en esta conversación' });
    }

    res.json(rows);
  } catch (err) {
    console.error('Error al obtener participantes:', err);
    res.status(500).json({ error: 'Error al obtener los participantes' });
  }
}