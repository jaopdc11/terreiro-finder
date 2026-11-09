import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { BlocoQuimbanda } from '@/features/casas/domain/BlocoQuimbanda';
import {
  useBlocoQuimbanda,
  useSalvarBlocoQuimbanda,
} from '../hooks/usePainel';

interface Props {
  casaId: string;
}

const ABERTURA: { v: boolean | null; label: string; desc: string }[] = [
  {
    v: true,
    label: 'Aberta a não-iniciados',
    desc: 'Pessoas sem fundamento podem participar de rituais e festas.',
  },
  {
    v: false,
    label: 'Só iniciados',
    desc: 'Casa reservada a quem tem coroa.',
  },
  { v: null, label: 'Não informado', desc: 'Prefere não declarar.' },
];

export function AbaTradicaoQuimbanda({ casaId }: Props) {
  const { data: bloco, isLoading } = useBlocoQuimbanda(casaId);
  const salvar = useSalvarBlocoQuimbanda(casaId);
  const [estado, setEstado] = useState<BlocoQuimbanda>(() =>
    BlocoQuimbanda.vazio(casaId),
  );

  useEffect(() => {
    if (bloco) setEstado(bloco);
  }, [bloco]);

  if (isLoading) {
    return <p className="text-muted-foreground">Carregando bloco…</p>;
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    salvar.mutate(estado.toInput());
  };

  return (
    <form onSubmit={submit} className="space-y-8">
      <p className="text-sm text-muted-foreground">
        A abertura aparece como filtro de busca; corrente e raiz aparecem na
        ficha pública. Reinos das entidades cultuadas não entram aqui —
        descrevem entidades, não a casa.
      </p>

      <div>
        <label htmlFor="q-corrente" className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Corrente
        </label>
        <input
          id="q-corrente"
          value={estado.corrente ?? ''}
          onChange={(e) =>
            setEstado(estado.com({ corrente: e.target.value || null }))
          }
          placeholder="Ex.: Quimbanda tradicional, Quimbanda Nagô"
          className="w-full border-0 border-b border-border bg-transparent pb-3 pt-1 text-lg text-foreground transition-colors placeholder:text-muted-foreground/30 focus:border-primary focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="q-raiz" className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Raiz / Linhagem (terreiro-mãe ou tata iniciador)
        </label>
        <input
          id="q-raiz"
          value={estado.raizLinhagem ?? ''}
          onChange={(e) =>
            setEstado(estado.com({ raizLinhagem: e.target.value || null }))
          }
          placeholder="De onde veio a coroa do dirigente"
          className="w-full border-0 border-b border-border bg-transparent pb-3 pt-1 text-lg text-foreground transition-colors placeholder:text-muted-foreground/30 focus:border-primary focus:outline-none"
        />
      </div>

      <div className="space-y-3">
        <p className="eyebrow">Abertura a não-iniciados</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {ABERTURA.map((o) => (
            <label
              key={String(o.v)}
              className={
                'cursor-pointer rounded-md border p-3 text-sm ' +
                (estado.abertaANaoIniciados === o.v
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-muted')
              }
            >
              <input
                type="radio"
                name="q-abertura"
                className="sr-only"
                checked={estado.abertaANaoIniciados === o.v}
                onChange={() =>
                  setEstado(estado.com({ abertaANaoIniciados: o.v }))
                }
              />
              <span className="block font-medium">{o.label}</span>
              <span className="mt-1 block text-xs text-muted-foreground">
                {o.desc}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-8 space-y-4">
        {salvar.error ? (
          <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
            {salvar.error.message}
          </p>
        ) : null}
        {salvar.isSuccess ? (
          <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
            <Check className="h-4 w-4 shrink-0" />
            Bloco salvo.
          </div>
        ) : null}
        <Button type="submit" variant="primary" disabled={salvar.isPending} className="w-full sm:w-auto">
          {salvar.isPending ? 'Salvando…' : 'Salvar tradição'}
        </Button>
      </div>
    </form>
  );
}
