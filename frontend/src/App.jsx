import { useState, useEffect, useMemo } from "react";
import { Waves, Check, Clock, CalendarDays, ArrowLeft, Info, Plus, X, Loader2 } from "lucide-react";

// URL del backend ya desplegado en Railway
const API_URL = "https://inscripcion-natacion-production.up.railway.app";
//const API_URL = "http://localhost:3000";

const CATEGORIAS = [
  { id: "AD", label: "Adultos", detalle: "15 años y más · incluye tercera edad" },
  { id: "IJ", label: "Infantil / Juvenil", detalle: "6 a 14 años" },
];

const DIA_LABEL = {
  lunes: "Lun", martes: "Mar", miercoles: "Mié", jueves: "Jue",
  viernes: "Vie", sabado: "Sáb", domingo: "Dom",
};

const PRECIO_INSCRIPCION = 600;
const PRECIO_ATENCION_MEDICA = 220;
const PRECIO_CERTIFICADO = 100;
const PRECIO_MENSUALIDAD = { 1: 220, 2: 363, 3: 564, 4: 706, 5: 823, 6: 965, 7: 1094 };
const MAX_HORARIOS = 3;

// Patrón oficial de la CURP: 4 letras, 6 dígitos de fecha, sexo (H/M),
// 2 letras de entidad, 3 consonantes, 1 alfanumérico diferenciador, 1 dígito verificador
const CURP_REGEX = /^[A-Z]{1}[AEIOUX]{1}[A-Z]{2}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HM](AS|BC|BS|CC|CS|CH|CL|CM|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QO|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d]\d$/;

function money(n) {
  return `$${n.toLocaleString("es-MX")}.00`;
}

function precioPorDias(n) {
  if (n <= 0) return 0;
  return PRECIO_MENSUALIDAD[Math.min(n, 7)];
}

function formatearFechaLabel(fechaStr) {
  const [anio, mes, dia] = fechaStr.split("-").map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  return fecha.toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" });
}

