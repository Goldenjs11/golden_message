import pool from '../config/db.js';

// 🔍 Buscar usuarios para agregar como amigos (excluye a uno mismo)
export const searchUsers = async (req, res) => {
    try {
        const { q, userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: "Falta el id de usuario" });
        }
        if (!q || q.trim().length < 2) {
            return res.json({ users: [] });
        }

        const { rows } = await pool.query(
            `SELECT id, username, username_public
             FROM goldenmessages.users
             WHERE id <> $1
               AND (username ILIKE $2 OR username_public ILIKE $2)
             LIMIT 10`,
            [userId, `%${q.trim()}%`]
        );

        res.json({ users: rows });
    } catch (error) {
        console.error("Error al buscar usuarios:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// ➕ Enviar solicitud de amistad
export const sendFriendRequest = async (req, res) => {
    try {
        const { requesterId, addresseeId } = req.body;

        if (!requesterId || !addresseeId) {
            return res.status(400).json({ error: "Faltan datos de la solicitud" });
        }
        if (requesterId === addresseeId) {
            return res.status(400).json({ error: "No puedes agregarte a ti mismo" });
        }

        // Si la otra persona ya te había enviado una solicitud, la aceptamos directamente
        const { rows: inversa } = await pool.query(
            `SELECT id FROM goldenmessages.contacts
             WHERE requester_id = $1 AND addressee_id = $2 AND status = 'pending'`,
            [addresseeId, requesterId]
        );

        if (inversa.length > 0) {
            await pool.query(
                `UPDATE goldenmessages.contacts SET status = 'accepted', updated_at = NOW() WHERE id = $1`,
                [inversa[0].id]
            );
            return res.json({ status: "ok", message: "Ahora son amigos" });
        }

        await pool.query(
            `INSERT INTO goldenmessages.contacts (requester_id, addressee_id, status)
             VALUES ($1, $2, 'pending')`,
            [requesterId, addresseeId]
        );

        res.json({ status: "ok", message: "Solicitud enviada" });
    } catch (error) {
        if (error.code === '23505') { // unique_violation
            return res.status(409).json({ error: "Ya existe una solicitud o amistad con este usuario" });
        }
        console.error("Error al enviar solicitud de amistad:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// ✅ Aceptar / ❌ rechazar solicitud
export const respondFriendRequest = async (req, res) => {
    try {
        const { id } = req.params; // id de la fila en contacts
        const { userId, accept } = req.body;

        const { rows } = await pool.query(
            `SELECT * FROM goldenmessages.contacts WHERE id = $1`,
            [id]
        );
        const solicitud = rows[0];

        if (!solicitud || solicitud.addressee_id !== Number(userId)) {
            return res.status(404).json({ error: "Solicitud no encontrada" });
        }

        if (accept) {
            await pool.query(
                `UPDATE goldenmessages.contacts SET status = 'accepted', updated_at = NOW() WHERE id = $1`,
                [id]
            );
            return res.json({ status: "ok", message: "Solicitud aceptada" });
        }

        await pool.query(`DELETE FROM goldenmessages.contacts WHERE id = $1`, [id]);
        res.json({ status: "ok", message: "Solicitud rechazada" });
    } catch (error) {
        console.error("Error al responder solicitud de amistad:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// 👥 Listar amigos aceptados
export const getFriends = async (req, res) => {
    try {
        const { userId } = req.params;

        const { rows } = await pool.query(
            `SELECT u.id, u.username, u.username_public
             FROM goldenmessages.contacts c
             JOIN goldenmessages.users u
               ON u.id = CASE WHEN c.requester_id = $1 THEN c.addressee_id ELSE c.requester_id END
             WHERE c.status = 'accepted'
               AND (c.requester_id = $1 OR c.addressee_id = $1)
             ORDER BY u.username_public NULLS LAST, u.username`,
            [userId]
        );

        res.json({ friends: rows });
    } catch (error) {
        console.error("Error al obtener amigos:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// 📥 Solicitudes pendientes que me llegaron
export const getPendingRequests = async (req, res) => {
    try {
        const { userId } = req.params;

        const { rows } = await pool.query(
            `SELECT c.id, u.id AS requester_id, u.username, u.username_public
             FROM goldenmessages.contacts c
             JOIN goldenmessages.users u ON u.id = c.requester_id
             WHERE c.addressee_id = $1 AND c.status = 'pending'
             ORDER BY c.created_at DESC`,
            [userId]
        );

        res.json({ pending: rows });
    } catch (error) {
        console.error("Error al obtener solicitudes pendientes:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};