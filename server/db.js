// server/db.js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function initDb() {
  const db = await open({
    filename: './sustainability.db',
    driver: sqlite3.Database,
  });

  // audits table (already there)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS audits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      measured_co2 REAL NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);

  // <-- NEW goals table -->
  await db.exec(`
    CREATE TABLE IF NOT EXISTS goals (
      url TEXT PRIMARY KEY,
      sustainability_goal REAL NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  return db;
}
