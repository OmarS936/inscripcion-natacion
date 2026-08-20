const express = require('express');
const router = express.Router();
const db = require('../db/db');

router.get('/', (req, res) => {
  const { categoria } = req.query;
  const stmt = db.prepare(`
    SELECT
      ch.id, ch.dia_semana, ch.hora_inicio, ch.categoria, ch.cupo_maximo,
      ch.cupo_maximo - COUNT(rh.id) AS cupo_disponible
    FROM cupo_horario ch
    LEFT JOIN registro_horario rh ON rh.cupo_horario_id = ch.id
    WHERE ch.categoria = ?
    GROUP BY ch.id
    ORDER BY
      ch.hora_inicio,
      CASE ch.dia_semana
        WHEN 'lunes' THEN 1
        WHEN 'martes' THEN 2
        WHEN 'miercoles' THEN 3
        WHEN 'jueves' THEN 4
        WHEN 'viernes' THEN 5
        WHEN 'sabado' THEN 6
        WHEN 'domingo' THEN 7
      END
  `);
  res.json(stmt.all(categoria));
});

module.exports = router;
