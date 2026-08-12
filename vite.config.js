import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// IMPORTANTE: "base" debe ser "/NOMBRE-DE-TU-REPO/"
// Si tu repositorio en GitHub se llama distinto a "portafolio-data-analytics",
// cambia el valor de abajo por el nombre exacto de tu repositorio.
export default defineConfig({
  plugins: [react()],
  base: "/portafolio-data-analytics/",
});
