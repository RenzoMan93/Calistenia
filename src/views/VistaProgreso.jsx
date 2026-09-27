import React, { useState, useEffect } from "react";
import { Dumbbell, Apple, TrendingUp, Flame, Crown, CalendarDays } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, ReferenceLine, ResponsiveContainer, Tooltip } from "recharts";
import { safeGet, safeSet, listRegistroKeysForMonth } from "../lib/storage";
import { C } from "../tema";
import { FilaColapsable, Locked, Panel } from "../components/ui.jsx";
import { LOGROS_DEF } from "../data/entrenamiento";
import { NOMBRES_MES, fechaLegible, hoy, pad2 } from "../lib/fechas";

export function VistaProgreso({ semana, perfil, progresion, accesoPremium, onBloqueado, onEditarObjetivo }) {
  const [verCalendario, setVerCalendario] = useState(false);
  const [verPeso, setVerPeso] = useState(false);
  const [verCalorias, setVerCalorias] = useState(false);
  if (!accesoPremium) {
    return (
      <Panel>
        <Locked titulo="Racha, gráfico semanal, peso corporal y logros" onBloqueado={onBloqueado} />
      </Panel>
    );
  }
  if (!semana) {
    return <p className="text-sm" style={{ color: C.muted }}>Cargando semana...</p>;
  }
  const diasEntrenados = semana.filter((d) => d.entreno).length;
  let racha = 0;
  for (let i = semana.length - 1; i >= 0; i--) {
    if (semana[i].entreno) racha++;
    else break;
  }
  const nivelMaximo = Math.max(...Object.values(progresion || {}));

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Panel style={{ marginBottom: 0 }}>
          <div className="flex items-center gap-2">
            <Flame size={16} color={C.train} />
            <span className="text-xs" style={{ color: C.muted }}>Racha actual</span>
          </div>
          <div className="display text-2xl mt-1">{racha} día{racha !== 1 ? "s" : ""}</div>
        </Panel>
        <Panel style={{ marginBottom: 0 }}>
          <div className="flex items-center gap-2">
            <Dumbbell size={16} color={C.train} />
            <span className="text-xs" style={{ color: C.muted }}>Días entrenados (7d)</span>
          </div>
          <div className="display text-2xl mt-1">{diasEntrenados}/7</div>
        </Panel>
      </div>

      <PanelLogros racha={racha} diasEntrenados={diasEntrenados} nivelMaximo={nivelMaximo} progresion={progresion} />

      <FilaColapsable icon={CalendarDays} color={C.food} titulo="Ver calendario" abierto={verCalendario} onClick={() => setVerCalendario((v) => !v)} />
      {verCalendario && <PanelCalendario />}

      <FilaColapsable icon={TrendingUp} color={C.food} titulo="Peso corporal" abierto={verPeso} onClick={() => setVerPeso((v) => !v)} />
      {verPeso && <PanelPeso objetivo={perfil.objetivo} onEditarObjetivo={onEditarObjetivo} />}

      <FilaColapsable icon={Apple} color={C.food} titulo="Gráfico de calorías (7 días)" abierto={verCalorias} onClick={() => setVerCalorias((v) => !v)} />
      {verCalorias && (
        <Panel>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={semana}>
              <XAxis dataKey="dia" tick={{ fill: C.muted, fontSize: 10 }} axisLine={{ stroke: C.border }} tickLine={false} />
              <YAxis tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: C.panelAlt, border: `1px solid ${C.border}`, fontSize: 12 }} labelStyle={{ color: C.text }} />
              <ReferenceLine y={perfil.kcal} stroke={C.food} strokeDasharray="4 4" />
              <Bar dataKey="kcal" fill={C.train} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      )}
    </div>
  );
}

