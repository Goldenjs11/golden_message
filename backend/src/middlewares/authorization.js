import pool from '../config/db.js';
import jsonwebtoken from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// id_role que corresponde al rol Administrador.
// Por defecto es 1 (los usuarios normales usan 2). Configurable via .env.
const ADMIN_ROLE_ID = process.env.ADMIN_ROLE_ID
  ? Number(process.env.ADMIN_ROLE_ID)
  : 1;

// Función para revisar la validez del token JWT y obtener información del usuario
export async function revisarCookie(req) {
    try {
        // Verifica si existe la cookie en la petición
        const cookieHeader = req.headers.cookie;

        if (!cookieHeader) {
            return null;
        }

        // Extrae el token JWT de la cookie
        const cookieJWT = cookieHeader.split("; ").find(cookie => cookie.startsWith("jwt="));
        if (!cookieJWT) {
            return null;
        }
        const token = cookieJWT.slice(4); // Elimina 'jwt=' para obtener el token

        // Verifica y decodifica el token JWT
        const decodificada = jsonwebtoken.verify(token, process.env.JWT_SECRET);


        // Realiza la consulta a la base de datos para encontrar el usuario
        const resultado = await pool.query('SELECT id, name, last_name, email, id_role,verificado FROM goldenmessages.users WHERE username = $1', [decodificada.username]);

        
        if (resultado.rows.length === 0) {
            return null;
        }

        // Retorna el usuario si todo es correcto
        return resultado.rows[0];
    } catch (error) {
        console.error('Error al verificar la cookie:', error);

        // Manejo del error: puedes lanzar un error o retornar null
        return null;
    }
}

// Middleware para permitir acceso solo a administradores
async function soloAdmin(req, res, next) {
    const logueado = await revisarCookie(req);
    if (logueado) { // Asume que el usuario tiene un campo 'esAdmin' para verificar
        return next();
    }
    return res.redirect("/");
}

// Middleware para permitir acceso solo a rutas públicas si no está logueado
async function soloPublico(req, res, next) {
    const logueado = await revisarCookie(req);
    if (!logueado) {
        return next();
    }
    return res.redirect("/admin");
}

// → ¿El usuario (ya resuelto por revisarCookie) es administrador?
// admin = id_role 1 ; usuarios normales = id_role 2. Se detecta por rol.
export function esAdmin(usuario) {
    return Boolean(usuario) && usuario.id_role === ADMIN_ROLE_ID;
}

// Middleware para rutas de API: exige sesión y adjunta el usuario a req.usuario.
// Al no redirigir (a diferencia de soloAdmin), devuelve 401 JSON, apto para fetch().
export async function requireAuth(req, res, next) {
    const usuario = await revisarCookie(req);
    if (!usuario) {
        return res.status(401).json({ status: "Error", message: "No autorizado. Debes iniciar sesión." });
    }
    req.usuario = usuario;
    return next();
}

// Middleware que garantiza que el usuario autenticado sea dueño del recurso.
// `obtenerId` extrae el id del dueño del recurso (ej. del body o del param).
// Los administradores quedan exentos.
export function verificarPropietario(obtenerId) {
    return async (req, res, next) => {
        const usuario = req.usuario;
        if (!usuario) {
            return res.status(401).json({ status: "Error", message: "No autorizado." });
        }
        if (await esAdmin(usuario)) {
            return next();
        }

        let idRecurso;
        try {
            idRecurso = await obtenerId(req);
        } catch (err) {
            return res.status(500).json({ status: "Error", message: "Error verificando el recurso." });
        }

        if (Number(idRecurso) === Number(usuario.id)) {
            return next();
        }

        return res.status(403).json({ status: "Error", message: "No tienes permiso sobre este recurso." });
    };
}

