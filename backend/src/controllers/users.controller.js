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