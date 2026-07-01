import { test } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import fse from 'fs-extra';

const BIN = fileURLToPath(new URL('../bin/index.js', import.meta.url));

/**
 * Smoke test do pipeline completo em --dry-run: não toca rede/npm/git,
 * apenas exercita o scaffold e a instalação da skill God Mode.
 */
test('init --dry-run gera a skill iaox-god-mode para claude-code', async () => {
  const cwd = await fse.mkdtemp(path.join(os.tmpdir(), 'iaox-smoke-'));
  try {
    const res = spawnSync('node', [BIN, 'demo', '--dry-run', '--ide', 'claude-code'], {
      cwd,
      encoding: 'utf-8',
    });

    assert.equal(res.status, 0, `CLI deve sair com 0.\nstdout:\n${res.stdout}\nstderr:\n${res.stderr}`);
    assert.match(res.stdout, /Project created successfully/i);

    const skill = path.join(cwd, 'demo', '.claude', 'skills', 'iaox-god-mode', 'SKILL.md');
    assert.ok(await fse.pathExists(skill), 'SKILL.md da skill deve ser gerado no projeto');

    const content = await fse.readFile(skill, 'utf-8');
    assert.match(content, /name:\s*iaox-god-mode/, 'frontmatter da skill deve ter o name correto');
  } finally {
    await fse.remove(cwd);
  }
});

test('init --dry-run aceita múltiplas IDEs', async () => {
  const cwd = await fse.mkdtemp(path.join(os.tmpdir(), 'iaox-smoke-'));
  try {
    const res = spawnSync('node', [BIN, 'demo', '--dry-run', '--ide', 'claude-code,cursor'], {
      cwd,
      encoding: 'utf-8',
    });
    assert.equal(res.status, 0, `stderr:\n${res.stderr}`);
    assert.ok(await fse.pathExists(path.join(cwd, 'demo', '.claude', 'skills', 'iaox-god-mode')));
    assert.ok(await fse.pathExists(path.join(cwd, 'demo', '.cursor', 'skills', 'iaox-god-mode')));
  } finally {
    await fse.remove(cwd);
  }
});

test('init falha com nome de projeto inválido', async () => {
  const cwd = await fse.mkdtemp(path.join(os.tmpdir(), 'iaox-smoke-'));
  try {
    const res = spawnSync('node', [BIN, 'NomeInvalido', '--dry-run'], { cwd, encoding: 'utf-8' });
    assert.notEqual(res.status, 0, 'deve falhar com nome não-kebab-case');
  } finally {
    await fse.remove(cwd);
  }
});
