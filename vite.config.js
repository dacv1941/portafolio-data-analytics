import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// IMPORTANTE: "base" debe ser "/NOMBRE-DE-TU-REPO/"
export default defineConfig({
  plugins: [react()],
  base: "/portafolio-data-analytics/",
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        compensacion: resolve(__dirname, "compensacion.html"),
        attrition: resolve(__dirname, "attrition.html"),
        credito: resolve(__dirname, "credito.html"),
        causal: resolve(__dirname, "causal.html"),
      },
    },
  },
});
