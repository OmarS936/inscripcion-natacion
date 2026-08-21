// Script para actualizar el cupo REAL de horarios y citas.
// Ya vienen listadas TODAS las franjas que existen hoy, con el valor de
// ejemplo actual (20 para horarios, 5/1 para citas) — solo cambia el número
// de cupo_maximo en las que quieras ajustar. No necesitas escribir nada
// desde cero ni agregar renglones.
//
// Guarda y corre: npm run actualizar-cupo
// Se puede correr las veces que haga falta (si el cupo cambia de ciclo en ciclo).

const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'inscripcion_natacion.db');
const db = new DatabaseSync(dbPath);

// =========================================================
// 1) CUPO DE HORARIOS DE ACTIVIDAD (Natación)
//    categoria: 'AD' (Adultos, incluye Tercera edad) o 'IJ' (Infantil/Juvenil)
// =========================================================
const CUPO_HORARIOS = [
  { dia_semana: 'lunes', hora_inicio: '06:00', categoria: 'AD', cupo_maximo: 7 },
  { dia_semana: 'martes', hora_inicio: '06:00', categoria: 'AD', cupo_maximo: 7 },
  { dia_semana: 'miercoles', hora_inicio: '06:00', categoria: 'AD', cupo_maximo: 7 },
  { dia_semana: 'jueves', hora_inicio: '06:00', categoria: 'AD', cupo_maximo: 7 },
  { dia_semana: 'viernes', hora_inicio: '06:00', categoria: 'AD', cupo_maximo: 7 },
  { dia_semana: 'lunes', hora_inicio: '07:00', categoria: 'AD', cupo_maximo: 0 },
  { dia_semana: 'martes', hora_inicio: '07:00', categoria: 'AD', cupo_maximo: 0 },
  { dia_semana: 'miercoles', hora_inicio: '07:00', categoria: 'AD', cupo_maximo: 0 },
  { dia_semana: 'jueves', hora_inicio: '07:00', categoria: 'AD', cupo_maximo: 0 },
  { dia_semana: 'viernes', hora_inicio: '07:00', categoria: 'AD', cupo_maximo: 0 },
  { dia_semana: 'sabado', hora_inicio: '07:00', categoria: 'AD', cupo_maximo: 0 },
  { dia_semana: 'domingo', hora_inicio: '07:00', categoria: 'AD', cupo_maximo: 11 },
  { dia_semana: 'lunes', hora_inicio: '08:00', categoria: 'AD', cupo_maximo: 3 },
  { dia_semana: 'martes', hora_inicio: '08:00', categoria: 'AD', cupo_maximo: 3 },
  { dia_semana: 'miercoles', hora_inicio: '08:00', categoria: 'AD', cupo_maximo: 3 },
  { dia_semana: 'jueves', hora_inicio: '08:00', categoria: 'AD', cupo_maximo: 3 },
  { dia_semana: 'viernes', hora_inicio: '08:00', categoria: 'AD', cupo_maximo: 3 },
  { dia_semana: 'sabado', hora_inicio: '08:00', categoria: 'AD', cupo_maximo: 3 },
  { dia_semana: 'domingo', hora_inicio: '08:00', categoria: 'AD', cupo_maximo: 4 },
  { dia_semana: 'lunes', hora_inicio: '09:00', categoria: 'AD', cupo_maximo: 4 },
  { dia_semana: 'martes', hora_inicio: '09:00', categoria: 'AD', cupo_maximo: 4 },
  { dia_semana: 'miercoles', hora_inicio: '09:00', categoria: 'AD', cupo_maximo: 4 },
  { dia_semana: 'jueves', hora_inicio: '09:00', categoria: 'AD', cupo_maximo: 4 },
  { dia_semana: 'viernes', hora_inicio: '09:00', categoria: 'AD', cupo_maximo: 4 },
  { dia_semana: 'sabado', hora_inicio: '09:00', categoria: 'AD', cupo_maximo: 4 },
  { dia_semana: 'domingo', hora_inicio: '09:00', categoria: 'AD', cupo_maximo: 4 },
  { dia_semana: 'lunes', hora_inicio: '10:00', categoria: 'AD', cupo_maximo: 12 },
  { dia_semana: 'martes', hora_inicio: '10:00', categoria: 'AD', cupo_maximo: 12 },
  { dia_semana: 'miercoles', hora_inicio: '10:00', categoria: 'AD', cupo_maximo: 12 },
  { dia_semana: 'jueves', hora_inicio: '10:00', categoria: 'AD', cupo_maximo: 12 },
  { dia_semana: 'viernes', hora_inicio: '10:00', categoria: 'AD', cupo_maximo: 12 },
  { dia_semana: 'sabado', hora_inicio: '10:00', categoria: 'AD', cupo_maximo: 8 },
  { dia_semana: 'domingo', hora_inicio: '10:00', categoria: 'AD', cupo_maximo: 12 },
  { dia_semana: 'lunes', hora_inicio: '11:00', categoria: 'AD', cupo_maximo: 7 },
  { dia_semana: 'martes', hora_inicio: '11:00', categoria: 'AD', cupo_maximo: 7 },
  { dia_semana: 'miercoles', hora_inicio: '11:00', categoria: 'AD', cupo_maximo: 7 },
  { dia_semana: 'jueves', hora_inicio: '11:00', categoria: 'AD', cupo_maximo: 7 },
  { dia_semana: 'viernes', hora_inicio: '11:00', categoria: 'AD', cupo_maximo: 7 },
  { dia_semana: 'sabado', hora_inicio: '11:00', categoria: 'IJ', cupo_maximo: 7 },
  { dia_semana: 'domingo', hora_inicio: '11:00', categoria: 'IJ', cupo_maximo: 7 },
  { dia_semana: 'lunes', hora_inicio: '12:00', categoria: 'AD', cupo_maximo: 7 },
  { dia_semana: 'martes', hora_inicio: '12:00', categoria: 'AD', cupo_maximo: 7 },
  { dia_semana: 'miercoles', hora_inicio: '12:00', categoria: 'AD', cupo_maximo: 7 },
  { dia_semana: 'jueves', hora_inicio: '12:00', categoria: 'AD', cupo_maximo: 7 },
  { dia_semana: 'viernes', hora_inicio: '12:00', categoria: 'AD', cupo_maximo: 7 },
  { dia_semana: 'sabado', hora_inicio: '12:00', categoria: 'IJ', cupo_maximo: 7 },
  { dia_semana: 'domingo', hora_inicio: '12:00', categoria: 'IJ', cupo_maximo: 7 },
  { dia_semana: 'lunes', hora_inicio: '13:00', categoria: 'AD', cupo_maximo: 7 },
  { dia_semana: 'martes', hora_inicio: '13:00', categoria: 'AD', cupo_maximo: 7 },
  { dia_semana: 'miercoles', hora_inicio: '13:00', categoria: 'AD', cupo_maximo: 7 },
  { dia_semana: 'jueves', hora_inicio: '13:00', categoria: 'AD', cupo_maximo: 7 },
  { dia_semana: 'viernes', hora_inicio: '13:00', categoria: 'AD', cupo_maximo: 7 },
  { dia_semana: 'sabado', hora_inicio: '13:00', categoria: 'IJ', cupo_maximo: 7 },
  { dia_semana: 'domingo', hora_inicio: '13:00', categoria: 'IJ', cupo_maximo: 7 },
  { dia_semana: 'lunes', hora_inicio: '14:00', categoria: 'IJ', cupo_maximo: 11 },
  { dia_semana: 'martes', hora_inicio: '14:00', categoria: 'IJ', cupo_maximo: 11 },
  { dia_semana: 'miercoles', hora_inicio: '14:00', categoria: 'IJ', cupo_maximo: 11 },
  { dia_semana: 'jueves', hora_inicio: '14:00', categoria: 'IJ', cupo_maximo: 11 },
  { dia_semana: 'viernes', hora_inicio: '14:00', categoria: 'IJ', cupo_maximo: 11 },
  { dia_semana: 'lunes', hora_inicio: '15:00', categoria: 'IJ', cupo_maximo: 9 },
  { dia_semana: 'martes', hora_inicio: '15:00', categoria: 'IJ', cupo_maximo: 9 },
  { dia_semana: 'miercoles', hora_inicio: '15:00', categoria: 'IJ', cupo_maximo: 9 },
  { dia_semana: 'jueves', hora_inicio: '15:00', categoria: 'IJ', cupo_maximo: 9 },
  { dia_semana: 'viernes', hora_inicio: '15:00', categoria: 'IJ', cupo_maximo: 9 },
  { dia_semana: 'lunes', hora_inicio: '16:00', categoria: 'IJ', cupo_maximo: 3 },
  { dia_semana: 'martes', hora_inicio: '16:00', categoria: 'IJ', cupo_maximo: 3 },
  { dia_semana: 'miercoles', hora_inicio: '16:00', categoria: 'IJ', cupo_maximo: 3 },
  { dia_semana: 'jueves', hora_inicio: '16:00', categoria: 'IJ', cupo_maximo: 3 },
  { dia_semana: 'viernes', hora_inicio: '16:00', categoria: 'IJ', cupo_maximo: 3 },
  { dia_semana: 'lunes', hora_inicio: '17:00', categoria: 'IJ', cupo_maximo: 0 },
  { dia_semana: 'martes', hora_inicio: '17:00', categoria: 'IJ', cupo_maximo: 0 },
  { dia_semana: 'miercoles', hora_inicio: '17:00', categoria: 'IJ', cupo_maximo: 0 },
  { dia_semana: 'jueves', hora_inicio: '17:00', categoria: 'IJ', cupo_maximo: 0 },
  { dia_semana: 'viernes', hora_inicio: '17:00', categoria: 'IJ', cupo_maximo: 0 },
  { dia_semana: 'lunes', hora_inicio: '18:00', categoria: 'AD', cupo_maximo: 0 },
  { dia_semana: 'martes', hora_inicio: '18:00', categoria: 'AD', cupo_maximo: 0 },
  { dia_semana: 'miercoles', hora_inicio: '18:00', categoria: 'AD', cupo_maximo: 0 },
  { dia_semana: 'jueves', hora_inicio: '18:00', categoria: 'AD', cupo_maximo: 0 },
  { dia_semana: 'viernes', hora_inicio: '18:00', categoria: 'AD', cupo_maximo: 0 },
  { dia_semana: 'lunes', hora_inicio: '19:00', categoria: 'AD', cupo_maximo: 5 },
  { dia_semana: 'martes', hora_inicio: '19:00', categoria: 'AD', cupo_maximo: 5 },
  { dia_semana: 'miercoles', hora_inicio: '19:00', categoria: 'AD', cupo_maximo: 5 },
  { dia_semana: 'jueves', hora_inicio: '19:00', categoria: 'AD', cupo_maximo: 5 },
  { dia_semana: 'viernes', hora_inicio: '19:00', categoria: 'AD', cupo_maximo: 5 },
  { dia_semana: 'lunes', hora_inicio: '20:00', categoria: 'AD', cupo_maximo: 0 },
  { dia_semana: 'martes', hora_inicio: '20:00', categoria: 'AD', cupo_maximo: 0 },
  { dia_semana: 'miercoles', hora_inicio: '20:00', categoria: 'AD', cupo_maximo: 0 },
  { dia_semana: 'jueves', hora_inicio: '20:00', categoria: 'AD', cupo_maximo: 0 },
  { dia_semana: 'viernes', hora_inicio: '20:00', categoria: 'AD', cupo_maximo: 0 },
  { dia_semana: 'lunes', hora_inicio: '21:00', categoria: 'AD', cupo_maximo: 10 },
  { dia_semana: 'martes', hora_inicio: '21:00', categoria: 'AD', cupo_maximo: 10 },
  { dia_semana: 'miercoles', hora_inicio: '21:00', categoria: 'AD', cupo_maximo: 10 },
  { dia_semana: 'jueves', hora_inicio: '21:00', categoria: 'AD', cupo_maximo: 10 },
  { dia_semana: 'viernes', hora_inicio: '21:00', categoria: 'AD', cupo_maximo: 10 },
];

