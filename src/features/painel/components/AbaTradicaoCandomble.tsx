import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import {
  CANDOMBLE_NACAO_LABEL,
  type CandombleNacao,
} from '@/features/casas/domain/blocoCandombleEnums';
import { BlocoCandomble } from '@/features/casas/domain/BlocoCandomble';
import {
  useBlocoCandomble,
  useSalvarBlocoCandomble,
} from '../hooks/usePainel';

interface Props {
  casaId: string;
}

const NACOES: CandombleNacao[] = [
  'ketu',
  'jeje',
  'angola',
  'efon',
  'nago_vodun',
  'outra',
];

export function AbaTradicaoCandomble({ casaId }: Props) {
  const { data: bloco, isLoading } = useBlocoCandomble(casaId);
  const salvar = useSalvarBlocoCandomble(casaId);
  const [estado, setEstado] = useState<BlocoCandomble>(() =>
    BlocoCandomble.vazio(casaId),
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
        Esses campos descrevem a casa pra quem busca. A nação aparece como
        filtro de busca; os demais aparecem na ficha pública.
      </p>

      <div className="space-y-3">
        <p className="eyebrow">Nação</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {NACOES.map((v) => (
            <label
              key={v}
              className={
                'cursor-pointer rounded-md border p-3 text-sm ' +
                (estado.nacao === v
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-muted')
              }
            >
              <input
                type="radio"
                name="candomble-nacao"
                className="sr-only"
                checked={estado.nacao === v}
                onChange={() => setEstado(estado.com({ nacao: v }))}
              />
              {CANDOMBLE_NACAO_LABEL[v]}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="c-orixa" className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Orixá da casa
        </label>
        <input
          id="c-orixa"
          value={estado.orixaDaCasa ?? ''}
          onChange={(e) =>
            setEstado(estado.com({ orixaDaCasa: e.target.value || null }))
          }
          placeholder="Ex.: Oxóssi, Iemanjá, Xangô"
          className="w-full border-0 border-b border-border bg-transparent pb-3 pt-1 text-lg text-foreground transition-colors placeholder:text-muted-foreground/30 focus:border-primary focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="c-raiz" className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Raiz / Linhagem (terreiro-mãe)
        </label>
        <input
          id="c-raiz"
          value={estado.raizLinhagem ?? ''}
          onChange={(e) =>
            setEstado(estado.com({ raizLinhagem: e.target.value || null }))
          }
          placeholder="Ex.: Casa Branca do Engenho Velho (Salvador/BA)"
          className="w-full border-0 border-b border-border bg-transparent pb-3 pt-1 text-lg text-foreground transition-colors placeholder:text-muted-foreground/30 focus:border-primary focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="c-lingua" className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Língua ritual
        </label>
        <input
          id="c-lingua"
          value={estado.linguaRitual ?? ''}
          onChange={(e) =>
            setEstado(estado.com({ linguaRitual: e.target.value || null }))
          }
          placeholder="Ex.: yorubá, ewe-fon, kimbundo"
          className="w-full border-0 border-b border-border bg-transparent pb-3 pt-1 text-lg text-foreground transition-colors placeholder:text-muted-foreground/30 focus:border-primary focus:outline-none"
        />
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
