import chalk from 'chalk';
import { DISPLAY_NAME, CLI_VERSION } from '../constants.js';

const ART = `
  ██╗ █████╗  ██████╗ ██╗  ██╗
  ██║██╔══██╗██╔═══██╗╚██╗██╔╝
  ██║███████║██║   ██║ ╚███╔╝
  ██║██╔══██║██║   ██║ ██╔██╗
  ██║██║  ██║╚██████╔╝██╔╝ ██╗
  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝ por JETOOH`;

/**
 * Exibe o logo ASCII + tagline no início do `init`.
 */
export async function showLogo() {
  console.log(chalk.cyan(ART));
  console.log(
    '  ' + chalk.bold.white(DISPLAY_NAME) + chalk.dim(`  v${CLI_VERSION}`)
  );
  console.log(chalk.dim('  AI-Orchestrated System — one command, full setup.\n'));
}

/**
 * Banner compacto para help.
 */
export function showBanner() {
  return '\n  ' + chalk.bold.cyan('IAOX') + chalk.dim(` — ${DISPLAY_NAME}`) + '\n';
}
