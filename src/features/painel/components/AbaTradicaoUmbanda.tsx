import { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
  KARDECISMO_LABEL,
  LINHAGEM_SUGERIDA,
  LINHAS_TRABALHADAS_SUGERIDAS,
  SACRALIZACAO_LABEL,
  SINCRETISMO_LABEL,
  type UmbandaKardecismo,
  type UmbandaSacralizacao,
  type UmbandaSincretismo,
} from '@/features/casas/domain/blocoUmbandaEnums';
import {
  BlocoUmbanda,
  type BlocoUmbandaInput,
} from '@/features/casas/domain/BlocoUmbanda';
import { useBlocoUmbanda, useSalvarBlocoUmbanda } from '../hooks/usePainel';

interface Props {
  casaId: string;
}

function ChipsToggle({
  legend,
  sugeridas,
  selecionadas,
  onToggle,
}: {
  legend: string;
  sugeridas: ReadonlyArray<string>;
  selecionadas: ReadonlyArray<string>;
  onToggle(tag: string): void;
}) {
  return (
    <fieldset className="space-y-2 rounded-lg border border-border p-4">
      <legend className="px-2 text-sm font-medium">{legend}</legend>
      <p className="text-xs text-muted-foreground">
        Marque o que faz parte da casa.
      </p>
      <div className="flex flex-wrap gap-2">
        {sugeridas.map((tag) => {
          const ativo = selecionadas.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => onToggle(tag)}
              aria-pressed={ativo}
              className={
                'rounded-full border px-3 py-1 text-sm ' +
                (ativo
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card hover:bg-muted')
              }
            >
              {tag}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function AbaTradicaoUmbanda({ casaId }: Props) {
  const { data: bloco, isLoading } = useBlocoUmbanda(casaId);
  const salvar = useSalvarBlocoUmbanda(casaId);
  const [estado, setEstado] = useState<BlocoUmbanda>(() => BlocoUmbanda.vazio(casaId));
  const [linhasExtra, setLinhasExtra] = useState('');

  useEffect(() => {
    if (bloco) setEstado(bloco);
  }, [bloco]);

  if (isLoading) {
    return <p className="text-muted-foreground">Carregando bloco…</p>;
  }

  const toggleSet = (campo: 'linhagem' | 'linhasTrabalhadas', tag: string) => {
    const atuais = campo === 'linhagem' ? estado.linhagem : estado.linhasTrabalhadas;
    const novo = atuais.includes(tag)
      ? atuais.filter((t) => t !== tag)
      : [...atuais, tag];
    setEstado(estado.com({ [campo]: novo } as Partial<BlocoUmbandaInput>));
  };

  const adicionarLinhasExtras = () => {
    const novas = linhasExtra
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.length > 0 && !estado.linhasTrabalhadas.includes(s));
    if (novas.length === 0) return;
    setEstado(
      estado.com({
        linhasTrabalhadas: [...estado.linhasTrabalhadas, ...novas],
      }),
    );
    setLinhasExtra('');
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    salvar.mutate(estado.toInput());
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Esses campos aparecem como filtros pra quem procura uma casa. Eles
        guiam pessoas que estão buscando exatamente a sua linha.
      </p>

      <fieldset className="space-y-2 rounded-lg border border-border p-4">
        <legend className="px-2 text-sm font-medium">Sincretismo católico</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {(['nenhum', 'parcial', 'forte'] as UmbandaSincretismo[]).map((v) => (
            <label
              key={v}
              className={
                'cursor-pointer rounded-md border p-3 text-sm ' +
                (estado.sincretismo === v
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-muted')
              }
            >
              <input
                type="radio"
                name="sincretismo"
                className="sr-only"
                checked={estado.sincretismo === v}
                onChange={() => setEstado(estado.com({ sincretismo: v }))}
              />
              {SINCRETISMO_LABEL[v]}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2 rounded-lg border border-border p-4">
        <legend className="px-2 text-sm font-medium">Influência kardecista</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {(['nenhuma', 'parcial', 'acentuada'] as UmbandaKardecismo[]).map((v) => (
            <label
              key={v}
              className={
                'cursor-pointer rounded-md border p-3 text-sm ' +
                (estado.influenciaKardecista === v
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-muted')
              }
            >
              <input
                type="radio"
                name="kardecista"
                className="sr-only"
                checked={estado.influenciaKardecista === v}
                onChange={() =>
                  setEstado(estado.com({ influenciaKardecista: v }))
                }
              />
              {KARDECISMO_LABEL[v]}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2 rounded-lg border border-border p-4">
        <legend className="px-2 text-sm font-medium">Sacralização</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {(['sim', 'nao', 'parcial'] as UmbandaSacralizacao[]).map((v) => (
            <label
              key={v}
              className={
                'cursor-pointer rounded-md border p-3 text-sm ' +
                (estado.sacralizacao === v
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-muted')
              }
            >
              <input
                type="radio"
                name="sacralizacao"
                className="sr-only"
                checked={estado.sacralizacao === v}
                onChange={() => setEstado(estado.com({ sacralizacao: v }))}
              />
              {SACRALIZACAO_LABEL[v]}
            </label>
          ))}
        </div>
      </fieldset>

      <ChipsToggle
        legend="Linhagem"
        sugeridas={LINHAGEM_SUGERIDA}
        selecionadas={estado.linhagem}
        onToggle={(t) => toggleSet('linhagem', t)}
      />

      <ChipsToggle
        legend="Linhas trabalhadas"
        sugeridas={LINHAS_TRABALHADAS_SUGERIDAS}
        selecionadas={estado.linhasTrabalhadas}
        onToggle={(t) => toggleSet('linhasTrabalhadas', t)}
      />

      <div className="space-y-1">
        <Label htmlFor="linhas-extra">Outras linhas (separe por vírgula)</Label>
        <div className="flex gap-2">
          <Input
            id="linhas-extra"
            value={linhasExtra}
            onChange={(e) => setLinhasExtra(e.target.value)}
            placeholder="Ex.: linha-da-mata, povo-do-oriente"
          />
          <Button type="button" variant="outline" onClick={adicionarLinhasExtras}>
            Adicionar
          </Button>
        </div>
      </div>

      {salvar.error ? (
        <p role="alert" className="text-sm text-destructive">
          {salvar.error.message}
        </p>
      ) : null}
      {salvar.isSuccess ? (
        <p className="text-sm text-primary">Bloco Umbanda salvo.</p>
      ) : null}

      <Button type="submit" disabled={salvar.isPending}>
        {salvar.isPending ? 'Salvando…' : 'Salvar tradição'}
      </Button>
    </form>
  );
}
