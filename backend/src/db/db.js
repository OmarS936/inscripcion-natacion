// Conexión a la base de datos SQLite usando el módulo nativo de Node.js
// DB_PATH permite apuntar a una ruta distinta en producción (ej. un volumen
// persistente en /data). Si no está definida, usa la ruta local de siempre.
const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', '..', 'inscripcion_natacion.db');
const db = new DatabaseSync(dbPath);
db.exec('PRAGMA foreign_keys = ON');

module.exports = db;