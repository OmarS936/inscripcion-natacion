// Cierre automático por agotamiento de cupo: si ya no queda ningún horario de
// actividad con lugar, O ya no queda ninguna cita de atención con lugar (en
// cualquiera de las fechas de cita vigentes), las inscripciones se consideran
// cerradas aunque todavía no haya llegado la hora de CIERRE_INSCRIPCIONES.
// Esto evita que alguien llegue hasta el final del formulario sin poder
// terminar por falta del otro recurso.
const db = require('./db/db');
const { estadoInscripciones, FECHAS_CITA_PERMITIDAS } = require('./config');
const { ahoraCDMX } = require('./franjas');

function hayHorariosDisponibles() {
  const fila = db.prepare(`
    SELECT EXISTS(
      SELECT 1 FROM cupo_horario ch
      LEFT JOIN registro_horario rh ON rh.cupo_horario_id = ch.id
      GROUP BY ch.id
      HAVING ch.cupo_maximo - COUNT(rh.id) > 0
    ) AS hay
  `).get();
  return !!fila.hay;
}

function hayCitasDisponibles() {
  // Hora de México, no UTC; y solo cuentan franjas que todavía no empiezan
  const ahora = ahoraCDMX().slice(0, 16);
  const hoy = ahora.slice(0, 10);
  const fechasFuturas = FECHAS_CITA_PERMITIDAS.filter((f) => f >= hoy);
  for (const fecha of fechasFuturas) {
    const fila = db.prepare(`
      SELECT EXISTS(
        SELECT 1 FROM cupo_cita cc
        LEFT JOIN cita c ON c.cupo_cita_id = cc.id AND c.fecha = ? AND c.estatus != 'cancelada'
        WHERE (? || ' ' || cc.hora_inicio) > ?
        GROUP BY cc.id
        HAVING cc.cupo_maximo - COUNT(c.id) > 0
      ) AS hay
    `).get(fecha, fecha, ahora);
    if (fila.hay) return true;
  }
  return false;
}

// 'antes' | 'abierto' | 'agotado' (sin horarios o sin citas) | 'cerrado'
function estadoCompleto() {
  const base = estadoInscripciones();
  if (base !== 'abierto') return base;
  if (!hayHorariosDisponibles() || !hayCitasDisponibles()) return 'agotado';
  return 'abierto';
}

module.exports = { hayHorariosDisponibles, hayCitasDisponibles, estadoCompleto };
