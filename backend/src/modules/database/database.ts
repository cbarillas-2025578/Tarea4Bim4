import { Pool } from "pg";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

export const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || "control_gastos",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "admin",
});

export async function initDatabase(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(150) NOT NULL,
      email VARCHAR(200) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS expenses (
      id SERIAL PRIMARY KEY,
      amount NUMERIC(12, 2) NOT NULL,
      category VARCHAR(100) NOT NULL,
      transaction_date TIMESTAMP NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ingresos (
      id SERIAL PRIMARY KEY,
      amount NUMERIC(12, 2) NOT NULL,
      source VARCHAR(100) NOT NULL,
      description VARCHAR(255) DEFAULT '',
      transaction_date TIMESTAMP NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS categorias (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      type VARCHAR(20) NOT NULL DEFAULT 'expense',
      color VARCHAR(20) NOT NULL DEFAULT '#38BDF8',
      icon VARCHAR(10) NOT NULL DEFAULT '📁',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  const defaultEmail = "Benjamin@gmail.com";
  const existing = await pool.query("SELECT id FROM usuarios WHERE email = $1", [defaultEmail]);

  if (existing.rows.length === 0) {
    const hashedPassword = await bcrypt.hash("Benjamin34gt", 10);
    await pool.query(
      "INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3)",
      ["Benjamin", defaultEmail, hashedPassword]
    );
    console.log("Usuario por defecto creado: Benjamin@gmail.com");
  }
}
