/**
 * Branding e configuração central do CLI.
 *
 * Renomeie o seu projeto inteiro alterando APENAS este arquivo:
 * nome do pacote, nome da skill, pacote do framework e MCPs.
 */

/** Nome do pacote npm (use o mesmo em package.json → name) */
export const CLI_NAME = 'create-meu-iaox-god-mode';

/** Versão exibida em --version (sincronize com package.json) */
export const CLI_VERSION = '0.1.0';

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
