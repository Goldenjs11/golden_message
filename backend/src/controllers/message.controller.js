import pool from '../config/db.js';
import QRCode from 'qrcode';
import bcryptjs from 'bcryptjs';
import { enviarMailNotificacionVisualizacionSimple } from '../utils/mail.service.js';
import { createCanvas, loadImage } from "canvas";


// Crear mensaje y generar QR
export const createMessage = async (req, res) => {
    try {
        const { title, viewsLimit, expiresAt, status, user_id, password, link_song, compartido, startDate, nameQr } = req.body;

        const query = `
            INSERT INTO messages (title, max_views, expires_at, user_id, estado, password, link_song, compartido, start_date)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *;
        `;

        const hashedPassword = await bcryptjs.hash(password, 10);
        const { rows } = await pool.query(query, [title, viewsLimit, expiresAt || null, user_id, status, hashedPassword, link_song, compartido, startDate]);
        const message = rows[0];


        const hashedLink = await bcryptjs.hash(message.id.toString(), 10);


        const appUrl = process.env.APP_URL.replace(/\/[^\/]*$/, "");
        const link = `${appUrl}/views_message?id_messagge=${hashedLink}`;

        // Generar QR como base64
        const qrBase64 = await generarQRConTexto(link, nameQr);


        // Guardamos el link del QR en la base de datos (en vez de guardar la ruta del archivo)
        await pool.query(
            `UPDATE messages SET link = $1, qr_code = $2, hash_link_id = $3 WHERE id = $4`,
            [link, qrBase64, hashedLink, message.id]
        );

        res.json({ message, messages: "Mensaje creado correctamente", link, qrUrl: qrBase64 });
    } catch (error) {
        console.error("Error al crear el mensaje:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

async function generarQRConTexto(link, texto) {
  const canvas = createCanvas(300, 300);
  const ctx = canvas.getContext("2d");

  // Generar QR en el canvas
  await QRCode.toCanvas(canvas, link, {
    margin: 1,
    color: {
      dark: "#000000",
      light: "#ffffff"
    }
  });

  // ✅ Solo dibuja si el texto existe y no está vacío
  if (texto && texto.trim().length > 0) {
    ctx.font = "bold 20px Arial";
    ctx.fillStyle = "red";   // color del texto
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(texto.trim(), canvas.width / 2, canvas.height / 2);
  }

  return canvas.toDataURL();
}

// Controlador para actualizar mensaje
export const updateMessage = async (req, res) => {
    const { id } = req.params;
    const { title, viewsLimit, expiresAt, status, password, link_song, startDate, compartido } = req.body;

    try {
        // Validar campos obligatorios (excepto password que es opcional en actualización)
        if (!title || !viewsLimit || !expiresAt || !status) {
            return res.status(400).json({ error: "Todos los campos son obligatorios (menos password)" });
        }

        let query;
        let values;

        if (password && password.trim() !== "") {
            // 👉 Si viene password, lo incluimos
            const hashedPassword = await bcryptjs.hash(password, 10);

            query = `
                UPDATE messages 
                SET title = $1, 
                    max_views = $2, 
                    expires_at = $3, 
                    estado = $4,
                    password = $5,
                    link_song = $6,
                    start_date = $7,
                    compartido = $8,
                    updated_at = NOW()
                WHERE id = $9
                RETURNING *;
            `;
            values = [title, viewsLimit, expiresAt, status, hashedPassword, link_song, startDate, compartido, id];
        } else {
            // 👉 Si no viene password, no lo actualizamos
            query = `
                UPDATE messages 
                SET title = $1, 
                    max_views = $2, 
                    expires_at = $3, 
                    estado = $4,
                    link_song = $5,
                    start_date = $6,
                    compartido = $7,
                    updated_at = NOW()
                WHERE id = $8
                RETURNING *;
            `;
            values = [title, viewsLimit, expiresAt, status, link_song, startDate, compartido, id];
        }

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
        const { idUsuario } = req.body;

        // Validamos que el ID esté presente
        if (!idUsuario) {
            return res.status(400).json({ error: "El idUsuario es obligatorio" });
        }

        const query = `
            SELECT id, title, estado, compartido
            FROM messages
            WHERE user_id = $1
               OR (compartido = true AND estado = true)
            ORDER BY created_at DESC
        `;

        const result = await pool.query(query, [idUsuario]);

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
        const password = req.method === "POST" ? req.body.password : null;

        // 1. Validar ID
        if (!id) {
            return res.status(400).json({ success: false, error: "ID de mensaje no proporcionado" });
        }

        // 2. Buscar mensaje en la base de datos
        const { rows } = await pool.query("SELECT * FROM messages WHERE hash_link_id = $1", [id]);
        const message = rows[0];

        // 2.1. Si no existe el mensaje, no tenemos email → no notificamos
        if (!message) {
            return res.status(404).json({ success: false, error: "Mensaje no encontrado" });
        }

        // 🔹 Obtenemos datos del usuario creador para notificar SIEMPRE
        const { rows: datesUsers } = await pool.query(
            "SELECT name, last_name, email FROM users WHERE id = $1",
            [message.user_id]
        );
        const user = datesUsers[0];
        const fullName = `${user.name} ${user.last_name}`;

        // 3. Si el mensaje está desactivado
        if (message.estado === false) {
            await enviarMailNotificacionVisualizacionSimple(user.email, fullName, message.title || "Mensaje sin título");
            return res.status(403).json({
                success: false,
                error: "Lamentablemente, el usuario ha desactivado este mensaje y no está disponible en este momento.",
                disponible: false
            });
        }
        // 4. Verificar disponibilidad futura

        if (message.start_date) {
            // ✅ Convertir fecha de inicio a hora de Colombia
            const startDate = new Date(
                new Date(
                    typeof message.start_date.toISOString === "function"
                        ? message.start_date.toISOString()
                        : message.start_date.replace(" ", "T") + "Z"
                ).toLocaleString("en-US", { timeZone: "America/Bogota" })
            );

            // ✅ Fecha/hora actual de Colombia
            const ahoraColombia = new Date(
                new Date().toLocaleString("en-US", { timeZone: "America/Bogota" })
            ).getTime();



            if (ahoraColombia < startDate.getTime()) {
                await enviarMailNotificacionVisualizacionSimple(
                    user.email,
                    fullName,
                    message.title || "Mensaje sin título"
                );

                const options = {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    timeZone: 'America/Bogota'
                };

                return res.status(403).json({
                    success: false,
                    error: "El mensaje aún no está disponible",
                    disponible_en: startDate.toISOString(),
                    disponible_en_local: startDate.toLocaleString('es-CO', options)
                });
            }
        }


        // 5. Verificar expiración
        if (message.expires_at) {
            // ✅ Convertimos la fecha de expiración a hora de Colombia
            const fechaExpira = new Date(
                new Date(
                    message.expires_at.toISOString
                        ? message.expires_at.toISOString()
                        : message.expires_at.replace(" ", "T") + "Z"
                ).toLocaleString("en-US", { timeZone: "America/Bogota" })
            );

            // ✅ Obtenemos la hora actual de Colombia
            const ahoraColombia = new Date(
                new Date().toLocaleString("en-US", { timeZone: "America/Bogota" })
            ).getTime();

            if (ahoraColombia >= fechaExpira.getTime()) {
                await enviarMailNotificacionVisualizacionSimple(
                    user.email,
                    fullName,
                    message.title || "Mensaje sin título"
                );

                if (message.password) {
                    const result = await handlePasswordAccess(
                        password,
                        message,
                        pool,
                        enviarMailNotificacionVisualizacionSimple
                    );
                    if (!result.success) {
                        return res.status(result.status).json(result);
                    }
                } else {
                    return res.status(403).json({
                        success: false,
                        error: "Este mensaje ya no está disponible"
                    });
                }
            }
        }


        // 6. Verificar límite de vistas
        let vistasRestantes = Math.max(message.max_views - message.views_count, 0);
        if (message.views_count >= message.max_views) {
            await enviarMailNotificacionVisualizacionSimple(user.email, fullName, message.title || "Mensaje sin título");

            if (message.password) {
                const result = await handlePasswordAccess(password, message, pool, enviarMailNotificacionVisualizacionSimple);
                if (!result.success) {
                    return res.status(result.status).json(result);
                }
            } else {
                return res.status(403).json({ success: false, error: "Este mensaje ya no está disponible" });
            }
        }

        // 7. Si aún no está agotado, procesamos vista
        if (req.method === "GET") {
            await pool.query("UPDATE messages SET views_count = views_count + 1 WHERE id = $1", [message.id]);
            vistasRestantes--;

            // 🔔 Enviar notificación al creador (también aquí)
            try {
                await enviarMailNotificacionVisualizacionSimple(
                    user.email,
                    fullName,
                    message.title || "Mensaje sin título"
                );
            } catch (error) {
                console.error("💥 Error al enviar correo de notificación:", error);
            }
        }

        // 8. Obtener detalles
        const { rows: messagedetails } = await pool.query(
            "SELECT * FROM message_details WHERE message_id = $1",
            [message.id]
        );

        // 9. Respuesta final
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


// 🔹 Función para validar contraseña y enviar notificación
const handlePasswordAccess = async (password, message, pool, enviarMailNotificacionVisualizacionSimple) => {
    // 1. Validar que la contraseña haya sido enviada
    if (!password) {
        return { success: false, status: 403, requierePassword: true, error: "Este mensaje alcanzó el máximo de vistas, ingresa la contraseña para verlo" };
    }

    // 2. Verificar si la contraseña coincide
    const isMatch = await bcryptjs.compare(password, message.password);
    if (!isMatch) {
        return { success: false, status: 401, error: "Contraseña incorrecta" };
    }

    // 3. Obtener datos del usuario creador
    const { rows: datesUsers } = await pool.query(
        "SELECT name, last_name, email FROM users WHERE id = $1",
        [message.user_id]
    );

    const user = datesUsers[0];
    const fullName = `${user.name} ${user.last_name}`;

    // 4. Enviar correo de notificación
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

    // 5. Retornar éxito
    return { success: true, user };
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
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())
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
                        d.display_time,
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
                        d.display_time,
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


