# Protostack Prototype

> **⚠️ INTERNAL USE ONLY** - Created with Protostack, a proprietary Stack Overflow tool.

This is a prototype created with [Protostack](https://github.com/StackEngLabs/protostack), a CLI tool for rapidly building and deploying SvelteKit prototypes with Stack Overflow's Stacks design system.

## What's Included

- **SvelteKit** with **Svelte 5** - Modern, reactive web framework
- **Stacks MCP** - AI-powered assistance for using Stack Overflow's design system
- **GitHub Pages Ready** - One command deployment
- **AI-Friendly** - Includes `AGENTS.md` for AI coding assistants

## Getting Started

### Development

Start the development server:

```bash
npm run dev
```

Your prototype will open in your browser at `http://localhost:5173`

### Stacks Design System

This template comes with **Stacks CSS pre-loaded** via CDN. You can use all Stacks atomic classes immediately:

```svelte
<!-- Use Stacks atomic classes directly -->
<div class="d-flex fd-column gap8 p16">
  <h1 class="fs-headline1 fw-bold fc-dark">Hello World</h1>
  <button class="s-btn s-btn__primary" type="button">Click me</button>
</div>
```

**Optional:** Install Stacks Svelte components for enhanced functionality:

```bash
npm install @stackoverflow/stacks-svelte @stackoverflow/stacks-icons
```

Then import and use components:

```svelte
<script>
  import { Button, Card, Input } from '@stackoverflow/stacks-svelte';
  import { IconSearch } from '@stackoverflow/stacks-icons';
</script>

<Card>
  <Input placeholder="Search..." icon={IconSearch} />
  <Button variant="primary">Submit</Button>
</Card>
```

### Using Stacks MCP in Cursor/VSCode

This project comes pre-configured with Stacks MCP server:

1. Open this project in **Cursor** or **VSCode**
2. The MCP configuration is already set up (`.cursor/mcp.json` and `.vscode/mcp.json`)
3. Ask your AI assistant about Stacks components before building UI
4. Example prompts:
   - "Show me how to use the Stacks Button component"
   - "What are the available Stacks atomic CSS classes for spacing?"
   - "How do I create a modal with Stacks?"

### AI Coding Guidelines

Read the `AGENTS.md` file for detailed guidelines on how AI assistants should work with this prototype. Key principles:

1. **Always use Stacks Svelte components first**
2. **Use Stacks atomic CSS classes** for styling
3. **Query Stacks MCP** before implementing any UI
4. **Avoid custom CSS** - leverage the design system

## Publishing to GitHub Pages

When your prototype is ready to share:

```bash
npx protostack publish
```

This will:
1. Build your prototype
2. Create a repository under StackEngLabs organization (if first time)
3. Deploy to GitHub Pages
4. Give you a shareable URL

## Project Structure

```
├── src/
│   ├── routes/          # SvelteKit routes
│   │   ├── +layout.svelte
│   │   └── +page.svelte
│   └── app.html         # HTML template
├── static/              # Static assets
├── .cursor/             # Cursor MCP configuration
├── .vscode/             # VSCode MCP configuration
├── AGENTS.md            # AI assistant guidelines
├── svelte.config.js     # SvelteKit configuration
├── vite.config.ts       # Vite configuration
└── package.json
```

## Learn More

- [SvelteKit Documentation](https://kit.svelte.dev/)
- [Svelte 5 Documentation](https://svelte.dev/)
- [Stacks Design System](https://stackoverflow.design/)
- [Protostack CLI](https://github.com/StackEngLabs/protostack)

## Support

For issues or questions:
- Check the `AGENTS.md` file for AI coding guidelines
- Consult Stacks MCP for design system questions
- Review SvelteKit and Svelte 5 documentation

---

Built with ❤️ using Protostack

