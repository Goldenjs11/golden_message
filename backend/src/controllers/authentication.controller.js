import pool from '../config/db.js';
import bcryptjs from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';
import dotenv from 'dotenv';
import moment from 'moment-timezone';
import { enviarMailVerificacion } from '../utils/mail.service.js';
import { validateRegistration, validateLogin } from '../validators/validators.js';
import { serializeUserPublic } from '../utils/serializeUserPublic.js';


dotenv.config();

/**
 * Registro de usuario
 */
export async function register(req, res) {
    try {
        const { email, user, password, telefono, name, lastname } = req.body;
        const validation = validateRegistration({ email, user, password });

        if (!validation.ok) {
            return res.status(400).send({ status: "Error", message: validation.errors.join('. ') });
        }

        // Verificar si el correo o el nombre de usuario ya existen
        const users = await pool.query(
            'SELECT email, username FROM goldenmessages.users WHERE email = $1 OR username = $2',
            [email, user]
        );
        if (users.rows.length > 0) {
            const existente = users.rows[0];
            const message = existente.email === email
                ? "El correo ya está registrado"
                : "El nombre de usuario ya está registrado";
            return res.status(409).send({ status: "Error", message });
        }

        // Hashear la contraseña
        const hashedPassword = await bcryptjs.hash(password, 10);

        // Generar token de verificación
        const tokenVerificacion = jsonwebtoken.sign(
            { user },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION }
        );

        // Enviar correo de verificación (Resend devuelve { data, error }, no accepted[])
        const mail = await enviarMailVerificacion(email, tokenVerificacion);
        if (mail?.error || !mail?.data?.id) {
            console.error("Error enviando email de verificación:", mail?.error || mail);
            return res.status(500).send({ status: "Error", message: "Error enviando email de verificación" });
        }

        // Insertar el nuevo usuario (id_role = 2 → usuario normal; 1 es administrador)
        await pool.query(`
            INSERT INTO goldenmessages.users (email, username, password_hash, verificado, token_verificacion, telefono, name, last_name, id_role) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 2) RETURNING id
        `, [email, user, hashedPassword, false, tokenVerificacion, telefono, name, lastname]);

        res.send({ status: "ok", message: "Usuario registrado correctamente. Por favor, revisa tu correo para confirmar tu cuenta.", redirect: "/" });
    } catch (error) {
        console.error("Error en register:", error);
        res.status(500).send({ status: "Error", message: "Error interno del servidor" });
    }
}

/**
 * Inicio de sesión
 */
export async function login(req, res) {
    try {
        const { username, password } = req.body;
        const validation = validateLogin({ username, password });

        if (!validation.ok) {
            return res.status(400).send({ status: "Error", message: validation.errors.join('. ') });
        }

        // Buscar usuario
        const resultado = await pool.query('SELECT * FROM goldenmessages.users WHERE username = $1', [username]);
        const usuario = resultado.rows[0];

                // Verificar credenciales
        if (!usuario || !(await bcryptjs.compare(password, usuario.password_hash))) {
            return res.status(401).send({ 
                status: "Error", 
                message: "Usuario o contraseña incorrectos" 
            });
        }

        // 🔒 Verificar si la cuenta está activada (campo verificado)
        if (!usuario.verificado) {
            return res.status(403).send({
                status: "Error",
                message: "Tu cuenta aún no está verificada. Por favor revisa tu correo."
            });
        }

        // Generar token JWT
        const token = jsonwebtoken.sign(
            { id: usuario.id, username: usuario.username },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION }
        );

        // Configurar cookie segura.
        const cookieOption = {
            expires: new Date(Date.now() + Number(process.env.JWT_COOKIE_EXPIRES || 60) * 60 * 1000),
            path: "/",
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: Number(process.env.JWT_COOKIE_EXPIRES || 60) * 60 * 1000
        };

        // Guardar cookie
        res.cookie("jwt", token, cookieOption);

        // Registrar sesión
        const ipInicio = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
        const dispositivoNavegador = req.get('User-Agent');
        const fechaInicioLocal = moment().tz('America/Bogota').format('YYYY-MM-DD HH:mm:ss');
        const estadoSesion = "Activa";

        const sessionData = await pool.query(`
            INSERT INTO goldenmessages.registros_de_sesion (id_usuario, fecha_hora_inicio, ip_inicio, dispositivo_navegador, estado_sesion)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id_sesion;
        `, [usuario.id, fechaInicioLocal, ipInicio, dispositivoNavegador, estadoSesion]);

        // Respuesta final
        res.send({
            status: "ok",
            message: "Inicio de sesión exitoso",
            redirect: "/admin",
            usuario: {
                ...serializeUserPublic(usuario),
                id_sesion: sessionData.rows[0].id_sesion
            }
        });
    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).send({ status: "Error", message: "Error interno del servidor" });
    }
}

export function logout(req, res) {
    res.clearCookie("jwt", {
        path: "/",
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    });

    if (req.method === "GET") {
        return res.redirect("/login");
    }

    return res.json({ status: "ok", message: "Sesión cerrada", redirect: "/login" });
}




export async function verificarCuenta(req, res) {

    try {
        // Verificar si el token está presente
        if (!req.params.token) {
            console.log("No se recibió un token.");
            return res.redirect("/");
        }

        // Decodificar el token JWT
        const decodificada = jsonwebtoken.verify(req.params.token, process.env.JWT_SECRET);
        if (!decodificada || !decodificada.user) {
            console.log("Error en el token decodificado.");
            return res.redirect("/").send({ status: "error", message: "Error en el token" });
        }

        // Buscar usuario con el token de verificación
        const { rows: usuarios } = await pool.query(
            'SELECT * FROM goldenmessages.users WHERE token_verificacion = $1',
            [req.params.token]
        );

        if (usuarios.length > 0) {
            const usuario = usuarios[0];

            // Marcar usuario como verificado
            await pool.query(
                'UPDATE goldenmessages.users SET verificado = true WHERE id = $1',
                [usuario.id]
            );

        } else {
            console.log("No se encontró un usuario con ese token.");
        }

        res.redirect("/");

    } catch (err) {
        console.error("Error en verificarCuenta:", err);
        res.status(500).redirect("/");
    }
}
