import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/shared/ui/button';
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
    <div className="space-y-3">
      <p className="eyebrow">{legend}</p>
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
    </div>
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
    <form onSubmit={submit} className="space-y-8">
      <p className="text-sm text-muted-foreground">
        Esses campos aparecem como filtros pra quem procura uma casa. Eles
        guiam pessoas que estão buscando exatamente a sua linha.
      </p>

      <div className="space-y-3">
        <p className="eyebrow">Sincretismo católico</p>
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
      </div>

      <div className="space-y-3">
        <p className="eyebrow">Influência kardecista</p>
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
      </div>

      <div className="space-y-3">
        <p className="eyebrow">Sacralização</p>
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
      </div>

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

      <div>
        <label
          htmlFor="linhas-extra"
          className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
        >
          Outras linhas (separe por vírgula)
        </label>
        <div className="flex items-end gap-3">
          <input
            id="linhas-extra"
            value={linhasExtra}
            onChange={(e) => setLinhasExtra(e.target.value)}
            placeholder="Ex.: linha-da-mata, povo-do-oriente"
            className="flex-1 border-0 border-b border-border bg-transparent pb-3 pt-1 text-lg text-foreground transition-colors placeholder:text-muted-foreground/30 focus:border-primary focus:outline-none"
          />
          <Button type="button" variant="outline" size="sm" onClick={adicionarLinhasExtras}>
            Adicionar
          </Button>
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
