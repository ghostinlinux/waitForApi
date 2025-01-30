import { defineConfig } from "rollup";
import typescript from "@rollup/plugin-typescript";

export default defineConfig({
  input: "index.ts",
  output: {
    dir: "dist",
    format: "es",
    name: "waitForApis",
  },
  plugins: [typescript({ tsconfig: "tsconfig.json" })],
  external: ["@playwright/test"],
});
