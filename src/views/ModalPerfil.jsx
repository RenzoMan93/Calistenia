import React, { useState } from "react";
import { X, MessageCircle, HelpCircle } from "lucide-react";
import { cerrarSesion } from "../lib/storage";
import { C } from "../tema";
import { NIVELES_ACTIVIDAD, OBJETIVOS, calcularObjetivoDiario } from "../data/nutricion";
import { WHATSAPP_LINK } from "../data/planes";

// ---------- MODAL PERFIL ----------
export function ModalPerfil({ perfil, onGuardar, onCerrar, onVerTerminos, onVerAyuda, esAnonimo, onCrearCuenta }) {
  const [form, setForm] = useState(perfil);
  const [datos, setDatos] = useState({
    peso: perfil.peso || "",
    altura: perfil.altura || "",
    edad: perfil.edad || "",
    sexo: perfil.sexo || "hombre",
    actividad: perfil.actividad || "ligero",
    objetivo: perfil.objetivo || "mantener",
  });
  const [mostrarCalc, setMostrarCalc] = useState(false);
  const [avisoObjetivo, setAvisoObjetivo] = useState(null);
  const datosCompletos = Boolean(datos.peso && datos.altura && datos.edad);

  const calcular = () => {
    const res = calcularObjetivoDiario(datos);
    if (res) setForm({ ...form, ...res, objetivo: datos.objetivo });
  };

  const cambiarObjetivo = (nuevoObjetivo) => {
    const nuevosDatos = { ...datos, objetivo: nuevoObjetivo };
    setDatos(nuevosDatos);
    if (datosCompletos) {
      const res = calcularObjetivoDiario(nuevosDatos);
      if (res) {
        setForm({ ...form, ...res, objetivo: nuevoObjetivo });
        setAvisoObjetivo({ ok: true, texto: "Recalculamos tus calorías y macros para el nuevo objetivo." });
        return;
      }
    }
    setForm({ ...form, objetivo: nuevoObjetivo });
    setAvisoObjetivo({ ok: false, texto: "Completa tu peso, altura y edad en la calculadora de abajo para recalcular tus calorías automáticamente." });
    setMostrarCalc(true);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", zIndex: 50 }}>
      <div style={{ background: C.panel, border: `1px solid ${C.border}`, boxShadow: "0 20px 50px rgba(0,0,0,0.45)" }} className="rounded-lg p-4 w-full max-w-sm max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <span className="display text-sm" style={{ color: C.muted }}>OBJETIVOS DIARIOS</span>
          <button onClick={onCerrar}><X size={18} color={C.muted} /></button>
        </div>

        <div className="mb-4">
          <div className="text-xs mb-2" style={{ color: C.muted }}>Tu objetivo</div>
          <div className="flex gap-2">
            {OBJETIVOS.map((o) => (
              <button
                key={o.id}
                onClick={() => cambiarObjetivo(o.id)}
                className="flex-1 text-xs py-2 rounded text-center"
                style={{
                  background: form.objetivo === o.id ? C.train : C.panelAlt,
                  color: form.objetivo === o.id ? C.panel : C.muted,
                  border: `1px solid ${form.objetivo === o.id ? C.train : C.border}`,
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
          {avisoObjetivo ? (
            <p className="text-[9px] mt-1" style={{ color: avisoObjetivo.ok ? C.food : C.train }}>{avisoObjetivo.texto}</p>
          ) : (
            <p className="text-[9px] mt-1" style={{ color: C.muted }}>
              ¿Ya llegaste a tu meta? Cambia el objetivo cuando quieras: si ya cargaste tu peso, altura y edad, recalculamos tus calorías solas.
            </p>
          )}
        </div>

        <button
          onClick={() => setMostrarCalc(!mostrarCalc)}
          className="w-full text-left text-xs mono mb-3 px-3 py-2 rounded"
          style={{ background: C.panelAlt, color: C.food, border: `1px solid ${C.border}` }}
        >
          {mostrarCalc ? "Ocultar calculadora automática" : "¿No sabes cuántas calorías necesitas? Calcúlalo acá"}
        </button>

        {mostrarCalc && (
          <div className="rounded-md p-3 mb-4 flex flex-col gap-2" style={{ background: C.panelAlt, border: `1px solid ${C.border}` }}>
            <div className="flex gap-2">
              <input type="number" placeholder="Peso (kg)" value={datos.peso} onChange={(e) => setDatos({ ...datos, peso: e.target.value })} className="rounded px-2 py-2 text-xs w-full mono" style={{ background: C.panel, color: C.text, border: `1px solid ${C.border}` }} />
              <input type="number" placeholder="Altura (cm)" value={datos.altura} onChange={(e) => setDatos({ ...datos, altura: e.target.value })} className="rounded px-2 py-2 text-xs w-full mono" style={{ background: C.panel, color: C.text, border: `1px solid ${C.border}` }} />
              <input type="number" placeholder="Edad" value={datos.edad} onChange={(e) => setDatos({ ...datos, edad: e.target.value })} className="rounded px-2 py-2 text-xs w-full mono" style={{ background: C.panel, color: C.text, border: `1px solid ${C.border}` }} />
            </div>
            <div className="flex gap-2">
              {["hombre", "mujer"].map((s) => (
                <button key={s} onClick={() => setDatos({ ...datos, sexo: s })} className="flex-1 text-xs py-2 rounded" style={{ background: datos.sexo === s ? C.food : C.panel, color: datos.sexo === s ? C.bg : C.muted, border: `1px solid ${C.border}` }}>
                  {s === "hombre" ? "Hombre" : "Mujer"}
                </button>
              ))}
            </div>
            <select value={datos.actividad} onChange={(e) => setDatos({ ...datos, actividad: e.target.value })} className="rounded px-2 py-2 text-xs" style={{ background: C.panel, color: C.text, border: `1px solid ${C.border}` }}>
              {NIVELES_ACTIVIDAD.map((n) => <option key={n.id} value={n.id}>{n.label}</option>)}
            </select>
            <select value={datos.objetivo} onChange={(e) => setDatos({ ...datos, objetivo: e.target.value })} className="rounded px-2 py-2 text-xs" style={{ background: C.panel, color: C.text, border: `1px solid ${C.border}` }}>
              {OBJETIVOS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
            <button onClick={calcular} className="py-2 rounded text-sm font-medium" style={{ background: C.food, color: C.bg }}>
              Calcular y completar
            </button>
            <p className="text-[9px]" style={{ color: C.muted }}>Estimación orientativa (fórmula Mifflin-St Jeor). Ajústala si tienes indicación de un profesional.</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {[
            ["kcal", "Calorías"],
            ["prot", "Proteína (g)"],
            ["carb", "Carbohidratos (g)"],
            ["grasa", "Grasas (g)"],
          ].map(([campo, label]) => (
            <label key={campo} className="flex flex-col text-xs" style={{ color: C.muted }}>
              {label}
              <input
                type="number"
                value={form[campo]}
                onChange={(e) => setForm({ ...form, [campo]: Number(e.target.value) })}
                className="mt-1 rounded px-2 py-2 mono"
                style={{ background: C.panelAlt, color: C.text, border: `1px solid ${C.border}` }}
              />
            </label>
          ))}
        </div>
        <button
          onClick={() =>
            onGuardar({
              ...form,
              peso: datos.peso,
              altura: datos.altura,
              edad: datos.edad,
              sexo: datos.sexo,
              actividad: datos.actividad,
            })
          }
          className="w-full mt-4 py-2 rounded font-medium"
          style={{ background: C.train, color: C.panel }}
        >
          Guardar
        </button>
        <button
          onClick={onVerAyuda}
          className="flex items-center justify-center gap-1 w-full text-center text-[10px] mt-3 underline"
          style={{ color: C.muted }}
        >
          <HelpCircle size={11} /> ¿Cómo usar la app?
        </button>
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1 w-full text-center text-[10px] mt-3 underline"
          style={{ color: C.food }}
        >
          <MessageCircle size={11} /> ¿Necesitas ayuda? Escríbenos por WhatsApp
        </a>
        <button onClick={onVerTerminos} className="w-full text-center text-[10px] mt-3 underline" style={{ color: C.muted }}>
          Términos y Privacidad
        </button>
        {esAnonimo ? (
          <button onClick={onCrearCuenta} className="w-full text-center text-[10px] mt-2 underline" style={{ color: C.food }}>
            Crear cuenta (no perder tu progreso)
          </button>
        ) : (
          <button onClick={cerrarSesion} className="w-full text-center text-[10px] mt-2 underline" style={{ color: C.danger }}>
            Cerrar sesión
          </button>
        )}
      </div>
    </div>
  );
}
