import { useState, useEffect, useMemo } from "react";
import { Waves, Check, Clock, CalendarDays, ArrowLeft, Info, Plus, X, Loader2, Users } from "lucide-react";

// TEMPORAL para pruebas locales — antes de subir a producción, regresa esto a la URL de Railway
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

function formatearFechaHora(iso) {
  return new Date(iso).toLocaleString("es-MX", {
    timeZone: "America/Mexico_City",
    weekday: "long", day: "numeric", month: "long",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  });
}

function formatearRestante(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const dos = (n) => String(n).padStart(2, "0");
  return (d > 0 ? `${d} d ` : "") + `${dos(h)}:${dos(m)}:${dos(s)}`;
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
  const [refrescoHorarios, setRefrescoHorarios] = useState(0);
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

  // --- apertura programada de inscripciones ---
  const [estado, setEstado] = useState(null); // { abierto, apertura, ahora }
  const [desfaseMs, setDesfaseMs] = useState(0); // reloj del servidor menos reloj de este dispositivo
  const [restanteMs, setRestanteMs] = useState(0);

  const cargarEstado = () =>
    fetch(`${API_URL}/estado`)
      .then((r) => r.json())
      .then((e) => {
        setDesfaseMs(new Date(e.ahora).getTime() - Date.now());
        setEstado(e);
      })
      .catch(() => {}); // si falla, se muestra la app normal; el servidor igual valida

  useEffect(() => { cargarEstado(); }, []);

  // Mientras está abierto, vuelve a preguntar cada rato: así detecta solo si
  // se agotó el cupo de horarios o de citas, sin que la persona recargue.
  useEffect(() => {
    if (!estado || estado.estado !== 'abierto') return;
    const t = setInterval(cargarEstado, 20000);
    return () => clearInterval(t);
  }, [estado]);

  // Si hay hora de cierre, vuelve a consultar justo al llegar: la página pasa sola a "cerradas"
  useEffect(() => {
    if (!estado || estado.estado !== 'abierto' || !estado.cierre) return;
    const faltan = new Date(estado.cierre).getTime() - (Date.now() + desfaseMs);
    const espera = Math.min(Math.max(faltan, 0) + 500, 2147483647); // tope de setTimeout (~24 días)
    const t = setTimeout(cargarEstado, espera);
    return () => clearTimeout(t);
  }, [estado, desfaseMs]);

  // Cuenta regresiva: al llegar a cero vuelve a consultar y abre sola, sin recargar
  useEffect(() => {
    if (!estado || estado.estado !== 'antes') return;
    const meta = new Date(estado.apertura).getTime();
    const tick = () => {
      const faltan = meta - (Date.now() + desfaseMs);
      setRestanteMs(faltan);
      if (faltan <= 0) {
        clearInterval(reloj);
        cargarEstado().then(() => setRefrescoHorarios((n) => n + 1));
      }
    };
    const reloj = setInterval(tick, 1000);
    tick();
    return () => clearInterval(reloj);
  }, [estado, desfaseMs]);

  // --- sala de espera ---
  const [cola, setCola] = useState(null); // { ticket, posicion, personasAdelante, tuTurno, salaEsperaActiva }

  // Al abrir las inscripciones, toma un turno (o recupera el que ya tenía este dispositivo)
  useEffect(() => {
    if (!estado || estado.estado !== 'abierto' || cola) return;
    const ticketGuardado = localStorage.getItem('cola_ticket');

    const consultar = (ticket) =>
      fetch(`${API_URL}/cola/estado?ticket=${ticket}`)
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((d) => setCola({ ...d, ticket }))
        .catch(() => {
          localStorage.removeItem('cola_ticket');
          tomarTurno();
        });

    const tomarTurno = () =>
      fetch(`${API_URL}/cola/entrar`, { method: 'POST' })
        .then((r) => r.json())
        .then((d) => {
          if (d.salaEsperaActiva === false) { setCola({ salaEsperaActiva: false, tuTurno: true }); return; }
          localStorage.setItem('cola_ticket', d.ticket);
          setCola({ ...d, tuTurno: false, posicion: null, personasAdelante: null });
        });

    if (ticketGuardado) consultar(ticketGuardado);
    else tomarTurno();
  }, [estado, cola]);

  // Mientras no le toque su turno, vuelve a preguntar cada pocos segundos
  useEffect(() => {
    if (!cola || cola.salaEsperaActiva === false || cola.tuTurno) return;
    const t = setInterval(() => {
      fetch(`${API_URL}/cola/estado?ticket=${cola.ticket}`)
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((d) => setCola({ ...d, ticket: cola.ticket }))
        .catch(() => {}); // si falla una consulta, se reintenta sola en el próximo ciclo
    }, 3000);
    return () => clearInterval(t);
  }, [cola]);

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
  }, [categoria, refrescoHorarios]);

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
          ticket: cola?.ticket ?? null,
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

  if (estado && estado.estado === 'agotado') {
    return (
      <div className="w-full min-h-screen bg-stone-50 text-stone-900 font-sans flex justify-center items-start py-10 px-4">
        <div className="w-full max-w-xl text-center pt-10"><img src="/logo.png" alt="Centro Acuático" className="h-16 mx-auto mb-6" />
          <div className="w-14 h-14 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center mx-auto mb-5">
            <Clock size={26} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Ya no hay cupo disponible</h1>
          <p className="text-sm text-stone-600 mb-2">
            Se agotaron los horarios de actividad o las citas de atención disponibles.
          </p>
          <p className="text-xs text-stone-500">
            Gracias por tu interés. Consulta en el deportivo la próxima fecha de apertura.
          </p>
        </div>
      </div>
    );
  }

  if (estado && estado.estado === 'cerrado') {
    return (
      <div className="w-full min-h-screen bg-stone-50 text-stone-900 font-sans flex justify-center items-start py-10 px-4">
        <div className="w-full max-w-xl text-center pt-10"><img src="/logo.png" alt="Centro Acuático" className="h-16 mx-auto mb-6" />
          <div className="w-14 h-14 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center mx-auto mb-5">
            <Clock size={26} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Las inscripciones ya cerraron</h1>
          <p className="text-sm text-stone-600 mb-2">
            El periodo de inscripción terminó.
          </p>
          <p className="text-xs text-stone-500">
            Gracias por tu interés. Consulta en las redes sociales del Centro Acuático la próxima fecha de apertura.
          </p>
        </div>
      </div>
    );
  }

  if (estado && estado.estado === 'antes') {
    return (
      <div className="w-full min-h-screen bg-stone-50 text-stone-900 font-sans flex justify-center items-start py-10 px-4">
        <div className="w-full max-w-xl text-center pt-10"><img src="/logo.png" alt="Centro Acuático" className="h-16 mx-auto mb-6" />
          <div className="w-14 h-14 rounded-full bg-sky-50 text-sky-700 flex items-center justify-center mx-auto mb-5">
            <Clock size={26} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Las inscripciones aún no están abiertas</h1>
          <p className="text-sm text-stone-600 mb-6">
            Se abrirán el {formatearFechaHora(estado.apertura)} (hora de la Ciudad de México).
          </p>
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <p className="text-xs text-stone-500 mb-1">Faltan</p>
            <p className="text-3xl font-bold text-sky-700 tracking-wide">{formatearRestante(restanteMs)}</p>
          </div>
          <p className="text-xs text-stone-500 mt-4">
            No necesitas recargar la página: se abrirá sola cuando llegue la hora.
          </p>
        </div>
      </div>
    );
  }

  // Todavía no le toca su turno en la fila
  if (cola && cola.salaEsperaActiva !== false && !cola.tuTurno) {
    return (
      <div className="w-full min-h-screen bg-stone-50 text-stone-900 font-sans flex justify-center items-start py-10 px-4">
        <div className="w-full max-w-xl text-center pt-10"><img src="/logo.png" alt="Centro Acuático" className="h-16 mx-auto mb-6" />
          <div className="w-14 h-14 rounded-full bg-sky-50 text-sky-700 flex items-center justify-center mx-auto mb-5">
            <Users size={26} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Estás en la fila</h1>
          <p className="text-sm text-stone-600 mb-6">
            Hay mucha gente conectada a la vez. Te iremos dejando pasar en grupos, en el orden en que llegaste.
          </p>
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <p className="text-xs text-stone-500 mb-1">Tu posición</p>
            <p className="text-3xl font-bold text-sky-700 tracking-wide">
              {cola.posicion ?? "…"}
            </p>
            {cola.personasAdelante !== null && (
              <p className="text-xs text-stone-500 mt-2">
                {cola.personasAdelante > 0
                  ? `${cola.personasAdelante} ${cola.personasAdelante === 1 ? "persona" : "personas"} delante de ti`
                  : "Ya casi es tu turno"}
              </p>
            )}
          </div>
          <p className="text-xs text-stone-500 mt-4 flex items-center justify-center gap-1.5">
            <Loader2 size={12} className="animate-spin" /> No cierres ni recargues la página: te vamos a pasar automáticamente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-stone-50 text-stone-900 font-sans flex justify-center items-start py-10 px-4">
      <div className="w-full max-w-xl">
      <img src="/logo.png" alt="Centro Acuático" className="h-14 mb-5" />
        {/* Progreso */}
        <div className="mb-8">
          <p className="text-xs tracking-widest uppercase text-sky-700 font-semibold mb-2">
            Nueva inscripción
          </p>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((n) => (
              <div key={n} className={`h-1.5 rounded-full flex-1 transition-colors ${n <= paso ? "bg-sky-700" : "bg-stone-200"}`} />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-stone-500">
            <span className={paso === 1 ? "text-sky-700 font-semibold" : ""}>1. Horarios y días</span>
            <span className={paso === 2 ? "text-sky-700 font-semibold" : ""}>2. Cita de atención</span>
            <span className={paso === 3 ? "text-sky-700 font-semibold" : ""}>3. Confirmación</span>
          </div>
        </div>

        {/*    
        {estado && estado.estado === 'abierto' && estado.cierre && (
          <p className="text-xs text-stone-500 mb-5 -mt-4">
            Las inscripciones cierran el {formatearFechaHora(estado.cierre)}.
          </p>
        )}
        */}  

        {/* PASO 1 */}
        {paso === 1 && (
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-700">
                <Waves size={20} />
              </div>
              <h1 className="text-2xl font-bold">Natación</h1>
            </div>
            <p className="text-sm text-stone-600 mb-5">
              Elija correctamente su categoría, horario y los días. Puede agregar hasta {MAX_HORARIOS} horarios distintos.
            </p>

            {bloques.length > 0 && (
              <div className="space-y-2 mb-5">
                {bloques.map((b, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-sky-200 bg-sky-50 px-4 py-3">
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
                      className={`flex-1 rounded-xl border px-3 py-2.5 text-left transition-colors ${categoria === c.id ? "border-sky-700 bg-sky-50" : "border-stone-200 bg-white hover:border-sky-400"}`}
                    >
                      <p className="text-sm font-semibold leading-tight">{c.label}</p>
                      <p className="text-xs text-stone-500 leading-tight">{c.detalle}</p>
                    </button>
                  ))}
                </div>

                <p className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <Clock size={16} className="text-sky-700" /> Elija un horario
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
                        className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 text-sm bg-white transition-colors ${yaUsada ? "opacity-40 cursor-not-allowed border-stone-100" : seleccionada ? "border-sky-700 bg-sky-50" : "border-stone-200 hover:border-sky-400"}`}
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
                <span>Llegó al máximo de {MAX_HORARIOS} horarios distintos por alumno.</span>
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
                        className={`rounded-xl border px-2 py-2.5 text-xs font-medium transition-colors flex flex-col items-center gap-1 ${sinCupo ? "opacity-40 cursor-not-allowed border-stone-100" : seleccionado ? "border-sky-700 bg-sky-700 text-white" : "border-stone-200 hover:border-sky-400"}`}
                      >
                        <span>{DIA_LABEL[entrada.dia_semana]}</span>
                        <span className={`text-xs ${seleccionado ? "text-sky-100" : "text-stone-400"}`}>
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
                    <button onClick={agregarBloque} className="flex items-center gap-1 text-sm font-semibold text-sky-700 border border-sky-700 rounded-lg px-3 py-1.5 hover:bg-sky-50">
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
                Además de la mensualidad, la inscripción incluye {money(PRECIO_INSCRIPCION)} de inscripción y $400 para Pensionado, Jubilado, Adulto Mayor(trer documento que lo avale),
                {" "}{money(PRECIO_ATENCION_MEDICA)} de atención médica y {money(PRECIO_CERTIFICADO)} de certificado médico (pagos únicos con tarjeta de crédito o débito).
              </span>
            </div>

            <button
              onClick={irAPaso2}
              disabled={bloques.length === 0 && diasSel.length === 0}
              className={`w-full mt-6 rounded-xl py-3.5 font-semibold text-sm transition-colors ${bloques.length > 0 || diasSel.length > 0 ? "bg-sky-700 text-white hover:bg-sky-800" : "bg-stone-200 text-stone-400 cursor-not-allowed"}`}
            >
              Continuar a elegir cita
            </button>
          </div>
        )}

        {/* PASO 2 */}
        {paso === 2 && (
          <div>
            <button onClick={() => setPaso(1)} className="flex items-center gap-1 text-xs text-stone-500 mb-4 hover:text-sky-700">
              <ArrowLeft size={14} /> Cambiar horarios o días
            </button>

            <h1 className="text-2xl font-bold mb-1">Agende su cita de atención</h1>
            <p className="text-sm text-stone-600 mb-6">Elija el día y la hora en que asistirá a la captura de sus datos.</p>

            <div className="rounded-2xl border border-stone-200 bg-white p-4 mb-5 space-y-2">
              <p className="text-xs text-stone-500">Plan seleccionado</p>
              {bloques.map((b, i) => (
                <p key={i} className="text-sm font-semibold">
                  Natación · {b.horaInicio} · {b.dias.map((d) => DIA_LABEL[d.dia_semana]).join(", ")}
                </p>
              ))}
              <p className="text-sm text-sky-700 font-bold pt-1">{money(totalMensualidad)}/mes</p>
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
                className={`w-full rounded-xl border px-4 py-3 text-sm uppercase tracking-wide focus:outline-none ${errorCurp ? "border-red-400 bg-red-50" : "border-stone-200 bg-white focus:border-sky-700"}`}
              />
              <p className="text-xs text-stone-500 mt-1">Escriba la CURP del alumno que se inscribirá, se usará para generar su folio de inscripción.</p>
              {errorCurp && <p className="text-xs text-red-600 mt-1 font-medium">{errorCurp}</p>}
            </div>

            <div className="mb-5">
              <p className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                <CalendarDays size={16} className="text-sky-700" /> Elija un día
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {cargandoDias ? (
                  <div className="flex items-center gap-2 text-sm text-stone-500 py-2">
                    <Loader2 size={16} className="animate-spin" /> Cargando fechas...
                  </div>
                ) : diasCita.length === 0 ? (
                  <p className="text-sm text-stone-500 py-2">
                    Por ahora no hay fechas de cita disponibles. Vuelva a intentarlo más tarde.
                  </p>
                ) : (
                  diasCita.map((d) => (
                    <button
                      key={d.fecha}
                      onClick={() => { setDiaCitaSel(d.fecha); setHoraCitaSel(null); }}
                      className={`shrink-0 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${diaCitaSel === d.fecha ? "border-sky-700 bg-sky-50 text-sky-700" : "border-stone-200 bg-white hover:border-sky-400"}`}
                    >
                      {d.label}
                    </button>
                  ))
                )}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                <Clock size={16} className="text-sky-700" /> Horarios disponibles
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
                        className={`rounded-xl border py-2 text-sm font-medium transition-colors flex flex-col items-center gap-0.5 ${sinCupo ? "opacity-40 cursor-not-allowed border-stone-100" : seleccionado ? "border-sky-700 bg-sky-700 text-white" : "border-stone-200 hover:border-sky-400"}`}
                      >
                        <span>{slot.hora_inicio}</span>
                        <span className={`text-xs ${seleccionado ? "text-sky-100" : "text-stone-400"}`}>
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
              className={`w-full mt-8 rounded-xl py-3.5 font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${horaCitaSel && !enviando ? "bg-sky-700 text-white hover:bg-sky-800" : "bg-stone-200 text-stone-400 cursor-not-allowed"}`}
            >
              {enviando && <Loader2 size={16} className="animate-spin" />}
              {enviando ? "Guardando..." : "Confirmar cita"}
            </button>
          </div>
        )}

        {/* PASO 3 */}
        {paso === 3 && (
          <div className="text-center pt-6">
            <div className="w-14 h-14 rounded-full bg-sky-50 text-sky-700 flex items-center justify-center mx-auto mb-5">
              <Check size={26} />
            </div>
            <h1 className="text-2xl font-bold mb-1">Todo listo</h1>
            <p className="text-sm text-stone-600 mb-1">Guarde estos datos (puede tomar una captura de pantalla), 
              los necesitará el día de su cita además de la documentación correspondiente. Llegar 20 minutos previos a su cita para sacar su certificado médico,
              si previamente ya tramitó su certificado médico llegar 5 minutos antes de la hora de su cita</p>
            <p className="text-lg font-bold text-sky-700 mb-6 tracking-wide">Folio: {folio}</p>

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
                <p className="text-xs text-stone-500">Mensualidad total(no incluye costo de Inscripción y Atención Médica)</p>
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
                setRefrescoHorarios((n) => n + 1); // trae el cupo actualizado, sin recargar la página
              }}
              className="mt-6 text-sm text-sky-700 font-semibold underline underline-offset-2"
            >
              Empezar de nuevo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
