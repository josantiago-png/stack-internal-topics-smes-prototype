import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const base = process.env.NODE_ENV === 'production' ? '/stack-internal-topics-smes-prototype' : '';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [vitePreprocess()],
  compilerOptions: {
    experimental: { async: true },
  },
  kit: {
    adapter: adapter({
      pages: "build",
      assets: "build",
      fallback: "404.html",
      precompress: false,
      strict: true,
    }),
    paths: {
      base,
    },
    prerender: {
      handleHttpError: 'warn',
      handleMissingId: 'warn',
    },
  },
};

export default config;
