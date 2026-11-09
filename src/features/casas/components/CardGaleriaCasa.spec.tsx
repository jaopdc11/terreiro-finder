import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CardGaleriaCasa } from './CardGaleriaCasa';
import type { CasaFotoView } from '../api/CasaFotosRepository';

vi.mock('../hooks/useGaleriaCasa');
import { useGaleriaCasa } from '../hooks/useGaleriaCasa';

const mockHook = vi.mocked(useGaleriaCasa);

function makeFoto(idx: number): CasaFotoView {
  return {
    id: `foto-${idx}`,
    casaId: 'casa-1',
    url: `https://storage.example.com/foto-${idx}.jpg`,
    ordem: idx,
  };
}

function stubFotos(fotos: CasaFotoView[]) {
  mockHook.mockReturnValue({ data: fotos, isLoading: false, error: null } as ReturnType<typeof useGaleriaCasa>);
}

describe('CardGaleriaCasa', () => {
  beforeEach(() => vi.clearAllMocks());

  it('não renderiza nada sem fotos', () => {
    stubFotos([]);
    const { container } = render(<CardGaleriaCasa casaId="casa-1" />);
    expect(container.firstChild).toBeNull();
  });

  it('não renderiza nada com data undefined', () => {
    mockHook.mockReturnValue({ data: undefined, isLoading: true, error: null } as ReturnType<typeof useGaleriaCasa>);
    const { container } = render(<CardGaleriaCasa casaId="casa-1" />);
    expect(container.firstChild).toBeNull();
  });

  it('renderiza grid com imagens lazy', () => {
    const fotos = [makeFoto(0), makeFoto(1), makeFoto(2)];
    stubFotos(fotos);
    render(<CardGaleriaCasa casaId="casa-1" />);
    const imgs = screen.getAllByRole('img');
    expect(imgs).toHaveLength(3);
    expect(imgs[0]).toHaveAttribute('src', fotos[0]!.url);
    expect(imgs[0]).toHaveAttribute('loading', 'lazy');
    expect(imgs[1]).toHaveAttribute('src', fotos[1]!.url);
  });

  it('lightbox começa fechado', () => {
    stubFotos([makeFoto(0)]);
    render(<CardGaleriaCasa casaId="casa-1" />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('abre lightbox ao clicar em thumbnail', () => {
    stubFotos([makeFoto(0)]);
    render(<CardGaleriaCasa casaId="casa-1" />);
    fireEvent.click(screen.getByRole('button', { name: /abrir foto 1/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('fecha lightbox ao clicar em fechar', () => {
    stubFotos([makeFoto(0)]);
    render(<CardGaleriaCasa casaId="casa-1" />);
    fireEvent.click(screen.getByRole('button', { name: /abrir foto 1/i }));
    fireEvent.click(screen.getByRole('button', { name: /fechar/i }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('fecha lightbox ao clicar no backdrop', () => {
    stubFotos([makeFoto(0)]);
    render(<CardGaleriaCasa casaId="casa-1" />);
    fireEvent.click(screen.getByRole('button', { name: /abrir foto 1/i }));
    fireEvent.click(screen.getByRole('dialog'));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('não exibe setas de navegação com 1 foto', () => {
    stubFotos([makeFoto(0)]);
    render(<CardGaleriaCasa casaId="casa-1" />);
    fireEvent.click(screen.getByRole('button', { name: /abrir foto 1/i }));
    expect(screen.queryByRole('button', { name: /anterior/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /próxima/i })).toBeNull();
  });

  it('exibe setas de navegação com 2+ fotos', () => {
    stubFotos([makeFoto(0), makeFoto(1)]);
    render(<CardGaleriaCasa casaId="casa-1" />);
    fireEvent.click(screen.getAllByRole('button')[0]!);
    expect(screen.getByRole('button', { name: /anterior/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /próxima/i })).toBeInTheDocument();
  });

  it('navega para próxima foto', () => {
    const fotos = [makeFoto(0), makeFoto(1)];
    stubFotos(fotos);
    render(<CardGaleriaCasa casaId="casa-1" />);
    fireEvent.click(screen.getAllByRole('button')[0]!);
    const lightboxImg = screen.getAllByRole('img').find((img) =>
      img.closest('[role="dialog"]'),
    );
    expect(lightboxImg).toHaveAttribute('src', fotos[0]!.url);
    fireEvent.click(screen.getByRole('button', { name: /próxima/i }));
    expect(lightboxImg).toHaveAttribute('src', fotos[1]!.url);
  });
});
