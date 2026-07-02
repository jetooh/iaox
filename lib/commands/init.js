import path from 'node:path';
import fse from 'fs-extra';
import ora from 'ora';
import chalk from 'chalk';
import { showLogo } from '../ui/logo.js';
import { printSuccess, printError, printStep, printWarning } from '../ui/messages.js';
import { validateProjectName, validateDirectoryEmpty, checkNetworkAccess } from '../utils/validators.js';
import { resolveProjectDir, resolveCoreConfigPath } from '../utils/platform.js';
import { getAvailableTools } from '../utils/tool-paths.js';
import { bootstrapFramework, scaffoldDryRun } from '../core/framework-bootstrap.js';
import { installGodMode } from '../core/god-mode-installer.js';
import {
  configureMcps,
  installFindSkills,
  installGsd,
  installOhMyClaudeCode,
  cleanupSkillsStructure,
} from '../core/ecosystem-installer.js';
import { postSetup } from '../core/post-setup.js';

const TOTAL_STEPS = 8;

/**
 * Lê as IDEs selecionadas em core-config.yaml (escrito pelo framework init).
 * @returns {Promise<string[]>}
 */
async function readSelectedTools(projectDir) {
  const configPath = await resolveCoreConfigPath(projectDir);
  if (!(await fse.pathExists(configPath))) return ['claude-code'];

  const content = await fse.readFile(configPath, 'utf-8');
  const match = content.match(/ide:\s*\n\s+selected:\s*\n((?:\s+-\s+.+\n?)+)/);
  if (!match) return ['claude-code'];

  const tools = match[1]
    .split('\n')
    .map((line) => line.match(/^\s+-\s+(.+)$/))
    .filter(Boolean)
    .map((m) => m[1].trim());

  return tools.length > 0 ? tools : ['claude-code'];
}

/**
 * Faz parse e valida a lista de IDEs passada em --ide.
 * @param {string} raw
 * @returns {string[]}
 */
function parseIdes(raw) {
  const available = getAvailableTools();
  const list = String(raw || 'claude-code')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((ide) => {
      if (available.includes(ide)) return true;
      printWarning(`IDE desconhecida ignorada: "${ide}" (válidas: ${available.join(', ')})`);
      return false;
    });
  return list.length > 0 ? list : ['claude-code'];
}

/**
 * Comando principal: inicializa um novo projeto IAOX com God Mode.
 * @param {string} [projectName]
 * @param {object} [options]
 * @param {boolean} [options.dryRun]
 * @param {string} [options.ide]
 */
