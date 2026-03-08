import { execSync } from "child_process";
import path from "path";

const root = path.resolve(import.meta.dirname, "..");

console.log("Building client...");
execSync("npx vite build", { cwd: root, stdio: "inherit" });

console.log("Building server...");
execSync(
  'npx esbuild server/index.ts --bundle --platform=node --outfile=dist/index.cjs --format=cjs --packages=external',
  { cwd: root, stdio: "inherit" }
);

console.log("Build complete!");
