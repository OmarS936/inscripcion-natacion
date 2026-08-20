-- =========================================================
-- Base de datos: inscripcion_natacion.db (SQLite)
-- App aislada de inscripción y citas para Natación
-- =========================================================

PRAGMA foreign_keys = ON;

CREATE TABLE cupo_horario (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    dia_semana      TEXT NOT NULL CHECK (dia_semana IN ('lunes','martes','miercoles','jueves','viernes','sabado','domingo')),
    hora_inicio     TEXT NOT NULL,
    categoria       TEXT NOT NULL CHECK (categoria IN ('AD','IJ')),
    cupo_maximo     INTEGER NOT NULL,
    UNIQUE (dia_semana, hora_inicio, categoria)
);

CREATE TABLE cupo_cita (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    hora_inicio     TEXT NOT NULL UNIQUE,
    cupo_maximo     INTEGER NOT NULL
);

CREATE TABLE registro (
    folio               TEXT PRIMARY KEY,
    curp                TEXT NOT NULL UNIQUE,
    fecha_creacion      TEXT NOT NULL DEFAULT (datetime('now')),
    mensualidad_total   DECIMAL(10,2) NOT NULL
);

CREATE TABLE registro_horario (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    folio               TEXT NOT NULL REFERENCES registro(folio) ON DELETE CASCADE,
    cupo_horario_id     INTEGER NOT NULL REFERENCES cupo_horario(id)
);

CREATE TABLE cita (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    folio               TEXT NOT NULL UNIQUE REFERENCES registro(folio) ON DELETE CASCADE,
    fecha               TEXT NOT NULL,
    cupo_cita_id        INTEGER NOT NULL REFERENCES cupo_cita(id),
    estatus             TEXT NOT NULL DEFAULT 'agendada'
                         CHECK (estatus IN ('agendada','atendida','cancelada'))
);

CREATE INDEX idx_registro_horario_folio ON registro_horario(folio);
CREATE INDEX idx_registro_horario_cupo ON registro_horario(cupo_horario_id);
CREATE INDEX idx_cita_cupo ON cita(cupo_cita_id);
CREATE INDEX idx_cita_fecha ON cita(fecha);

-- =========================================================
-- Datos iniciales: cupo por horario de actividad (Natación)
-- =========================================================
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('lunes', '06:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('martes', '06:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('miercoles', '06:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('jueves', '06:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('viernes', '06:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('lunes', '07:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('martes', '07:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('miercoles', '07:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('jueves', '07:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('viernes', '07:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('sabado', '07:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('domingo', '07:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('lunes', '08:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('martes', '08:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('miercoles', '08:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('jueves', '08:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('viernes', '08:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('sabado', '08:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('domingo', '08:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('lunes', '09:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('martes', '09:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('miercoles', '09:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('jueves', '09:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('viernes', '09:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('sabado', '09:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('domingo', '09:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('lunes', '10:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('martes', '10:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('miercoles', '10:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('jueves', '10:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('viernes', '10:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('sabado', '10:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('domingo', '10:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('lunes', '11:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('martes', '11:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('miercoles', '11:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('jueves', '11:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('viernes', '11:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('sabado', '11:00', 'IJ', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('domingo', '11:00', 'IJ', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('lunes', '12:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('martes', '12:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('miercoles', '12:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('jueves', '12:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('viernes', '12:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('sabado', '12:00', 'IJ', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('domingo', '12:00', 'IJ', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('lunes', '13:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('martes', '13:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('miercoles', '13:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('jueves', '13:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('viernes', '13:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('sabado', '13:00', 'IJ', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('domingo', '13:00', 'IJ', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('lunes', '14:00', 'IJ', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('martes', '14:00', 'IJ', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('miercoles', '14:00', 'IJ', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('jueves', '14:00', 'IJ', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('viernes', '14:00', 'IJ', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('lunes', '15:00', 'IJ', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('martes', '15:00', 'IJ', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('miercoles', '15:00', 'IJ', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('jueves', '15:00', 'IJ', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('viernes', '15:00', 'IJ', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('lunes', '16:00', 'IJ', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('martes', '16:00', 'IJ', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('miercoles', '16:00', 'IJ', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('jueves', '16:00', 'IJ', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('viernes', '16:00', 'IJ', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('lunes', '17:00', 'IJ', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('martes', '17:00', 'IJ', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('miercoles', '17:00', 'IJ', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('jueves', '17:00', 'IJ', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('viernes', '17:00', 'IJ', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('lunes', '18:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('martes', '18:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('miercoles', '18:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('jueves', '18:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('viernes', '18:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('lunes', '19:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('martes', '19:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('miercoles', '19:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('jueves', '19:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('viernes', '19:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('lunes', '20:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('martes', '20:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('miercoles', '20:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('jueves', '20:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('viernes', '20:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('lunes', '21:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('martes', '21:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('miercoles', '21:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('jueves', '21:00', 'AD', 20);
INSERT INTO cupo_horario (dia_semana, hora_inicio, categoria, cupo_maximo) VALUES ('viernes', '21:00', 'AD', 20);

-- =========================================================
-- Datos iniciales: cupo por franja de cita de atención
-- =========================================================
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('07:00', 5);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('07:15', 5);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('07:30', 5);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('07:45', 5);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('08:00', 5);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('08:15', 5);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('08:30', 5);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('08:45', 5);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('09:00', 5);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('09:15', 5);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('09:30', 5);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('09:45', 5);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('10:00', 5);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('10:15', 5);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('10:30', 5);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('10:45', 5);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('11:00', 5);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('11:15', 5);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('11:30', 5);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('11:45', 5);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('12:00', 5);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('12:15', 5);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('12:30', 5);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('12:45', 5);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('13:00', 5);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('13:15', 5);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('13:30', 5);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('13:45', 5);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('14:00', 1);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('14:15', 1);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('14:30', 1);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('14:45', 1);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('15:00', 1);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('15:15', 1);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('15:30', 1);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('15:45', 1);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('16:00', 1);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('16:15', 1);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('16:30', 1);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('16:45', 1);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('17:00', 1);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('17:15', 1);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('17:30', 1);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('17:45', 1);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('18:00', 1);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('18:15', 1);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('18:30', 1);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('18:45', 1);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('19:00', 1);
INSERT INTO cupo_cita (hora_inicio, cupo_maximo) VALUES ('19:15', 1);
