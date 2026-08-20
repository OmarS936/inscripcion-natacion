const express = require('express');
const cors = require('cors');
const app = express();

// Necesario para que el límite de intentos identifique correctamente
// la IP de cada visitante cuando la app está detrás del proxy de Railway
app.set('trust proxy', 1);

app.use(cors());
app.use(express.json());

app.use('/horarios', require('./routes/horarios'));
app.use('/registros', require('./routes/registros'));
app.use('/citas', require('./routes/citas'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API corriendo en puerto ${PORT}`));