// =========================================================
// 2) CUPO DE FRANJAS DE CITA (atención a usuarios)
// =========================================================
const CUPO_CITAS = [
  { hora_inicio: '07:00', cupo_maximo: 0 },
  { hora_inicio: '07:15', cupo_maximo: 0 },
  { hora_inicio: '07:30', cupo_maximo: 0 },
  { hora_inicio: '07:45', cupo_maximo: 0 },
  { hora_inicio: '08:00', cupo_maximo: 0 },
  { hora_inicio: '08:15', cupo_maximo: 0 },
  { hora_inicio: '08:30', cupo_maximo: 0 },
  { hora_inicio: '08:45', cupo_maximo: 0 },
  { hora_inicio: '09:00', cupo_maximo: 4 },
  { hora_inicio: '09:15', cupo_maximo: 4 },
  { hora_inicio: '09:30', cupo_maximo: 4 },
  { hora_inicio: '09:45', cupo_maximo: 4 },
  { hora_inicio: '10:00', cupo_maximo: 4 },
  { hora_inicio: '10:15', cupo_maximo: 4 },
  { hora_inicio: '10:30', cupo_maximo: 4 },
  { hora_inicio: '10:45', cupo_maximo: 4 },
  { hora_inicio: '11:00', cupo_maximo: 4 },
  { hora_inicio: '11:15', cupo_maximo: 4 },
  { hora_inicio: '11:30', cupo_maximo: 4 },
  { hora_inicio: '11:45', cupo_maximo: 4 },
  { hora_inicio: '12:00', cupo_maximo: 4 },
  { hora_inicio: '12:15', cupo_maximo: 4 },
  { hora_inicio: '12:30', cupo_maximo: 4 },
  { hora_inicio: '12:45', cupo_maximo: 4 },
  { hora_inicio: '13:00', cupo_maximo: 4 },
  { hora_inicio: '13:15', cupo_maximo: 4 },
  { hora_inicio: '13:30', cupo_maximo: 4 },
  { hora_inicio: '13:45', cupo_maximo: 4 },
  { hora_inicio: '14:00', cupo_maximo: 4 },
  { hora_inicio: '14:15', cupo_maximo: 4 },
  { hora_inicio: '14:30', cupo_maximo: 4 },
  { hora_inicio: '14:45', cupo_maximo: 4 },
  { hora_inicio: '15:00', cupo_maximo: 2 },
  { hora_inicio: '15:15', cupo_maximo: 2 },
  { hora_inicio: '15:30', cupo_maximo: 2 },
  { hora_inicio: '15:45', cupo_maximo: 2 },
  { hora_inicio: '16:00', cupo_maximo: 2 },
  { hora_inicio: '16:15', cupo_maximo: 2 },
  { hora_inicio: '16:30', cupo_maximo: 2 },
  { hora_inicio: '16:45', cupo_maximo: 2 },
  { hora_inicio: '17:00', cupo_maximo: 4 },
  { hora_inicio: '17:15', cupo_maximo: 4 },
  { hora_inicio: '17:30', cupo_maximo: 4 },
  { hora_inicio: '17:45', cupo_maximo: 4 },
  { hora_inicio: '18:00', cupo_maximo: 2 },
  { hora_inicio: '18:15', cupo_maximo: 2 },
  { hora_inicio: '18:30', cupo_maximo: 2 },
  { hora_inicio: '18:45', cupo_maximo: 2 },
  { hora_inicio: '19:00', cupo_maximo: 2 },
  { hora_inicio: '19:15', cupo_maximo: 2 },
  { hora_inicio: '19:30', cupo_maximo: 2 },
  //{ hora_inicio: '19:45', cupo_maximo: 1 },
  //{ hora_inicio: '20:00', cupo_maximo: 1 },
  //{ hora_inicio: '18:15', cupo_maximo: 1 },
  //{ hora_inicio: '18:30', cupo_maximo: 1 },
  //{ hora_inicio: '18:45', cupo_maximo: 1 },
  //{ hora_inicio: '19:00', cupo_maximo: 1 },
  //{ hora_inicio: '19:15', cupo_maximo: 1 },
];

