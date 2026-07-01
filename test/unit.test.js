import { test } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fse from 'fs-extra';

import { validateProjectName, validateDirectoryEmpty } from '../lib/utils/validators.js';
import { getAvailableTools, getToolPaths, resolveToolKey, supportsMcp } from '../lib/utils/tool-paths.js';
import { CLI_VERSION, CLI_NAME, SKILL_NAME } from '../lib/constants.js';

test('validateProjectName: aceita kebab-case válido', () => {
  assert.equal(validateProjectName('meu-projeto').valid, true);
  assert.equal(validateProjectName('app_1.0').valid, true);
});

test('validateProjectName: rejeita vazio, maiúsculas e caracteres inválidos', () => {
  assert.equal(validateProjectName('').valid, false);
  assert.equal(validateProjectName('   ').valid, false);
  assert.equal(validateProjectName('MeuProjeto').valid, false);
  assert.equal(validateProjectName('-começa-com-traço').valid, false);
  assert.equal(validateProjectName('com espaço').valid, false);
});

test('validateProjectName: rejeita nome longo demais (>214)', () => {
  assert.equal(validateProjectName('a'.repeat(215)).valid, false);
  assert.equal(validateProjectName('a'.repeat(214)).valid, true);
});

test('validateDirectoryEmpty: true para inexistente e vazio, false para com conteúdo', async () => {
  const base = await fse.mkdtemp(path.join(os.tmpdir(), 'iaox-test-'));
  try {
    assert.equal(await validateDirectoryEmpty(path.join(base, 'nao-existe')), true);
    const vazio = path.join(base, 'vazio');
    await fse.ensureDir(vazio);
    assert.equal(await validateDirectoryEmpty(vazio), true);
    await fse.writeFile(path.join(vazio, 'x.txt'), 'x');
    assert.equal(await validateDirectoryEmpty(vazio), false);
  } finally {
    await fse.remove(base);
  }
});

test('tool-paths: as 4 IDEs alvo estão disponíveis', () => {
  const tools = getAvailableTools();
  for (const ide of ['claude-code', 'codex', 'cursor', 'gemini']) {
    assert.ok(tools.includes(ide), `${ide} deve estar disponível`);
  }
});

test('tool-paths: resolve key legada "claude" -> "claude-code"', () => {
  assert.equal(resolveToolKey('claude'), 'claude-code');
  assert.equal(getToolPaths('claude').instructions, 'CLAUDE.md');
});

test('tool-paths: supportsMcp reflete a config (gemini sem MCP per-project)', () => {
  assert.equal(supportsMcp('claude-code'), true);
  assert.equal(supportsMcp('gemini'), false);
});

test('constants: versão vem do package.json e branding é iaox', () => {
  const pkg = fse.readJsonSync(new URL('../package.json', import.meta.url));
  assert.equal(CLI_VERSION, pkg.version);
  assert.equal(CLI_NAME, 'iaox');
  assert.equal(SKILL_NAME, 'iaox-god-mode');
});
