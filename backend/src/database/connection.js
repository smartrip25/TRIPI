import pkg from "pg";
const { Pool } = pkg;
import config from "../config.js";

export const dbSettings = {
    port: config.port,
    ssl: { rejectUnauthorized: false }, // Si tu proveedor lo requiere
};

const pool = new Pool(dbSettings);

export const getConnection = () => pool;

export { pkg as pg };