import { spawnSync } from 'node:child_process';
import path from 'node:path';
import fse from 'fs-extra';
import { resolveCoreDir } from '../utils/platform.js';
import { CLI_NAME } from '../constants.js';

const ENV_EXAMPLE_CONTENT = `# IAOX Environment Configuration
# Copie este arquivo para .env e preencha seus valores.

# ANTHROPIC_API_KEY=your-key-here
# GEMINI_API_KEY=your-key-here
# GITHUB_TOKEN=your-token-here
`;

const GITIGNORE_CONTENT = `node_modules/
.DS_Store
*.log
.aiox/

# secrets — nunca commitar (raiz e por app); só os .env.example são versionados
.env
.env.*
**/.env
**/.env.*
!.env.example
!**/.env.example

# screenshots são voláteis (limpos a cada 12h pelo hook); mantém só a pasta
screenshot/*
!screenshot/.gitkeep
`;

/**
 * Tarefas de pós-instalação: deps + .env.example + .gitignore + git init/commit.
 *
 * @param {string} projectDir
 * @param {object} [options]
 * @param {boolean} [options.dryRun=false] - pula npm install e git (mantém arquivos locais)
 * @returns {Promise<{ gitInitialized: boolean, depsInstalled: boolean }>}
 */
export async function postSetup(projectDir, options = {}) {
  const { dryRun = false } = options;

  await createFile(path.join(projectDir, '.env.example'), ENV_EXAMPLE_CONTENT);
  await createFile(path.join(projectDir, '.gitignore'), GITIGNORE_CONTENT, { overwrite: false });

  // Pasta de screenshots na raiz (Playwright grava aqui; hook limpa a cada 12h)
  await fse.ensureDir(path.join(projectDir, 'screenshot'));
  await createFile(path.join(projectDir, 'screenshot', '.gitkeep'), '', { overwrite: false });

  if (dryRun) {
    return { gitInitialized: false, depsInstalled: false };
  }

  const depsInstalled = await installDependencies(projectDir);
  const gitInitialized = await initializeGit(projectDir);
  return { gitInitialized, depsInstalled };
}

async function installDependencies(projectDir) {
  const coreDir = await resolveCoreDir(projectDir);
  const corePath = path.join(projectDir, coreDir);
  const pkgJson = path.join(corePath, 'package.json');
  try {
    if (!(await fse.pathExists(pkgJson))) return false;
    const result = spawnSync('npm', ['install'], {
      cwd: corePath,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    });
    return !result.error && result.status === 0;
  } catch {
    return false;
  }
}

async function initializeGit(projectDir) {
  try {
    const check = spawnSync('git', ['rev-parse', '--is-inside-work-tree'], {
      cwd: projectDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    });
    if (check.status !== 0) {
      const init = spawnSync('git', ['init'], {
        cwd: projectDir,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true,
      });
      if (init.error || init.status !== 0) return false;
    }
    const add = spawnSync('git', ['add', '-A'], {
      cwd: projectDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    });
    if (add.error || add.status !== 0) return false;

    // --no-verify pula pre-commit/commit-msg hooks instalados pelo framework/GSD,
    // que podem abortar o commit inicial do bootstrap.
    const commit = spawnSync(
      'git',
      ['commit', '--no-verify', '-m', `chore: bootstrap project via ${CLI_NAME}`],
      {
        cwd: projectDir,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true,
      }
    );
    return !commit.error && commit.status === 0;
  } catch {
    return false;
  }
}

async function createFile(filePath, content, options = {}) {
  const { overwrite = true } = options;
  try {
    if (!overwrite && (await fse.pathExists(filePath))) return;
    await fse.writeFile(filePath, content, 'utf-8');
  } catch {
    /* não-crítico */
  }
}
