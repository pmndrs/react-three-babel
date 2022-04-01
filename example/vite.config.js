import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { threeMinifier } from "@yushijinhun/three-minifier-rollup";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    { ...threeMinifier(), enforce: "pre" },
    react({
      babel: {
        plugins: [
          [
            "module:@react-three/babel",
            {
              importSources: ["three", "three-stdlib"],
            },
          ],
        ],
      },
    }),
  ],
});
