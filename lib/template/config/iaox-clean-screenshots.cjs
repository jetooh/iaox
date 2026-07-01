#!/usr/bin/env node
/**
 * IAOX — Limpeza automática da pasta screenshot/ a cada 12 horas.
 *
 * Registrado como hook SessionStart em .claude/settings.json. No início de uma
 * sessão, se passaram >= 12h desde a última limpeza (marcador screenshot/.last-clean),
 * apaga todo o conteúdo de screenshot/ e regrava o marcador.
 *
 * Silencioso e à prova de falhas: nunca lança nem bloqueia a sessão (exit 0).
 */
const fs = require('node:fs');
const path = require('node:path');

const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

try {
  const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const dir = path.join(root, 'screenshot');
  if (!fs.existsSync(dir)) process.exit(0);

  const stamp = path.join(dir, '.last-clean');
  let last = 0;
  if (fs.existsSync(stamp)) {
    const parsed = parseInt(fs.readFileSync(stamp, 'utf-8').trim(), 10);
    if (!Number.isNaN(parsed)) last = parsed;
  }

  const now = Date.now();
  if (last && now - last < TWELVE_HOURS_MS) process.exit(0);

  for (const entry of fs.readdirSync(dir)) {
    if (entry === '.last-clean' || entry === '.gitkeep') continue;
    fs.rmSync(path.join(dir, entry), { recursive: true, force: true });
  }
  fs.writeFileSync(stamp, String(now), 'utf-8');
} catch {
  // silencioso — a limpeza de screenshots nunca deve quebrar a sessão
}
process.exit(0);
