import { pool } from '../config/db.js';

export async function createNPC(req, res) {
  try {
    // ID del usuario autenticado
    const userId = req.user.id;

    // Extraemos los datos del body
    const { name, race, class: npcClass, backstory, personality_traits, stats, ai_model_config } = req.body;

    if (!name || !race || !npcClass) {
      return res.status(400).json({ error: 'Faltan campos obligatorios (name, race, class)' });
    }

    // Insertamos en la base de datos
    const [result] = await pool.execute(
      `INSERT INTO npcs (user_id, name, race, class, backstory, personality_traits, stats, ai_model_config, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        userId,
        name,
        race,
        npcClass,
        backstory,
        personality_traits,
        JSON.stringify(stats),
        JSON.stringify(ai_model_config),
      ]
    );

    // Devolvemos el resultado
    res.status(201).json({
      message: 'NPC creado correctamente',
      npc: {
        id: result.insertId,
        user_id: userId,
        name,
        race,
        class: npcClass,
        backstory,
        personality_traits,
        stats,
        ai_model_config,
        created_at: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('Error en createNPC:', err);
    res.status(500).json({ error: 'Error interno al crear NPC' });
  }
}

export async function getNpcs (req,res){
  const [rows] = await pool.query('SELECT id, name, race, user_id FROM npcs');
  res.json(rows);
};

export async function getNpcById(req, res) {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute('SELECT * FROM npcs WHERE id=?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'NPC no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el NPC' });
  }
}
