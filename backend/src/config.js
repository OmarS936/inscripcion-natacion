// Configuración de reglas de negocio que se ajustan a mano, mes a mes.

// Fechas en las que SÍ se ofrecen citas de atención (normalmente 1 lunes al mes,
// dentro de la ventana de inscripción). Agrega aquí las próximas fechas conforme
// se vayan definiendo — formato 'YYYY-MM-DD'.
const FECHAS_CITA_PERMITIDAS = [
   //'2026-09-28',
   '2026-10-26',
   '2026-10-27',
   //'2026-08-25',
];

// Ventana de inscripciones: momento exacto en que abren y en que cierran.
// Hora de la Ciudad de México (UTC-6, ya sin horario de verano), formato 'AAAA-MM-DDTHH:MM:SS-06:00'.
// Déjalas en null para no limitar (null en apertura = ya abierto; null en cierre = sin cierre).
//
// Ejemplo: abren a las 00:00 del 1 de octubre y cierran al terminar el día 5
// (el cierre se pone a las 00:00 del día 6, así el día 5 se cuenta completo):
//   APERTURA_INSCRIPCIONES = '2026-10-01T00:00:00-06:00'
//   CIERRE_INSCRIPCIONES   = '2026-10-06T00:00:00-06:00'
const APERTURA_INSCRIPCIONES = '2026-10-26T00:00:00-06:00';
const CIERRE_INSCRIPCIONES = '2026-10-26T14:00:00-06:00'; // ya está cerrado; cambia esto para la próxima apertura

// Avisa en el log (sin tirar el servidor) si alguna fecha quedó mal escrita
function validarVentana() {
  const ap = APERTURA_INSCRIPCIONES && new Date(APERTURA_INSCRIPCIONES).getTime();
  const ci = CIERRE_INSCRIPCIONES && new Date(CIERRE_INSCRIPCIONES).getTime();
  if (APERTURA_INSCRIPCIONES && Number.isNaN(ap)) console.warn('⚠ APERTURA_INSCRIPCIONES no es una fecha válida:', APERTURA_INSCRIPCIONES);
  if (CIERRE_INSCRIPCIONES && Number.isNaN(ci)) console.warn('⚠ CIERRE_INSCRIPCIONES no es una fecha válida:', CIERRE_INSCRIPCIONES);
  if (ap && ci && ci <= ap) console.warn('⚠ CIERRE_INSCRIPCIONES debe ser posterior a APERTURA_INSCRIPCIONES');
}
validarVentana();

// Devuelve 'antes' (aún no abren), 'abierto' o 'cerrado'
function estadoInscripciones() {
  const ahora = Date.now();
  if (APERTURA_INSCRIPCIONES && ahora < new Date(APERTURA_INSCRIPCIONES).getTime()) return 'antes';
  if (CIERRE_INSCRIPCIONES && ahora >= new Date(CIERRE_INSCRIPCIONES).getTime()) return 'cerrado';
  return 'abierto';
}

function inscripcionesAbiertas() {
  return estadoInscripciones() === 'abierto';
}

// Sala de espera al abrir inscripciones: deja pasar a la gente en grupos,
// en vez de que todos compitan al mismo tiempo por las citas.
// Pon SALA_ESPERA_ACTIVA en false para desactivarla (todos entran directo).
const SALA_ESPERA_ACTIVA = true;
const SALA_ESPERA_PERSONAS_POR_GRUPO = 8;   // cuántas personas se dejan pasar cada vez, ej:1
const SALA_ESPERA_INTERVALO_MS = 4000;       // cada cuántos milisegundos pasa el siguiente grupo, ej:2000000

function esDiaDeCitaPermitido(fechaStr) {
  return FECHAS_CITA_PERMITIDAS.includes(fechaStr);
}

module.exports = {
  FECHAS_CITA_PERMITIDAS,
  esDiaDeCitaPermitido,
  APERTURA_INSCRIPCIONES,
  CIERRE_INSCRIPCIONES,
  estadoInscripciones,
  inscripcionesAbiertas,
  SALA_ESPERA_ACTIVA,
  SALA_ESPERA_PERSONAS_POR_GRUPO,
  SALA_ESPERA_INTERVALO_MS,
};
