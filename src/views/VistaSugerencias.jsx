import React, { useState, useEffect } from "react";
import { Star, Trash2 } from "lucide-react";
import { usuarioActualId, listarSugerencias, crearSugerencia, borrarSugerencia } from "../lib/storage";
import { C } from "../tema";
import { Estrellas, Panel, SelectorEstrellas } from "../components/ui.jsx";
import { hacePoco } from "../lib/fechas";

export function VistaSugerencias({ perfil, esAnonimo, onCrearCuenta }) {
  const [lista, setLista] = useState(null);
  const [miUserId, setMiUserId] = useState(null);
  const [estrellas, setEstrellas] = useState(5);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const cargar = () => {
    listarSugerencias().then(setLista);
  };

  useEffect(() => {
    cargar();
    usuarioActualId().then(setMiUserId).catch(() => {});
  }, []);

  const enviar = async (e) => {
    e.preventDefault();
    if (!texto.trim() || enviando) return;
    setEnviando(true);
    setMensaje(null);
    try {
      await crearSugerencia({ nombre: perfil?.nombre?.trim() || "Usuario", estrellas, texto: texto.trim() });
      setTexto("");
      setEstrellas(5);
      cargar();
    } catch (err) {
      setMensaje(err.message || "No se pudo publicar. Prueba de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  const borrar = async (id) => {
    setLista((prev) => prev.filter((s) => s.id !== id));
    try {
      await borrarSugerencia(id);
    } catch {
      cargar();
    }
  };

  const promedio = lista && lista.length > 0 ? lista.reduce((sum, s) => sum + s.estrellas, 0) / lista.length : null;

  return (
    <div>
      <Panel>
        <div className="flex items-center gap-2 mb-1">
          <Star size={16} color={C.food} />
          <span className="display text-sm" style={{ color: C.food }}>SUGERENCIAS</span>
        </div>
        <p className="text-[10px] mb-3" style={{ color: C.muted }}>
          Cuéntanos qué te parece la app y qué le agregarías. Lo ve todo el mundo.
        </p>
        {promedio !== null && (
          <div className="flex items-center gap-2 mb-3">
            <Estrellas cantidad={Math.round(promedio)} size={14} />
            <span className="text-xs mono" style={{ color: C.muted }}>
              {promedio.toFixed(1)} de {lista.length} sugerencia{lista.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
        {esAnonimo ? (
          // Sin cuenta no se puede publicar (lo bloquea también el servidor,
          // ver 0006_blindar_suscripcion.sql), para evitar spam anónimo.
          <div className="flex flex-col gap-2">
            <p className="text-xs" style={{ color: C.muted }}>
              Para publicar una sugerencia necesitas crear tu cuenta (no pierdes nada de lo que ya cargaste).
            </p>
            <button onClick={onCrearCuenta} className="py-2 rounded font-medium" style={{ background: C.food, color: C.bg }}>
              Crear mi cuenta
            </button>
          </div>
        ) : (
        <form onSubmit={enviar} className="flex flex-col gap-2">
          <SelectorEstrellas valor={estrellas} onCambiar={setEstrellas} />
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="¿Qué te gustaría que tenga la app?"
            className="rounded px-3 py-2 text-sm"
            style={{ background: C.panelAlt, color: C.text, border: `1px solid ${C.border}` }}
          />
          <button
            type="submit"
            disabled={enviando || !texto.trim()}
            className="py-2 rounded font-medium disabled:opacity-40"
            style={{ background: C.food, color: C.bg }}
          >
            {enviando ? "Publicando..." : "Publicar sugerencia"}
          </button>
          {mensaje && <p className="text-xs" style={{ color: C.danger }}>{mensaje}</p>}
        </form>
        )}
      </Panel>

      <Panel>
        <div className="display text-sm mb-3" style={{ color: C.muted }}>LO QUE DICEN LOS USUARIOS</div>
        {lista === null ? (
          <p className="text-xs" style={{ color: C.muted }}>Cargando...</p>
        ) : lista.length === 0 ? (
          <p className="text-xs" style={{ color: C.muted }}>Todavía no hay sugerencias. ¡Sé el primero!</p>
        ) : (
          <div className="flex flex-col gap-3">
            {lista.map((s) => (
              <div key={s.id} className="rounded px-3 py-2" style={{ background: C.panelAlt }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{s.nombre}</span>
                    <Estrellas cantidad={s.estrellas} />
                  </div>
                  <span className="text-[10px]" style={{ color: C.muted }}>{hacePoco(s.created_at)}</span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs" style={{ color: C.text }}>{s.texto}</p>
                  {s.user_id === miUserId && (
                    <button onClick={() => borrar(s.id)} className="flex-shrink-0" title="Borrar">
                      <Trash2 size={13} color={C.muted} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
