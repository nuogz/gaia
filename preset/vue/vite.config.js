import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

import { defineConfig } from 'vite';
import pluginVue from '@vitejs/plugin-vue';



const dirPackage = dirname(fileURLToPath(import.meta.url));


export default defineConfig({
	plugins: [
		pluginVue({
			template: {
				compilerOptions: {
					isCustomElement: tag => /^((module-|comp-|p-).+?|module)$/.test(tag)
				}
			}
		}),
	],
	root: resolve(dirPackage, 'src'),
	base: './',
	build: {
		target: 'esnext',
		outDir: resolve(dirPackage, 'dist'),
		emptyOutDir: true,
		chunkSizeWarningLimit: 1024,
		minify: true
	},
	publicDir: resolve(dirPackage, 'src', 'public'),
	clearScreen: false,
	server: {
		hmr: {
			port: 45000,
		},
		port: 47000,
		proxy: {
			'^/api/': {
				target: 'http://127.0.0.1:147000',
				changeOrigin: true,
			},
			'/wock': {
				target: 'ws://127.0.0.1:147000/wock',
				ws: true
			},
		},
		watch: {
			ignored: [
				'**/*.{api,lib,map}.js',
				'**/*.lib/**/*.js'
			]
		}
	}
});
