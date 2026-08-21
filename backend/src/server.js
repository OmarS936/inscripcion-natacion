const express = require('express');
const cors = require('cors');
const app = express();

// Necesario para que el límite de intentos identifique correctamente
// la IP de cada visitante cuando la app está detrás del proxy de Railway
app.set('trust proxy', 1);

// Orígenes permitidos: el frontend real en producción, y tu entorno local
// de pruebas (Vite corre por default en el puerto 5173)
const ORIGENES_PERMITIDOS = [
  'https://inscripcion-natacion.vercel.app',
  'http://localhost:5173',
];

app.use(cors({
  origin: ORIGENES_PERMITIDOS,
}));
app.use(express.json());

app.use('/horarios', require('./routes/horarios'));
app.use('/registros', require('./routes/registros'));
app.use('/citas', require('./routes/citas'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API corriendo en puerto ${PORT}`));
