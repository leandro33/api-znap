import dotenv from "dotenv";
import mysql from "mysql2/promise";
//import { logger } from "../logger";
dotenv.config();

export const pool = mysql.createPool({
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: false
});

// valida no boot
(async () => {
    try {
        const conn = await pool.getConnection();
        await conn.query("SELECT 1");
        conn.release();
        //logger.info("db ok (mysql)");
    } catch (err) {
        //logger.error({ err }, "db connection failed (mysql)");
    }
})();

export async function query<T = any>(sql: string, params?: any[]) {
    const [rows] = await pool.execute(sql, params);
    return rows as T[];
}
