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

const MEMORY_INDEX_CONTENT = `# Memory — índice do orquestrador

Memórias globais do ecossistema (fatos/decisões que persistem entre sessões).
Memórias por app ficam em \`apps/<app>/MEMORY.md\`. Ver a regra \`memory.md\`.

<!-- uma linha por memória: - [Título](arquivo.md) — gancho -->
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

# cofre local de acessos — NUNCA commitar (só access.example.md é versionado)
access.md

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
/**
 * Garante os artefatos do orquestrador que NÃO são versionados no template
 * (memória global, docs, screenshot/, access.md, .gitignore/.env.example).
 * Idempotente (overwrite:false preserva dados do usuário). Roda no init E no
 * update — assim quem atualiza um projeto antigo também recebe a memória/docs.
 *
 * @param {string} projectDir
 */
export async function ensureOrchestratorScaffold(projectDir) {
  await createFile(path.join(projectDir, '.env.example'), ENV_EXAMPLE_CONTENT, { overwrite: false });
  await createFile(path.join(projectDir, '.gitignore'), GITIGNORE_CONTENT, { overwrite: false });

  // Pasta de screenshots na raiz (Playwright grava aqui; hook limpa a cada 12h)
  await fse.ensureDir(path.join(projectDir, 'screenshot'));
  await createFile(path.join(projectDir, 'screenshot', '.gitkeep'), '', { overwrite: false });

  // Cofre local de acessos: cria access.md a partir do exemplo (ignorado pelo git)
  const accessExample = path.join(projectDir, 'access.example.md');
  const accessFile = path.join(projectDir, 'access.md');
  if ((await fse.pathExists(accessExample)) && !(await fse.pathExists(accessFile))) {
    await fse.copy(accessExample, accessFile);
  }

  // Memória do orquestrador: índice global (versionado; ver a regra memory.md)
  const memoryDir = path.join(projectDir, '.claude', 'memory');
  await fse.ensureDir(path.join(memoryDir, 'apps'));
  await createFile(path.join(memoryDir, 'MEMORY.md'), MEMORY_INDEX_CONTENT, { overwrite: false });

  // Docs do orquestrador (globais) + pasta de docs por app (isoladas)
  await fse.ensureDir(path.join(projectDir, 'docs', 'stories'));
  await fse.ensureDir(path.join(projectDir, 'docs', 'features'));
  await fse.ensureDir(path.join(projectDir, 'docs', 'apps'));
  await createFile(path.join(projectDir, 'docs', 'apps', '.gitkeep'), '', { overwrite: false });
}

export async function postSetup(projectDir, options = {}) {
  const { dryRun = false } = options;

  await ensureOrchestratorScaffold(projectDir);

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
