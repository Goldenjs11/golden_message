import pool from '../config/db.js';
import bcryptjs from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';
import dotenv from 'dotenv';
import moment from 'moment-timezone';
import { enviarMailVerificacion } from '../utils/mail.service.js';


dotenv.config();

/**
 * Registro de usuario
 */
export async function register(req, res) {
    try {
        const { email, user, password, telefono, name, lastname } = req.body;


        if (!email || !user || !password) {
            return res.status(400).send({ status: "Error", message: "Todos los campos son obligatorios" });
        }

        // Verificar si el usuario ya existe
        const users = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (users.rows.length > 0) {
            return res.status(409).send({ status: "Error", message: "El usuario ya existe" });
        }

        // Hashear la contraseña
        const hashedPassword = await bcryptjs.hash(password, 10);

        // Generar token de verificación
        const tokenVerificacion = jsonwebtoken.sign(
            { user },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION }
        );

        // Enviar correo de verificación
        const mail = await enviarMailVerificacion(email, tokenVerificacion);
        if (!mail || mail.accepted.length === 0) {
            return res.status(500).send({ status: "Error", message: "Error enviando email de verificación" });
        }

        // Insertar el nuevo usuario
        await pool.query(`
            INSERT INTO users (email, username, password_hash, verificado, token_verificacion, telefono, name, last_name, id_role) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1) RETURNING id
        `, [email, user, hashedPassword, 0, tokenVerificacion, telefono, name, lastname]);

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

        if (!username || !password) {
            return res.status(400).send({ status: "Error", message: "Los campos están incompletos" });
        }

        // Buscar usuario
        const resultado = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
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

        // Configurar cookie segura
        const cookieOption = {
            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 60 * 1000),
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        };

        // Guardar cookie
        res.cookie("jwt", token, cookieOption);

        // Registrar sesión
        const ipInicio = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
        const dispositivoNavegador = req.get('User-Agent');
        const fechaInicioLocal = moment().tz('America/Bogota').format('YYYY-MM-DD HH:mm:ss');
        const estadoSesion = "Activa";

        const sessionData = await pool.query(`
            INSERT INTO registros_de_sesion (id_usuario, fecha_hora_inicio, ip_inicio, dispositivo_navegador, estado_sesion)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id_sesion;
        `, [usuario.id, fechaInicioLocal, ipInicio, dispositivoNavegador, estadoSesion]);

        // Respuesta final
        res.send({
            status: "ok",
            message: "Inicio de sesión exitoso",
            redirect: "/admin",
            usuario: {
                id: usuario.id,
                nombre_usuario: usuario.username,
                email: usuario.email,
                telefono: usuario.telefono,
                id_sesion: sessionData.rows[0].id_sesion
            }
        });
    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).send({ status: "Error", message: "Error interno del servidor" });
    }
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
            'SELECT * FROM users WHERE token_verificacion = $1',
            [req.params.token]
        );

        if (usuarios.length > 0) {
            const usuario = usuarios[0];

            // Marcar usuario como verificado
            await pool.query(
                'UPDATE users SET verificado = true WHERE id = $1',
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