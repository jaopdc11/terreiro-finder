import type { Casa } from '../domain/Casa';

const VISITANTES_LABEL = {
  aberto: 'Visitação livre',
  jogo_previo: 'Jogo prévio',
  so_indicacao: 'Só por indicação',
} as const;

const ENDERECO_LABEL = {
  publico: 'Endereço público',
  sob_contato: 'Endereço sob contato',
  oculto: 'Endereço oculto',
} as const;

const FOTO_LABEL = {
  permitido: 'Foto permitida',
  proibido: 'Foto proibida',
  parcial: 'Foto parcial',
} as const;

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-0.5 text-[11px] font-medium text-foreground/80">
      <span
        aria-hidden="true"
        className="inline-block h-1 w-1 rounded-full bg-primary/70"
      />
      {children}
    </span>
  );
}

export function BadgesAbertura({ casa }: { casa: Casa }) {
  const p = casa.perfilAbertura;
  return (
    <div className="flex flex-wrap gap-1.5">
      <Badge>{VISITANTES_LABEL[p.aceitaVisitantes]}</Badge>
      <Badge>{ENDERECO_LABEL[p.enderecoVisibilidade]}</Badge>
      <Badge>{FOTO_LABEL[p.fotoRegistro]}</Badge>
      {!casa.estaVerificada() ? (
        <span
          className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-primary/60 bg-primary/5 px-2.5 py-0.5 text-[11px] font-medium text-primary"
          data-testid="badge-nao-verificada"
        >
          <span
            aria-hidden="true"
            className="inline-block h-1 w-1 rounded-full bg-primary"
          />
          Não verificada
        </span>
      ) : null}
    </div>
  );
}
