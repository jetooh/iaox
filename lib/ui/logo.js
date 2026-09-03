import chalk from 'chalk';

/**
 * Exibe o logo IAOX estilizado usando oh-my-logo (renderFilled).
 *
 * @param {object} [options]
 * @param {boolean} [options.returnString] - Se true, retorna a string ao invés de imprimir
 * @returns {Promise<string | void>}
 */
export async function showLogo(options = {}) {
  let output = '';

  try {
    const { renderFilled } = await import('oh-my-logo');

    const rendered = await renderFilled('iaox', {
      palette: 'sunset',
    });

    output += rendered + '\n';
    output += chalk.dim('  by JETOOH • https://github.com/jetooh/iaox') + '\n';
    output += '\n';
  } catch {
    // Fallback caso oh-my-logo falhe ou não esteja disponível
    output += chalk.bold.cyan('\n  IAOX\n') + '\n';
    output += chalk.dim('  by JETOOH • https://github.com/jetooh/iaox') + '\n';
    output += '\n';
  }

  if (options.returnString) {
    return output;
  }

  process.stdout.write(output);
}

/**
 * Exibe um banner simplificado de uma linha (para contextos fora do --help).
 */
export function showBanner() {
  console.log(
    chalk.bold.cyan('IAOX') +
    chalk.dim(' — AI-Orchestrated System by JETOOH')
  );
}
