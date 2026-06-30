import chalk from 'chalk';
import { SKILL_NAME } from '../constants.js';

const TOOL_START = {
  'claude-code': 'claude',
  codex: 'codex',
  cursor: 'cursor',
  gemini: 'gemini',
};

/**
 * Imprime o cabeçalho de uma etapa numerada do pipeline.
 */
export function printStep(current, total, label) {
  console.log(
    chalk.dim(`\n[${current}/${total}] `) + chalk.bold.white(label)
  );
}

export function printSuccess(projectName, primaryTool = 'claude-code') {
  const start = TOOL_START[primaryTool] || 'claude';
  console.log('');
  console.log(chalk.green.bold('  ✓ Project created successfully!\n'));
  console.log(chalk.bold('  Next steps:'));
  console.log(chalk.cyan(`    cd ${projectName}`));
  console.log(chalk.cyan(`    ${start}`));
  console.log(chalk.dim(`    # then type: /${SKILL_NAME}`));
  console.log('');
}

export function printError(message, error) {
  console.error(chalk.red(`\n  ✗ ${message}`));
  if (error && process.env.DEBUG) {
    console.error(chalk.dim(error.stack || error.message));
  } else if (error) {
    console.error(chalk.dim(`    ${error.message}`));
  }
}

export function printWarning(message) {
  console.warn(chalk.yellow(`  ⚠ ${message}`));
}

export function printInfo(message) {
  console.log(chalk.blue(`  ℹ ${message}`));
}