function actualizarCupoHorarios() {
  const stmt = db.prepare(`
    UPDATE cupo_horario
    SET cupo_maximo = ?
    WHERE dia_semana = ? AND hora_inicio = ? AND categoria = ?
  `);
  let actualizados = 0;
  for (const fila of CUPO_HORARIOS) {
    const resultado = stmt.run(fila.cupo_maximo, fila.dia_semana, fila.hora_inicio, fila.categoria);
    if (resultado.changes === 0) {
      console.warn(`  ⚠ No se encontró: ${fila.dia_semana} ${fila.hora_inicio} ${fila.categoria} (revisa que exista esa combinación)`);
    } else {
      actualizados++;
    }
  }
  console.log(`Cupo de horarios actualizado: ${actualizados} de ${CUPO_HORARIOS.length}`);
}

function actualizarCupoCitas() {
  // "Upsert": si la hora ya existe, actualiza su cupo; si no existe, la crea.
  // Así puedes agregar horas nuevas o dejar sin tocar las que no cambien.
  const stmt = db.prepare(`
    INSERT INTO cupo_cita (hora_inicio, cupo_maximo)
    VALUES (?, ?)
    ON CONFLICT(hora_inicio) DO UPDATE SET cupo_maximo = excluded.cupo_maximo
  `);
  for (const fila of CUPO_CITAS) {
    stmt.run(fila.hora_inicio, fila.cupo_maximo);
  }
  console.log(`Cupo de citas actualizado: ${CUPO_CITAS.length} franjas`);
}

actualizarCupoHorarios();
actualizarCupoCitas();
db.close();
console.log('Listo.');
