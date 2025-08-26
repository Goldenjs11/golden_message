// backend/src/config/db.js
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración para __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env desde la raíz del proyecto
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Verificar si DATABASE_URL está definido
if (!process.env.DATABASE_URL) {
  console.error("❌ Error: DATABASE_URL no está definido en el archivo .env");
  process.exit(1); // Sale del proceso
}

console.log("✅ DATABASE_URL detectada correctamente");

// Configurar Pool de PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
// Manejo de errores global del pool
pool.on('error', (err) => {
  console.error('⚠️ Error en la conexión con la base de datos:', err.message);
});

// Probar conexión al iniciar
(async () => {
  try {
    const client = await pool.connect();
    console.log('🚀 Conexión exitosa a la base de datos');
    client.release();
  } catch (err) {
    console.error('❌ No se pudo conectar a la base de datos:', err.message);
    console.error('💡 Verifica que PostgreSQL esté activo, el usuario y contraseña sean correctos, y que el puerto 5432 esté disponible.');
    process.exit(1);
  }
})();

export default pool;
