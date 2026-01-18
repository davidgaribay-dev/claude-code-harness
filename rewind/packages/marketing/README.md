# @rewind/marketing

Marketing website for Rewind Viewer built with Astro, Tailwind CSS v4, and TypeScript.

## Overview

This is the marketing and landing page package for Rewind Viewer. It showcases the product's features, provides getting started guides, and serves as the public-facing documentation site.

## Tech Stack

- **Astro 5.x** - Static site generator with partial hydration
- **Tailwind CSS v4** - Utility-first CSS framework (matching the web package design system)
- **TypeScript** - Type-safe development
- **Shared Design System** - Uses the same color palette and design tokens as @rewind/web

## Development

```bash
# Install dependencies (from monorepo root)
pnpm install

# Start dev server (runs on port 4321 by default)
pnpm dev:marketing

# Build for production
pnpm build:marketing

# Preview production build
pnpm preview:marketing
```

## Project Structure

```
src/
├── components/        # Astro components
│   ├── Navigation.astro
│   └── Footer.astro
├── layouts/          # Page layouts
│   └── BaseLayout.astro
├── pages/            # File-based routing
│   └── index.astro   # Landing page
└── styles/           # Global styles
    └── global.css    # Tailwind config + design tokens
```

## Design System

This package shares the same design language as the main web application:

- **Colors**: HSL-based color system with light/dark theme support
- **Typography**: Nunito Sans font family with system fallbacks
- **Spacing**: Tailwind's default spacing scale
- **Border Radius**: Custom radius scale (sm to 4xl)
- **Components**: Matches the visual style of the web package

## Features Highlighted

The marketing site emphasizes:

1. **Monaco Editor Integration** - VS Code-quality code display
2. **Extended Thinking Visualization** - Unique AI reasoning display
3. **Tool Execution Visualization** - Color-coded tool tracking
4. **Real-Time ETL** - Live import progress with SSE
5. **Analytics & Insights** - Token tracking and cost analysis
6. **Full-Text Search** - Instant conversation search
7. **Production-Ready Architecture** - Modern tech stack

## Marketing Strategy

Based on best practices for developer tool marketing:

### Key Messages

- **For Power Users**: Professional conversation management with advanced features
- **For Teams**: Share knowledge, track costs, understand AI usage patterns
- **For Learners**: Study extended thinking to master prompt engineering
- **For Managers**: Monitor AI development tools with detailed analytics

### Value Propositions

1. **Complete Visibility** - Browse all Claude Code conversations in one place
2. **Cost Control** - Track API usage and optimize token consumption
3. **Knowledge Base** - Build a searchable archive of AI solutions
4. **Learning Tool** - Understand AI reasoning through extended thinking
5. **Open Source** - MIT licensed, self-hosted, full data control

### Target Audience

- Individual developers tracking Claude Code costs and usage
- Development teams sharing AI-assisted solutions
- Prompt engineers learning from successful conversations
- Tech leads analyzing team AI usage patterns
- Researchers studying AI-assisted development

## SEO & Performance

- **Static Site Generation** - Pre-rendered HTML for fast loading
- **Semantic HTML** - Proper heading hierarchy and structure
- **Open Graph Tags** - Social media preview optimization
- **Mobile-First Design** - Responsive across all devices
- **Zero JavaScript by Default** - Only hydrates interactive components

## Deployment

The marketing site can be deployed to any static hosting service:

- **Vercel** - Zero-config deployment
- **Netlify** - Automatic builds from Git
- **GitHub Pages** - Free hosting for open source
- **Cloudflare Pages** - Edge network deployment
- **Any CDN** - Standard HTML/CSS/JS output

```bash
# Build static site
pnpm build:marketing

# Output directory: packages/marketing/dist/
```

## License

MIT License - Same as the main Rewind Viewer project
