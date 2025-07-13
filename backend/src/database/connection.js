import pkg from "pg";
const { Pool } = pkg;

export const dbSettings = {
    OLLAMA_BASE_URL : process.env.OLLAMA_BASE_URL || '',
    OLLAMA_MODEL : process.env.OLLAMA_MODEL || 'qwen3:1.7b',
    ssl: { rejectUnauthorized: false } // Si tu proveedor lo requiere
};

const pool = new Pool(dbSettings);

export const getConnection = () => pool;

export { pkg as pg };