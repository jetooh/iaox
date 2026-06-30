import { spawnSync } from 'node:child_process';
import path from 'node:path';
import fse from 'fs-extra';
import { convertSkills, convertMcpConfig, convertProjectInstructions, convertRules } from '../utils/skill-converter.js';
import { getToolPaths, resolveToolKey } from '../utils/tool-paths.js';
import { MCP_SERVERS, ECOSYSTEM } from '../constants.js';

const MCP_CONFIG = { mcpServers: MCP_SERVERS };

/**
 * Configura os MCP servers para a ferramenta de IA selecionada.
 *
 * @param {string} projectDir
 * @param {string} [aiTool='claude-code']
 * @returns {Promise<{ count: number, warning: string|null }>}
 */
export async function configureMcps(projectDir, aiTool = 'claude-code') {
  const resolved = resolveToolKey(aiTool);
  const count = Object.keys(MCP_CONFIG.mcpServers).length;

  if (resolved === 'claude-code') {
    const mcpPath = path.join(projectDir, '.mcp.json');
    if (await fse.pathExists(mcpPath)) {
      const existing = await fse.readJson(mcpPath).catch(() => ({}));
      const merged = {
        mcpServers: { ...(existing.mcpServers || {}), ...MCP_CONFIG.mcpServers },
      };
      await fse.writeJson(mcpPath, merged, { spaces: 2 });
    } else {
      await fse.writeJson(mcpPath, MCP_CONFIG, { spaces: 2 });
    }
    return { count, warning: null };
  }

  const result = await convertMcpConfig(MCP_CONFIG, projectDir, resolved);
  return { count, warning: result.warning };
}

/**
 * Instala a skill find-skills (Vercel Labs) no projeto.
 * @returns {Promise<boolean>}
 */
export async function installFindSkills(projectDir) {
  try {
    const result = spawnSync(
      'npx',
      ['-y', 'skills', 'add', 'https://github.com/vercel-labs/skills', '--skill', 'find-skills'],
      { cwd: projectDir, stdio: ['ignore', 'pipe', 'pipe'], shell: true, timeout: 120_000 }
    );
    return result.status === 0;
  } catch {
    return false;
  }
}

/**
 * Instala o GSD (Get Shit Done) framework localmente.
 * @returns {Promise<boolean>}
 */
export async function installGsd(projectDir) {
  try {
    const result = spawnSync('npx', ['-y', ECOSYSTEM.gsd.package, ...ECOSYSTEM.gsd.args], {
      cwd: projectDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
      timeout: 120_000,
    });
    return result.status === 0;
  } catch {
    return false;
  }
}

/**
 * Instala oh-my-claudecode via npx.
 * @returns {Promise<boolean>}
 */
export async function installOhMyClaudeCode() {
  try {
    const result = spawnSync('npx', ['-y', ECOSYSTEM.omc.package, ...ECOSYSTEM.omc.args], {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
      timeout: 120_000,
    });
    return result.status === 0;
  } catch {
    return false;
  }
}

/**
 * Materializa symlinks de skills em diretórios reais e converte skills/rules/
 * instruções para a ferramenta de IA selecionada.
 *
 * @param {string} projectDir
 * @param {string} [aiTool='claude-code']
 * @param {object} [options]
 * @param {boolean} [options.keepClaudeDir=false]
 */
export async function cleanupSkillsStructure(projectDir, aiTool = 'claude-code', options = {}) {
  const { keepClaudeDir = false } = options;
  const resolved = resolveToolKey(aiTool);
  const claudeSkillsDir = path.join(projectDir, '.claude', 'skills');
  const claudeRulesDir = path.join(projectDir, '.claude', 'rules');
  const agentsDir = path.join(projectDir, '.agents');
  const claudeSquadsDir = path.join(projectDir, '.claude', 'squads');

  // 1. Symlinks → diretórios reais
  if (await fse.pathExists(claudeSkillsDir)) {
    for (const entry of await fse.readdir(claudeSkillsDir)) {
      const entryPath = path.join(claudeSkillsDir, entry);
      const stat = await fse.lstat(entryPath);
      if (stat.isSymbolicLink()) {
        const target = await fse.realpath(entryPath);
        await fse.remove(entryPath);
        await fse.copy(target, entryPath);
      }
    }
  }

  // 2–4. Converter para ferramenta alvo
  if (resolved !== 'claude-code') {
    if (await fse.pathExists(claudeSkillsDir)) await convertSkills(claudeSkillsDir, projectDir, resolved);
    if (await fse.pathExists(claudeRulesDir)) await convertRules(claudeRulesDir, projectDir, resolved);
  }
  await convertProjectInstructions(projectDir, resolved);

  // 5. Remover .agents/ se a ferramenta não usa
  if (await fse.pathExists(agentsDir)) {
    const tp = getToolPaths(resolved);
    const usesAgents = (tp.skills && tp.skills.startsWith('.agents')) ||
      (tp.agents && tp.agents.startsWith('.agents'));
    if (!usesAgents) await fse.remove(agentsDir);
  }

  // 6. Squads ficam só em squads/
  if (await fse.pathExists(claudeSquadsDir)) await fse.remove(claudeSquadsDir);

  // 7. Limpar .claude/ se não for claude-code (e não estiver em multi-IDE)
  if (resolved !== 'claude-code' && !keepClaudeDir) {
    const claudeDir = path.join(projectDir, '.claude');
    if (await fse.pathExists(claudeDir)) await fse.remove(claudeDir);
  }
}
