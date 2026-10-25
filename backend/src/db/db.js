// Conexión a la base de datos SQLite usando el módulo nativo de Node.js
// DB_PATH permite apuntar a una ruta distinta en producción (ej. un volumen
// persistente en /data). Si no está definida, usa la ruta local de siempre.
const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', '..', 'inscripcion_natacion.db');
const db = new DatabaseSync(dbPath);
db.exec('PRAGMA foreign_keys = ON');

// Tabla de la sala de espera. Se crea sola si no existe, para no depender de
// correr una migración a mano sobre la base de datos ya en producción.
db.exec(`
  CREATE TABLE IF NOT EXISTS cola (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    token      TEXT NOT NULL UNIQUE,
    creado_en  TEXT NOT NULL
  )
`);

module.exports = db;