// Middleware que valida que un mensaje pertenezca al usuario autenticado.
// `obtenerMessageId` extrae el id del mensaje (param/body); consulta su user_id.
export function verificarPropietarioMensaje(obtenerMessageId) {
    return async (req, res, next) => {
        const usuario = req.usuario;
        if (!usuario) {
            return res.status(401).json({ status: "Error", message: "No autorizado." });
        }
        if (await esAdmin(usuario)) {
            return next();
        }

        let messageId;
        try {
            messageId = obtenerMessageId(req);
            const { rows } = await pool.query(
                "SELECT user_id FROM goldenmessages.messages WHERE id = $1",
                [messageId]
            );
            if (rows.length === 0 || Number(rows[0].user_id) !== Number(usuario.id)) {
                return res.status(403).json({ status: "Error", message: "No tienes permiso sobre este mensaje." });
            }
        } catch (err) {
            return res.status(500).json({ status: "Error", message: "Error verificando el mensaje." });
        }

        return next();
    };
}


export function verificarPermiso(nombreModulo) {
    return async (req, res, next) => {
        try {
            // 1. Verificar usuario autenticado
            const usuario = await revisarCookie(req);
            if (!usuario) {
                console.warn("[DEBUG] Usuario no autenticado. Redirigiendo a /login");
                return res.redirect("/login");
            }

            // 2. Obtener permisos desde la base de datos
            const query = `
                SELECT 
                    pm.id,
                    pm.nombre,
                    pa.estado
                FROM goldenmessages.permisos_modulos pm
                LEFT JOIN goldenmessages.permisos_asignados pa 
                    ON pm.id = pa.id_permiso_modulo
                    AND (
                        pa.id_usuario = $1 OR
                        pa.id_role = (SELECT id_role FROM goldenmessages.users WHERE id = $1)
                    )
                WHERE pm.nombre = $2
                ORDER BY pa.id_usuario DESC
                LIMIT 1;
            `;

            const { rows } = await pool.query(query, [usuario.id, nombreModulo]);

            // 3. Si no existe el módulo, denegamos
            if (rows.length === 0) {
                console.warn(`[DEBUG] Módulo '${nombreModulo}' no encontrado.`);
                return res.status(404).json({ error: "Módulo no encontrado" });
            }

            const permiso = rows[0];

            // 4. Evaluar permiso
            if (permiso.estado === false) {
                console.warn(`[DEBUG] Acceso denegado para el módulo: ${nombreModulo}`);
                return res.status(403).json({ error: "Permiso denegado" });
            }

            // 5. Si no hay permiso definido, también se bloquea
            if (permiso.estado === null) {
                console.warn(`[DEBUG] No hay permiso definido para '${nombreModulo}'`);
                return res.status(403).json({ error: "Permiso no asignado" });
            }

            // 6. Si pasa todas las validaciones, seguimos
            req.usuario = usuario;
            next();

        } catch (error) {
            console.error("[ERROR] en verificarPermiso:", error);
            res.status(500).json({ error: "Error interno en la verificación de permisos" });
        }
    };
}

// Endpoint para obtener permisos
export async function obtenerPermisos(req, res) {
    const usuario = await revisarCookie(req);
    if (!usuario) {
        return res.status(401).json({ status: "Error", message: "No autorizado" });
    }

    try {
        // Obtener permisos del rol y del usuario
// Obtener permisos del rol y del usuario
    const permisosResultado = await pool.query(`
        SELECT 
            pa.id, 
            m.nombre,
            m.contenido,
            m.icono,
            m.color,
            m.ruta,
            m.boton, 
            pa.estado
        FROM goldenmessages.permisos_asignados pa
        LEFT JOIN goldenmessages.permisos_modulos m ON pa.id_permiso_modulo = m.id
        WHERE (pa.id_role = $1 AND pa.id_usuario IS NULL) 
        OR (pa.id_usuario = $2 AND pa.id_role IS NULL)
    `, [usuario.id_role, usuario.id]);

        // Devolver los permisos en la respuesta
        res.json({
            status: "ok",
            permisos: permisosResultado.rows 
        });
    } catch (error) {
        console.error('Error al obtener permisos:', error);
        res.status(500).json({ status: "Error", message: "Error interno del servidor" });
    }
}





export const methods = {
    soloAdmin,
    soloPublico,
    requireAuth,
    verificarPermiso,
    esAdmin,
    verificarPropietario,
    verificarPropietarioMensaje
};



