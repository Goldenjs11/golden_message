// Cambia 'import { config } from 'dotenv';' por require
const dotenv = require('dotenv');
dotenv.config();

// Ya tenías esto, que es correcto para CommonJS
const { Pool } = require('pg'); 

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.on('error', (err) => {
    console.error('Error en la conexión con la base de datos:', err);
});

// Cambia 'export default pool;' por module.exports
module.exports = pool;