const express = require('express');
const cors = require('cors');
const app = express();

// Necesario para que el límite de intentos identifique correctamente la IP de
// cada visitante. Railway pone la app detrás de 2 saltos de proxy (su borde +
// su enrutador interno); con solo 1 (el valor anterior), Express calculaba la
// misma IP para TODAS las personas, y el límite de intentos terminaba siendo
// un cupo compartido por todo el sitio en vez de uno por persona — esto fue
// lo que causó que casi todos vieran "demasiados intentos" desde su primer clic.
app.set('trust proxy', 2);

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

app.use('/estado', require('./routes/estado'));
app.use('/cola', require('./routes/cola'));
app.use('/horarios', require('./routes/horarios'));
app.use('/registros', require('./routes/registros'));
app.use('/citas', require('./routes/citas'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API corriendo en puerto ${PORT}`));
