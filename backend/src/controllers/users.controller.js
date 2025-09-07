import pool from '../config/db.js';


export const getUserById = async (req, res) => {
    try {
        const { id} = req.params;

        const result = await pool.query(
            'SELECT name, last_name, email, username, username_public, telefono,facebook_link , instagram_link , username_public_share, id FROM users WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(200).json({ user: null });  // <-- Devolvemos vacío, no error
        }


        res.json({ user: result.rows });
    } catch (error) {
        console.error('Error al obtener el usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};



export const updateUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const campos = req.body; // 👉 aquí recibimos solo los cambios

    if (!id) {
      return res.status(400).json({ error: "Falta el id de usuario" });
    }

    if (!campos || Object.keys(campos).length === 0) {
      return res.status(400).json({ error: "No hay cambios para actualizar" });
    }

    // 🔧 Generamos dinámicamente la consulta SQL
    const keys = Object.keys(campos);
    const values = Object.values(campos);

    // Ej: ["name = $1", "email = $2", ...]
    const setQuery = keys.map((key, idx) => `${key} = $${idx + 1}`).join(", ");

    const query = `UPDATE users SET ${setQuery} WHERE id = $${keys.length + 1} RETURNING *`;

    const result = await pool.query(query, [...values, id]);

    res.json({
      message: "Usuario actualizado correctamente",
      user: result.rows[0]
    });
  } catch (error) {
    console.error("❌ Error al actualizar el usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};