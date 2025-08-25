import pool from '../config/db.js';
import QRCode from 'qrcode';
import fs from "fs";
import path from "path";
import bcryptjs from 'bcryptjs';


// Crear mensaje y generar QR
export const createMessage = async (req, res) => {
    try {
        const { title, viewsLimit, expiresAt, status, user_id, password } = req.body;

        // Insertamos el mensaje inicial
        const query = `
            INSERT INTO messages (title, max_views, expires_at, user_id, estado, password)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        // Hashear la contraseña
        const hashedPassword = await bcryptjs.hash(password, 10);

        const { rows } = await pool.query(query, [title, viewsLimit, expiresAt || null, user_id, status, hashedPassword]);
        const message = rows[0];

        // Generar link único
        const appUrl = process.env.APP_URL.replace(/\/[^\/]*$/, "");
        const link = `${appUrl}/views_message?id_messagge=${message.id}`;

        // Ruta donde se guardará el QR
        const qrDir = path.join("uploads", "qr");
        const qrPath = path.join(qrDir, `qr_${message.id}.png`);

        // Crear carpeta si no existe
        if (!fs.existsSync(qrDir)) {
            fs.mkdirSync(qrDir, { recursive: true });
        }

        // Generar QR como archivo PNG
        await QRCode.toFile(qrPath, link);

        // Guardar link y ruta del QR en la base de datos
        await pool.query(
            `UPDATE messages SET link = $1, qr_code = $2 WHERE id = $3`,
            [link, qrPath, message.id]
        );
        const qrUrl = `https://golden-message.onrender.com/${qrPath.replace(/\\/g, "/")}`;
        res.json({ message, link, qrUrl });
    } catch (error) {
        console.error("Error al crear el mensaje:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Obtener todos los mensajes
export const getAllMessages = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM messages ORDER BY created_at');
        res.json({ messages: result.rows });
    } catch (error) {
        console.error('Error al obtener los mensajes:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};


// Obtener un mensaje por ID
export const getMessageById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'SELECT * FROM messages WHERE id = $1 LIMIT 1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Mensaje no encontrado' });
        }

        res.json({ message: result.rows[0] });
    } catch (error) {
        console.error('Error al obtener el mensaje:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};


// Obtener los detalles del mensaje por ID
export const getMessageDetailsById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'SELECT * FROM message_details WHERE message_id = $1 LIMIT 1',
            [id]
        );

    if (result.rows.length === 0) {
        return res.status(200).json({ message: null });  // <-- Devolvemos vacío, no error
    }


        res.json({ message: result.rows[0] });
    } catch (error) {
        console.error('Error al obtener los detalles del mensaje:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};


// Obtener mensaje
export const getMessage = async (req, res) => {
    try {
        const { id } = req.params;

        const { rows } = await pool.query('SELECT * FROM messages WHERE id = $1', [id]);
        const message = rows[0];

        

        if (!message) {
            return res.status(404).json({ error: 'Mensaje no encontrado' });
        }

        // Validar expiración
        if (message.expires_at && new Date() > new Date(message.expires_at)) {
            return res.status(410).json({ error: 'Este mensaje ha expirado' });
        }

        // Validar límite de vistas
        if (message.views_count >= message.max_views) {
            return res.status(403).json({ error: 'Este mensaje ya no está disponible' });
        }

        // Incrementar vistas
        const updateQuery = `
            UPDATE messages
            SET views_count = views_count + 1
            WHERE id = $1
            RETURNING views_count;
        `;

        const updated = await pool.query(updateQuery, [id]);
        const { rows: messagedetails } = await pool.query('SELECT * FROM message_details WHERE message_id = $1', [id]);

        let vistasRestantes = message.max_views - updated.rows[0].views_count;
       

        res.json({
            content: {message, messagedetails},
            vistasRestantes,
            redirect: "/viewsmessage"
        });
    } catch (error) {
        console.error('Error al obtener el mensaje:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};


export const saveMessageDetails = async (req, res) => {
    try {
        const { message_id, details } = req.body;

        if (!message_id || !details || !Array.isArray(details) || details.length === 0) {
            return res.status(400).json({ success: false, message: "Faltan los detalles o el ID del mensaje" });
        }

        // Insertar cada detalle en la base de datos
        const inserts = details.map(async (det) => {
            const query = `
                INSERT INTO message_details (
                    message_id, detail, position, priority,
                    display_time, font_size, font_family,
                    background_color, text_color, created_at
                )
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, NOW())
                RETURNING id
            `;

            const values = [
                message_id,
                det.detail,
                det.position,
                det.priority,
                det.screen_time,
                det.font_size,
                det.font_family,
                det.background_color,
                det.text_color
            ];

            const result = await pool.query(query, values);
            return result.rows[0];
        });

        const results = await Promise.all(inserts);

        res.status(201).json({
            success: true,
            message: "Detalles guardados correctamente",
            data: results
        });

    } catch (error) {
        console.error("Error al guardar detalles:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
};
