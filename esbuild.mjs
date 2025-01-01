import { build, context } from "esbuild";
import { mkdir, copyFile } from "fs/promises";

const options = {
  entryPoints: ["src/main.ts"],
  bundle: true,
  minify: true,
  outfile: "static/.build/main.js",
  external: ["path", "fs", "child_process", "crypto", "url", "module"],
  loader: {
    ".lua": "text",
  },
};

(async () => {
  try {
    await mkdir("static/.build", { recursive: true });
    await copyFile(
      "node_modules/wasmoon/dist/glue.wasm",
      "static/.build/glue.wasm"
    );
    if (process.argv.includes("--watch")) {
      const ctx = await context(options);
      await ctx.watch();
      const { host, port } = await ctx.serve({
        servedir: "static",
      });
      console.log(`Server running at http://${host}:${port}`);
    } else {
      await build(options);
    }
  } catch (e) {
    console.error(e);
  }
})();
