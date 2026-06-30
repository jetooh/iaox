/**
 * Mapeamento de diretórios e arquivos por AI Tool.
 *
 * Suporta as 4 IDEs alvo: Claude Code, Codex, Cursor, Gemini CLI.
 *
 * @type {Record<string, {
 *   skills: string,
 *   rules: string|null,
 *   agents: string|null,
 *   mcp: string|null,
 *   instructions: string,
 *   ignore: string|null,
 *   startCommand: string
 * }>}
 */
export const TOOL_PATHS = {
  'claude-code': {
    skills: '.claude/skills',
    rules: '.claude/rules',
    agents: '.claude/commands/IAOX/agents',
    mcp: '.mcp.json',
    instructions: 'CLAUDE.md',
    ignore: '.claudeignore',
    startCommand: 'claude',
  },
  codex: {
    skills: '.codex/skills',
    rules: null,
    agents: '.codex/agents',
    mcp: '.codex/config.toml',
    instructions: 'AGENTS.md',
    ignore: '.codexignore',
    startCommand: 'codex',
  },
  cursor: {
    skills: '.cursor/skills',
    rules: '.cursor/rules',
    agents: '.cursor/rules',
    mcp: '.cursor/mcp.json',
    instructions: 'AGENTS.md',
    ignore: '.cursorignore',
    startCommand: 'cursor',
  },
  gemini: {
    skills: '.gemini/skills',
    rules: '.gemini/rules',
    agents: '.gemini/rules/IAOX/agents',
    mcp: null,
    instructions: 'GEMINI.md',
    ignore: '.geminiignore',
    startCommand: 'gemini',
  },
};

/** Mapeia keys legadas para as canônicas. */
const LEGACY_MAP = {
  claude: 'claude-code',
};

export function resolveToolKey(aiTool) {
  return LEGACY_MAP[aiTool] || aiTool;
}

export function getToolPaths(aiTool) {
  const resolved = resolveToolKey(aiTool);
  return TOOL_PATHS[resolved] || TOOL_PATHS['claude-code'];
}

export function getAvailableTools() {
  return Object.keys(TOOL_PATHS);
}

/** IDEs que suportam MCP per-project. */
export function supportsMcp(aiTool) {
  return getToolPaths(aiTool).mcp !== null;
}
