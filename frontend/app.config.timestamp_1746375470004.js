// app.config.ts
import { defineConfig } from "@tanstack/react-start/config";
import tsConfigPaths from "vite-tsconfig-paths";
var app_config_default = defineConfig({
  tsr: {
    appDirectory: "src"
  },
  vite: {
    plugins: [
      tsConfigPaths({
        projects: ["./tsconfig.json"]
      })
    ],
    server: {
      preset: "cloudflare-pages",
      unenv: cloudflare,
      allowedHosts: [
        "70b2-2600-1700-89c1-1670-b451-87e6-34e-cc3d.ngrok-free.app"
      ]
    }
  }
});
export {
  app_config_default as default
};
