import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Home from './page';

describe('Home', () => {
  it('renders the welcome heading', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { name: /bem-vindo/i })).toBeDefined();
  });
});
