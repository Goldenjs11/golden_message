import pool from '../config/db.js';
import { serializeUserPublic } from '../utils/serializeUserPublic.js';


export const getUserById = async (req, res) => {
    try {
        const { id} = req.params;

        const result = await pool.query(
            `SELECT name, last_name, email, username, username_public, telefono,
                    facebook_link, instagram_link, username_public_share,
                    banner_bg1, banner_bg2, banner_text1, banner_text2, id
             FROM goldenmessages.users WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(200).json({ user: null });
        }

        const safeRows = result.rows.map(serializeUserPublic);

        res.json({ user: safeRows });
    } catch (error) {
        console.error('Error al obtener el usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};



// ✅ Campos que un usuario (o admin) puede editar en su perfil.
// NUNCA deben incluirse campos sensibles: id_role, password_hash, verificado,
// token_verificacion, id, email único que dé escalada, etc.
const CAMPOS_EDITABLES = [
  "username_public",
  "name",
  "last_name",
  "email",
  "telefono",
  "facebook_link",
  "instagram_link",
  "username_public_share",
  "banner_bg1",
  "banner_bg2",
  "banner_text1",
  "banner_text2"
];

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

    // 🛡️ Whitelist: solo se aplican los campos permitidos. Cualquier intento
    // de modificar campos sensibles (id_role, password_hash, verificado, token…)
    // se ignora por completo.
    const cambiosPermitidos = {};
    for (const key of Object.keys(campos)) {
      if (CAMPOS_EDITABLES.includes(key)) {
        cambiosPermitidos[key] = campos[key];
      }
    }

    if (Object.keys(cambiosPermitidos).length === 0) {
      return res.status(400).json({ error: "No hay campos válidos para actualizar" });
    }

    // 🔧 Generamos la consulta con SQL parametrizado y SOLO las claves permitidas
    const keys = Object.keys(cambiosPermitidos);
    const values = Object.values(cambiosPermitidos);

    // Ej: ["name = $1", "email = $2", ...]
    const setQuery = keys.map((key, idx) => `${key} = $${idx + 1}`).join(", ");

    const query = `UPDATE goldenmessages.users SET ${setQuery} WHERE id = $${keys.length + 1} RETURNING *`;

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