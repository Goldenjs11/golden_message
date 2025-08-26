import pool from '../config/db.js';
import jsonwebtoken from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Función para revisar la validez del token JWT y obtener información del usuario
async function revisarCookie(req) {
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
        const resultado = await pool.query('SELECT id, name, last_name, email, role,verificado FROM users WHERE username = $1', [decodificada.username]);

        
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




export const methods = {
    soloAdmin,
    soloPublico
};



