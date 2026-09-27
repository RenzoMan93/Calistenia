import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Las librerías van en archivos aparte del código de la app: cambian muy de
// vez en cuando, así que después de cada deploy el celular sigue usando las
// que ya tenía guardadas y solo baja lo nuevo de la app. Recharts (gráficos)
// queda en su propio archivo y solo se baja al abrir Entreno o Progreso.
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return "react";
          if (id.includes("@supabase")) return "supabase";
        },
      },
    },
  },
});
