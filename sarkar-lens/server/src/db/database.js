import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dbDir = path.join(root, 'data');
fs.mkdirSync(dbDir, { recursive: true });
const db = new Database(path.join(dbDir, 'sarkar-lens.sqlite'));
db.pragma('journal_mode = WAL');

db.exec(`CREATE TABLE IF NOT EXISTS services (id TEXT PRIMARY KEY, data TEXT NOT NULL);\nCREATE TABLE IF NOT EXISTS progress (session_id TEXT NOT NULL, service_id TEXT NOT NULL, status TEXT NOT NULL, PRIMARY KEY(session_id, service_id));`);

export function seedServices(services){
  const stmt=db.prepare('INSERT OR REPLACE INTO services(id,data) VALUES(?,?)');
  const tx=db.transaction(items=>items.forEach(s=>stmt.run(s.id,JSON.stringify(s)))); tx(services);
}
export function getServices(){ return db.prepare('SELECT data FROM services').all().map(r=>JSON.parse(r.data)); }
export function setProgress(sessionId, serviceId, status){ db.prepare('INSERT OR REPLACE INTO progress(session_id,service_id,status) VALUES(?,?,?)').run(sessionId,serviceId,status); }
export function getProgress(sessionId){ return db.prepare('SELECT service_id,status FROM progress WHERE session_id=?').all(sessionId); }
