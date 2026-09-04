import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    cors: true,
    // @ts-ignore — Vite 7+ allowedHosts
    allowedHosts: true as unknown as string[],
    headers: {
      "X-Frame-Options": "ALLOWALL",
    },
    hmr: {
      clientPort: 443,
    },
  },
  preview: {
    host: "0.0.0.0",
    port: 5173,
    cors: true,
  },
});
