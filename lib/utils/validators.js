import fse from 'fs-extra';

/**
 * Valida o nome do projeto: kebab-case, sem espaços, npm-safe.
 *
 * @param {string} name
 * @returns {{ valid: boolean, message?: string }}
 */
export function validateProjectName(name) {
  if (!name || !name.trim()) {
    return { valid: false, message: 'Project name is required. Usage: iaox <name>' };
  }

  const trimmed = name.trim();

  if (trimmed.length > 214) {
    return { valid: false, message: 'Project name must be 214 characters or fewer.' };
  }

  if (/[A-Z]/.test(trimmed)) {
    return { valid: false, message: 'Project name must be lowercase (kebab-case).' };
  }

  if (!/^[a-z0-9][a-z0-9-_.]*$/.test(trimmed)) {
    return {
      valid: false,
      message: 'Project name must start with a letter/number and contain only lowercase letters, numbers, "-", "_" or ".".',
    };
  }

  return { valid: true };
}

/**
 * Verifica se um diretório está vazio ou não existe.
 *
 * @param {string} dirPath
 * @returns {Promise<boolean>} true se vazio/inexistente
 */
export async function validateDirectoryEmpty(dirPath) {
  if (!(await fse.pathExists(dirPath))) {
    return true;
  }
  const entries = await fse.readdir(dirPath);
  return entries.length === 0;
}

/**
 * Verifica conectividade com a internet (GitHub API).
 *
 * @returns {Promise<boolean>}
 */
export async function checkNetworkAccess() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch('https://api.github.com', { signal: controller.signal });
    clearTimeout(timeout);
    return res.ok || res.status === 403; // 403 = rate-limited mas online
  } catch {
    return false;
  }
}
