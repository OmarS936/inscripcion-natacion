const express = require('express');
const router = express.Router();
const {
  APERTURA_INSCRIPCIONES,
  CIERRE_INSCRIPCIONES,
  estadoInscripciones,
} = require('../config');

// Le dice al frontend en qué momento están las inscripciones: 'antes', 'abierto' o 'cerrado',
// y cuándo abren/cierran. Manda también la hora del servidor, para que las cuentas
// regresivas no dependan del reloj (a veces desajustado) del celular de cada persona.
router.get('/', (req, res) => {
  res.set('Cache-Control', 'no-store');
  const estado = estadoInscripciones();
  res.json({
    estado,
    abierto: estado === 'abierto',
    apertura: APERTURA_INSCRIPCIONES,
    cierre: CIERRE_INSCRIPCIONES,
    ahora: new Date().toISOString(),
  });
});

module.exports = router;
