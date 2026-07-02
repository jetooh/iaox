import type { ReactNode } from 'react';
import '../src/env'; // validates env vars at startup (Zod)

export const metadata = {
  title: '__APP_NAME__',
  description: 'Aplicação Next.js gerada pelo IAOX.',
};

// Component code is in English; user-facing copy is in Portuguese (pt-BR).
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
