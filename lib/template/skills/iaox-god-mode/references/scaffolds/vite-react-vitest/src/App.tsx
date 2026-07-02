import { useState } from 'react';

// Component code is in English; user-facing copy is in Portuguese (pt-BR).
export function App() {
  const [count, setCount] = useState(0);

  return (
    <main>
      <h1>Bem-vindo</h1>
      <p>Você clicou {count} vez(es).</p>
      <button type="button" onClick={() => setCount((value) => value + 1)}>
        Clique aqui
      </button>
    </main>
  );
}
