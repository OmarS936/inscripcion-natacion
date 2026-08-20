// Conexión a la base de datos SQLite usando el módulo nativo de Node.js
// (no requiere instalar ni compilar nada adicional)
const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const db = new DatabaseSync(path.join(__dirname, '..', '..', 'inscripcion_natacion.db'));
db.exec('PRAGMA foreign_keys = ON');

module.exports = db;
