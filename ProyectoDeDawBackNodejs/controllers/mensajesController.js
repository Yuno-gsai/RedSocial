import pool from "../db/pool.js";

/**
 * Crea un nuevo mensaje en la base de datos y actualiza el contador de mensajes no leídos
 * @param {Object} req - Objeto de solicitud de Express
 * @param {Object} res - Objeto de respuesta de Express
 * @returns {Object} JSON con el ID del mensaje creado o un mensaje de error
 */
export const crearMensajeHandler = async (req, res) => {
    const { remitente_id, destinatario_id, mensaje } = req.body.data;
    if (!remitente_id || !destinatario_id || !mensaje) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    try {
      const [result] = await pool.query(
        "INSERT INTO mensajes (remitente_id, destinatario_id, mensaje) VALUES (?, ?, ?)",
        [remitente_id, destinatario_id, mensaje]
      );
      const nuevoId = result.insertId;

      await pool.query(
        `INSERT INTO estados_chat (usuario_id, amigo_id, mensajes_no_leidos, fecha_ultimo_mensaje)
        VALUES (?, ?, 1, NOW())
        ON DUPLICATE KEY UPDATE mensajes_no_leidos = mensajes_no_leidos + 1, fecha_ultimo_mensaje = NOW()`,
        [destinatario_id, remitente_id]
      );

      const nuevoMensaje = {
        id: nuevoId,
        remitente_id: Number(remitente_id),
        destinatario_id: Number(destinatario_id),
        mensaje,
        enviado_en: new Date().toISOString(),
      };

      const io = req.app.get("io");
      if (io) {
        io.emit("nuevoMensaje", nuevoMensaje);
      }

      return res.status(201).json({ id: nuevoId, message: "Mensaje creado" });
    } catch (error) {
    console.error("Error al crear mensaje:", error);
    return res.status(500).json({ error: "Error al crear mensaje" });
  }
};

/**
 * Obtiene el historial de mensajes entre dos usuarios
 * @param {Object} req - Objeto de solicitud con remitente_id y destinatario_id
 * @param {Object} res - Objeto de respuesta de Express
 * @returns {Array} Lista de mensajes ordenados por fecha de envío
 */
export const obtenerMensajesHandler = async (req, res) => {
    const { remitente_id, destinatario_id } = req.body.data;
    if (!remitente_id || !destinatario_id) {
        return res.status(400).json({ error: "Faltan remitente_id o destinatario_id" });
    }
    try {
      const [rows] = await pool.query(
      `SELECT * FROM mensajes WHERE
       (remitente_id = ? AND destinatario_id = ?) OR
       (remitente_id = ? AND destinatario_id = ?)
       ORDER BY enviado_en ASC`,
      [remitente_id, destinatario_id, destinatario_id, remitente_id]
    );
    return res.json(rows);
  } catch (error) {
    console.error("Error al obtener mensajes:", error);
    return res.status(500).json({ error: "Error al obtener mensajes" });
  }
};

/**
 * Obtiene el último mensaje intercambiado entre dos usuarios
 * @param {Object} req - Objeto de solicitud con user1_id y user2_id
 * @param {Object} res - Objeto de respuesta de Express
 * @returns {Object} Último mensaje o null si no hay mensajes
 */
export const obtenerUltimoMensajeHandler = async (req, res) => {
    const { user1_id, user2_id } = req.body.data;
    if (!user1_id || !user2_id) {
        return res.status(400).json({ error: "Faltan user1_id o user2_id" });
    }
    try {
    const [rows] = await pool.query(
      `SELECT * FROM mensajes WHERE
      (remitente_id = ? AND destinatario_id = ?) OR
      (remitente_id = ? AND destinatario_id = ?)
      ORDER BY enviado_en DESC LIMIT 1`,
      [user1_id, user2_id, user2_id, user1_id]
    );
    return res.json(rows[0] || null);
  } catch (error) {
    console.error("Error al obtener último mensaje:", error);
    return res.status(500).json({ error: "Error al obtener el último mensaje" });
  }
};

