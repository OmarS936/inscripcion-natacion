// Configuración de reglas de negocio que se ajustan a mano, mes a mes.

// Fechas en las que SÍ se ofrecen citas de atención (normalmente 1 lunes al mes,
// dentro de la ventana de inscripción). Agrega aquí las próximas fechas conforme
// se vayan definiendo — formato 'YYYY-MM-DD'.
const FECHAS_CITA_PERMITIDAS = [
   '2026-08-24',
   //'2026-08-25',
];

function esDiaDeCitaPermitido(fechaStr) {
  return FECHAS_CITA_PERMITIDAS.includes(fechaStr);
}

module.exports = {
  FECHAS_CITA_PERMITIDAS,
  esDiaDeCitaPermitido,
};
