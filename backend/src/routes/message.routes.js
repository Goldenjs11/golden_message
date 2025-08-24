import { Router } from 'express';
import { createMessage, getMessage , getAllMessages, saveMessageDetails, getMessageById, getMessageDetailsById } from '../controllers/message.controller.js';
import {register, login} from '../controllers/authentication.controller.js';
import multer from 'multer';

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

router.post('/message', createMessage);
router.post('/messages', getAllMessages);
router.post('/messagesone/:id', getMessageById);
router.get('/message/:id', getMessage);
// Ruta para guardar los detalles
router.post("/details", img.array("image[]"), saveMessageDetails);
router.post('/detailsone/:id', getMessageDetailsById);

export default router;
