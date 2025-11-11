import { pool } from '../config/db.js';

export async function createNPC(req, res) {
  try {
    // ID del usuario autenticado
    const userId = req.user.id;

    // Extraemos los datos del body
    const { name, race, class: npcClass, backstory, personality_traits, stats, ai_model_config, alignment, image_url  } = req.body;

    if (!name || !race || !npcClass) {
      return res.status(400).json({ error: 'Faltan campos obligatorios (name, race, class)' });
    }

    // Insertamos en la base de datos
    const [result] = await pool.execute(
      `INSERT INTO npcs (
        user_id, name, race, class, backstory, personality_traits,
        stats, ai_model_config, alignment, image_url, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        userId,
        name,
        race,
        npcClass,
        backstory,
        personality_traits,
        JSON.stringify(stats),
        JSON.stringify(ai_model_config),
        alignment,
        image_url
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
        alignment,
        image_url,
      },
    });
  } catch (err) {
    console.error('Error en createNPC:', err);
    res.status(500).json({ error: 'Error interno al crear NPC' });
  }
}

export async function getNpcs (req,res){
  const [rows] = await pool.query('SELECT id, name, race, class, user_id FROM npcs');
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

export async function findNpcById(npcId) {
  const [rows] = await pool.query('SELECT * FROM npcs WHERE id = ?', [npcId]);
  return rows[0] || null;
}

export async function updateNPC(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id; // viene del token JWT
    if (!userId) return res.status(401).json({ error: "No autorizado" });

    // Campos permitidos
    const {
      name,
      race,
      class: npcClass,
      backstory,
      personality_traits,
      stats,
      ai_model_config,
      alignment,
      image_url,
    } = req.body;

    // Verificar que el NPC pertenece al usuario
    const [npcRows] = await pool.execute(
      "SELECT * FROM npcs WHERE id = ? AND user_id = ?",
      [id, userId]
    );
    if (npcRows.length === 0) {
      return res.status(404).json({ error: "NPC no encontrado o no pertenece al usuario." });
    }

    // Construir consulta dinámica para solo actualizar campos presentes
    const updates = [];
    const params = [];

    if (name !== undefined) { updates.push("name = ?"); params.push(name); }
    if (race !== undefined) { updates.push("race = ?"); params.push(race); }
    if (npcClass !== undefined) { updates.push("class = ?"); params.push(npcClass); }
    if (backstory !== undefined) { updates.push("backstory = ?"); params.push(backstory); }
    if (personality_traits !== undefined) { updates.push("personality_traits = ?"); params.push(personality_traits); }
    if (stats !== undefined) { updates.push("stats = ?"); params.push(JSON.stringify(stats)); }
    if (ai_model_config !== undefined) { updates.push("ai_model_config = ?"); params.push(JSON.stringify(ai_model_config)); }
    if (alignment !== undefined) { updates.push("alignment = ?"); params.push(alignment); }
    if (image_url !== undefined) { updates.push("image_url = ?"); params.push(image_url); }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No hay campos para actualizar." });
    }

    params.push(id, userId); // WHERE params

    const sql = `UPDATE npcs SET ${updates.join(", ")} WHERE id = ? AND user_id = ?`;
    await pool.execute(sql, params);

    // Devolver el NPC actualizado
    const [updatedRows] = await pool.execute('SELECT * FROM npcs WHERE id = ?', [id]);
    res.json({ message: "NPC actualizado correctamente", npc: updatedRows[0] });
  } catch (error) {
    console.error("Error en updateNPC:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

export async function deleteNPC(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [rows] = await pool.execute("SELECT * FROM npcs WHERE id = ? AND user_id = ?", [id, userId]);
    if (rows.length === 0) return res.status(404).json({ error: "NPC no encontrado o no pertenece al usuario." });

    await pool.execute("DELETE FROM npcs WHERE id = ? AND user_id = ?", [id, userId]);
    res.json({ message: "NPC eliminado correctamente" });
  } catch (err) {
    console.error("Error al eliminar NPC:", err);
    res.status(500).json({ error: "Error interno al eliminar NPC" });
  }
}

export async function getUserNPCs(req, res) {
  try {
    const userId = req.user.id; // viene del middleware requireAuth
    const [rows] = await pool.execute('SELECT * FROM npcs WHERE user_id = ?', [userId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los NPCs' });
  }
}
