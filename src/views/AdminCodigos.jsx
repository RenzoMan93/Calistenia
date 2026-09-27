import React, { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { soyAdmin, crearCodigoPremium, listarCodigosPremium, adminListarUsuarios, adminActivarPremium } from "../lib/storage";
import { C } from "../tema";
import { estadoUsuarioAdmin } from "../data/planes";
import { hoy } from "../lib/fechas";

export function AdminCodigos({ onCerrar }) {
  const [autorizado, setAutorizado] = useState(null);
  const [seccion, setSeccion] = useState("usuarios");
  const [codigos, setCodigos] = useState(null);
  const [generando, setGenerando] = useState(false);
  const [usuarios, setUsuarios] = useState(null);
  const [filtro, setFiltro] = useState("");
  const [activandoEmail, setActivandoEmail] = useState(null);

  const cargarCodigos = useCallback(async () => {
    try {
      const lista = await listarCodigosPremium();
      setCodigos(lista);
    } catch (e) {
      console.error(e);
      setCodigos([]);
    }
  }, []);

  const [errorUsuarios, setErrorUsuarios] = useState(null);

  const cargarUsuarios = useCallback(async () => {
    setErrorUsuarios(null);
    try {
      const lista = await adminListarUsuarios();
      setUsuarios(lista);
    } catch (e) {
      console.error(e);
      setErrorUsuarios(e?.message || "Error desconocido");
      setUsuarios([]);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const ok = await soyAdmin();
      setAutorizado(ok);
      if (ok) {
        cargarUsuarios();
        cargarCodigos();
      }
    })();
  }, [cargarUsuarios, cargarCodigos]);

  const generar = async () => {
    setGenerando(true);
    try {
      await crearCodigoPremium();
      await cargarCodigos();
    } catch (e) {
      console.error(e);
    }
    setGenerando(false);
  };

  const activarPremiumA = async (email) => {
    setActivandoEmail(email);
    try {
      await adminActivarPremium(email, 30);
      await cargarUsuarios();
    } catch (e) {
      console.error(e);
    }
    setActivandoEmail(null);
  };

  const hoyStr = hoy();
  const usuariosFiltrados = (usuarios || []).filter((u) => {
    const q = filtro.trim().toLowerCase();
    if (!q) return true;
    return (u.email || "").toLowerCase().includes(q) || (u.nombre || "").toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", zIndex: 70 }}>
      <div style={{ background: C.panel, border: `1px solid ${C.border}`, boxShadow: "0 20px 50px rgba(0,0,0,0.45)" }} className="rounded-lg p-4 w-full max-w-sm max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-2">
          <span className="display text-sm" style={{ color: C.muted }}>PANEL DE ADMINISTRACIÓN</span>
          <button onClick={onCerrar}><X size={18} color={C.muted} /></button>
        </div>

        {autorizado === null && <p className="text-xs" style={{ color: C.muted }}>Verificando permisos...</p>}
        {autorizado === false && (
          <p className="text-xs" style={{ color: C.danger }}>Esta cuenta no tiene permisos de administrador.</p>
        )}

        {autorizado && (
          <>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setSeccion("usuarios")}
                className="flex-1 py-2 rounded text-xs mono"
                style={{ background: seccion === "usuarios" ? C.train : C.panelAlt, color: seccion === "usuarios" ? C.panel : C.muted }}
              >
                Usuarios
              </button>
              <button
                onClick={() => setSeccion("codigos")}
                className="flex-1 py-2 rounded text-xs mono"
                style={{ background: seccion === "codigos" ? C.train : C.panelAlt, color: seccion === "codigos" ? C.panel : C.muted }}
              >
                Códigos
              </button>
            </div>

            {seccion === "usuarios" && (
              <div>
                <p className="text-[10px] mb-3" style={{ color: C.muted }}>
                  Todos los que se registraron en la app, con su estado actual. "+30 días" le activa o extiende
                  Premium a esa cuenta puntual, sin necesidad de código ni pago.
                </p>
                <input
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  placeholder="Buscar por email o nombre..."
                  className="w-full rounded px-3 py-2 text-xs mb-3"
                  style={{ background: C.panelAlt, color: C.text, border: `1px solid ${C.border}` }}
                />
                {errorUsuarios ? (
                  <p className="text-xs" style={{ color: C.danger }}>Error al cargar: {errorUsuarios}</p>
                ) : usuarios === null ? (
                  <p className="text-xs" style={{ color: C.muted }}>Cargando...</p>
                ) : usuariosFiltrados.length === 0 ? (
                  <p className="text-xs" style={{ color: C.muted }}>No hay usuarios que coincidan.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {usuariosFiltrados.map((u) => {
                      const estado = estadoUsuarioAdmin(u, hoyStr);
                      return (
                        <div key={u.user_id} className="rounded px-3 py-2" style={{ background: C.panelAlt }}>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs truncate">{u.email}</span>
                            <span className="text-[10px] mono flex-shrink-0" style={{ color: estado.color }}>{estado.texto}</span>
                          </div>
                          <div className="flex items-center justify-between mt-1 gap-2">
                            <span className="text-[9px]" style={{ color: C.muted }}>
                              {u.nombre ? `${u.nombre} · ` : ""}Alta: {new Date(u.creado).toLocaleDateString("es-UY")}
                            </span>
                            <button
                              onClick={() => activarPremiumA(u.email)}
                              disabled={activandoEmail === u.email}
                              className="text-[10px] mono px-2 py-1 rounded flex-shrink-0"
                              style={{ background: C.food, color: C.bg, opacity: activandoEmail === u.email ? 0.5 : 1 }}
                            >
                              {activandoEmail === u.email ? "..." : "+30 días"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {seccion === "codigos" && (
              <div>
                <p className="text-[10px] mb-3" style={{ color: C.muted }}>
                  Mercado Pago activa Premium automáticamente al confirmar el pago. Usa esto solo para casos manuales
                  (promociones, cortesías). Cada código es de un solo uso.
                </p>
                <button onClick={generar} disabled={generando} className="w-full py-2 rounded font-medium mb-3" style={{ background: C.food, color: C.bg, opacity: generando ? 0.5 : 1 }}>
                  {generando ? "Generando..." : "Generar código nuevo"}
                </button>
                {codigos === null ? (
                  <p className="text-xs" style={{ color: C.muted }}>Cargando...</p>
                ) : codigos.length === 0 ? (
                  <p className="text-xs" style={{ color: C.muted }}>Todavía no generaste códigos.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {codigos.map((c) => (
                      <div key={c.codigo} className="flex items-center justify-between rounded px-3 py-2" style={{ background: C.panelAlt }}>
                        <span className="mono text-sm">{c.codigo}</span>
                        <span className="text-[10px]" style={{ color: c.usado ? C.muted : C.food }}>{c.usado ? `Usado (${c.fecha_uso})` : "Disponible"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
