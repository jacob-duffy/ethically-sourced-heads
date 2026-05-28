import { defineConfig } from 'vite';
import { resolve } from 'path';

// Set the base to the repo name for GitHub Pages
export default defineConfig({
	base: '/ethically-sourced-heads/',
	build: {
		outDir: resolve(__dirname, 'dist'),
		emptyOutDir: true,
		rollupOptions: {
			input: {
				main: resolve(__dirname, 'index.html'),
			},
		},
	},
	server: {
		port: 5173,
		open: true,
	},
	publicDir: resolve(__dirname, 'public'),
});
