import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [".next/**", "out/**", "node_modules/**", "design-references/**", ".pages-stash/**", "next-env.d.ts", "migrations/**", "payload-types.ts", "app/(payload)/admin/importMap.js"],
  },
];

export default config;
