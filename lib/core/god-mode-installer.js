import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fse from 'fs-extra';
import { getToolPaths, resolveToolKey } from '../utils/tool-paths.js';
import { SKILL_NAME, DISPLAY_NAME } from '../constants.js';

const GOD_MODE_MARKER_START = '<!-- IAOX-GOD-MODE:START -->';
const GOD_MODE_MARKER_END = '<!-- IAOX-GOD-MODE:END -->';

/** Bloco injetado no arquivo de instruções para tornar o modo persistente. */
function godModeInstructionsBlock() {
  return `${GOD_MODE_MARKER_START}
## ⚡ ${DISPLAY_NAME} — Persistent Mode

This project runs in **${DISPLAY_NAME}**. Once the user activates the
\`${SKILL_NAME}\` skill (\`/${SKILL_NAME}\`) in a session, you remain the IAOX
Operator for the rest of that session:

- Treat **every** subsequent request as a God Mode request — classify its intent
  (OPERATE / CREATE / CONFIGURE) and route it to the correct agent automatically,
  **without waiting to be re-invoked**.
- Dispatch the owning agent autonomously via the Task tool using the
  \`subagent_type\` map in \`.claude/skills/${SKILL_NAME}/references/agent-matrix.md\`.
- \`git push\`, PRs, releases and MCP changes are exclusive to \`@devops\` (\`aiox-devops\`).
- Stay active until the user types \`*exit\`.
${GOD_MODE_MARKER_END}`;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = path.join(__dirname, '..', 'template');
const TEMPLATE_JSON = path.join(TEMPLATE_DIR, 'template.json');
const VERSION_FILE = '.version';

/**
 * Instala a skill God Mode (e rules + settings) no projeto.
 *
 *   template/skills/<skill>/ → {skills}/<skill>/
 *   template/rules/          → {rules}/ (merge, sem sobrescrever)
 *   template/config/         → .claude/ (merge de settings.json)
 *
 * @param {string} projectDir
 * @param {object} [options]
 * @param {string} [options.aiTool='claude-code']
 * @returns {Promise<{ version: string, filesInstalled: number }>}
 */
export async function installGodMode(projectDir, options = {}) {
  const { aiTool = 'claude-code' } = options;
  const resolved = resolveToolKey(aiTool);
  const toolPaths = getToolPaths(resolved);
  let filesInstalled = 0;

  let version = 'unknown';
  if (await fse.pathExists(TEMPLATE_JSON)) {
    const info = await fse.readJson(TEMPLATE_JSON);
    version = info.version || version;
  }

  // 1. Skills
  let skillsBaseDir = null;
  if (toolPaths.skills) {
    skillsBaseDir = path.join(projectDir, toolPaths.skills);
    await fse.ensureDir(skillsBaseDir);

    const templateSkillsDir = path.join(TEMPLATE_DIR, 'skills');
    if (await fse.pathExists(templateSkillsDir)) {
      const skillDirs = await fse.readdir(templateSkillsDir, { withFileTypes: true });
      for (const dir of skillDirs) {
        if (!dir.isDirectory()) continue;
        const dest = path.join(skillsBaseDir, dir.name);
        await fse.copy(path.join(templateSkillsDir, dir.name), dest);
        filesInstalled += await countFiles(dest);
      }
    }
  }

  // 2. Rules (merge, sem sobrescrever)
  if (toolPaths.rules) {
    const rulesSrc = path.join(TEMPLATE_DIR, 'rules');
    if (await fse.pathExists(rulesSrc)) {
      const rulesDest = path.join(projectDir, toolPaths.rules);
      await fse.ensureDir(rulesDest);
      for (const file of await fse.readdir(rulesSrc)) {
        const src = path.join(rulesSrc, file);
        if ((await fse.stat(src)).isFile()) {
          await fse.copy(src, path.join(rulesDest, file), { overwrite: false });
          filesInstalled++;
        }
      }
    }
  }

  // 3. Config (settings.json merge) — só para claude-code
  if (resolved === 'claude-code') {
    const configSrc = path.join(TEMPLATE_DIR, 'config');
    if (await fse.pathExists(configSrc)) {
      const configDest = path.join(projectDir, '.claude');
      await fse.ensureDir(configDest);
      for (const file of await fse.readdir(configSrc)) {
        const src = path.join(configSrc, file);
        if (!(await fse.stat(src)).isFile()) continue;
        if (file === 'settings.json') {
          await mergeSettingsJson(src, path.join(configDest, 'settings.json'));
        } else {
          await fse.copy(src, path.join(configDest, file), { overwrite: false });
        }
        filesInstalled++;
      }
    }
  }

  // 3.5. Documento mestre de convenções → raiz do projeto
  const instructionSrc = path.join(TEMPLATE_DIR, 'instruction.md');
  if (await fse.pathExists(instructionSrc)) {
    await fse.copy(instructionSrc, path.join(projectDir, 'instruction.md'), { overwrite: false });
    filesInstalled++;
  }

  // 4. Injeta bloco de persistência no arquivo de instruções (CLAUDE.md / AGENTS.md / GEMINI.md)
  await injectInstructions(projectDir, toolPaths.instructions);

  // 5. Arquivo de versão
  const versionDir = skillsBaseDir
    ? path.join(skillsBaseDir, SKILL_NAME)
    : path.join(projectDir, '.claude', 'skills', SKILL_NAME);
  await fse.ensureDir(versionDir);
  await fse.writeFile(path.join(versionDir, VERSION_FILE), version, 'utf-8');

  return { version, filesInstalled };
}

/**
 * Lê a versão da skill instalada no projeto.
 *
 * @returns {Promise<string|null>}
 */
export async function getInstalledGodModeVersion(projectDir, aiTool = 'claude-code') {
  const toolPaths = getToolPaths(resolveToolKey(aiTool));
  const skillsBase = toolPaths.skills || '.claude/skills';
  const versionFilePath = path.join(projectDir, skillsBase, SKILL_NAME, VERSION_FILE);
  try {
    if (await fse.pathExists(versionFilePath)) {
      return (await fse.readFile(versionFilePath, 'utf-8')).trim();
    }
  } catch {
    /* noop */
  }
  return null;
}

/**
 * Injeta (idempotente) o bloco de persistência do God Mode no arquivo de
 * instruções do projeto. Cria o arquivo se não existir; substitui o bloco
 * entre marcadores se já existir.
 *
 * @param {string} projectDir
 * @param {string} instructionsFile - caminho relativo (ex.: 'CLAUDE.md')
 */
async function injectInstructions(projectDir, instructionsFile) {
  if (!instructionsFile) return;
  const target = path.join(projectDir, instructionsFile);
  const block = godModeInstructionsBlock();

  try {
    await fse.ensureDir(path.dirname(target));
    if (!(await fse.pathExists(target))) {
      await fse.writeFile(target, block + '\n', 'utf-8');
      return;
    }
    let content = await fse.readFile(target, 'utf-8');
    if (content.includes(GOD_MODE_MARKER_START)) {
      // Substitui bloco existente (atualização idempotente)
      const re = new RegExp(`${GOD_MODE_MARKER_START}[\\s\\S]*?${GOD_MODE_MARKER_END}`);
      content = content.replace(re, block);
    } else {
      content = content.trimEnd() + '\n\n' + block + '\n';
    }
    await fse.writeFile(target, content, 'utf-8');
  } catch {
    /* não-crítico */
  }
}

async function mergeSettingsJson(srcPath, destPath) {
  const src = await fse.readJson(srcPath);
  if (await fse.pathExists(destPath)) {
    const dest = await fse.readJson(destPath).catch(() => ({}));
    await fse.writeJson(destPath, { ...src, ...dest }, { spaces: 2 });
  } else {
    await fse.copy(srcPath, destPath);
  }
}

async function countFiles(dirPath) {
  if (!(await fse.pathExists(dirPath))) return 0;
  let count = 0;
  for (const entry of await fse.readdir(dirPath, { withFileTypes: true })) {
    if (entry.isFile()) count++;
    else if (entry.isDirectory()) count += await countFiles(path.join(dirPath, entry.name));
  }
  return count;
}
