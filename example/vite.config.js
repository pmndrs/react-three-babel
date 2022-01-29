import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
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
