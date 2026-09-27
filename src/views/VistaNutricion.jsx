import React, { useState, useEffect } from "react";
import { Apple, Plus, X, Settings, BookOpen } from "lucide-react";
import { safeGet, safeSet } from "../lib/storage";
import { ALIMENTOS, COMIDAS_DEL_DIA, HELADERA_ITEMS, NOMBRE_OBJETIVO, TIPOS_COMIDA, ordenarRecetasPorObjetivo, recomendarComida, sugerirCombinacionLibre, sugerirDesdeHeladera } from "../data/nutricion";
import { C } from "../tema";
import { FilaColapsable, FilaItem, Locked, Panel } from "../components/ui.jsx";

export function PanelHeladera({ restanteKcal, onAgregarComida, accesoPremium, onBloqueado }) {
  const [seleccion, setSeleccion] = useState([]);
  const [agregado, setAgregado] = useState(null);
  const [misMenus, setMisMenus] = useState(null);
  const [creando, setCreando] = useState(false);
  const [nuevoMenu, setNuevoMenu] = useState({ nombre: "", ingredientes: [], kcal: "", prot: "", carb: "", grasa: "" });

  const toggle = (item) => {
    setSeleccion((prev) => (prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]));
  };

  useEffect(() => {
    if (!accesoPremium) return;
    (async () => {
      const guardados = await safeGet("misMenus");
      setMisMenus(guardados || []);
    })();
  }, [accesoPremium]);

  if (!accesoPremium) {
    return (
      <Panel>
        <div className="display text-sm mb-3" style={{ color: C.muted }}>EN LA HELADERA TENGO...</div>
        <Locked titulo="Recetas armadas con lo que tienes en tu heladera" onBloqueado={onBloqueado} />
      </Panel>
    );
  }

  const { completas, casiCompletas } = sugerirDesdeHeladera(seleccion, misMenus || []);
  const combinacionLibre = completas.length === 0 ? sugerirCombinacionLibre(seleccion) : null;

  const agregar = (r) => {
    onAgregarComida({ nombre: r.nombre, kcal: r.kcal, prot: r.prot, carb: r.carb, grasa: r.grasa });
    setAgregado(r.nombre);
    setTimeout(() => setAgregado(null), 2000);
  };

  const toggleIngredienteNuevo = (item) => {
    setNuevoMenu((prev) => ({
      ...prev,
      ingredientes: prev.ingredientes.includes(item) ? prev.ingredientes.filter((x) => x !== item) : [...prev.ingredientes, item],
    }));
  };

  const guardarMenu = async () => {
    if (!nuevoMenu.nombre.trim() || nuevoMenu.ingredientes.length === 0 || !nuevoMenu.kcal) return;
    const menu = {
      nombre: nuevoMenu.nombre.trim(),
      ingredientes: nuevoMenu.ingredientes,
      kcal: Number(nuevoMenu.kcal) || 0,
      prot: Number(nuevoMenu.prot) || 0,
      carb: Number(nuevoMenu.carb) || 0,
      grasa: Number(nuevoMenu.grasa) || 0,
    };
    const nuevaLista = [...(misMenus || []), menu];
    setMisMenus(nuevaLista);
    await safeSet("misMenus", nuevaLista);
    setNuevoMenu({ nombre: "", ingredientes: [], kcal: "", prot: "", carb: "", grasa: "" });
    setCreando(false);
  };

  const borrarMenu = async (nombre) => {
    const nuevaLista = (misMenus || []).filter((m) => m.nombre !== nombre);
    setMisMenus(nuevaLista);
    await safeSet("misMenus", nuevaLista);
  };

  return (
    <Panel style={{ borderColor: C.food }}>
      <div className="flex items-center gap-2 mb-1">
        <Apple size={16} color={C.food} />
        <span className="display text-sm" style={{ color: C.food }}>EN LA HELADERA TENGO...</span>
      </div>
      <p className="text-xs mb-3" style={{ color: C.muted }}>Marca lo que tienes y te digo qué puedes preparar sin pasarte de tus calorías de hoy.</p>

      <div className="flex flex-wrap gap-2 mb-3">
        {HELADERA_ITEMS.map((item) => {
          const activo = seleccion.includes(item);
          return (
            <button
              key={item}
              onClick={() => toggle(item)}
              className="px-3 py-1 rounded-full text-xs"
              style={{
                background: activo ? C.food : C.panelAlt,
                color: activo ? C.bg : C.muted,
                border: `1px solid ${activo ? C.food : C.border}`,
              }}
            >
              {item}
            </button>
          );
        })}
      </div>

      {seleccion.length === 0 && (
        <p className="text-xs" style={{ color: C.muted }}>Elige al menos un ingrediente para ver sugerencias.</p>
      )}

      {completas.length > 0 && (
        <div className="flex flex-col gap-2">
          {completas.map((r) => {
            const cabe = r.kcal <= restanteKcal;
            return (
              <div key={r.nombre} className="rounded px-3 py-2" style={{ background: C.panelAlt }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{r.nombre}</span>
                  <span className="text-xs mono" style={{ color: cabe ? C.food : C.danger }}>{r.kcal} kcal</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px]" style={{ color: cabe ? C.muted : C.danger }}>
                    {cabe ? "Entra en tus calorías de hoy" : "Se pasa de lo que te queda hoy"}
                  </span>
                  <button onClick={() => agregar(r)} className="text-[10px] mono px-2 py-1 rounded" style={{ background: C.food, color: C.bg }}>
                    {agregado === r.nombre ? "Agregado ✓" : "Agregar"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {completas.length === 0 && combinacionLibre && (
        <div className="rounded px-3 py-2 mb-3" style={{ background: C.panelAlt, border: `1px dashed ${C.food}` }}>
          <p className="text-xs" style={{ color: C.text }}>{combinacionLibre}</p>
        </div>
      )}

      {completas.length === 0 && casiCompletas.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs" style={{ color: C.muted }}>
            {combinacionLibre
              ? "También tienes estas recetas ya armadas (no usan todo lo que elegiste, pero traen las calorías calculadas):"
              : "No llega a ninguna receta completa, pero estas son las que mejor puedes armar con lo que tienes:"}
          </p>
          {casiCompletas.map((r) => (
            <div key={r.nombre} className="rounded px-3 py-2" style={{ background: C.panelAlt }}>
              <div className="flex items-center justify-between">
                <span className="text-sm">{r.nombre}</span>
                <span className="text-[10px] mono" style={{ color: C.muted }}>{r.tenes.length}/{r.ingredientes.length}</span>
              </div>
              <div className="text-[10px]" style={{ color: C.food }}>Te falta: {r.falta.join(", ")}</div>
            </div>
          ))}
        </div>
      )}

      {seleccion.length > 0 && completas.length === 0 && casiCompletas.length === 0 && (
        <p className="text-xs" style={{ color: C.muted }}>No encontré una receta con esa combinación. Prueba agregar algún ingrediente más.</p>
      )}

      <div className="mt-4 pt-3" style={{ borderTop: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium" style={{ color: C.muted }}>MIS MENÚS</span>
          <button onClick={() => setCreando(!creando)} className="text-xs mono" style={{ color: C.food }}>
            {creando ? "Cancelar" : "+ Crear menú"}
          </button>
        </div>

        {misMenus && misMenus.length > 0 && (
          <div className="flex flex-col gap-2 mb-2">
            {misMenus.map((m) => (
              <div key={m.nombre} className="flex items-center justify-between rounded px-3 py-2" style={{ background: C.panelAlt }}>
                <div>
                  <div className="text-sm">{m.nombre}</div>
                  <div className="text-[10px]" style={{ color: C.muted }}>{m.ingredientes.join(", ")} · {m.kcal} kcal</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => agregar(m)} className="text-[10px] mono px-2 py-1 rounded" style={{ background: C.food, color: C.bg }}>
                    Agregar
                  </button>
                  <button onClick={() => borrarMenu(m.nombre)}><X size={14} color={C.muted} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {creando && (
          <div className="rounded-md p-3 flex flex-col gap-2" style={{ background: C.panelAlt }}>
            <input
              value={nuevoMenu.nombre}
              onChange={(e) => setNuevoMenu({ ...nuevoMenu, nombre: e.target.value })}
              placeholder="Nombre del menú"
              className="rounded px-2 py-2 text-xs"
              style={{ background: C.panel, color: C.text, border: `1px solid ${C.border}` }}
            />
            <div className="flex flex-wrap gap-1">
              {HELADERA_ITEMS.map((item) => {
                const activo = nuevoMenu.ingredientes.includes(item);
                return (
                  <button
                    key={item}
                    onClick={() => toggleIngredienteNuevo(item)}
                    className="px-2 py-1 rounded-full text-[10px]"
                    style={{
                      background: activo ? C.food : C.panel,
                      color: activo ? C.bg : C.muted,
                      border: `1px solid ${activo ? C.food : C.border}`,
                    }}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              {["kcal", "prot", "carb", "grasa"].map((campo) => (
                <input
                  key={campo}
                  type="number"
                  placeholder={campo}
                  value={nuevoMenu[campo]}
                  onChange={(e) => setNuevoMenu({ ...nuevoMenu, [campo]: e.target.value })}
                  className="rounded px-2 py-2 text-xs w-full mono"
                  style={{ background: C.panel, color: C.text, border: `1px solid ${C.border}` }}
                />
              ))}
            </div>
            <button
              onClick={guardarMenu}
              disabled={!nuevoMenu.nombre.trim() || nuevoMenu.ingredientes.length === 0 || !nuevoMenu.kcal}
              className="py-2 rounded text-sm font-medium disabled:opacity-40"
              style={{ background: C.food, color: C.bg }}
            >
              Guardar menú
            </button>
          </div>
        )}
      </div>
    </Panel>
  );
}

export function PanelComidasDia({ perfil }) {
  const [plan, setPlan] = useState(null);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    (async () => {
      const guardado = await safeGet("planComidas");
      setPlan(guardado || COMIDAS_DEL_DIA.map((m) => ({ ...m })));
    })();
  }, []);

  if (!plan) return null;

  const totalPct = plan.reduce((s, m) => s + Number(m.pct || 0), 0);

  const actualizar = (i, campo, valor) => {
    const nuevo = plan.map((m, idx) => (idx === i ? { ...m, [campo]: campo === "pct" ? Number(valor) / 100 : valor } : m));
    setPlan(nuevo);
  };

  const agregarComidaPlan = () => setPlan([...plan, { nombre: "Nueva comida", pct: 0 }]);
  const quitarComidaPlan = (i) => setPlan(plan.filter((_, idx) => idx !== i));

  const guardar = async () => {
    await safeSet("planComidas", plan);
    setEditando(false);
  };

  const restablecer = async () => {
    const sugerido = COMIDAS_DEL_DIA.map((m) => ({ ...m }));
    setPlan(sugerido);
    await safeSet("planComidas", sugerido);
  };

  return (
    <Panel>
      <div className="flex items-center justify-between mb-1">
        <div className="display text-sm" style={{ color: C.muted }}>CUÁNTO DEBÉS COMER POR DÍA</div>
        <button onClick={() => setEditando(!editando)} className="text-xs mono" style={{ color: C.food }}>
          {editando ? "Listo" : "Editar"}
        </button>
      </div>
      <p className="text-xs mb-3" style={{ color: C.muted }}>
        Objetivo diario: {perfil.kcal} kcal · P{perfil.prot}g · C{perfil.carb}g · G{perfil.grasa}g. Esto es una sugerencia, repártela como te quede más cómoda.
      </p>

      {!editando ? (
        <div className="flex flex-col gap-2">
          {plan.map((m, i) => (
            <div key={i} className="flex items-center justify-between rounded px-3 py-2" style={{ background: C.panelAlt }}>
              <span className="text-sm">{m.nombre}</span>
              <span className="text-xs mono" style={{ color: C.muted }}>
                {Math.round(perfil.kcal * m.pct)} kcal · P{Math.round(perfil.prot * m.pct)}g
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {plan.map((m, i) => (
            <div key={i} className="flex items-center gap-2 rounded px-2 py-2" style={{ background: C.panelAlt }}>
              <input
                value={m.nombre}
                onChange={(e) => actualizar(i, "nombre", e.target.value)}
                className="flex-1 rounded px-2 py-1 text-xs"
                style={{ background: C.panel, color: C.text, border: `1px solid ${C.border}` }}
              />
              <input
                type="number"
                value={Math.round(m.pct * 100)}
                onChange={(e) => actualizar(i, "pct", e.target.value)}
                className="w-14 rounded px-2 py-1 text-xs mono text-right"
                style={{ background: C.panel, color: C.text, border: `1px solid ${C.border}` }}
              />
              <span className="text-xs" style={{ color: C.muted }}>%</span>
              <button onClick={() => quitarComidaPlan(i)}><X size={14} color={C.muted} /></button>
            </div>
          ))}
          <div className="text-[10px]" style={{ color: totalPct === 1 ? C.muted : C.danger }}>
            Total: {Math.round(totalPct * 100)}%{totalPct !== 1 ? " (debería sumar 100%)" : ""}
          </div>
          <div className="flex gap-2 mt-1">
            <button onClick={agregarComidaPlan} className="flex-1 flex items-center justify-center gap-1 py-2 rounded text-xs" style={{ background: C.panel, color: C.muted, border: `1px solid ${C.border}` }}>
              <Plus size={12} /> Agregar comida
            </button>
            <button onClick={restablecer} className="flex-1 py-2 rounded text-xs" style={{ background: C.panel, color: C.muted, border: `1px solid ${C.border}` }}>
              Usar sugerencia
            </button>
          </div>
          <button onClick={guardar} className="w-full py-2 rounded font-medium mt-1" style={{ background: C.food, color: C.bg }}>
            Guardar
          </button>
        </div>
      )}
    </Panel>
  );
}

export function PanelRecetas({ onAgregar, objetivo }) {
  const [abierta, setAbierta] = useState(null);
  const [agregada, setAgregada] = useState(null);
  const [tipoFiltro, setTipoFiltro] = useState("todas");
  const ordenadas = ordenarRecetasPorObjetivo(objetivo);
  const recetas = tipoFiltro === "todas" ? ordenadas : ordenadas.filter((r) => r.tipo === tipoFiltro);

  const agregar = (r) => {
    onAgregar({ nombre: r.nombre, kcal: r.kcal, prot: r.prot, carb: r.carb, grasa: r.grasa });
    setAgregada(r.nombre);
    setTimeout(() => setAgregada(null), 2000);
  };

  return (
    <Panel>
      <div className="flex items-center gap-2 mb-1">
        <Apple size={16} color={C.food} />
        <span className="display text-sm" style={{ color: C.food }}>RECETAS SALUDABLES</span>
      </div>
      <p className="text-xs mb-3" style={{ color: C.muted }}>
        Ideas simples y rápidas, ordenadas para tu objetivo de {NOMBRE_OBJETIVO[objetivo] || NOMBRE_OBJETIVO.mantener}. Toca una para ver los ingredientes y cómo prepararla.
      </p>
      <div className="flex flex-wrap gap-2 mb-3">
        <button
          onClick={() => setTipoFiltro("todas")}
          className="px-3 py-1 rounded-full text-xs"
          style={{
            background: tipoFiltro === "todas" ? C.food : C.panelAlt,
            color: tipoFiltro === "todas" ? C.bg : C.muted,
            border: `1px solid ${tipoFiltro === "todas" ? C.food : C.border}`,
          }}
        >
          Todas
        </button>
        {TIPOS_COMIDA.map((t) => (
          <button
            key={t.id}
            onClick={() => setTipoFiltro(t.id)}
            className="px-3 py-1 rounded-full text-xs"
            style={{
              background: tipoFiltro === t.id ? C.food : C.panelAlt,
              color: tipoFiltro === t.id ? C.bg : C.muted,
              border: `1px solid ${tipoFiltro === t.id ? C.food : C.border}`,
            }}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {recetas.map((r) => {
          const abiertaAhora = abierta === r.nombre;
          const tipoInfo = TIPOS_COMIDA.find((t) => t.id === r.tipo);
          return (
            <div key={r.nombre} className="rounded" style={{ background: C.panelAlt, border: `1px solid ${C.border}` }}>
              <button
                onClick={() => setAbierta(abiertaAhora ? null : r.nombre)}
                className="w-full flex items-center gap-3 px-3 py-2 text-left"
              >
                <div
                  className="flex items-center justify-center flex-shrink-0"
                  style={{ width: 36, height: 36, borderRadius: 8, background: C.panel, fontSize: 18 }}
                >
                  {tipoInfo?.emoji || "🍽️"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{r.nombre}</div>
                  <div className="text-[9px]" style={{ color: C.muted }}>{tipoInfo?.label || "Comida"}</div>
                </div>
                <span className="text-xs mono flex-shrink-0" style={{ color: C.food }}>{r.kcal} kcal</span>
              </button>
              {abiertaAhora && (
                <div className="px-3 pb-3">
                  <div className="text-[10px] mb-1" style={{ color: C.muted }}>Ingredientes: {r.ingredientes.join(", ")}</div>
                  <div className="text-[11px] mb-2" style={{ color: C.text }}>{r.preparacion}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] mono" style={{ color: C.muted }}>P{r.prot}g · C{r.carb}g · G{r.grasa}g</span>
                    <button
                      onClick={() => agregar(r)}
                      className="text-[10px] mono px-2 py-1 rounded"
                      style={{ background: C.food, color: C.bg }}
                    >
                      {agregada === r.nombre ? "Agregado ✓" : "Agregar a mis comidas"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

export function VistaNutricion({ totales, perfil, registro, onAgregar, onQuitar, accesoPremium, onBloqueado }) {
  const [custom, setCustom] = useState({ nombre: "", kcal: "", prot: "", carb: "", grasa: "" });
  const [verRecetas, setVerRecetas] = useState(false);
  const [verHeladera, setVerHeladera] = useState(false);
  const [verComidasDia, setVerComidasDia] = useState(false);
  const [verAgregarRapido, setVerAgregarRapido] = useState(false);
  const [verPersonalizado, setVerPersonalizado] = useState(false);

  const barra = (valor, objetivo, color) => (
    <div className="mb-2">
      <div className="flex justify-between text-xs mono mb-1" style={{ color: C.muted }}>
        <span>{Math.round(valor)}g</span>
        <span>{objetivo}g</span>
      </div>
      <div style={{ height: 8, background: C.border, borderRadius: 4 }}>
        <div
          style={{
            width: `${Math.max(Math.min((valor / objetivo) * 100, 100), valor > 0 ? 4 : 0)}%`,
            height: 8,
            background: color,
            borderRadius: 4,
          }}
        />
      </div>
    </div>
  );

  const rec = recomendarComida(totales, perfil);

  return (
    <div>
      <Panel>
        <div className="display text-sm mb-3" style={{ color: C.muted }}>MACROS DE HOY</div>
        <div className="text-xs mb-1" style={{ color: C.muted }}>Proteína</div>
        {barra(totales.prot, perfil.prot, C.food)}
        <div className="text-xs mb-1" style={{ color: C.muted }}>Carbohidratos</div>
        {barra(totales.carb, perfil.carb, C.train)}
        <div className="text-xs mb-1" style={{ color: C.muted }}>Grasas</div>
        {barra(totales.grasa, perfil.grasa, "#C9A24B")}
      </Panel>

      <Panel style={{ borderColor: accesoPremium ? C.food : C.border }}>
        <div className="flex items-center gap-2 mb-2">
          <Apple size={16} color={C.food} />
          <span className="display text-sm" style={{ color: C.food }}>QUÉ COMER AHORA</span>
        </div>
        {accesoPremium ? (
          <>
            <p className="text-sm mb-2">{rec.mensaje}</p>
            {rec.sugerencias.length > 0 && (
              <div className="flex flex-col gap-2">
                {rec.sugerencias.map((a) => (
                  <div key={a.nombre} className="flex items-center justify-between rounded px-3 py-2" style={{ background: C.panelAlt }}>
                    <span className="text-sm">{a.nombre}</span>
                    <span className="text-xs mono" style={{ color: C.food }}>{a.kcal} kcal · P{a.prot}g</span>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <Locked titulo="Recomendación personalizada según tus macros" onBloqueado={onBloqueado} />
        )}
      </Panel>

      <FilaColapsable icon={BookOpen} color={C.food} titulo="Ver recetas" abierto={verRecetas} onClick={() => setVerRecetas((v) => !v)} />
      {verRecetas && <PanelRecetas onAgregar={onAgregar} objetivo={perfil.objetivo} />}

      <FilaColapsable icon={Apple} color={C.food} titulo="En la heladera tengo..." abierto={verHeladera} onClick={() => setVerHeladera((v) => !v)} />
      {verHeladera && (
        <PanelHeladera restanteKcal={Math.max(perfil.kcal - totales.kcal, 0)} onAgregarComida={onAgregar} accesoPremium={accesoPremium} onBloqueado={onBloqueado} />
      )}

      <FilaColapsable icon={Settings} color={C.muted} titulo="Cuánto debes comer por día" abierto={verComidasDia} onClick={() => setVerComidasDia((v) => !v)} />
      {verComidasDia && <PanelComidasDia perfil={perfil} />}

      <FilaColapsable icon={Plus} color={C.food} titulo="Agregar rápido" abierto={verAgregarRapido} onClick={() => setVerAgregarRapido((v) => !v)} />
      {verAgregarRapido && (
        <Panel>
          <div className="grid grid-cols-2 gap-2">
            {ALIMENTOS.map((a) => (
              <button
                key={a.nombre}
                onClick={() => onAgregar(a)}
                className="text-left p-2 rounded"
                style={{ background: C.panelAlt, border: `1px solid ${C.border}` }}
              >
                <div className="text-xs">{a.nombre}</div>
                <div className="text-[10px] mono" style={{ color: C.food }}>{a.kcal} kcal</div>
              </button>
            ))}
          </div>
        </Panel>
      )}

      <FilaColapsable icon={Plus} color={C.food} titulo="Cargar alimento personalizado" abierto={verPersonalizado} onClick={() => setVerPersonalizado((v) => !v)} />
      {verPersonalizado && (
      <Panel>
        {accesoPremium ? (
          <div className="flex flex-col gap-2">
            <input placeholder="Nombre" value={custom.nombre} onChange={(e) => setCustom({ ...custom, nombre: e.target.value })} className="rounded px-2 py-2 text-sm" style={{ background: C.panelAlt, color: C.text, border: `1px solid ${C.border}` }} />
            <div className="flex gap-2">
              {["kcal", "prot", "carb", "grasa"].map((campo) => (
                <input
                  key={campo}
                  type="number"
                  placeholder={campo}
                  value={custom[campo]}
                  onChange={(e) => setCustom({ ...custom, [campo]: e.target.value })}
                  className="rounded px-2 py-2 text-sm w-full mono"
                  style={{ background: C.panelAlt, color: C.text, border: `1px solid ${C.border}` }}
                />
              ))}
            </div>
            <button
              disabled={!custom.nombre || !custom.kcal}
              onClick={() => {
                onAgregar({
                  nombre: custom.nombre,
                  kcal: Number(custom.kcal) || 0,
                  prot: Number(custom.prot) || 0,
                  carb: Number(custom.carb) || 0,
                  grasa: Number(custom.grasa) || 0,
                });
                setCustom({ nombre: "", kcal: "", prot: "", carb: "", grasa: "" });
              }}
              className="flex items-center justify-center gap-1 py-2 rounded font-medium disabled:opacity-40"
              style={{ background: C.food, color: C.bg }}
            >
              <Plus size={16} /> Agregar
            </button>
          </div>
        ) : (
          <Locked titulo="Alimentos personalizados ilimitados" onBloqueado={onBloqueado} />
        )}
      </Panel>
      )}

      <Panel>
        <div className="display text-sm mb-3" style={{ color: C.muted }}>COMIDAS CARGADAS</div>
        {registro.comidas.length === 0 ? (
          <p className="text-sm" style={{ color: C.muted }}>Sin comidas todavía.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {registro.comidas.map((c) => (
              <FilaItem key={c.id} texto={c.nombre} sub={`${c.kcal} kcal · P${c.prot} C${c.carb} G${c.grasa}`} onQuitar={() => onQuitar(c.id)} />
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
