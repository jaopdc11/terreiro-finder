import { describe, expect, it } from 'vitest';
import { formatarCep } from './cep';

describe('formatarCep', () => {
  it('insere hífen depois do 5º dígito', () => {
    expect(formatarCep('88308600')).toBe('88308-600');
  });

  it('mantém parcial sem hífen até 5 dígitos', () => {
    expect(formatarCep('12345')).toBe('12345');
    expect(formatarCep('1234')).toBe('1234');
  });

  it('ignora não-dígitos', () => {
    expect(formatarCep('88a308b600')).toBe('88308-600');
    expect(formatarCep('88308-600')).toBe('88308-600');
    expect(formatarCep('  883 08-600  ')).toBe('88308-600');
  });

  it('limita a 8 dígitos', () => {
    expect(formatarCep('123456789012')).toBe('12345-678');
  });

  it('string vazia retorna string vazia', () => {
    expect(formatarCep('')).toBe('');
  });
});
