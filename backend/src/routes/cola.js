const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const db = require('../db/db');
const { estadoInscripciones, SALA_ESPERA_ACTIVA } = require('../config');
const { calcularAdmitidos, posicionDe } = require('../sala-espera');

// Toma un turno nuevo en la fila: se le asigna un código aleatorio (el "ticket"),
// no un número consecutivo, para que nadie pueda adivinar el de otra persona
// ni colarse probando números seguidos.
router.post('/entrar', (req, res) => {
  res.set('Cache-Control', 'no-store');
  if (!SALA_ESPERA_ACTIVA) return res.json({ salaEsperaActiva: false, tuTurno: true });
  if (estadoInscripciones() !== 'abierto') {
    return res.status(403).json({ error: 'Las inscripciones no están abiertas' });
  }
  const token = crypto.randomBytes(24).toString('hex'); // 48 caracteres, imposible de adivinar
  db.prepare('INSERT INTO cola (token, creado_en) VALUES (?, ?)').run(token, new Date().toISOString());
  res.json({ salaEsperaActiva: true, ticket: token });
});

// Consulta la posición de un turno ya tomado, a partir de su ticket.
router.get('/estado', (req, res) => {
  res.set('Cache-Control', 'no-store');
  if (!SALA_ESPERA_ACTIVA) return res.json({ salaEsperaActiva: false, tuTurno: true });

  const ticket = String(req.query.ticket || '');
  if (!/^[a-f0-9]{48}$/.test(ticket)) return res.status(400).json({ error: 'Falta el ticket' });

  const posicion = posicionDe(ticket);
  if (posicion === null) return res.status(404).json({ error: 'Ese turno ya no existe' });

  const admitidos = calcularAdmitidos();
  const total = db.prepare('SELECT COUNT(*) AS n FROM cola').get().n;

  res.json({
    salaEsperaActiva: true,
    posicion,
    totalEnCola: total,
    personasAdelante: Math.max(0, posicion - admitidos),
    tuTurno: posicion <= admitidos,
  });
});

module.exports = router;