export async function initCommand(projectName, options = {}) {
  const dryRun = Boolean(options.dryRun);
  try {
    await showLogo();
    if (dryRun) {
      console.log(chalk.yellow.bold('  ⚡ DRY RUN') + chalk.dim(' — sem wizard, sem rede, sem npm/git. Só o código do CLI.\n'));
    }
    // Sem nome (ou ".") → instala na PASTA ATUAL; senão cria uma subpasta.
    const isCurrentDir = !projectName || projectName === '.';
    const name = isCurrentDir ? path.basename(process.cwd()) : projectName;
    const bootstrapTarget = isCurrentDir ? '.' : projectName;

    // ── Step 1: Validate ──
    printStep(1, TOTAL_STEPS, 'Validating environment...');
    if (!isCurrentDir) {
      const nameValidation = validateProjectName(name);
      if (!nameValidation.valid) {
        printError(nameValidation.message);
        process.exit(1);
      }
    }

    const projectDir = isCurrentDir ? process.cwd() : resolveProjectDir(projectName);
    if (isCurrentDir) {
      printWarning(`Installing into the current folder: ${projectDir}`);
    } else if (!(await validateDirectoryEmpty(projectDir))) {
      if (dryRun) {
        printWarning(`Directory "${name}" não está vazio — dry-run vai sobrescrever os arquivos simulados.`);
      } else {
        printError(`Directory "${name}" already exists and is not empty.`);
        process.exit(1);
      }
    }
    if (!dryRun && !(await checkNetworkAccess())) {
      printWarning('No network access detected. Some operations may fail.');
    }

    // ── Step 2: Bootstrap framework (ou scaffold simulado no dry-run) ──
    printStep(2, TOTAL_STEPS, dryRun ? 'Scaffolding simulated framework...' : 'Initializing IAOX framework...');
    let spinner = ora(dryRun ? 'Scaffolding (dry run)...' : 'Initializing framework...').start();
    try {
      if (dryRun) {
        await scaffoldDryRun(bootstrapTarget, process.cwd(), parseIdes(options.ide));
        spinner.succeed('Simulated framework scaffolded');
      } else {
        await bootstrapFramework(bootstrapTarget, process.cwd());
        spinner.succeed('Framework initialized');
      }
    } catch (error) {
      spinner.fail(dryRun ? 'Failed to scaffold simulated framework' : 'Failed to initialize framework');
      printError('Bootstrap failed. See output above.', error);
      process.exit(1);
    }

    const selectedTools = dryRun ? parseIdes(options.ide) : await readSelectedTools(projectDir);
    const primaryTool = selectedTools[0] || 'claude-code';

    // ── Step 3: Install God Mode (por IDE) ──
    printStep(3, TOTAL_STEPS, 'Installing God Mode skill...');
    for (const tool of selectedTools) {
      spinner = ora(`Installing God Mode (${tool})...`).start();
      try {
        const { version, filesInstalled } = await installGodMode(projectDir, { aiTool: tool });
        spinner.succeed(`God Mode (${tool}) ${chalk.dim(`v${version}, ${filesInstalled} files`)}`);
      } catch (error) {
        spinner.fail(`Failed to install God Mode (${tool})`);
        printError(`God Mode installation failed for ${tool}.`, error);
        process.exit(1);
      }
    }

    // ── find-skills (opcional, pulado no dry-run) ──
    if (!dryRun) {
      spinner = ora('Installing find-skills...').start();
      if (await installFindSkills(projectDir)) {
        spinner.succeed('find-skills installed');
      } else {
        spinner.warn('find-skills not installed (optional)');
      }
    }

    // ── squads/ vazio ──
    await fse.ensureDir(path.join(projectDir, 'squads'));

    // ── Step 4: MCPs (por IDE) ──
    printStep(4, TOTAL_STEPS, 'Configuring MCP servers...');
    for (const tool of selectedTools) {
      spinner = ora(`Configuring MCP servers (${tool})...`).start();
      try {
        const { count, warning } = await configureMcps(projectDir, tool);
        spinner.succeed(`MCP servers (${tool}) ${chalk.dim(`${count} configured`)}`);
        if (warning) printWarning(warning);
      } catch (error) {
        spinner.fail(`Failed to configure MCP servers (${tool})`);
        printWarning(`MCP configuration failed for ${tool}: ${error.message}`);
      }
    }

    // ── Step 5: GSD ──
    printStep(5, TOTAL_STEPS, 'Installing GSD framework...');
    if (dryRun) {
      console.log(chalk.dim('  ⤷ skipped (dry run)'));
    } else {
      spinner = ora('Installing GSD (Get Shit Done)...').start();
      if (await installGsd(projectDir)) spinner.succeed('GSD framework installed');
      else spinner.warn('GSD not installed (optional)');
    }

    // ── Step 6: oh-my-claudecode ──
    printStep(6, TOTAL_STEPS, 'Installing oh-my-claudecode...');
    if (dryRun) {
      console.log(chalk.dim('  ⤷ skipped (dry run)'));
    } else {
      spinner = ora('Installing oh-my-claudecode...').start();
      if (await installOhMyClaudeCode()) spinner.succeed('oh-my-claudecode installed');
      else spinner.warn('oh-my-claudecode not installed (optional)');
    }

    // ── Step 7: Cleanup + Convert (por IDE) ──
    printStep(7, TOTAL_STEPS, 'Cleaning up & converting...');
    const hasClaudeCode = selectedTools.includes('claude-code');
    const multiTool = selectedTools.length > 1;
    for (const tool of selectedTools) {
      try {
        await cleanupSkillsStructure(projectDir, tool, {
          keepClaudeDir: hasClaudeCode || multiTool,
        });
        console.log(chalk.green('  ✓') + ` Cleaned up (${tool})`);
      } catch (error) {
        printWarning(`Cleanup failed for ${tool}: ${error.message}`);
      }
    }
    if (!hasClaudeCode) {
      const claudeDir = path.join(projectDir, '.claude');
      if (await fse.pathExists(claudeDir)) await fse.remove(claudeDir);
    }

    // ── Step 8: Finalize ──
    printStep(8, TOTAL_STEPS, 'Finalizing...');
    spinner = ora('Running post-setup tasks...').start();
    try {
      const { depsInstalled, gitInitialized } = await postSetup(projectDir, { dryRun });
      spinner.stop();
      if (dryRun) {
        console.log(chalk.dim('  ⤷ npm install & git skipped (dry run); .env.example & .gitignore created'));
      } else {
        if (depsInstalled) console.log(chalk.green('  ✓') + ' Dependencies installed');
        else printWarning('Dependencies installation skipped');
        if (gitInitialized) console.log(chalk.green('  ✓') + ' Git initialized with initial commit');
        else printWarning('Git initialization skipped or failed');
      }
    } catch (error) {
      spinner.fail('Post-setup failed');
      printError('Post-setup encountered an error.', error);
    }

    printSuccess(name, primaryTool, isCurrentDir);
  } catch (error) {
    printError('An unexpected error occurred during project creation.', error);
    process.exit(1);
  }
}
