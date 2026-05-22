import { Router } from 'express';
import { createMessage, getMessage , getAllMessages, saveMessageDetails, getMessageById, getMessageDetailsById, updateDetails , updateMessage, getMessageReactions, saveMessageReaction, deleteMessageReaction} from '../controllers/message.controller.js';
import {register, login} from '../controllers/authentication.controller.js';
import multer from 'multer';
import { methods as authorization, obtenerPermisos } from '../middlewares/authorization.js';
import { getUserById, updateUserById } from '../controllers/users.controller.js';

const router = Router();

// Configuración de Multer para guardar imágenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "img/");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb(null, "img_" + uniqueSuffix + "_" + file.originalname);
    }
});

const img = multer({ storage });



router.post('/register', register);
router.post('/login', login);

// ruta para obtener permisos del usuario
router.get('/permisos', authorization.soloAdmin, obtenerPermisos);

router.post('/message', createMessage);
// Ruta para actualizar mensaje por ID
router.put("/messagesupdate/:id", updateMessage);

router.post('/messages', getAllMessages);

router.post('/messagesone/:id', getMessageById);
router.get('/message/:id/reactions', getMessageReactions);
router.post('/message/:id/reactions', saveMessageReaction);
router.delete('/message/:id/reactions', deleteMessageReaction);
// Para obtener el mensaje (sin contraseña)
router.get('/message/:id', getMessage);

// Para validar contraseña y acceder al mensaje
router.post('/message/:id', getMessage);
// Ruta para guardar los detalles
router.post("/details", img.array("image[]"), saveMessageDetails);
router.post('/detailsone/:id', getMessageDetailsById);

//Actualizar detalles
router.put("/updatedetails/:messageId", updateDetails);

/* Perfil Usuario */
router.get('/user/:id', getUserById);
/* Actualizar datos de Usuario */
router.put("/user/:id", updateUserById); // 👈 Aquí el update






export default router;
