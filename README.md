# App de inscripción — Natación

App aislada para apartar horario de Natación y agendar cita de atención,
sin tener que ir presencialmente solo para ver disponibilidad.

**En producción:**
- Frontend: https://inscripcion-natacion.vercel.app
- Backend (API): https://inscripcion-natacion-production.up.railway.app

## Estructura

```
proyecto/
├── backend/           API en Node.js + Express + SQLite nativo (node:sqlite)
│   ├── schema.sql      tablas + cupo inicial de ejemplo
│   ├── scripts/
│   │   ├── init-db.js          crea la base de datos desde cero (SOLO la primera vez)
│   │   └── actualizar-cupo.js  ajusta el cupo real de horarios y citas
│   └── src/
│       ├── server.js           arranque del servidor, CORS
│       ├── config.js           reglas de negocio editables a mano (ver abajo)
│       ├── db/db.js            conexión a la base de datos
│       └── routes/
│           ├── estado.js       ¿están abiertas las inscripciones?
│           ├── horarios.js     disponibilidad de clases por categoría
│           ├── citas.js        fechas y franjas de cita disponibles
│           └── registros.js    crea el folio + horarios + cita (todo junto)
└── frontend/          React + Vite, el formulario que usa la gente
    └── src/App.jsx
```

## Cómo funciona, en resumen

1. La persona elige categoría (Adultos / Infantil-Juvenil), horario(s) y días — hasta 3 horarios distintos.
2. Escribe su CURP (se valida el formato) y agenda una cita de atención para entregar documentos.
3. Al confirmar, el servidor crea el folio, reserva los horarios y agenda la cita **en una sola operación**: si algo falla, no queda nada a medias.
4. El precio de la mensualidad lo calcula el propio servidor a partir de los horarios elegidos — nunca se confía en lo que mande el navegador.
5. Antes de la hora de apertura, o después del cierre, el servidor no publica cupo ni acepta registros, aunque alguien intente saltarse la página.
6. Si hay mucha gente conectada al abrir, cada quien toma un turno en una **sala de espera** y se le va dejando pasar por grupos, en el orden en que llegó — el servidor también revisa esto antes de aceptar un registro, no solo la pantalla.
7. Si se acaba el cupo de horarios de actividad, o el de citas de atención (lo que se agote primero), las inscripciones se cierran solas — aunque el otro recurso todavía tenga lugares. Esto evita que alguien llene todo el formulario y se quede sin poder terminar por falta de cita, o de horario.

## Reglas de negocio editables — `backend/src/config.js`

Todo esto se cambia editando ese archivo y subiendo el cambio con `git push` (no se toca la base de datos):

- **`FECHAS_CITA_PERMITIDAS`** — en qué fechas exactas se ofrecen citas de atención (normalmente 1 día al mes).
- **`APERTURA_INSCRIPCIONES`** / **`CIERRE_INSCRIPCIONES`** — momento exacto (hora de la Ciudad de México) en que abren y cierran las inscripciones. En `null`, no hay límite. Fuera de esa ventana, la página se lo dice a la gente sola, sin que nadie tenga que hacer nada.
- **`SALA_ESPERA_ACTIVA`** — `true` para activar la fila de espera al abrir, `false` para que todos entren directo.
- **`SALA_ESPERA_PERSONAS_POR_GRUPO`** / **`SALA_ESPERA_INTERVALO_MS`** — cuánta gente se deja pasar y cada cuánto tiempo. Por ejemplo, 8 personas cada 4000 ms (4 segundos) deja pasar a 120 personas por minuto.

El turno de cada persona es un código aleatorio de 48 caracteres (no un número consecutivo adivinable), guardado en su navegador. Una vez que le toca su turno, lo conserva para siempre — así que si quiere registrar a más de una persona (pareja, hijos), no tiene que volver a formarse entre un registro y otro, siempre que lo haga desde el mismo dispositivo.

## Cupo — `backend/scripts/actualizar-cupo.js`

