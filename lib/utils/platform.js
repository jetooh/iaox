import fs from 'node:fs';
import path from 'node:path';
import fse from 'fs-extra';

/**
 * Resolve o caminho absoluto do diretório do projeto a partir do nome.
 */
export function resolveProjectDir(name) {
  return path.resolve(process.cwd(), name);
}

/**
 * Abre um file descriptor para /dev/tty (input interativo quando stdin é pipe).
 * Retorna null em plataformas/condições onde não é possível.
 *
 * @returns {number|null}
 */
export function getTtyFd() {
  if (process.platform === 'win32') return null;
  try {
    return fs.openSync('/dev/tty', 'r');
  } catch {
    return null;
  }
}

export function closeTtyFd(fd) {
  if (fd !== null && fd !== undefined) {
    try {
      fs.closeSync(fd);
    } catch {
      /* noop */
    }
  }
}

/**
 * Descobre o nome do diretório do core do framework dentro do projeto.
 * Procura por .aiox-core ou .aios-core.
 *
 * @param {string} projectDir
 * @returns {Promise<string>} nome do diretório (default: '.aiox-core')
 */
export async function resolveCoreDir(projectDir) {
  for (const candidate of ['.aiox-core', '.aios-core']) {
    if (await fse.pathExists(path.join(projectDir, candidate))) {
      return candidate;
    }
  }
  return '.aiox-core';
}

/**
 * Resolve o caminho do core-config.yaml dentro do projeto.
 *
 * @param {string} projectDir
 * @returns {Promise<string>}
 */
export async function resolveCoreConfigPath(projectDir) {
  const candidates = [
    path.join(projectDir, 'core-config.yaml'),
    path.join(projectDir, '.aiox-core', 'core-config.yaml'),
    path.join(projectDir, '.aios-core', 'core-config.yaml'),
  ];
  for (const candidate of candidates) {
    if (await fse.pathExists(candidate)) return candidate;
  }
  return candidates[0];
}
