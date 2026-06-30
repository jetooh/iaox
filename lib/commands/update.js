import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fse from 'fs-extra';
import ora from 'ora';
import semver from 'semver';
import { printError, printInfo, printWarning } from '../ui/messages.js';
import { installGodMode, getInstalledGodModeVersion } from '../core/god-mode-installer.js';
import { getAvailableTools, getToolPaths } from '../utils/tool-paths.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_JSON = path.join(__dirname, '..', 'template', 'template.json');

/**
 * Atualiza a skill God Mode no projeto atual se houver versão mais nova bundled.
 */
export async function updateCommand() {
  const projectDir = process.cwd();

  const bundled = await fse.readJson(TEMPLATE_JSON).catch(() => null);
  if (!bundled) {
    printError('Template metadata not found in this CLI build.');
    process.exit(1);
  }
  const bundledVersion = bundled.version;

  // Detecta quais IDEs têm a skill instalada
  const toolsWithSkill = [];
  for (const tool of getAvailableTools()) {
    const tp = getToolPaths(tool);
    if (!tp.skills) continue;
    if (await getInstalledGodModeVersion(projectDir, tool)) {
      toolsWithSkill.push(tool);
    }
  }

  if (toolsWithSkill.length === 0) {
    printWarning('No installed God Mode skill found in this directory. Run init first.');
    process.exit(1);
  }

  for (const tool of toolsWithSkill) {
    const installed = await getInstalledGodModeVersion(projectDir, tool);
    if (installed && semver.valid(installed) && semver.valid(bundledVersion) && !semver.gt(bundledVersion, installed)) {
      printInfo(`${tool}: already up to date (v${installed})`);
      continue;
    }
    const spinner = ora(`Updating God Mode (${tool}) ${installed || '?'} → ${bundledVersion}...`).start();
    try {
      const { version, filesInstalled } = await installGodMode(projectDir, { aiTool: tool });
      spinner.succeed(`${tool}: updated to v${version} (${filesInstalled} files)`);
    } catch (error) {
      spinner.fail(`${tool}: update failed`);
      printError(`Update failed for ${tool}.`, error);
    }
  }
}
