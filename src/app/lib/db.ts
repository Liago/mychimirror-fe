import mysql, { Pool } from "mysql2/promise";

let pool: Pool | null = null;

export function getDbPool(): Pool {
	if (!pool) {
		const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
		if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
			throw new Error(
				"Configurazione DB mancante: verifica DB_HOST, DB_USER, DB_PASSWORD, DB_NAME nel file .env"
			);
		}
		pool = mysql.createPool({
			host: DB_HOST,
			port: Number(DB_PORT) || 3306,
			user: DB_USER,
			password: DB_PASSWORD,
			database: DB_NAME,
			connectionLimit: 5,
			charset: "utf8mb4",
		});
	}
	return pool;
}
