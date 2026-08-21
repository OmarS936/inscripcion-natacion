// Crea la base de datos a partir de schema.sql, usando el SQLite nativo de Node.js
// DB_PATH permite apuntar a una ruta distinta en producción (ej. un volumen persistente).
const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'schema.sql');
const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'inscripcion_natacion.db');

const sql = fs.readFileSync(schemaPath, 'utf8');
const db = new DatabaseSync(dbPath);
db.exec(sql);
db.close();

console.log('Base de datos creada en:', dbPath);
