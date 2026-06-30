import path from 'node:path';
import fse from 'fs-extra';
import chalk from 'chalk';
import semver from 'semver';
import { REQUIRED_NODE_VERSION, SKILL_NAME } from '../constants.js';
import { resolveCoreConfigPath } from '../utils/platform.js';
import { checkNetworkAccess } from '../utils/validators.js';

/**
 * Executa verificações de saúde no projeto atual.
 */
export async function doctorCommand() {
  const projectDir = process.cwd();
  const checks = [];

  // 1. Node version
  checks.push({
    label: 'Node.js >= 18.0.0',
    ok: semver.satisfies(process.version, REQUIRED_NODE_VERSION),
    critical: false,
  });

  // 2. Projeto (core-config.yaml)
  const configPath = await resolveCoreConfigPath(projectDir);
  checks.push({
    label: 'IAOX project (core-config.yaml)',
    ok: await fse.pathExists(configPath),
    critical: true,
  });

  // 3. God Mode skill
  const skillPath = path.join(projectDir, '.claude', 'skills', SKILL_NAME, 'SKILL.md');
  checks.push({
    label: `God Mode skill (${SKILL_NAME}/SKILL.md)`,
    ok: await fse.pathExists(skillPath),
    critical: true,
  });

  // 4. CLAUDE.md
  checks.push({
    label: 'Project instructions (CLAUDE.md)',
    ok: await fse.pathExists(path.join(projectDir, 'CLAUDE.md')),
    critical: false,
  });

  // 5. settings.json
  checks.push({
    label: 'Claude settings (settings.json)',
    ok: await fse.pathExists(path.join(projectDir, '.claude', 'settings.json')),
    critical: false,
  });

  // 6. Rules
  const rulesDir = path.join(projectDir, '.claude', 'rules');
  let hasRules = false;
  if (await fse.pathExists(rulesDir)) {
    hasRules = (await fse.readdir(rulesDir)).some((f) => f.endsWith('.md'));
  }
  checks.push({ label: 'Rules (>=1 .md in rules/)', ok: hasRules, critical: false });

  // 7. Git
  checks.push({
    label: 'Git initialized',
    ok: await fse.pathExists(path.join(projectDir, '.git')),
    critical: false,
  });

  // 8. Network
  checks.push({ label: 'Network (GitHub API)', ok: await checkNetworkAccess(), critical: false });

  // Render
  console.log('');
  let criticalFail = false;
  for (const c of checks) {
    const icon = c.ok ? chalk.green('✓') : c.critical ? chalk.red('✗') : chalk.yellow('!');
    const tag = c.critical && !c.ok ? chalk.red(' [critical]') : '';
    console.log(`  ${icon} ${c.label}${tag}`);
    if (c.critical && !c.ok) criticalFail = true;
  }
  console.log('');

  if (criticalFail) {
    console.log(chalk.red('  ✗ Critical checks failed. This may not be a valid IAOX project.\n'));
    process.exit(1);
  }
  console.log(chalk.green('  ✓ Project looks healthy.\n'));
}
