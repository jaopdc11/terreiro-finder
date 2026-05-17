import { useEffect, useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
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
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        A abertura aparece como filtro de busca; corrente e raiz aparecem na
        ficha pública. Reinos das entidades cultuadas não entram aqui —
        descrevem entidades, não a casa.
      </p>

      <div className="space-y-1">
        <Label htmlFor="q-corrente">Corrente</Label>
        <Input
          id="q-corrente"
          value={estado.corrente ?? ''}
          onChange={(e) =>
            setEstado(estado.com({ corrente: e.target.value || null }))
          }
          placeholder="Ex.: Quimbanda tradicional, Quimbanda Nagô"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="q-raiz">Raiz / Linhagem (terreiro-mãe ou tata iniciador)</Label>
        <Input
          id="q-raiz"
          value={estado.raizLinhagem ?? ''}
          onChange={(e) =>
            setEstado(estado.com({ raizLinhagem: e.target.value || null }))
          }
          placeholder="De onde veio a coroa do dirigente"
        />
      </div>

      <fieldset className="space-y-2 rounded-lg border border-border p-4">
        <legend className="px-2 text-sm font-medium">
          Abertura a não-iniciados
        </legend>
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
      </fieldset>

      {salvar.error ? (
        <p role="alert" className="text-sm text-destructive">
          {salvar.error.message}
        </p>
      ) : null}
      {salvar.isSuccess ? (
        <p className="text-sm text-primary">Bloco Quimbanda salvo.</p>
      ) : null}

      <Button type="submit" disabled={salvar.isPending}>
        {salvar.isPending ? 'Salvando…' : 'Salvar tradição'}
      </Button>
    </form>
  );
}
