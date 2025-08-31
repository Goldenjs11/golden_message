import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import messageRoutes from "./routes/message.routes.js";
import { verificarCuenta } from "./controllers/authentication.controller.js";
import { methods as authorization } from "./middlewares/authorization.js";


const app = express();
const PORT = process.env.PORT || 4000;

// Necesario para __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



// Hacemos que la carpeta uploads sea pública
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de la API
app.use("/api", messageRoutes);

// Servir frontend
app.use(express.static(path.join(__dirname, "../../frontend")));

// Ruta raíz → carga el login.html
app.get("/", (req, res) => {    
  res.sendFile(path.join(__dirname, "../../frontend/pages", "login.html"));
});


app.get("/register", (req, res) => {    
  res.sendFile(path.join(__dirname, "../../frontend/pages", "register.html"));
});
app.get("/verificar/:token", (req, res) => {
  verificarCuenta(req, res);
});

app.get("/admin",authorization.soloAdmin, (req, res) => {    
  res.sendFile(path.join(__dirname, "../../frontend/pages/admin", "menu.html"));
});


app.get("/gestionmensajes",authorization.soloAdmin, authorization.verificarPermiso("Gestión de Mensajes"), (req, res) => {    
  res.sendFile(path.join(__dirname, "../../frontend/pages/admin", "gestion mensajes.html"));
});
app.get("/admin/creacionmensajes",authorization.soloAdmin, authorization.verificarPermiso("Crear Mensaje"), (req, res) => {    
  res.sendFile(path.join(__dirname, "../../frontend/pages/admin", "creacion mensajes.html"));
});
app.get("/admin/perfil",authorization.soloAdmin, authorization.verificarPermiso("Gestión de Perfil"), (req, res) => {    
  res.sendFile(path.join(__dirname, "../../frontend/pages/admin", "gestion de perfil.html"));
});
app.get("/admin/detallemensajes",authorization.soloAdmin, (req, res) => {    
  res.sendFile(path.join(__dirname, "../../frontend/pages/admin", "detalle mensajes.html"));
});
app.get("/views_message", (req, res) => {    
  res.sendFile(path.join(__dirname, "../../frontend/pages", "views_mensajes.html"));
});

// Levantar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});