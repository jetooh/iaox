/**
 * Branding e configuração central do CLI.
 *
 * Renomeie o seu projeto inteiro alterando APENAS este arquivo:
 * nome do pacote, nome da skill, pacote do framework e MCPs.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const pkg = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'package.json'), 'utf-8')
);

/** Nome do comando/binário exibido em mensagens (bin do package.json). */
export const CLI_NAME = 'iaox';

/** Versão exibida em --version — lida do package.json (fonte única da verdade). */
export const CLI_VERSION = pkg.version;

/** Nome de exibição usado em banners e mensagens */
export const DISPLAY_NAME = 'IAOX God Mode';

/** Slug da skill God Mode (diretório dentro de skills/) */
export const SKILL_NAME = 'iaox-god-mode';

/**
 * Pacote do framework de agentes a ser instalado na etapa de bootstrap.
 * O CLI tenta `FRAMEWORK_PACKAGE` e cai para `FRAMEWORK_PACKAGE_FALLBACK`
 * se o primeiro não existir no registry.
 */
export const FRAMEWORK_PACKAGE = 'aiox-core';
export const FRAMEWORK_PACKAGE_FALLBACK = 'aios-core';

/** Servidores MCP configurados para cada IDE selecionada. */
export const MCP_SERVERS = {
  context7: {
    command: 'npx',
    args: ['-y', '@upstash/context7-mcp@latest'],
  },
  '21st-dev': {
    command: 'npx',
    args: ['-y', '@21st-dev/magic@latest'],
  },
  'nano-banana-pro': {
    type: 'stdio',
    command: 'npx',
    args: ['-y', '@rafarafarafa/nano-banana-pro-mcp'],
    env: {
      GEMINI_API_KEY: '${GEMINI_API_KEY}',
    },
  },
};

/** Pacotes opcionais do ecossistema instalados via npx (etapas 5/6). */
export const ECOSYSTEM = {
  gsd: { package: 'get-shit-done-cc', args: ['--local'] },
  omc: { package: 'oh-my-claude-sisyphus', args: ['install', '--skip-claude-check'] },
};

export const REQUIRED_NODE_VERSION = '>=18.0.0';