El cupo de cada horario de clase y cada franja de cita se define **a mano**, no se calcula solo. Para cambiarlo:

1. Edita los números en `actualizar-cupo.js`.
2. `git add . && git commit -m "..." && git push` (sube el código, Railway se redespliega).
3. En la **Console de Railway**, corre `npm run actualizar-cupo` — esto sí aplica los números a la base de datos real. Sin este paso, el cambio no se ve reflejado aunque ya esté en GitHub.

**Nunca corras `npm run init-db` sobre la base de datos de producción una vez que haya gente registrada real** — recrea las tablas desde cero y borra todo. Ese comando es solo para la primera vez, o para tu base de datos local de pruebas.

## Correrlo en tu computadora, para probar

**Backend:**
1. Instala [Node.js](https://nodejs.org) versión 22 o más nueva (en Windows, si `npm` da un error de "ejecución de scripts deshabilitada", corre `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` en PowerShell como administrador, una sola vez)
2. Dentro de `backend/`: `npm install`, luego `npm run init-db`, luego `npm start`
3. La API queda en `http://localhost:3000`

**Frontend**, en otra terminal (deja el backend corriendo):
1. En `frontend/src/App.jsx`, cambia temporalmente `API_URL` a `"http://localhost:3000"` (está comentada la línea, solo hay que intercambiarlas)
2. Dentro de `frontend/`: `npm install`, luego `npm run dev`
3. Ábrelo en `http://localhost:5173`
4. **Antes de subir cualquier cambio a GitHub, regresa `API_URL` a la URL de Railway** — si no, la app pública se queda apuntando a tu compu.

## Desplegar desde cero (si algún día hay que rehacerlo)

**Backend, en Railway:**
1. [railway.app](https://railway.app) → cuenta con GitHub → "New Project" → "Deploy from GitHub repo" → elige el repositorio
2. En "Settings" del servicio: **Root Directory = `backend`**
3. Agrega un volumen (Add → Volume → conéctalo al servicio) con **mount path `/data`** — es donde vive el archivo de la base de datos, para que sobreviva a cada redeploy
4. En "Variables", agrega `DB_PATH` = `/data/inscripcion_natacion.db`
5. En "Settings" → "Networking" → "Generate Domain" para obtener la URL pública
6. En la **Console**, corre `npm run init-db` una sola vez, para crear las tablas

**Frontend, en Vercel:**
1. [vercel.com](https://vercel.com) → cuenta con GitHub → "Add New" → "Project" → mismo repositorio
2. Root Directory = `frontend` (Vercel detecta solo que es Vite)
3. Deploy — te da la URL pública

**Después de tener ambas URLs:** en `backend/src/server.js`, agrega la URL de Vercel a `ORIGENES_PERMITIDOS` (para que el navegador deje que el frontend y la API se hablen), y en `frontend/src/App.jsx` pon la URL de Railway en `API_URL`.

## Cosas a tener presentes

- **Consultar quién se ha registrado**, desde la Console de Railway, con `node:sqlite` directo — no hay un script guardado para esto todavía, los comandos exactos quedaron en el historial de la conversación con Claude.
- **La base de datos vive en el volumen de Railway** (`/data`), separada del código — un `git push` nunca la borra.
- **No hay respaldo automático todavía.** Es la mejora pendiente más importante: si el volumen falla, no hay copia de seguridad.
- **El límite de intentos (`registros.js`) identifica a cada persona por su IP real**, no por una compartida — esto se corrigió después de que, en la apertura de septiembre 2026, un ajuste incorrecto de "trust proxy" hacía que el servidor viera la misma IP para todos los visitantes, bloqueando a casi todos con "demasiados intentos" desde su primer intento.
- **CORS solo deja pasar** a la URL de Vercel y a `localhost:5173` (para pruebas locales) — cualquier otro sitio es rechazado.
- **Railway, plan Hobby ($5/mes):** con el volumen real de uso, el gasto mensual ronda los $0.15-0.20, muy por debajo del cupo incluido.
