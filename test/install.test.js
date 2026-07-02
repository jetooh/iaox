import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import fse from 'fs-extra';

import { installGodMode } from '../lib/core/god-mode-installer.js';

const BIN = fileURLToPath(new URL('../bin/index.js', import.meta.url));

/**
 * Testes de integração: uma instalação real (--dry-run) precisa entregar TODOS
 * os artefatos que o framework promete — agentes, scaffolds, ecossistema,
 * config compartilhada e o hook de screenshots.
 */
describe('instalação completa (--dry-run)', () => {
  let dir;
  let cwd;

  before(() => {
    cwd = fse.mkdtempSync(path.join(os.tmpdir(), 'iaox-int-'));
    const res = spawnSync('node', [BIN, 'demo', '--dry-run', '--ide', 'claude-code'], {
      cwd,
      encoding: 'utf-8',
    });
    assert.equal(res.status, 0, `init falhou:\n${res.stdout}\n${res.stderr}`);
    dir = path.join(cwd, 'demo');
  });

  after(() => fse.removeSync(cwd));

  test('instala os 8 agentes da casa', () => {
    for (const a of ['scaffolder', 'security', 'e2e', 'i18n', 'platform', 'observability', 'finops', 'a11y']) {
      assert.ok(fse.existsSync(path.join(dir, '.claude', 'agents', `${a}.md`)), `agente ${a} faltando`);
    }
  });

  test('Camada 3: CI affected + Changesets', () => {
    assert.ok(fse.existsSync(path.join(dir, '.github', 'workflows', 'ecosystem-ci.yml')), 'workflow de CI faltando');
    assert.ok(fse.existsSync(path.join(dir, '.changeset', 'config.json')), 'config do changesets faltando');
    const pkg = fse.readJsonSync(path.join(dir, 'package.json'));
    assert.equal(pkg.scripts.changeset, 'changeset', 'script changeset faltando');
    assert.ok(pkg.devDependencies['@changesets/cli'], '@changesets/cli faltando');
  });

  test('instala os 3 scaffolds determinísticos com placeholders', () => {
    const base = path.join(dir, '.claude', 'skills', 'iaox-god-mode', 'references', 'scaffolds');
    assert.ok(fse.existsSync(path.join(base, 'vite-react-vitest', 'package.json')));
    assert.ok(fse.existsSync(path.join(base, 'nextjs-react', 'package.json')));
    assert.ok(fse.existsSync(path.join(base, 'flutter', 'pubspec.yaml')));
    const vite = fse.readFileSync(path.join(base, 'vite-react-vitest', 'vite.config.ts'), 'utf-8');
    assert.match(vite, /__PORT__/, 'scaffold vite deve ter o placeholder __PORT__');
    const next = fse.readFileSync(path.join(base, 'nextjs-react', 'package.json'), 'utf-8');
    assert.match(next, /__APP_NAME__/, 'scaffold next deve ter __APP_NAME__');
    assert.match(next, /__PORT__/, 'scaffold next deve ter __PORT__');
  });

  test('registry ecosystem.json válido e vazio', () => {
    const eco = fse.readJsonSync(path.join(dir, 'ecosystem.json'));
    assert.deepEqual(eco.apps, []);
    assert.deepEqual(eco.packages, []);
  });

  test('monorepo: workspaces + turbo + config compartilhada', () => {
    const pkg = fse.readJsonSync(path.join(dir, 'package.json'));
    assert.deepEqual(pkg.workspaces, ['app/*', 'packages/*']);
    for (const f of ['turbo.json', 'tsconfig.base.json', 'eslint.config.js', '.prettierrc.json', 'knip.json', 'app/.gitkeep', 'packages/README.md', '.husky/pre-commit']) {
      assert.ok(fse.existsSync(path.join(dir, f)), `${f} faltando`);
    }
    assert.ok(pkg['lint-staged'], 'package.json deve ter config lint-staged');
    assert.equal(pkg.scripts.prepare, 'husky', 'prepare script deve ser husky');
  });

  test('cofre de acessos: access.example.md versionado (access.md é ignorado)', () => {
    assert.ok(fse.existsSync(path.join(dir, 'access.example.md')), 'access.example.md faltando');
    const gitignore = fse.readFileSync(path.join(dir, '.gitignore'), 'utf-8');
    assert.match(gitignore, /^access\.md$/m, '.gitignore deve ignorar access.md');
  });

  test('memória e docs: índice global + isolamento por app', () => {
    assert.ok(fse.existsSync(path.join(dir, '.claude', 'memory', 'MEMORY.md')), 'MEMORY.md global faltando');
    assert.ok(fse.existsSync(path.join(dir, '.claude', 'memory', 'apps')), 'pasta memory/apps faltando');
    assert.ok(fse.existsSync(path.join(dir, 'docs', 'stories')), 'docs/stories (orquestrador) faltando');
    assert.ok(fse.existsSync(path.join(dir, 'docs', 'apps')), 'docs/apps (por app) faltando');
    const claude = fse.readFileSync(path.join(dir, 'CLAUDE.md'), 'utf-8');
    assert.match(claude, /@\.claude\/memory\/MEMORY\.md/, 'CLAUDE.md deve referenciar o índice de memória');
  });

  test('hook de limpeza de screenshots registrado', () => {
    assert.ok(fse.existsSync(path.join(dir, '.claude', 'iaox-clean-screenshots.cjs')));
    const settings = fse.readJsonSync(path.join(dir, '.claude', 'settings.json'));
    assert.ok(settings.hooks?.SessionStart, 'settings.json deve ter hook SessionStart');
  });

  test('instruction.md na raiz e referenciado no CLAUDE.md', () => {
    assert.ok(fse.existsSync(path.join(dir, 'instruction.md')));
    const claude = fse.readFileSync(path.join(dir, 'CLAUDE.md'), 'utf-8');
    assert.match(claude, /@instruction\.md/);
  });

  test('regras globais da casa instaladas', () => {
    const rulesDir = path.join(dir, '.claude', 'rules');
    for (const r of ['vertical-slices', 'app-structure', 'tooling', 'ecosystem', 'secrets', 'observability', 'finops', 'a11y', 'memory', 'god-mode-overview']) {
      assert.ok(fse.existsSync(path.join(rulesDir, `${r}.md`)), `regra ${r} faltando`);
    }
  });
});

