import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // <Picture> is the one place a raw <img> is correct: derivatives are pre-encoded with explicit
    // dimensions, srcset and sizes (scripts/process-images.mjs), so next/image has nothing to add.
    files: ["src/components/ui/Picture.tsx"],
    rules: { "@next/next/no-img-element": "off" },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "_qa/**", "_src/**", "scripts/**"]),
]);

export default eslintConfig;
