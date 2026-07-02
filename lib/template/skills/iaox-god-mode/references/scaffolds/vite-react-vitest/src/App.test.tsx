import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('renders the welcome heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /bem-vindo/i })).toBeDefined();
  });

  it('increments the counter when the button is clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /clique aqui/i }));
    expect(screen.getByText(/1 vez/i)).toBeDefined();
  });
});
