import { Command } from 'commander';
import chalk from 'chalk';
import { showBanner } from './ui/logo.js';

const program = new Command();

program
  .name('iaox')
  .description('IAOX by JETOOH — bootstrap an AIOX project with the God Mode skill')
  .version('3.1.0', '-v, --version', 'Display the current version');

// Exibe banner antes do texto de help (sync, pois addHelpText não suporta async)
program.addHelpText('before', () => {
  return '\n  ' + chalk.bold.cyan('AIOX') + chalk.dim(' — AI-Orchestrated System \u2022 installer by JETOOH') + '\n';
});

// Comando padrão: init (criar novo projeto)
program
  .argument('[project-name]', 'Name of the project to create')
  .action(async (projectName) => {
    const { initCommand } = await import('./commands/init.js');
    await initCommand(projectName);
  });

// Comando: update
program
  .command('update')
  .description('Update an existing AIOX project to the latest template version')
  .action(async (options) => {
    const { updateCommand } = await import('./commands/update.js');
    await updateCommand(options);
  });

// Comando: doctor
program
  .command('doctor')
  .description('Run health checks on the current AIOX project')
  .action(async (options) => {
    const { doctorCommand } = await import('./commands/doctor.js');
    await doctorCommand(options);
  });

// Comando: add-squad
program
  .command('add-squad <name>')
  .description('Add a new squad to the current AIOX project')
  .action(async (name, options) => {
    const { addSquadCommand } = await import('./commands/add-squad.js');
    await addSquadCommand(name, options);
  });

// Handler global de erros
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
