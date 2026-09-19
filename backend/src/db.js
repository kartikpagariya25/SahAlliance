import Database from "better-sqlite3";

const db = new Database("sahalliance.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    circle_id INTEGER,
    loan_id INTEGER,
    address TEXT,
    amount TEXT,
    purpose TEXT,
    tx_hash TEXT UNIQUE,
    timestamp INTEGER
  );

  CREATE TABLE IF NOT EXISTS circles (
    id INTEGER PRIMARY KEY,
    name TEXT,
    pot_balance TEXT
  );
`);

export default db;
