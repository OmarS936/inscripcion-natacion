// Utilidades de hora para las citas. Todo se compara en hora de la Ciudad de
// México (UTC-6, sin horario de verano), sin importar en qué zona esté el servidor.

// 'YYYY-MM-DD HH:MM:SS' en hora CDMX
function ahoraCDMX() {
  return new Date().toLocaleString('sv-SE', { timeZone: 'America/Mexico_City' });
}

function fechaHoyCDMX() {
  return ahoraCDMX().slice(0, 10);
}

// ¿La franja de esa fecha ya empezó (o ya pasó)? hora_inicio viene como 'HH:MM'
function franjaYaPaso(fecha, horaInicio) {
  return `${fecha} ${horaInicio}` <= ahoraCDMX().slice(0, 16);
}

module.exports = { ahoraCDMX, fechaHoyCDMX, franjaYaPaso };
