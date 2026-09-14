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
      password VARCHAR(255),
      google_sub VARCHAR(200) UNIQUE,
      avatar VARCHAR(500),
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS google_sub VARCHAR(200) UNIQUE");
  await pool.query("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS avatar VARCHAR(500)");
  await pool.query("ALTER TABLE usuarios ALTER COLUMN password DROP NOT NULL");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS expenses (
      id SERIAL PRIMARY KEY,
      amount NUMERIC(12, 2) NOT NULL,
      category VARCHAR(100) NOT NULL,
      transaction_date TIMESTAMP NOT NULL,
      user_id INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query("ALTER TABLE expenses ADD COLUMN IF NOT EXISTS user_id INTEGER NOT NULL DEFAULT 1");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ingresos (
      id SERIAL PRIMARY KEY,
      amount NUMERIC(12, 2) NOT NULL,
      source VARCHAR(100) NOT NULL,
      description VARCHAR(255) DEFAULT '',
      transaction_date TIMESTAMP NOT NULL,
      user_id INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query("ALTER TABLE ingresos ADD COLUMN IF NOT EXISTS user_id INTEGER NOT NULL DEFAULT 1");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS categorias (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      type VARCHAR(20) NOT NULL DEFAULT 'expense',
      color VARCHAR(20) NOT NULL DEFAULT '#38BDF8',
      icon VARCHAR(10) NOT NULL DEFAULT '📁',
      user_id INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query("ALTER TABLE categorias ADD COLUMN IF NOT EXISTS user_id INTEGER NOT NULL DEFAULT 1");
  await pool.query("ALTER TABLE categorias DROP CONSTRAINT IF EXISTS categorias_name_key");
  await pool.query("CREATE UNIQUE INDEX IF NOT EXISTS uq_categorias_user_name ON categorias (user_id, name)");

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
