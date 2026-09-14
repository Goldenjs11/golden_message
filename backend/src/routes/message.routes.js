import express, { Router } from 'express';
import { createMessage, getMessage , getAllMessages, saveMessageDetails, getMessageById, getMessageDetailsById, updateDetails , updateMessage, getMessageReactions, saveMessageReaction, deleteMessageReaction} from '../controllers/message.controller.js';
import {register, login, logout} from '../controllers/authentication.controller.js';
import multer from 'multer';
import { methods as authorization, obtenerPermisos, requireAuth, verificarPropietario, verificarPropietarioMensaje } from '../middlewares/authorization.js';
import { getUserById, updateUserById } from '../controllers/users.controller.js';
import { uploadRoot, publicUploadBase } from '../config/uploads.js';

const router = Router();

// Helpers para extraer el id del dueño / del mensaje en cada verificación de propiedad
const propietarioDeParam = (req) => Number(req.params.id);
const propietarioDelBody = (req) => Number(req.body.user_id ?? req.body.idUsuario);
const messageIdDeParam = (req) => Number(req.params.id) || Number(req.params.messageId);
const messageIdDelBody = (req) => Number(req.body.message_id);

// Configuración de Multer para guardar imágenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadRoot);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb(null, "img_" + uniqueSuffix + "_" + file.originalname);
    }
});

const img = multer({ storage });

router.use(publicUploadBase, express.static(uploadRoot));



router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// ruta para obtener permisos del usuario
router.get('/permisos', authorization.soloAdmin, obtenerPermisos);

// 🛡️ Las rutas de gestión de mensajes/perfil exigen autenticación y propiedad del recurso.
// El público solo accede a GET/POST /message/:id y a las reacciones (vía enlace QR).

// Crear mensaje: debe autenticarse y el usuario_id debe ser propio
router.post('/message', requireAuth, verificarPropietario(propietarioDelBody), createMessage);
// Ruta para actualizar mensaje por ID (solo dueño del mensaje)
router.put("/messagesupdate/:id", requireAuth, verificarPropietarioMensaje(messageIdDeParam), updateMessage);

// Listar mensajes: el idUsuario debe ser propio
router.post('/messages', requireAuth, verificarPropietario(propietarioDelBody), getAllMessages);

// Obtener un mensaje por ID (gestión): solo dueño
router.post('/messagesone/:id', requireAuth, verificarPropietarioMensaje(messageIdDeParam), getMessageById);

// Guardar detalles: solo dueño del mensaje al que pertenecen
router.post("/details", requireAuth, verificarPropietarioMensaje(messageIdDelBody), saveMessageDetails);
// Obtener detalles (gestión): solo dueño
router.post('/detailsone/:id', requireAuth, verificarPropietarioMensaje(messageIdDeParam), getMessageDetailsById);

//Actualizar detalles (solo dueño del mensaje)
router.put("/updatedetails/:messageId", requireAuth, verificarPropietarioMensaje(messageIdDeParam), updateDetails);

// ── Reacciones: públicas por diseño (cualquiera con el enlace del QR puede ver/reaccionar) ──
router.get('/message/:id/reactions', getMessageReactions);
router.post('/message/:id/reactions', saveMessageReaction);
router.delete('/message/:id/reactions', deleteMessageReaction);
// Ver/validar mensaje público vía enlace compartido
router.get('/message/:id', getMessage);
router.post('/message/:id', getMessage);

/* Perfil Usuario */
// Ver perfil propio (o admin)
router.get('/user/:id', requireAuth, verificarPropietario(propietarioDeParam), getUserById);
// Actualizar datos de Usuario: solo el dueño del perfil (o admin); con whitelist de campos
router.put("/user/:id", requireAuth, verificarPropietario(propietarioDeParam), updateUserById);






export default router;
