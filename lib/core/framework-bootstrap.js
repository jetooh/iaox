import { spawnSync } from 'node:child_process';
import path from 'node:path';
import fse from 'fs-extra';
import { getTtyFd, closeTtyFd, resolveCoreConfigPath } from '../utils/platform.js';
import { FRAMEWORK_PACKAGE, FRAMEWORK_PACKAGE_FALLBACK } from '../constants.js';

/**
 * Executa `npx <framework> init <nome>` para criar a estrutura do projeto.
 *
 * O framework (aiox-core) tem prompts próprios (idioma, IDEs, tech preset).
 * Abrimos /dev/tty para input interativo quando stdin é pipe.
 *
 * @param {string} projectName
 * @param {string} [parentDir]
 * @returns {Promise<string>} caminho absoluto do projeto
 * @throws {Error} se o comando falhar
 */
export async function bootstrapFramework(projectName, parentDir) {
  const cwd = parentDir || process.cwd();
  const projectDir = path.resolve(cwd, projectName);
  let stdinFd = null;

  try {
    stdinFd = getTtyFd();
    const stdinOption = stdinFd !== null ? stdinFd : 'inherit';

    // Descobre qual pacote do framework existe no registry
    const check = spawnSync('npm', ['view', FRAMEWORK_PACKAGE, 'version'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
      timeout: 15_000,
    });
    const pkg = check.status === 0 ? FRAMEWORK_PACKAGE : FRAMEWORK_PACKAGE_FALLBACK;

    const result = spawnSync('npx', [pkg, 'init', projectName], {
      cwd,
      stdio: [stdinOption, 'inherit', 'inherit'],
      shell: true,
    });

    if (result.error) {
      throw new Error(
        `Failed to execute 'npx ${pkg} init': ${result.error.message}. ` +
          `Ensure npx is available and you have network access.`
      );
    }
    if (result.status !== 0) {
      throw new Error(
        `'npx ${pkg} init ${projectName}' exited with code ${result.status}. ` +
          `Check the output above for details.`
      );
    }
  } finally {
    closeTtyFd(stdinFd);
  }

  await ensureRootVersion(projectDir);
  return projectDir;
}

/**
 * Cria um esqueleto mínimo do projeto para o modo --dry-run, simulando o que
 * o `aiox-core init` produziria — SEM rodar o wizard nem baixar nada.
 *
 * Cria apenas o necessário para que as etapas próprias do CLI (God Mode, MCPs,
 * conversão, persistência) rodem de verdade contra a estrutura.
 *
 * @param {string} projectName
 * @param {string} [parentDir]
 * @param {string[]} [ides] - IDEs selecionadas (default: ['claude-code'])
 * @returns {Promise<string>} caminho absoluto do projeto
 */
export async function scaffoldDryRun(projectName, parentDir, ides = ['claude-code']) {
  const cwd = parentDir || process.cwd();
  const projectDir = path.resolve(cwd, projectName);

  await fse.ensureDir(projectDir);
  await fse.ensureDir(path.join(projectDir, '.claude'));

  // core-config.yaml mínimo com a lista de IDEs (lido por readSelectedTools)
  const coreDir = path.join(projectDir, '.aiox-core');
  await fse.ensureDir(coreDir);
  const ideList = ides.map((i) => `    - ${i}`).join('\n');
  const config =
    `version: '1.0.0'\n` +
    `project:\n  name: ${projectName}\n  version: '1.0.0'\n` +
    `ide:\n  selected:\n${ideList}\n`;
  await fse.writeFile(path.join(coreDir, 'core-config.yaml'), config, 'utf-8');

  // CLAUDE.md placeholder (o God Mode injeta o bloco de persistência nele)
  await fse.writeFile(
    path.join(projectDir, 'CLAUDE.md'),
    `# ${projectName}\n\n_(placeholder gerado pelo --dry-run)_\n`,
    'utf-8'
  );

  return projectDir;
}

/**
 * Garante um campo 'version:' top-level em core-config.yaml
 * (alguns tooling esperam isso no nível raiz).
 */
async function ensureRootVersion(projectDir) {
  const configPath = await resolveCoreConfigPath(projectDir);
  try {
    if (!(await fse.pathExists(configPath))) return;
    let content = await fse.readFile(configPath, 'utf-8');
    if (/^version:\s/m.test(content)) return;

    const m = content.match(/^\s+version:\s*(.+)$/m);
    const version = m ? m[1].trim().replace(/^['"]|['"]$/g, '') : '1.0.0';
    content = `version: '${version}'\n${content}`;
    await fse.writeFile(configPath, content, 'utf-8');
  } catch {
    /* não-crítico */
  }
}
