const express = require('express');
const router = express.Router();
const db = require('../db/db');
const { FECHAS_CITA_PERMITIDAS, esDiaDeCitaPermitido } = require('../config');
const { fechaHoyCDMX, franjaYaPaso } = require('../franjas');

// Devuelve las fechas de cita configuradas que todavía no han pasado
router.get('/fechas', (req, res) => {
  const hoy = fechaHoyCDMX();
  const fechasFuturas = FECHAS_CITA_PERMITIDAS.filter((f) => f >= hoy).sort();
  res.json(fechasFuturas);
});

router.get('/disponibilidad', (req, res) => {
  const { fecha } = req.query;

  if (!fecha || !esDiaDeCitaPermitido(fecha)) {
    return res.json([]);
  }

  const stmt = db.prepare(`
    SELECT
      cc.id, cc.hora_inicio, cc.cupo_maximo,
      cc.cupo_maximo - COUNT(c.id) AS cupo_disponible
    FROM cupo_cita cc
    LEFT JOIN cita c ON c.cupo_cita_id = cc.id AND c.fecha = ? AND c.estatus != 'cancelada'
    GROUP BY cc.id
    ORDER BY cc.hora_inicio
  `);
  // Las franjas que ya empezaron no se ofrecen
  res.json(stmt.all(fecha).filter((f) => !franjaYaPaso(fecha, f.hora_inicio)));
});

module.exports = router;
