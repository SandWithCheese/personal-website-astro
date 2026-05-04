// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";

import node from "@astrojs/node";

import mdx from "@astrojs/mdx";
import { remarkReadingTime } from "./remark-reading-time.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://sandwicheese.tech",

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

  integrations: [react(), mdx()],
  markdown: {
    remarkPlugins: [remarkReadingTime],
  },

  security: {
    allowedDomains: [
      {
        protocol: "https",
        hostname: "sandwicheese.tech",
      },
    ],
  },

  adapter: node({
    mode: "standalone",
  }),
});