/**
 * Marca todos los mensajes de un chat como leídos
 * @param {Object} req - Objeto de solicitud con usuario_id y amigo_id
 * @param {Object} res - Objeto de respuesta de Express
 * @returns {Object} Mensaje de confirmación o error
 */
export const marcarChatComoLeido = async (req, res) => {
      const { usuario_id, amigo_id } = req.body.data;
      if (!usuario_id || !amigo_id) {
          return res.status(400).json({ error: "Faltan usuario_id o amigo_id" });
      }
      try {
      await pool.query(
        `INSERT INTO estados_chat (usuario_id, amigo_id, mensajes_no_leidos, fecha_ultimo_leido)
        VALUES (?, ?, 0, NOW())
        ON DUPLICATE KEY UPDATE mensajes_no_leidos = 0, fecha_ultimo_leido = NOW()`,
        [usuario_id, amigo_id]
      );
      return res.json({ message: "Chat marcado como leído" });
    } catch (error) {
      console.error("Error al marcar chat como leído:", error);
      return res.status(500).json({ error: "Error al marcar chat como leído" });
    }
};

/**
 * Obtiene la lista de amigos de un usuario con información de mensajes no leídos
 * @param {Object} req - Objeto de solicitud con usuario_id
 * @param {Object} res - Objeto de respuesta de Express
 * @returns {Array} Lista de amigos con información de mensajes y estados
 */
export const obtenerAmigosConEstado = async (req, res) => {
    const { usuario_id } = req.body.data;
    if (!usuario_id) {
        return res.status(400).json({ error: "Falta usuario_id" });
    }
    try {
    const [rows] = await pool.query(
      `SELECT 
        a.id AS amistad_id,
        a.usuario1_id,
        u1.nombre_usuario AS usuario1_nombre,
        u1.foto_perfil AS usuario1_foto,
        a.usuario2_id,
        u2.nombre_usuario AS usuario2_nombre,
        u2.foto_perfil AS usuario2_foto,
        a.creado_en AS amistad_creado_en,
        COALESCE(ec.mensajes_no_leidos, 0) AS mensajes_no_leidos,
        ec.fecha_ultimo_mensaje,
        lm.mensaje AS ultimo_mensaje_texto
      FROM amigos a
      JOIN usuarios u1 ON a.usuario1_id = u1.id
      JOIN usuarios u2 ON a.usuario2_id = u2.id
      LEFT JOIN estados_chat ec ON ec.usuario_id = ? AND
        ((ec.amigo_id = a.usuario1_id AND a.usuario1_id <> ?) OR (ec.amigo_id = a.usuario2_id AND a.usuario2_id <> ?))
      LEFT JOIN (
        SELECT 
          LEAST(remitente_id, destinatario_id) AS user_min,
          GREATEST(remitente_id, destinatario_id) AS user_max,
          mensaje
        FROM mensajes m1
        WHERE enviado_en = (
          SELECT MAX(enviado_en)
          FROM mensajes m2
          WHERE
            LEAST(m2.remitente_id, m2.destinatario_id) = LEAST(m1.remitente_id, m1.destinatario_id) AND
            GREATEST(m2.remitente_id, m2.destinatario_id) = GREATEST(m1.remitente_id, m1.destinatario_id)
        )
      ) lm ON lm.user_min = LEAST(a.usuario1_id, a.usuario2_id) AND lm.user_max = GREATEST(a.usuario1_id, a.usuario2_id)
      WHERE a.usuario1_id = ? OR a.usuario2_id = ?
      ORDER BY ec.fecha_ultimo_mensaje DESC, a.creado_en DESC`,
      [usuario_id, usuario_id, usuario_id, usuario_id, usuario_id]
    );
    return res.json(rows);
  } catch (error) {
    console.error("Error al obtener amigos con estado:", error);
    return res.status(500).json({ error: "Error al obtener amigos con estado" });
  }
};
