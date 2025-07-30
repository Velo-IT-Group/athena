// vite.config.ts

import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [
		tsconfigPaths({
			projects: ["./tsconfig.json"],
		}),
		tanstackStart({
			customViteReactPlugin: true,
			target: "vercel",
			spa: {
				enabled: true,
			},
		}),
		tailwindcss(),
		react(),
	],
	server: {
		port: 3000,
	},
});
