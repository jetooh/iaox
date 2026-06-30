import { Command } from 'commander';
import chalk from 'chalk';
import { CLI_NAME, CLI_VERSION, DISPLAY_NAME } from './constants.js';

const program = new Command();

program
  .name(CLI_NAME)
  .description(`Bootstrap a IAOX project with ${DISPLAY_NAME} — AI agent orchestration`)
  .version(CLI_VERSION, '-v, --version', 'Display the current version');

program.addHelpText(
  'before',
  () => '\n  ' + chalk.bold.cyan('IAOX') + chalk.dim(` — ${DISPLAY_NAME}`) + '\n'
);

// Comando padrão: init (criar novo projeto)
program
  .argument('[project-name]', 'Name of the project to create')
  .option('--dry-run', 'Simulate the pipeline without the framework wizard, network installs, npm install or git')
  .option('--ide <tools>', 'Comma-separated IDEs to simulate in --dry-run (e.g. claude-code,cursor,codex,gemini)', 'claude-code')
  .action(async (projectName, options) => {
    const { initCommand } = await import('./commands/init.js');
    await initCommand(projectName, options);
  });

program
  .command('update')
  .description('Update an existing project to the latest God Mode skill version')
  .action(async (options) => {
    const { updateCommand } = await import('./commands/update.js');
    await updateCommand(options);
  });

program
  .command('doctor')
  .description('Run health checks on the current project')
  .action(async (options) => {
    const { doctorCommand } = await import('./commands/doctor.js');
    await doctorCommand(options);
  });

program
  .command('add-squad <name>')
  .description('Add a new squad to the current project')
  .action(async (name, options) => {
    const { addSquadCommand } = await import('./commands/add-squad.js');
    await addSquadCommand(name, options);
  });

program.exitOverride((err) => {
  if (err.code === 'commander.helpDisplayed' || err.code === 'commander.version') {
    process.exit(0);
  }
  throw err;
});

/**
 * Executa o CLI, parseando os argumentos do processo.
 */
export async function run() {
  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    console.error(chalk.red(`\nError: ${error.message}`));
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}
