const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const db = require('../db/db');

// Patrón oficial de la CURP: 4 letras, 6 dígitos de fecha, sexo (H/M),
// 2 letras de entidad, 3 consonantes, 1 alfanumérico diferenciador, 1 dígito verificador
const CURP_REGEX = /^[A-Z]{1}[AEIOUX]{1}[A-Z]{2}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HM](AS|BC|BS|CC|CS|CH|CL|CM|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QO|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d]\d$/;

// Límite de intentos: evita que alguien use este endpoint para "adivinar"
// qué CURPs ya están registradas probando muchas seguidas
const limitarIntentos = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 15,                   // máximo 15 intentos por IP en esa ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.' },
});

// Mismo catálogo que usa el frontend para mostrar el precio, pero aquí
// es el que realmente decide qué se guarda — nunca se confía en el precio
// que manda el cliente.
const PRECIO_MENSUALIDAD = { 1: 220, 2: 363, 3: 564, 4: 706, 5: 823, 6: 965, 7: 1094 };

function precioPorDias(n) {
  if (n <= 0) return 0;
  return PRECIO_MENSUALIDAD[Math.min(n, 7)];
}

function generarFolio(curp) {
  const anio = new Date().getFullYear();
  const sufijo = curp.slice(-4);
  const aleatorio = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `NAT-${anio}-${sufijo}-${aleatorio}`;
}

// Crea el registro (folio + horarios) Y la cita en una sola operación atómica:
// si cualquier parte falla, no queda nada a medias (ni folio huérfano sin cita).
router.post('/', limitarIntentos, (req, res) => {
  const { curp, horarios, mensualidad_total, fecha, cupo_cita_id } = req.body;

  if (!curp || !horarios || horarios.length === 0 || !fecha || !cupo_cita_id) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  const curpNormalizada = curp.trim().toUpperCase();
  if (!CURP_REGEX.test(curpNormalizada)) {
    return res.status(400).json({ error: 'La CURP no tiene un formato válido' });
  }

  try {
    db.exec('BEGIN');

    // CURP duplicada
    const yaExiste = db.prepare('SELECT 1 FROM registro WHERE curp = ?').get(curpNormalizada);
    if (yaExiste) {
      throw new Error('Ya existe un registro con esta CURP');
    }

    // Máximo de horarios distintos
    const placeholders = horarios.map(() => '?').join(',');
    const horasDistintas = db.prepare(`
      SELECT COUNT(DISTINCT hora_inicio) AS total
      FROM cupo_horario
      WHERE id IN (${placeholders})
    `).get(...horarios);
    if (horasDistintas.total > 3) {
      throw new Error('Máximo 3 horarios distintos por alumno');
    }

    // Cupo de cada horario de actividad
    for (const cupoHorarioId of horarios) {
      const info = db.prepare(`
        SELECT ch.cupo_maximo - COUNT(rh.id) AS disponible
        FROM cupo_horario ch
        LEFT JOIN registro_horario rh ON rh.cupo_horario_id = ch.id
        WHERE ch.id = ?
        GROUP BY ch.id
      `).get(cupoHorarioId);
      if (!info || info.disponible <= 0) {
        throw new Error(`Sin cupo disponible en el horario ${cupoHorarioId}`);
      }
    }

    // Cupo de la franja de cita
    const infoCita = db.prepare(`
      SELECT cc.cupo_maximo - COUNT(c.id) AS disponible
      FROM cupo_cita cc
      LEFT JOIN cita c ON c.cupo_cita_id = cc.id AND c.fecha = ? AND c.estatus != 'cancelada'
      WHERE cc.id = ?
      GROUP BY cc.id
    `).get(fecha, cupo_cita_id);
    if (!infoCita || infoCita.disponible <= 0) {
      throw new Error('Sin cupo disponible en esa franja de cita');
    }

    // Precio real: se calcula aquí a partir de los horarios elegidos,
    // NUNCA se usa el mensualidad_total que mandó el cliente.
    const filasHorario = db.prepare(`
      SELECT hora_inicio FROM cupo_horario WHERE id IN (${placeholders})
    `).all(...horarios);
    const diasPorHora = {};
    for (const fila of filasHorario) {
      diasPorHora[fila.hora_inicio] = (diasPorHora[fila.hora_inicio] || 0) + 1;
    }
    const mensualidadCalculada = Object.values(diasPorHora)
      .reduce((suma, dias) => suma + precioPorDias(dias), 0);

    // Todo validado: se crea folio, horarios y cita juntos
    const folio = generarFolio(curpNormalizada);
    db.prepare(`INSERT INTO registro (folio, curp, mensualidad_total) VALUES (?, ?, ?)`)
      .run(folio, curpNormalizada, mensualidadCalculada);

    const insertarHorario = db.prepare(`INSERT INTO registro_horario (folio, cupo_horario_id) VALUES (?, ?)`);
    for (const cupoHorarioId of horarios) {
      insertarHorario.run(folio, cupoHorarioId);
    }

    db.prepare(`INSERT INTO cita (folio, fecha, cupo_cita_id) VALUES (?, ?, ?)`)
      .run(folio, fecha, cupo_cita_id);

    db.exec('COMMIT');
    res.status(201).json({ folio });
  } catch (err) {
    db.exec('ROLLBACK');
    res.status(409).json({ error: err.message });
  }
});

module.exports = router;
