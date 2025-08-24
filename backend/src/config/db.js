import { config } from 'dotenv';
import pg from 'pg';

config();


const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false, // Para evitar problemas en despliegues
    },
});

pool.on('error', (err) => {
    console.error('Error en la conexión con la base de datos:', err);
});

export default pool;
