import pkg from "pg";
const { Pool } = pkg;

export const dbSettings = {
    // Configuración de base de datos - ajustar según necesidades
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'tripiapp',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: { rejectUnauthorized: false } // Si tu proveedor lo requiere
};

const pool = new Pool(dbSettings);

export const getConnection = () => pool;

export { pkg as pg };