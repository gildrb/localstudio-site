// Generate separate straight-alpha loading air layers; never writes runtime assets.
// vp exec node packages/logo-renderer/scripts/render-loading-layers.ts --output=/tmp/localstudio-layered-loading
// CSS plane: 3760x4000, logo stage: x1410 y470 w940 h940/1.52.
// Apply viewport edge feather to both layers and day ellipse to day BG in CSS.
// Fixed hero-UV shadow penumbra remains a small viewport-dependent approximation.
// Temporary clone is retained for source provenance and debugging.
import { cpSync, mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { build } from "vite-plus/pack";
import { wgslVitePlugin } from "@vgpu/wgsl/loader-vite";

// Clone before packing WGSL. Runtime shader files stay unchanged.
const packageRoot = fileURLToPath(new URL("../", import.meta.url));
const temporary = mkdtempSync(join(tmpdir(), "localstudio-loading-renderer-"));
cpSync(join(packageRoot, "src"), join(temporary, "src"), { recursive: true });
cpSync(join(packageRoot, "package.json"), join(temporary, "package.json"));
symlinkSync(join(packageRoot, "node_modules"), join(temporary, "node_modules"));
const airPath = join(temporary, "src/renderer/shaders/shared/hero-air.wgsl");
const air = readFileSync(airPath, "utf8");
const edge = `  let edge = smoothstep(vec2f(0.012, 0.018), vec2f(0.105, 0.115), uv)
    * (1.0 - smoothstep(vec2f(0.895, 0.78), vec2f(0.988, 0.975), uv));
  let feather = edge.x * edge.y;`;
const day = "let backgroundFeather = feather * mix(1.0, dayFeather, params.day);";
if (!air.includes(edge) || !air.includes(day))
	throw new Error("Atmosphere display changed; review loading-layer masks before regenerating.");
writeFileSync(
	airPath,
	air.replace(edge, "  let feather = 1.0;").replace(day, "let backgroundFeather = feather;"),
);
// Use the native pack API and official WGSL plugin on the edited clone.
// Copy the typed entry so static imports target the edited clone, not runtime shaders.
// Running the packed entry as Node avoids untyped dynamic-import module namespaces.
const temporaryScripts = join(temporary, "scripts");
mkdirSync(temporaryScripts);
for (const name of ["loading-layers-runtime.ts", "snapshot-png.ts"]) {
	cpSync(join(packageRoot, "scripts", name), join(temporaryScripts, name));
}
const packed = join(temporary, "dist");
await build({
	config: false,
	cwd: temporary,
	entry: { "loading-layers-runtime": join(temporaryScripts, "loading-layers-runtime.ts") },
	outDir: packed,
	platform: "node",
	format: ["esm"],
	fixedExtension: true,
	dts: false,
	plugins: [wgslVitePlugin()],
});
const repositoryRoot = new URL("../../../", import.meta.url);
const output =
	process.argv.find((arg) => arg.startsWith("--output="))?.slice(9) ??
	join(tmpdir(), "localstudio-layered-loading");
mkdirSync(output, { recursive: true });
console.log(JSON.stringify({ output, temporary }));

const rendered = spawnSync(
	process.execPath,
	[join(packed, "loading-layers-runtime.mjs"), output, repositoryRoot.href],
	{ stdio: "inherit" },
);
if (rendered.error !== undefined) throw rendered.error;
if (rendered.signal === null) {
	process.exitCode = rendered.status ?? 1;
} else {
	process.kill(process.pid, rendered.signal);
}
