import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import starlight from '@astrojs/starlight';

export default defineConfig({
  output: 'static',
  site: 'https://rewind-viewer.dev',
  integrations: [
    starlight({
      title: 'Rewind Viewer',
      description: 'Browse and visualize your Claude Code conversation history with a beautiful, modern interface',
      social: [
        {
          label: 'GitHub',
          icon: 'github',
          href: 'https://github.com/davidgaribay-dev/rewind',
        },
      ],
      editLink: {
        baseUrl: 'https://github.com/davidgaribay-dev/rewind/edit/main/packages/marketing/',
      },
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Introduction', link: '/docs/introduction', badge: { text: 'Start here', variant: 'tip' } },
            { label: 'Installation', link: '/docs/installation' },
            { label: 'Quick Start', link: '/docs/quick-start' },
          ],
        },
        {
          label: 'Core Concepts',
          items: [
            { label: 'Configuration', link: '/docs/configuration' },
            { label: 'Architecture', link: '/docs/architecture' },
          ],
        },
        {
          label: 'API & CLI',
          items: [
            { label: 'REST API', link: '/docs/api' },
            { label: 'CLI Tool', link: '/docs/cli', badge: { text: 'Auto-sync', variant: 'success' } },
          ],
        },
        {
          label: 'Help & Support',
          items: [
            { label: 'Troubleshooting', link: '/docs/troubleshooting' },
          ],
        },
      ],
      customCss: [
        './src/styles/starlight-custom.css',
      ],
      components: {
        // Override default components if needed
        // Head: './src/components/Head.astro',
      },
      expressiveCode: {
        themes: ['github-dark', 'github-light'],
        styleOverrides: {
          borderRadius: '0.5rem',
        },
      },
      lastUpdated: true,
      pagination: true,
      favicon: '/favicon.svg',
      head: [
        {
          tag: 'meta',
          attrs: {
            property: 'og:image',
            content: 'https://rewind-viewer.dev/og-image.png',
          },
        },
        {
          tag: 'meta',
          attrs: {
            name: 'twitter:card',
            content: 'summary_large_image',
          },
        },
      ],
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  },
});
