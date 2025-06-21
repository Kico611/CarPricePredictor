import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import eslintPlugin from "vite-plugin-eslint";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), eslintPlugin(), tailwindcss()],
});
