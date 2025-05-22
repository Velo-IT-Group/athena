import { defineConfig } from "@tanstack/react-start/config";
import tsConfigPaths from "vite-tsconfig-paths";
import { cloudflare } from "unenv";

export default defineConfig({
	tsr: {
		appDirectory: "src",
		quoteStyle: "single",
	},
	vite: {
		plugins: [
			tsConfigPaths({
				projects: ["./tsconfig.json"],
			}),
		],
		build: {
			rollupOptions: {
				external: ["@tanstack/start/server"],
			},
		},
	},
	server: {
		preset: "cloudflare-pages",
		unenv: cloudflare,
	},
});
