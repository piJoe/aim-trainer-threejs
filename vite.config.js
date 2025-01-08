import { defineConfig } from "vite";
import { resolve } from "path";
import gzipPlugin from "rollup-plugin-gzip";
import { brotliCompress } from "zlib";
import { promisify } from "util";

const brotliPromise = promisify(brotliCompress);
const commonGzipOptions = {
  filter: /\.(js|mjs|cjs|json|css|html|wasm|svg)$/,
};

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
    rollupOptions: {
      plugins: [
        gzipPlugin({
          ...commonGzipOptions,
        }),
        gzipPlugin({
          ...commonGzipOptions,
          customCompression: (content) => brotliPromise(Buffer.from(content)),
          fileName: ".br",
        }),
      ],
    },
  },
});
