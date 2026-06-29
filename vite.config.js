import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: {
    exclude: ["@discord/embedded-app-sdk"],
  },
});
