# AppEvents — Claude Code Configuration

## Environment Setup

### Haiku Model Default
This project defaults to Claude Haiku 4.5 to optimize token usage:

```powershell
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL = "claude-haiku-4-5-20251001"
```

**Persistent setup** (Windows):
```powershell
[System.Environment]::SetEnvironmentVariable("ANTHROPIC_DEFAULT_HAIKU_MODEL", "claude-haiku-4-5-20251001", "User")
```

Or set via System Properties → Environment Variables → Add `ANTHROPIC_DEFAULT_HAIKU_MODEL=claude-haiku-4-5-20251001` as a user variable.

**For specific sessions**, use:
- `/model haiku` — switch to Haiku for the current session
- `/model opus` — switch to Opus if a task requires advanced reasoning
- `/fast` — Opus with faster streaming (for complex tasks when Haiku stalls)

## Claude Code Plugins

All plugins disabled to reduce context overhead. Enable on demand via `/plugin <name>` if needed.

## MCP Servers

**Enabled** (in `.mcp.json`):
- Memory — local memory persistence
- Cloudflare — documentation search
- Sequential Thinking — extended reasoning (when needed)
- Next.js Devtools — Next.js development tools

**Disconnected**: Apify, GitHub, Resend, PlayMCP, Pixelesq, Malwarebytes Scam Guard, and all account-level integrations except Figma.

**Why**: Reduces baseline token cost per message. Each unused MCP server tool definition is injected into context on every turn.

## Skills

**Kept** (in `.claude/skills/`):
- brainstorming
- browser-use
- copywriting
- frontend-design
- marketing-ideas
- marketing-psychology
- programmatic-seo
- seo-audit
- subagent-driven-development
- ui-ux-pro-max
- using-superpowers
- vercel-react-best-practices
- web-design-guidelines
- writing-plans
- aspnet-core (for .NET work, not yet used)
- accessibility
- run

**Removed** (unused): pptx, content-strategy, agent-browser, ai-image-generation, ai-seo, copy-editing, copywriting-prose-creator, design-md, google-agents-cli-adk-code, skill-creator, test-driven-development.

## Working Directory

Always run Claude Code from this directory so project-level settings (`.claude/settings.json`, `.mcp.json`) apply.