export function PanelLogros({ racha, diasEntrenados, nivelMaximo, progresion }) {
  const ctx = { racha, diasEntrenados, nivelMaximo, progresion };
  return (
    <Panel>
      <div className="display text-sm mb-3" style={{ color: C.muted }}>LOGROS</div>
      <div className="grid grid-cols-2 gap-2">
        {LOGROS_DEF.map((l) => {
          const conseguido = l.cumple(ctx);
          return (
            <div
              key={l.id}
              className="rounded-md p-2 flex flex-col items-center text-center gap-1"
              style={{ background: conseguido ? C.foodDim : C.panelAlt, border: `1px solid ${conseguido ? C.food : C.border}`, opacity: conseguido ? 1 : 0.5 }}
            >
              <Crown size={16} color={conseguido ? C.food : C.muted} />
              <span className="text-[11px] font-medium">{l.nombre}</span>
              <span className="text-[9px]" style={{ color: C.muted }}>{l.desc}</span>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

export function PanelCalendario() {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [diasConDatos, setDiasConDatos] = useState(null);
  const [diaSel, setDiaSel] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const monthKey = `${cursor.y}-${pad2(cursor.m + 1)}`;

  useEffect(() => {
    (async () => {
      setDiasConDatos(null);
      setDiaSel(null);
      setDetalle(null);
      const dias = await listRegistroKeysForMonth(monthKey);
      setDiasConDatos(dias);
    })();
  }, [monthKey]);

  const verDia = async (fechaStr) => {
    setDiaSel(fechaStr);
    setCargandoDetalle(true);
    const data = await safeGet(`registro:${fechaStr}`);
    setDetalle(data || { entrenamiento: [], comidas: [] });
    setCargandoDetalle(false);
  };

  const cambiarMes = (delta) => {
    let m = cursor.m + delta;
    let y = cursor.y;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setCursor({ y, m });
  };

  const diasEnMes = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const primerDiaSemana = (new Date(cursor.y, cursor.m, 1).getDay() + 6) % 7; // 0 = lunes
  const celdas = [...Array(primerDiaSemana).fill(null), ...Array.from({ length: diasEnMes }, (_, i) => i + 1)];
  const hoyStr = hoy();

  return (
    <Panel>
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => cambiarMes(-1)} className="px-3 py-1 rounded" style={{ background: C.panelAlt, color: C.muted }}>‹</button>
        <span className="display text-sm" style={{ color: C.muted }}>{NOMBRES_MES[cursor.m].toUpperCase()} {cursor.y}</span>
        <button onClick={() => cambiarMes(1)} className="px-3 py-1 rounded" style={{ background: C.panelAlt, color: C.muted }}>›</button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
          <div key={i} className="text-center text-[9px]" style={{ color: C.muted }}>{d}</div>
        ))}
      </div>

      {diasConDatos === null ? (
        <p className="text-xs" style={{ color: C.muted }}>Cargando...</p>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {celdas.map((dia, i) => {
            if (!dia) return <div key={i} />;
            const fechaStr = `${monthKey}-${pad2(dia)}`;
            const tieneDatos = diasConDatos.has(fechaStr);
            const esHoy = fechaStr === hoyStr;
            const seleccionado = diaSel === fechaStr;
            return (
              <button
                key={i}
                onClick={() => tieneDatos && verDia(fechaStr)}
                disabled={!tieneDatos}
                className="aspect-square rounded flex flex-col items-center justify-center text-[10px]"
                style={{
                  background: seleccionado ? C.train : C.panelAlt,
                  border: `1px solid ${esHoy ? C.train : C.border}`,
                  opacity: tieneDatos ? 1 : 0.35,
                  color: seleccionado ? C.panel : C.text,
                }}
              >
                {dia}
                {tieneDatos && <div style={{ width: 4, height: 4, borderRadius: 2, background: seleccionado ? C.panel : C.food, marginTop: 2 }} />}
              </button>
            );
          })}
        </div>
      )}

      {diaSel && (
        <div className="mt-3 rounded-md p-3" style={{ background: C.panelAlt }}>
          <div className="text-xs mono mb-2" style={{ color: C.food }}>{fechaLegible(diaSel)}</div>
          {cargandoDetalle ? (
            <p className="text-xs" style={{ color: C.muted }}>Cargando...</p>
          ) : (
            <>
              {detalle.entrenamiento.length > 0 && (
                <div className="mb-2">
                  <div className="text-[10px] mb-1" style={{ color: C.muted }}>Entrenamiento</div>
                  {detalle.entrenamiento.map((e) => (
                    <div key={e.id} className="text-xs">{e.ejercicio} — {e.tipo === "tiempo" ? `${e.segundos}s sostenidos` : `${e.series}x${e.reps}`}</div>
                  ))}
                </div>
              )}
              {detalle.comidas.length > 0 && (
                <div>
                  <div className="text-[10px] mb-1" style={{ color: C.muted }}>Comidas</div>
                  {detalle.comidas.map((c) => (
                    <div key={c.id} className="text-xs">{c.nombre} — {c.kcal} kcal</div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Panel>
  );
}

export function PanelPeso({ objetivo, onEditarObjetivo }) {
  const [historial, setHistorial] = useState(null);
  const [pesoHoy, setPesoHoy] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [metaPeso, setMetaPeso] = useState(null);
  const [editandoMeta, setEditandoMeta] = useState(false);
  const [metaInput, setMetaInput] = useState("");

  useEffect(() => {
    (async () => {
      const h = (await safeGet("peso")) || [];
      setHistorial(h);
      const m = await safeGet("metaPeso");
      setMetaPeso(m);
      if (m) setMetaInput(String(m.kg));
    })();
  }, []);

  const registrar = async () => {
    const kg = Number(pesoHoy);
    if (!kg || guardando) return;
    setGuardando(true);
    const otros = (historial || []).filter((p) => p.fecha !== hoy());
    const nuevo = [...otros, { fecha: hoy(), kg }].sort((a, b) => (a.fecha > b.fecha ? 1 : -1));
    setHistorial(nuevo);
    await safeSet("peso", nuevo);
    setPesoHoy("");
    setGuardando(false);
  };

  const guardarMeta = async () => {
    const kg = Number(metaInput);
    if (!kg) return;
    const nueva = { kg };
    setMetaPeso(nueva);
    await safeSet("metaPeso", nueva);
    setEditandoMeta(false);
  };

  if (historial === null) return null;

  const ultimos = historial.slice(-10).map((p) => ({ ...p, dia: fechaLegible(p.fecha).split(" ")[0] }));
  const diferencia = historial.length >= 2 ? historial[historial.length - 1].kg - historial[0].kg : 0;
  const ultimoPeso = historial.length > 0 ? historial[historial.length - 1].kg : null;

  let mensajeMeta = null;
  let yaLlegoMeta = false;
  if (metaPeso && ultimoPeso !== null) {
    const faltante = ultimoPeso - metaPeso.kg;
    yaLlegoMeta = objetivo === "subir" ? faltante >= 0 : objetivo === "bajar" ? faltante <= 0 : Math.abs(faltante) < 0.5;
    if (yaLlegoMeta) {
      mensajeMeta = "¡Llegaste a tu meta de peso! 🎉";
    } else {
      mensajeMeta = `Te ${Math.abs(faltante) === 1 ? "falta" : "faltan"} ${Math.abs(faltante).toFixed(1)} kg para llegar a tu meta de ${metaPeso.kg} kg.`;
    }
  }

  return (
    <Panel>
      <div className="flex items-center justify-between mb-1">
        <span className="display text-sm" style={{ color: C.muted }}>PESO CORPORAL</span>
        {historial.length >= 2 && (
          <span className="text-xs mono" style={{ color: diferencia <= 0 ? C.food : C.train }}>
            {diferencia > 0 ? "+" : ""}{diferencia.toFixed(1)} kg desde el registro
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mb-3">
        {metaPeso && !editandoMeta ? (
          <button onClick={() => setEditandoMeta(true)} className="text-xs mono" style={{ color: C.food }}>
            Meta: {metaPeso.kg} kg (editar)
          </button>
        ) : !editandoMeta ? (
          <button onClick={() => setEditandoMeta(true)} className="text-xs mono underline" style={{ color: C.muted }}>
            Definir meta de peso
          </button>
        ) : null}
      </div>

      {editandoMeta && (
        <div className="flex gap-2 mb-3">
          <input
            type="number"
            step="0.1"
            placeholder="Meta (kg)"
            value={metaInput}
            onChange={(e) => setMetaInput(e.target.value)}
            className="flex-1 rounded px-3 py-2 text-sm mono"
            style={{ background: C.panelAlt, color: C.text, border: `1px solid ${C.border}` }}
          />
          <button onClick={guardarMeta} className="px-4 py-2 rounded text-sm font-medium" style={{ background: C.food, color: C.bg }}>
            Guardar
          </button>
        </div>
      )}

      {mensajeMeta && (
        <p className="text-xs mb-2" style={{ color: C.food }}>{mensajeMeta}</p>
      )}
      {yaLlegoMeta && (
        <button
          onClick={onEditarObjetivo}
          className="w-full flex items-center justify-center gap-1 py-2 rounded text-xs font-medium mb-3"
          style={{ background: C.foodDim, color: C.food, border: `1px solid ${C.food}` }}
        >
          <Crown size={12} /> ¿Y ahora? Cambiar mi objetivo
        </button>
      )}

      <div className="flex gap-2 mb-3">
        <input
          type="number"
          step="0.1"
          placeholder="Peso de hoy (kg)"
          value={pesoHoy}
          onChange={(e) => setPesoHoy(e.target.value)}
          className="flex-1 rounded px-3 py-2 text-sm mono"
          style={{ background: C.panelAlt, color: C.text, border: `1px solid ${C.border}` }}
        />
        <button onClick={registrar} disabled={guardando} className="px-4 py-2 rounded text-sm font-medium" style={{ background: C.food, color: C.bg, opacity: guardando ? 0.5 : 1 }}>
          Registrar
        </button>
      </div>
      {ultimos.length < 2 ? (
        <p className="text-xs" style={{ color: C.muted }}>Registra tu peso un par de veces para ver la evolución.</p>
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={ultimos}>
            <XAxis dataKey="dia" tick={{ fill: C.muted, fontSize: 10 }} axisLine={{ stroke: C.border }} tickLine={false} />
            <YAxis
              tick={{ fill: C.muted, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              domain={[
                (dataMin) => Math.min(dataMin - 1, metaPeso ? metaPeso.kg - 1 : dataMin - 1),
                (dataMax) => Math.max(dataMax + 1, metaPeso ? metaPeso.kg + 1 : dataMax + 1),
              ]}
            />
            <Tooltip contentStyle={{ background: C.panelAlt, border: `1px solid ${C.border}`, fontSize: 12 }} labelStyle={{ color: C.text }} />
            {metaPeso && <ReferenceLine y={metaPeso.kg} stroke={C.food} strokeDasharray="4 4" label={{ value: "Meta", fill: C.food, fontSize: 10, position: "insideTopRight" }} />}
            <Line type="monotone" dataKey="kg" stroke={C.train} strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Panel>
  );
}
