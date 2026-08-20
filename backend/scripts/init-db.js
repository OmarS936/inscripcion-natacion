// Crea la base de datos a partir de schema.sql, usando el SQLite nativo de Node.js
const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', '..', 'schema.sql');
const dbPath = path.join(__dirname, '..', 'inscripcion_natacion.db');

const sql = fs.readFileSync(schemaPath, 'utf8');
const db = new DatabaseSync(dbPath);
db.exec(sql);
db.close();

console.log('Base de datos creada en:', dbPath);
