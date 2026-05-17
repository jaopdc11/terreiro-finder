import { useEffect, useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
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
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Esses campos descrevem a casa pra quem busca. A nação aparece como
        filtro de busca; os demais aparecem na ficha pública.
      </p>

      <fieldset className="space-y-2 rounded-lg border border-border p-4">
        <legend className="px-2 text-sm font-medium">Nação</legend>
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
      </fieldset>

      <div className="space-y-1">
        <Label htmlFor="c-orixa">Orixá da casa</Label>
        <Input
          id="c-orixa"
          value={estado.orixaDaCasa ?? ''}
          onChange={(e) =>
            setEstado(estado.com({ orixaDaCasa: e.target.value || null }))
          }
          placeholder="Ex.: Oxóssi, Iemanjá, Xangô"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="c-raiz">Raiz / Linhagem (terreiro-mãe)</Label>
        <Input
          id="c-raiz"
          value={estado.raizLinhagem ?? ''}
          onChange={(e) =>
            setEstado(estado.com({ raizLinhagem: e.target.value || null }))
          }
          placeholder="Ex.: Casa Branca do Engenho Velho (Salvador/BA)"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="c-lingua">Língua ritual</Label>
        <Input
          id="c-lingua"
          value={estado.linguaRitual ?? ''}
          onChange={(e) =>
            setEstado(estado.com({ linguaRitual: e.target.value || null }))
          }
          placeholder="Ex.: yorubá, ewe-fon, kimbundo"
        />
      </div>

      {salvar.error ? (
        <p role="alert" className="text-sm text-destructive">
          {salvar.error.message}
        </p>
      ) : null}
      {salvar.isSuccess ? (
        <p className="text-sm text-primary">Bloco Candomblé salvo.</p>
      ) : null}

      <Button type="submit" disabled={salvar.isPending}>
        {salvar.isPending ? 'Salvando…' : 'Salvar tradição'}
      </Button>
    </form>
  );
}
