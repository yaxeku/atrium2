import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	define: {
		// Enable Svelte 5 features
		'__SVELTE_5_RUNTIME__': true
	}
});
