import pool from '../config/db.js';
import QRCode from 'qrcode';
import bcryptjs from 'bcryptjs';
import { enviarMailNotificacionVisualizacionSimple } from '../utils/mail.service.js';


// Crear mensaje y generar QR
export const createMessage = async (req, res) => {
    try {
        const { title, viewsLimit, expiresAt, status, user_id, password, link_song } = req.body;

        const query = `
            INSERT INTO messages (title, max_views, expires_at, user_id, estado, password, link_song)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;

        const hashedPassword = await bcryptjs.hash(password, 10);
        const { rows } = await pool.query(query, [title, viewsLimit, expiresAt || null, user_id, status, hashedPassword, link_song]);
        const message = rows[0];
        

        const hashedLink = await bcryptjs.hash(message.id.toString(), 10);


        const appUrl = process.env.APP_URL.replace(/\/[^\/]*$/, "");
        const link = `${appUrl}/views_message?id_messagge=${hashedLink}`;

        // Generar QR como base64
        const qrBase64 = await QRCode.toDataURL(link);


        // Guardamos el link del QR en la base de datos (en vez de guardar la ruta del archivo)
        await pool.query(
            `UPDATE messages SET link = $1, qr_code = $2, hash_link_id = $3 WHERE id = $4`,
            [link, qrBase64, hashedLink, message.id]
        );

        res.json({ message, link, qrUrl: qrBase64 });
    } catch (error) {
        console.error("Error al crear el mensaje:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Controlador para actualizar mensaje
export const updateMessage = async (req, res) => {
    const { id } = req.params;
    const { title, viewsLimit, expiresAt, status, password, link_song } = req.body;


    try {
        // Validar campos obligatorios
        if (!title || !viewsLimit || !expiresAt || !status) {
            return res.status(400).json({ error: "Todos los campos son obligatorios" });
        }

        // Actualizar mensaje
        const query = `
            UPDATE messages 
            SET title = $1, 
                max_views = $2, 
                expires_at = $3, 
                estado = $4,
                password = $5,
                link_song = $6,
                updated_at = NOW()
            WHERE id = $7
            RETURNING *;
        `;
        const hashedPassword = await bcryptjs.hash(password, 10);
        const values = [title, viewsLimit, expiresAt, status, hashedPassword,link_song, id];
        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Mensaje no encontrado" });
        }

        return res.status(200).json({
            success: true,
            message: "Mensaje actualizado correctamente",
            data: result.rows[0],
        });
    } catch (error) {
        console.error("Error al actualizar mensaje:", error);
        return res.status(500).json({ error: "Error interno del servidor" });
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
            'SELECT * FROM message_details WHERE message_id = $1 order by priority',
            [id]
        );

    if (result.rows.length === 0) {
        return res.status(200).json({ message: null });  // <-- Devolvemos vacío, no error
    }


        res.json({ message: result.rows });
    } catch (error) {
        console.error('Error al obtener los detalles del mensaje:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};



// 📌 Obtener mensaje y permitir acceso con contraseña si se agotaron las vistas
export const getMessage = async (req, res) => {
    try {
        const id = decodeURIComponent(req.params.id);
        const password = req.method === "POST" ? req.body.password : null; // ✅ Solo en POST

        // 1. Validar ID
        if (!id) {
            return res.status(400).json({ success: false, error: "ID de mensaje no proporcionado" });
        }

        // 2. Buscar mensaje en la base de datos
        const { rows } = await pool.query("SELECT * FROM messages WHERE hash_link_id = $1", [id]);
        const message = rows[0];

        if (!message) {
            return res.status(404).json({ success: false, error: "Mensaje no encontrado" });
        }

        // 3. Verificar expiración
        if (message.expires_at) {
            console.log("🚀 ~ getMessage ~ expires_at:", message.expires_at)

            const fechaExpira = new Date(message.expires_at);
            console.log("🚀 ~ getMessage ~ fechaExpira:", fechaExpira)
            
            if (new Date() >= fechaExpira) {
                return res.status(410).json({ success: false, error: "Este mensaje ha expirado" });
            }
        }

        // 4. Manejar vistas y contraseña
        let vistasRestantes = Math.max(message.max_views - message.views_count, 0);

        if (message.views_count >= message.max_views) {
            if (message.password) {
                if (!password) {
                    return res.status(403).json({
                        success: false,
                        requierePassword: true,
                        error: "Este mensaje alcanzó el máximo de vistas, ingresa la contraseña para verlo"
                    });
                }

                // Validar contraseña
                const isMatch = await bcryptjs.compare(password, message.password);
                if (!isMatch) {
                    return res.status(401).json({ success: false, error: "Contraseña incorrecta" });
                }

                //console.log("🔓 Contraseña correcta, acceso permitido con vistas agotadas");
                // 🔹 Obtener datos del usuario creador
                const { rows: datesUsers } = await pool.query(
                    "SELECT name, last_name, email FROM users WHERE id = $1",
                    [message.user_id]
                );

                const user = datesUsers[0];
                const fullName = `${user.name} ${user.last_name}`;

                // 🔔 Enviar correo también cuando se accede con contraseña
                try {
                    await enviarMailNotificacionVisualizacionSimple(
                        user.email,
                        fullName,
                        message.title || "Mensaje sin título"
                    );
                    console.log(`📧 Notificación enviada a ${user.email}`);
                } catch (error) {
                    console.error("💥 Error al enviar correo de notificación:", error);
                }


            } else {
                return res.status(403).json({ success: false, error: "Este mensaje ya no está disponible" });
            }
        } else {
            // ✅ Solo si es GET, incrementamos las vistas
            if (req.method === "GET") {
                await pool.query("UPDATE messages SET views_count = views_count + 1 WHERE id = $1", [message.id]);

                vistasRestantes--;

                // 🔹 Obtener datos del usuario creador
                const { rows: datesUsers } = await pool.query(
                    "SELECT name, last_name, email FROM users WHERE id = $1",
                    [message.user_id]
                );

                const user = datesUsers[0];
                const fullName = `${user.name} ${user.last_name}`;

                // 🔔 Enviar correo **en TODAS las vistas**
                try {
                    await enviarMailNotificacionVisualizacionSimple(
                        user.email, // Correo del creador
                        fullName,   // Nombre del creador
                        message.title || "Mensaje sin título" // Título del mensaje
                    );
                    console.log(`📧 Notificación enviada a ${user.email}`);
                } catch (error) {
                    console.error("💥 Error al enviar correo de notificación:", error);
                }

            }
        }

        // 5. Obtener detalles
        const { rows: messagedetails } = await pool.query(
            "SELECT * FROM message_details WHERE message_id = $1",
            [message.id]
        );

        // 6. Respuesta final
        return res.json({
            success: true,
            content: { message, messagedetails },
            vistasRestantes,
            redirect: "/viewsmessage"
        });

    } catch (error) {
        console.error("💥 [ERROR] Ocurrió un error en getMessage():", error);
        return res.status(500).json({ success: false, error: "Error interno del servidor" });
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
                    background_color, background_color2, text_color, text_color2, created_at
                )
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11 NOW())
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
                det.background_color2,
                det.text_color,
                det.text_color2
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


export const updateDetails = async (req, res) => {
    const { messageId } = req.params;
    const { details } = req.body;


    try {
        // Primero, eliminamos los detalles existentes que ya no están en el array
        const existingDetails = await pool.query(
            "SELECT id FROM message_details WHERE message_id = $1",
            [messageId]
        );

        const incomingIds = details.filter(d => d.id).map(d => parseInt(d.id));
        const idsToDelete = existingDetails.rows
            .filter(row => !incomingIds.includes(row.id))
            .map(row => row.id);

        if (idsToDelete.length > 0) {
            await pool.query(
                `DELETE FROM message_details WHERE id = ANY($1::int[])`,
                [idsToDelete]
            );
        }

        // Ahora actualizamos o insertamos los detalles nuevos
        for (const d of details) {
            if (d.id) {
                // Actualizamos los existentes
                await pool.query(
                    `UPDATE message_details 
                     SET detail = $1, position = $2, priority = $3, display_time = $4,
                         font_size = $5, font_family = $6, background_color = $7, background_color2 = $8, text_color = $9 , text_color2 = $10
                     WHERE id = $11`,
                    [
                        d.detail,
                        d.position,
                        d.priority,
                        d.screen_time,
                        d.font_size,
                        d.font_family,
                        d.background_color,
                        d.background_color2,
                        d.text_color,
                        d.text_color2,
                        d.id
                    ]
                );
            } else {
                // Insertamos nuevos
                await pool.query(
                    `INSERT INTO message_details 
                     (message_id, detail, position, priority, display_time, font_size, font_family, background_color, background_color2, text_color, text_color2)
                     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, $10, $11)`,
                    [
                        messageId,
                        d.detail,
                        d.position,
                        d.priority,
                        d.screen_time,
                        d.font_size,
                        d.font_family,
                        d.background_color,
                        d.background_color2,
                        d.text_color,
                        d.text_color2
                    ]
                );
            }
        }

        res.status(200).json({ message: "Detalles actualizados correctamente" });
    } catch (error) {
        console.error("Error al actualizar detalles:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};


