import { spawnSync } from 'node:child_process';
import path from 'node:path';
import fse from 'fs-extra';
import ora from 'ora';
import { printError, printInfo, printWarning } from '../ui/messages.js';

/**
 * Adiciona um squad ao projeto atual.
 *
 * Tenta `npx squads add <name>`; se indisponível, cria um scaffold local
 * em squads/<name>/ com a estrutura mínima.
 *
 * @param {string} name
 */
export async function addSquadCommand(name) {
  const projectDir = process.cwd();

  if (!name || !/^[a-z0-9][a-z0-9-_]*$/.test(name)) {
    printError('Squad name must be lowercase kebab-case (e.g. "backend", "growth-team").');
    process.exit(1);
  }

  const spinner = ora(`Adding squad "${name}"...`).start();
  const result = spawnSync('npx', ['-y', 'squads', 'add', name], {
    cwd: projectDir,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
    timeout: 120_000,
  });

  if (result.status === 0) {
    spinner.succeed(`Squad "${name}" added via squads CLI`);
    return;
  }

  spinner.warn('squads CLI unavailable — creating local scaffold');
  try {
    const squadDir = path.join(projectDir, 'squads', name);
    await fse.ensureDir(path.join(squadDir, 'agents'));
    await fse.ensureDir(path.join(squadDir, 'tasks'));
    await fse.writeFile(
      path.join(squadDir, 'README.md'),
      `# Squad: ${name}\n\nDescreva o propósito deste squad e liste seus agentes.\n`,
      'utf-8'
    );
    printInfo(`Created squads/${name}/ scaffold (agents/, tasks/, README.md).`);
  } catch (error) {
    printWarning(`Failed to scaffold squad locally: ${error.message}`);
    process.exit(1);
  }
}
