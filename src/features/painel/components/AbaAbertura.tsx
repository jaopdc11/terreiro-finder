import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import type { Casa } from '@/features/casas/domain/Casa';
import {
  PerfilAbertura,
  type AceitaVisitantes,
  type EnderecoVisibilidade,
  type FotoRegistro,
} from '@/features/casas/domain/PerfilAbertura';
import { useSalvarAbertura } from '../hooks/usePainel';

const ENDERECO_OPCOES: { v: EnderecoVisibilidade; label: string; ajuda: string }[] = [
  { v: 'publico', label: 'Público', ajuda: 'Endereço completo aparece na ficha.' },
  { v: 'sob_contato', label: 'Sob contato', ajuda: 'Aparece só depois que a pessoa fala com a casa.' },
  { v: 'oculto', label: 'Oculto', ajuda: 'Endereço não aparece no site.' },
];

const VISITANTES_OPCOES: { v: AceitaVisitantes; label: string; ajuda: string }[] = [
  { v: 'aberto', label: 'Aberto', ajuda: 'Qualquer pessoa pode visitar.' },
  { v: 'jogo_previo', label: 'Jogo prévio', ajuda: 'Visita combinada com a dirigência.' },
  { v: 'so_indicacao', label: 'Só por indicação', ajuda: 'Só quem é indicado por alguém da casa.' },
];

const FOTO_OPCOES: { v: FotoRegistro; label: string; ajuda: string }[] = [
  { v: 'permitido', label: 'Permitido', ajuda: 'Foto livre nas dependências.' },
  { v: 'parcial', label: 'Parcial', ajuda: 'Foto só em áreas combinadas.' },
  { v: 'proibido', label: 'Proibido', ajuda: 'Sem fotos em nenhuma área ritual.' },
];

function Toggle<T extends string>({
  legend,
  opcoes,
  selecionado,
  onChange,
}: {
  legend: string;
  opcoes: { v: T; label: string; ajuda: string }[];
  selecionado: T;
  onChange(v: T): void;
}) {
  return (
    <fieldset className="space-y-2 rounded-lg border border-border p-4">
      <legend className="px-2 text-sm font-medium">{legend}</legend>
      <div className="grid gap-2 sm:grid-cols-3">
        {opcoes.map((o) => {
          const ativo = o.v === selecionado;
          return (
            <label
              key={o.v}
              className={
                'flex cursor-pointer flex-col gap-1 rounded-md border p-3 text-sm ' +
                (ativo
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-muted')
              }
            >
              <input
                type="radio"
                className="sr-only"
                name={legend}
                checked={ativo}
                onChange={() => onChange(o.v)}
              />
              <span className="font-medium">{o.label}</span>
              <span className="text-xs text-muted-foreground">{o.ajuda}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function AbaAbertura({ casa }: { casa: Casa }) {
  const salvar = useSalvarAbertura(casa.id);
  const [perfil, setPerfil] = useState<PerfilAbertura>(casa.perfilAbertura);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    salvar.mutate(perfil);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Você controla quanto a casa expõe. Mude quando quiser.
      </p>

      <Toggle
        legend="Endereço"
        opcoes={ENDERECO_OPCOES}
        selecionado={perfil.enderecoVisibilidade}
        onChange={(v) => setPerfil(perfil.comEnderecoVisibilidade(v))}
      />
      <Toggle
        legend="Visitantes"
        opcoes={VISITANTES_OPCOES}
        selecionado={perfil.aceitaVisitantes}
        onChange={(v) => setPerfil(perfil.comAceitaVisitantes(v))}
      />
      <Toggle
        legend="Registro de imagem"
        opcoes={FOTO_OPCOES}
        selecionado={perfil.fotoRegistro}
        onChange={(v) => setPerfil(perfil.comFotoRegistro(v))}
      />

      {salvar.error ? (
        <p role="alert" className="text-sm text-destructive">
          {salvar.error.message}
        </p>
      ) : null}
      {salvar.isSuccess ? (
        <p className="text-sm text-primary">Abertura salva.</p>
      ) : null}

      <Button type="submit" disabled={salvar.isPending}>
        {salvar.isPending ? 'Salvando…' : 'Salvar abertura'}
      </Button>
    </form>
  );
}