export default function App() {
  const [paso, setPaso] = useState(1);

  // --- horarios de actividad ---
  const [categoria, setCategoria] = useState("AD");
  const [horariosApi, setHorariosApi] = useState([]);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);
  const [errorHorarios, setErrorHorarios] = useState(null);

  const [bloques, setBloques] = useState([]); // [{ horaInicio, dias: [{id, dia_semana, cupo_disponible}] }]
  const [filaSel, setFilaSel] = useState(null); // hora_inicio elegida
  const [diasSel, setDiasSel] = useState([]); // ids de cupo_horario elegidos en esa hora

  // --- cita ---
  const [diasCita, setDiasCita] = useState([]);
  const [cargandoDias, setCargandoDias] = useState(true);
  const [diaCitaSel, setDiaCitaSel] = useState(null);
  const [citasApi, setCitasApi] = useState([]);
  const [cargandoCitas, setCargandoCitas] = useState(false);
  const [horaCitaSel, setHoraCitaSel] = useState(null);

  // --- registro ---
  const [curp, setCurp] = useState("");
  const [errorCurp, setErrorCurp] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [folio, setFolio] = useState(null);

  // Cargar horarios cuando cambia la categoría
  useEffect(() => {
    setCargandoHorarios(true);
    setErrorHorarios(null);
    fetch(`${API_URL}/horarios?categoria=${categoria}`)
      .then((r) => {
        if (!r.ok) throw new Error("No se pudo cargar la disponibilidad");
        return r.json();
      })
      .then((data) => setHorariosApi(data))
      .catch((err) => setErrorHorarios(err.message))
      .finally(() => setCargandoHorarios(false));
  }, [categoria]);

  // Cargar las fechas de cita configuradas (una vez, no depende de nada más)
  useEffect(() => {
    setCargandoDias(true);
    fetch(`${API_URL}/citas/fechas`)
      .then((r) => r.json())
      .then((fechas) => {
        const conLabel = fechas.map((f) => ({ fecha: f, label: formatearFechaLabel(f) }));
        setDiasCita(conLabel);
        if (conLabel.length > 0) setDiaCitaSel(conLabel[0].fecha);
      })
      .catch(() => setDiasCita([]))
      .finally(() => setCargandoDias(false));
  }, []);

  // Cargar disponibilidad de citas cuando cambia el día elegido (paso 2)
  useEffect(() => {
    if (paso !== 2 || !diaCitaSel) return;
    setCargandoCitas(true);
    fetch(`${API_URL}/citas/disponibilidad?fecha=${diaCitaSel}`)
      .then((r) => r.json())
      .then((data) => setCitasApi(data))
      .catch(() => setCitasApi([]))
      .finally(() => setCargandoCitas(false));
  }, [diaCitaSel, paso]);

  // Agrupar horarios por hora_inicio para armar la lista de "elige un horario"
  const horasAgrupadas = useMemo(() => {
    const grupos = {};
    for (const h of horariosApi) {
      if (!grupos[h.hora_inicio]) grupos[h.hora_inicio] = [];
      grupos[h.hora_inicio].push(h);
    }
    return grupos;
  }, [horariosApi]);

  const diasDeLaFilaSel = filaSel ? horasAgrupadas[filaSel] || [] : [];

  const toggleDia = (entrada) => {
    if (entrada.cupo_disponible <= 0) return;
    setDiasSel((prev) =>
      prev.includes(entrada.id) ? prev.filter((id) => id !== entrada.id) : [...prev, entrada.id]
    );
  };

  const elegirFila = (hora) => {
    setFilaSel(hora);
    setDiasSel([]);
  };

  const agregarBloque = () => {
    if (diasSel.length === 0) return;
    const seleccionadas = diasDeLaFilaSel.filter((d) => diasSel.includes(d.id));
    setBloques((prev) => [...prev, { horaInicio: filaSel, dias: seleccionadas }]);
    setFilaSel(null);
    setDiasSel([]);
  };

  const quitarBloque = (idx) => {
    setBloques((prev) => prev.filter((_, i) => i !== idx));
  };

  const totalMensualidad = bloques.reduce((sum, b) => sum + precioPorDias(b.dias.length), 0);
  const previewMensualidad = precioPorDias(diasSel.length);

  const irAPaso2 = () => {
    const bloquesFinales = diasSel.length > 0 ? [...bloques, { horaInicio: filaSel, dias: diasDeLaFilaSel.filter(d => diasSel.includes(d.id)) }] : bloques;
    if (bloquesFinales.length === 0) return;
    if (diasSel.length > 0) {
      setBloques(bloquesFinales);
      setFilaSel(null);
      setDiasSel([]);
    }
    setPaso(2);
  };

  const confirmar = async () => {
    if (!horaCitaSel) return;
    const curpNormalizada = curp.trim().toUpperCase();
    if (!CURP_REGEX.test(curpNormalizada)) {
      setErrorCurp("La CURP no tiene un formato válido. Revisa que esté completa y correcta.");
      return;
    }

    setEnviando(true);
    setErrorCurp(null);

    try {
      // Todo se envía junto: el backend crea folio, horarios y cita
      // en una sola operación, así nunca queda un folio sin su cita.
      const todosLosHorarioIds = bloques.flatMap((b) => b.dias.map((d) => d.id));

      const resRegistro = await fetch(`${API_URL}/registros`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          curp: curpNormalizada,
          horarios: todosLosHorarioIds,
          mensualidad_total: totalMensualidad,
          fecha: diaCitaSel,
          cupo_cita_id: horaCitaSel,
        }),
      });
      const dataRegistro = await resRegistro.json();
      if (!resRegistro.ok) throw new Error(dataRegistro.error || "No se pudo crear el registro");

      setFolio(dataRegistro.folio);
      setPaso(3);
    } catch (err) {
      setErrorCurp(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-stone-50 text-stone-900 font-sans flex justify-center items-start py-10 px-4">
      <div className="w-full max-w-xl">
        {/* Progreso */}
        <div className="mb-8">
          <p className="text-xs tracking-widest uppercase text-emerald-700 font-semibold mb-2">
            Nueva inscripción
          </p>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((n) => (
              <div key={n} className={`h-1.5 rounded-full flex-1 transition-colors ${n <= paso ? "bg-emerald-700" : "bg-stone-200"}`} />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-stone-500">
            <span className={paso === 1 ? "text-emerald-700 font-semibold" : ""}>1. Horarios y días</span>
            <span className={paso === 2 ? "text-emerald-700 font-semibold" : ""}>2. Cita de atención</span>
            <span className={paso === 3 ? "text-emerald-700 font-semibold" : ""}>3. Confirmación</span>
          </div>
        </div>

        {/* PASO 1 */}
        {paso === 1 && (
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
                <Waves size={20} />
              </div>
              <h1 className="text-2xl font-bold">Natación</h1>
            </div>
            <p className="text-sm text-stone-600 mb-5">
              Elige tu categoría, tu horario y los días. Puedes agregar hasta {MAX_HORARIOS} horarios distintos.
            </p>

            {bloques.length > 0 && (
              <div className="space-y-2 mb-5">
                {bloques.map((b, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold">{b.horaInicio}</p>
                      <p className="text-xs text-stone-600">
                        {b.dias.map((d) => DIA_LABEL[d.dia_semana]).join(", ")} · {money(precioPorDias(b.dias.length))}/mes
                      </p>
                    </div>
                    <button onClick={() => quitarBloque(i)} className="text-stone-400 hover:text-red-500 p-1">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {bloques.length < MAX_HORARIOS ? (
              <>
                <div className="flex gap-2 mb-5">
                  {CATEGORIAS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => { setCategoria(c.id); setFilaSel(null); setDiasSel([]); }}
                      className={`flex-1 rounded-xl border px-3 py-2.5 text-left transition-colors ${categoria === c.id ? "border-emerald-700 bg-emerald-50" : "border-stone-200 bg-white hover:border-emerald-400"}`}
                    >
                      <p className="text-sm font-semibold leading-tight">{c.label}</p>
                      <p className="text-xs text-stone-500 leading-tight">{c.detalle}</p>
                    </button>
                  ))}
                </div>

                <p className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <Clock size={16} className="text-emerald-700" /> Elige un horario
                </p>

                {cargandoHorarios && (
                  <div className="flex items-center gap-2 text-sm text-stone-500 py-4">
                    <Loader2 size={16} className="animate-spin" /> Cargando disponibilidad...
                  </div>
                )}
                {errorHorarios && (
                  <div className="text-sm text-red-600 py-2">
                    No se pudo conectar con el servidor ({errorHorarios}). ¿Está corriendo el backend?
                  </div>
                )}

                <div className="space-y-2 mb-2">
                  {Object.keys(horasAgrupadas).sort().map((hora) => {
                    const yaUsada = bloques.some((b) => b.horaInicio === hora);
                    const seleccionada = filaSel === hora;
                    const diasDisponibles = horasAgrupadas[hora].filter((d) => d.cupo_disponible > 0).length;
                    return (
                      <button
                        key={hora}
                        disabled={yaUsada}
                        onClick={() => elegirFila(hora)}
                        className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 text-sm bg-white transition-colors ${yaUsada ? "opacity-40 cursor-not-allowed border-stone-100" : seleccionada ? "border-emerald-700 bg-emerald-50" : "border-stone-200 hover:border-emerald-400"}`}
                      >
                        <span className="font-medium">{hora}</span>
                        <span className="text-xs text-stone-500">
                          {yaUsada ? "ya agregado" : `${diasDisponibles} ${diasDisponibles === 1 ? "día disponible" : "días disponibles"}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 mb-2">
                <Info size={16} className="mt-0.5 shrink-0" />
                <span>Llegaste al máximo de {MAX_HORARIOS} horarios distintos por alumno.</span>
              </div>
            )}

            {filaSel && (
              <div className="rounded-2xl border border-stone-200 bg-white p-4 mt-4">
                <p className="text-sm font-semibold mb-3">Días disponibles · {filaSel}</p>
                <div className="grid grid-cols-4 gap-2">
                  {diasDeLaFilaSel.map((entrada) => {
                    const seleccionado = diasSel.includes(entrada.id);
                    const sinCupo = entrada.cupo_disponible <= 0;
                    return (
                      <button
                        key={entrada.id}
                        disabled={sinCupo}
                        onClick={() => toggleDia(entrada)}
                        className={`rounded-xl border px-2 py-2.5 text-xs font-medium transition-colors flex flex-col items-center gap-1 ${sinCupo ? "opacity-40 cursor-not-allowed border-stone-100" : seleccionado ? "border-emerald-700 bg-emerald-700 text-white" : "border-stone-200 hover:border-emerald-400"}`}
                      >
                        <span>{DIA_LABEL[entrada.dia_semana]}</span>
                        <span className={`text-xs ${seleccionado ? "text-emerald-100" : "text-stone-400"}`}>
                          {sinCupo ? "sin cupo" : `${entrada.cupo_disponible} lug.`}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {diasSel.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
                    <span className="text-sm text-stone-600">
                      {diasSel.length} {diasSel.length === 1 ? "clase" : "clases"} · {money(previewMensualidad)}/mes
                    </span>
                    <button onClick={agregarBloque} className="flex items-center gap-1 text-sm font-semibold text-emerald-700 border border-emerald-700 rounded-lg px-3 py-1.5 hover:bg-emerald-50">
                      <Plus size={14} /> Agregar este horario
                    </button>
                  </div>
                )}
              </div>
            )}

            {(bloques.length > 0 || diasSel.length > 0) && (
              <div className="flex items-center justify-between mt-5 rounded-xl bg-stone-900 text-white px-4 py-3.5">
                <span className="text-sm">Mensualidad total</span>
                <span className="text-lg font-bold">{money(totalMensualidad + (bloques.length === 0 ? previewMensualidad : 0))}/mes</span>
              </div>
            )}

            <div className="flex items-start gap-2 mt-4 text-xs text-stone-500">
              <Info size={14} className="mt-0.5 shrink-0" />
              <span>
                Además de la mensualidad, la inscripción incluye {money(PRECIO_INSCRIPCION)} de inscripción,
                {" "}{money(PRECIO_ATENCION_MEDICA)} de atención médica y {money(PRECIO_CERTIFICADO)} de certificado médico (pagos únicos).
              </span>
            </div>

            <button
              onClick={irAPaso2}
              disabled={bloques.length === 0 && diasSel.length === 0}
              className={`w-full mt-6 rounded-xl py-3.5 font-semibold text-sm transition-colors ${bloques.length > 0 || diasSel.length > 0 ? "bg-emerald-700 text-white hover:bg-emerald-800" : "bg-stone-200 text-stone-400 cursor-not-allowed"}`}
            >
              Continuar a elegir cita
            </button>
          </div>
        )}

        {/* PASO 2 */}
        {paso === 2 && (
          <div>
            <button onClick={() => setPaso(1)} className="flex items-center gap-1 text-xs text-stone-500 mb-4 hover:text-emerald-700">
              <ArrowLeft size={14} /> Cambiar horarios o días
            </button>

            <h1 className="text-2xl font-bold mb-1">Agenda tu cita de atención</h1>
            <p className="text-sm text-stone-600 mb-6">Elige el día y la hora en que asistirás a la captura de tus datos.</p>

            <div className="rounded-2xl border border-stone-200 bg-white p-4 mb-5 space-y-2">
              <p className="text-xs text-stone-500">Plan seleccionado</p>
              {bloques.map((b, i) => (
                <p key={i} className="text-sm font-semibold">
                  Natación · {b.horaInicio} · {b.dias.map((d) => DIA_LABEL[d.dia_semana]).join(", ")}
                </p>
              ))}
              <p className="text-sm text-emerald-700 font-bold pt-1">{money(totalMensualidad)}/mes</p>
            </div>

            <div className="mb-5">
              <label className="text-sm font-semibold mb-2 block">CURP</label>
              <input
                type="text"
                value={curp}
                onChange={(e) => {
                  const limpio = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 18);
                  setCurp(limpio);
                  if (errorCurp) setErrorCurp(null);
                }}
                placeholder="Ej. GOMJ900101HDFNRS05"
                maxLength={18}
                className={`w-full rounded-xl border px-4 py-3 text-sm uppercase tracking-wide focus:outline-none ${errorCurp ? "border-red-400 bg-red-50" : "border-stone-200 bg-white focus:border-emerald-700"}`}
              />
              <p className="text-xs text-stone-500 mt-1">Se usa para generar tu folio y evitar registros duplicados.</p>
              {errorCurp && <p className="text-xs text-red-600 mt-1 font-medium">{errorCurp}</p>}
            </div>

            <div className="mb-5">
              <p className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                <CalendarDays size={16} className="text-emerald-700" /> Elige un día
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {cargandoDias ? (
                  <div className="flex items-center gap-2 text-sm text-stone-500 py-2">
                    <Loader2 size={16} className="animate-spin" /> Cargando fechas...
                  </div>
                ) : diasCita.length === 0 ? (
                  <p className="text-sm text-stone-500 py-2">
                    Por ahora no hay fechas de cita disponibles. Vuelve a intentarlo más tarde.
                  </p>
                ) : (
                  diasCita.map((d) => (
                    <button
                      key={d.fecha}
                      onClick={() => { setDiaCitaSel(d.fecha); setHoraCitaSel(null); }}
                      className={`shrink-0 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${diaCitaSel === d.fecha ? "border-emerald-700 bg-emerald-50 text-emerald-700" : "border-stone-200 bg-white hover:border-emerald-400"}`}
                    >
                      {d.label}
                    </button>
                  ))
                )}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                <Clock size={16} className="text-emerald-700" /> Horarios disponibles
              </p>
              {cargandoCitas ? (
                <div className="flex items-center gap-2 text-sm text-stone-500 py-4">
                  <Loader2 size={16} className="animate-spin" /> Cargando franjas...
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2 max-h-72 overflow-y-auto pr-1">
                  {citasApi.map((slot) => {
                    const sinCupo = slot.cupo_disponible <= 0;
                    const seleccionado = horaCitaSel === slot.id;
                    return (
                      <button
                        key={slot.id}
                        disabled={sinCupo}
                        onClick={() => setHoraCitaSel(slot.id)}
                        className={`rounded-xl border py-2 text-sm font-medium transition-colors flex flex-col items-center gap-0.5 ${sinCupo ? "opacity-40 cursor-not-allowed border-stone-100" : seleccionado ? "border-emerald-700 bg-emerald-700 text-white" : "border-stone-200 hover:border-emerald-400"}`}
                      >
                        <span>{slot.hora_inicio}</span>
                        <span className={`text-xs ${seleccionado ? "text-emerald-100" : "text-stone-400"}`}>
                          {sinCupo ? "sin cupo" : `${slot.cupo_disponible}/${slot.cupo_maximo}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              onClick={confirmar}
              disabled={!horaCitaSel || enviando}
              className={`w-full mt-8 rounded-xl py-3.5 font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${horaCitaSel && !enviando ? "bg-emerald-700 text-white hover:bg-emerald-800" : "bg-stone-200 text-stone-400 cursor-not-allowed"}`}
            >
              {enviando && <Loader2 size={16} className="animate-spin" />}
              {enviando ? "Guardando..." : "Confirmar cita"}
            </button>
          </div>
        )}

        {/* PASO 3 */}
        {paso === 3 && (
          <div className="text-center pt-6">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-5">
              <Check size={26} />
            </div>
            <h1 className="text-2xl font-bold mb-1">Todo listo</h1>
            <p className="text-sm text-stone-600 mb-1">Guarda estos datos, los necesitarás el día de tu cita.</p>
            <p className="text-lg font-bold text-emerald-700 mb-6 tracking-wide">Folio: {folio}</p>

            <div className="rounded-2xl border border-stone-200 bg-white p-5 text-left space-y-3">
              <div>
                <p className="text-xs text-stone-500">Actividad</p>
                <p className="font-semibold">Natación</p>
              </div>
              <div>
                <p className="text-xs text-stone-500">Horarios y días</p>
                {bloques.map((b, i) => (
                  <p key={i} className="font-semibold">{b.horaInicio} · {b.dias.map((d) => DIA_LABEL[d.dia_semana]).join(", ")}</p>
                ))}
              </div>
              <div>
                <p className="text-xs text-stone-500">Mensualidad total</p>
                <p className="font-semibold">{money(totalMensualidad)} / mes</p>
              </div>
              <div className="h-px bg-stone-100" />
              <div>
                <p className="text-xs text-stone-500">Cita de atención</p>
                <p className="font-semibold">
                  {diasCita.find((d) => d.fecha === diaCitaSel)?.label} · {citasApi.find((c) => c.id === horaCitaSel)?.hora_inicio} hrs
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setPaso(1); setBloques([]); setFilaSel(null); setDiasSel([]);
                setHoraCitaSel(null); setCurp(""); setFolio(null); setErrorCurp(null);
              }}
              className="mt-6 text-sm text-emerald-700 font-semibold underline underline-offset-2"
            >
              Empezar de nuevo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
