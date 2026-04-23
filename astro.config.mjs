// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) return;

            if (id.includes("/three/")) return "three";
            if (
              id.includes("/@react-three/fiber/") ||
              id.includes("/@react-three/drei/") ||
              id.includes("/@react-three/rapier/") ||
              id.includes("/react/") ||
              id.includes("/react-dom/")
            ) {
              return "react-three";
            }
          },
        },
      },
    },
  },

  integrations: [react()],

  adapter: node({
    mode: "standalone",
  }),
});
