import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@/shared/ui/button';

describe('smoke', () => {
  it('renderiza Button com texto', () => {
    render(<Button>Salve</Button>);
    expect(screen.getByRole('button', { name: 'Salve' })).toBeInTheDocument();
  });
});
