import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: "./src",
  publicDir: "../public",
  resolve: {
    alias: {
      src: resolve(__dirname, "./src"),
      assets: resolve(__dirname, "./assets"),
    },
  },
  build: {
    outDir: "../dist",
  },
});
