# App de inscripción — Natación

App aislada para apartar horario de Natación y agendar cita de atención,
sin tener que ir presencialmente solo para ver disponibilidad.

## Estructura

- `schema.sql` — script de la base de datos (SQLite): tablas + cupo inicial
- `backend/` — API en Node.js + Express, usa el SQLite nativo de Node (`node:sqlite`, sin dependencias que compilar)

## Correrlo en tu computadora (para probar)

1. Instala [Node.js](https://nodejs.org) versión 22 o más nueva
2. Abre una terminal dentro de `backend/` y corre:
   ```
   npm install
   ```
3. Crea la base de datos con los datos iniciales:
   ```
   npm run init-db
   ```
4. Levanta el servidor:
   ```
   npm start
   ```
5. La API queda disponible en `http://localhost:3000`

## Subir esto a GitHub

1. Crea una cuenta en [github.com](https://github.com) si no tienes una
2. En GitHub, da clic en "New repository", ponle un nombre (ej. `inscripcion-natacion`), y NO marques "Add a README"
3. En tu computadora, dentro de esta carpeta del proyecto, corre:
   ```
   git init
   git add .
   git commit -m "Primera versión"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/inscripcion-natacion.git
   git push -u origin main
   ```

## Desplegar en Railway (para que quede en línea)

1. Entra a [railway.app](https://railway.app) y crea una cuenta (puedes usar tu cuenta de GitHub)
2. "New Project" → "Deploy from GitHub repo" → elige tu repositorio
3. En "Settings": Root directory = `backend`, Start command = `npm start`
4. En "Settings" → "Volumes", agrega un volumen para que la base de datos no se borre en cada actualización
5. Railway te da una URL pública — esa es tu app en línea

## Pendiente antes de desplegar

- Conectar el prototipo de React a esta API (por ahora usa datos de ejemplo)
- Cargar el cupo real en `cupo_horario` y `cupo_cita` (el script trae un valor de ejemplo de 20 y 5/1)
