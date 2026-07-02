// Shared ESLint flat config for the whole ecosystem (all apps + packages).
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    // Lint only the ecosystem's own code (app/* and packages/*); skip framework
    // files, build output and config files.
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/node_modules/**',
      '**/.dart_tool/**',
      '.aiox-core/**',
      '.claude/**',
      'squads/**',
      'docs/**',
      '**/*.config.{js,ts,mjs,cjs}',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
);
