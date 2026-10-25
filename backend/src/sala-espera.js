// Lógica de la sala de espera, compartida entre la ruta de consulta (cola.js)
// y el registro (registros.js), para que ambas usen exactamente el mismo cálculo.
//
// El "token" es un código aleatorio de 48 caracteres que identifica el turno
// de una persona — no es adivinable, a diferencia de un número consecutivo.
// El orden real de la fila (quién llegó antes) se sigue llevando por dentro
// con el id autoincremental de la tabla, pero ese número nunca sale del servidor.
const db = require('./db/db');
const { SALA_ESPERA_PERSONAS_POR_GRUPO, SALA_ESPERA_INTERVALO_MS } = require('./config');

// Cuántas personas ya deberían haber sido admitidas, según cuánto tiempo pasó
// desde que se formó la primera persona en la fila.
function calcularAdmitidos() {
  const primera = db.prepare('SELECT MIN(creado_en) AS min FROM cola').get().min;
  if (!primera) return 0;
  const transcurrido = Date.now() - new Date(primera).getTime();
  const grupos = Math.floor(Math.max(0, transcurrido) / SALA_ESPERA_INTERVALO_MS) + 1;
  return grupos * SALA_ESPERA_PERSONAS_POR_GRUPO;
}

// Posición en la fila (1 = primer lugar) del turno con ese token, o null si no existe.
function posicionDe(token) {
  const fila = db.prepare('SELECT id FROM cola WHERE token = ?').get(token);
  if (!fila) return null;
  return db.prepare('SELECT COUNT(*) AS n FROM cola WHERE id <= ?').get(fila.id).n;
}

function yaEsSuTurno(token) {
  const posicion = posicionDe(token);
  if (posicion === null) return false;
  return posicion <= calcularAdmitidos();
}

module.exports = { calcularAdmitidos, posicionDe, yaEsSuTurno };
