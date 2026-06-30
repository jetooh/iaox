import path from 'node:path';
import fse from 'fs-extra';
import { getToolPaths, resolveToolKey } from './tool-paths.js';

/**
 * Copia as skills (já materializadas em .claude/skills) para o diretório
 * de skills da ferramenta alvo. Skills são markdown, portáveis entre IDEs.
 *
 * @param {string} claudeSkillsDir - origem (.claude/skills)
 * @param {string} projectDir
 * @param {string} aiTool
 */
export async function convertSkills(claudeSkillsDir, projectDir, aiTool) {
  const toolPaths = getToolPaths(aiTool);
  if (!toolPaths.skills) return;

  const destDir = path.join(projectDir, toolPaths.skills);
  await fse.ensureDir(destDir);
  await fse.copy(claudeSkillsDir, destDir, { overwrite: false });
}

/**
 * Copia rules para a ferramenta alvo (se ela suportar rules).
 */
export async function convertRules(claudeRulesDir, projectDir, aiTool) {
  const toolPaths = getToolPaths(aiTool);
  if (!toolPaths.rules) return;

  const destDir = path.join(projectDir, toolPaths.rules);
  await fse.ensureDir(destDir);
  await fse.copy(claudeRulesDir, destDir, { overwrite: false });
}

/**
 * Gera o arquivo de instruções do projeto para a ferramenta alvo
 * (AGENTS.md / GEMINI.md) a partir do CLAUDE.md, se existir.
 */
export async function convertProjectInstructions(projectDir, aiTool) {
  const toolPaths = getToolPaths(aiTool);
  const target = path.join(projectDir, toolPaths.instructions);

  if (await fse.pathExists(target)) return; // já existe (ex.: claude-code)

  const claudeMd = path.join(projectDir, 'CLAUDE.md');
  if (await fse.pathExists(claudeMd)) {
    await fse.ensureDir(path.dirname(target));
    await fse.copy(claudeMd, target, { overwrite: false });
  }
}

/**
 * Converte a config de MCP para o formato da ferramenta alvo.
 *
 * - cursor: .cursor/mcp.json (mesmo formato JSON do Claude)
 * - codex:  .codex/config.toml (formato TOML — merge simples por append)
 * - gemini: não suporta MCP per-project → retorna warning
 *
 * @returns {Promise<{ warning: string|null }>}
 */
export async function convertMcpConfig(mcpConfig, projectDir, aiTool) {
  const resolved = resolveToolKey(aiTool);
  const toolPaths = getToolPaths(resolved);

  if (!toolPaths.mcp) {
    return { warning: `${resolved} não suporta MCP per-project. Configure manualmente se necessário.` };
  }

  const mcpPath = path.join(projectDir, toolPaths.mcp);
  await fse.ensureDir(path.dirname(mcpPath));

  if (resolved === 'codex') {
    // TOML: [mcp_servers.<name>] command = "..." args = [...]
    const lines = [];
    for (const [name, cfg] of Object.entries(mcpConfig.mcpServers)) {
      lines.push(`[mcp_servers.${name}]`);
      lines.push(`command = "${cfg.command}"`);
      lines.push(`args = [${(cfg.args || []).map((a) => `"${a}"`).join(', ')}]`);
      if (cfg.env) {
        const envPairs = Object.entries(cfg.env)
          .map(([k, v]) => `${k} = "${v}"`)
          .join(', ');
        lines.push(`env = { ${envPairs} }`);
      }
      lines.push('');
    }
    const toml = lines.join('\n');
    if (await fse.pathExists(mcpPath)) {
      await fse.appendFile(mcpPath, '\n' + toml);
    } else {
      await fse.writeFile(mcpPath, toml);
    }
    return { warning: null };
  }

  // cursor (e outros JSON-based): merge
  if (await fse.pathExists(mcpPath)) {
    const existing = await fse.readJson(mcpPath).catch(() => ({}));
    const merged = {
      mcpServers: { ...(existing.mcpServers || {}), ...mcpConfig.mcpServers },
    };
    await fse.writeJson(mcpPath, merged, { spaces: 2 });
  } else {
    await fse.writeJson(mcpPath, mcpConfig, { spaces: 2 });
  }

  return { warning: null };
}
