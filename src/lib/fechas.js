export const diasEntre = (desde, hasta) => Math.floor((new Date(hasta) - new Date(desde)) / 86400000);

export const pad2 = (n) => String(n).padStart(2, "0");

// Fecha local (YYYY-MM-DD), no UTC: con toISOString() en Uruguay (UTC-3)
// después de las 21 h "hoy" pasaba a ser mañana, así que lo que se cargaba de
// noche quedaba guardado en el día siguiente.
export const isoLocal = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

export const hoy = () => isoLocal(new Date());

export const fechaLegible = (iso) => {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-UY", { weekday: "short", day: "2-digit", month: "short" });
};

export const ultimosDias = (n) => {
  const arr = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    arr.push(isoLocal(d));
  }
  return arr;
};

export const NOMBRES_MES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export const uid = () => Math.random().toString(36).slice(2, 9);

export function hacePoco(fechaIso) {
  const diffMs = Date.now() - new Date(fechaIso).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "recién";
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffHoras = Math.floor(diffMin / 60);
  if (diffHoras < 24) return `hace ${diffHoras}h`;
  const diffDias = Math.floor(diffHoras / 24);
  return `hace ${diffDias}d`;
}