describe('modo update (installGodMode { update: true })', () => {
  let dir;

  before(async () => {
    dir = fse.mkdtempSync(path.join(os.tmpdir(), 'iaox-upd-'));
    await installGodMode(dir, { aiTool: 'claude-code' }); // init
  });

  after(() => fse.removeSync(dir));

  test('sobrescreve regras de framework, preserva dados do usuário', async () => {
    // usuário adiciona uma app ao registry (dado) e "corrompe" uma regra (framework)
    const eco = path.join(dir, 'ecosystem.json');
    const data = fse.readJsonSync(eco);
    data.apps.push({ name: 'loja', stack: 'vite-react-vitest', port: 5173, status: 'active', path: 'app/loja' });
    fse.writeJsonSync(eco, data);
    const rule = path.join(dir, '.claude', 'rules', 'tooling.md');
    fse.writeFileSync(rule, 'CONTEUDO ANTIGO CORROMPIDO');

    await installGodMode(dir, { aiTool: 'claude-code', update: true });

    // regra de framework foi restaurada
    assert.doesNotMatch(fse.readFileSync(rule, 'utf-8'), /CORROMPIDO/, 'update deve sobrescrever a regra');
    // dados do usuário preservados
    assert.equal(fse.readJsonSync(eco).apps.length, 1, 'update NÃO deve apagar apps do registry');
  });
});
