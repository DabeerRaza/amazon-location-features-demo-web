import path from "path";

import svgr from "@svgr/rollup";
import react from "@vitejs/plugin-react";
import multi from "rollup-plugin-multi-entry";
import { defineConfig } from "vite";
import eslint from "vite-plugin-eslint";

import bundlePlugin from "./vite-plugin-bundle";

export default defineConfig(({ mode }) => {
	const isProduction = mode === "production";
	return {
		plugins: [
			react(),
			svgr(),
			eslint({
				fix: true,
				failOnError: false
			})
		],
		resolve: {
			alias: {
				"@demo/assets": path.resolve(__dirname, "./src/assets"),
				"@demo/core": path.resolve(__dirname, "./src/core"),
				"@demo/atomicui": path.resolve(__dirname, "./src/atomicui"),
				"@demo/hooks": path.resolve(__dirname, "./src/hooks"),
				"@demo/services": path.resolve(__dirname, "./src/services"),
				"@demo/stores": path.resolve(__dirname, "./src/stores"),
				"@demo/types": path.resolve(__dirname, "./src/types"),
				"@demo/theme": path.resolve(__dirname, "./src/theme"),
				"@demo/utils": path.resolve(__dirname, "./src/utils"),
				"./runtimeConfig": "./runtimeConfig.browser"
			}
		},
		server: {
			port: 3000
		},
		build: isProduction
			? {
					outDir: "./build",
					sourcemap: false,
					lib: {
						entry: path.resolve(__dirname, "src/index.ts"),
						name: "amazon-location-web-demo",
						formats: ["cjs", "es", "umd", "iife"]
					},
					emptyOutDir: false,
					minify: "terser",
					rollupOptions: {
						input: "src/index.ts",
						preserveEntrySignatures: "strict",
						output: {
							entryFileNames: "[name].js"
						},
						plugins: [multi(), bundlePlugin()]
					}
			  }
			: {},
		optimizeDeps: {
			disabled: false
		}
	};
});
