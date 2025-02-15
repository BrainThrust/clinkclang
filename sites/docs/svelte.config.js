import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import adapter from "@sveltejs/adapter-vercel";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { mdsvex, escapeSvelte } from "mdsvex";
import { createHighlighter } from "shiki";

const __dirname = dirname(fileURLToPath(import.meta.url));

const theme = 'github-dark';
const highlighter = await createHighlighter({
    themes: [theme],
    langs: ['bash', 'javascript', 'typescript']
});

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://svelte.dev/docs/kit/integrations
    // for more information about preprocessors
    preprocess: [
        vitePreprocess(),
        mdsvex({
            extensions: ['.md', '.svx'],
            layout: {
                blog: join(__dirname, './src/lib/components/md-layouts/blog.svelte'),
                docs: join(__dirname, './src/lib/components/md-layouts/docs.svelte'),
                githubMarkdownLight: join(__dirname, './src/lib/components/md-layouts/github-markdown.svelte'),
                // fallback
                _: join(__dirname, './src/lib/components/md-layouts/blog.svelte')
            },
            highlight: {
                highlighter: async (code, lang = 'text') => {
                    const html = escapeSvelte(highlighter.codeToHtml(code, { lang, theme }));
                    return `{@html \`${html}\` }`;
                }
            },
        })
    ],
    kit: {
        // adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
        // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
        // See https://svelte.dev/docs/kit/adapters for more information about adapters.
        adapter: adapter()
    },
    extensions: ['.svelte', '.md', '.svx']
};

export default config;