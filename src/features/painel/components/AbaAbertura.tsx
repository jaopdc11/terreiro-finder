import { useState } from 'react';
import {
  AlertCircle,
  Camera,
  CameraOff,
  Calendar,
  Check,
  EyeOff,
  Globe,
  Lock,
  MapPin,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import type { Casa } from '@/features/casas/domain/Casa';
import {
  PerfilAbertura,
  type AceitaVisitantes,
  type EnderecoVisibilidade,
  type FotoRegistro,
} from '@/features/casas/domain/PerfilAbertura';
import { useSalvarAbertura } from '../hooks/usePainel';

const ENDERECO_OPCOES: { v: EnderecoVisibilidade; label: string; ajuda: string; icone: LucideIcon }[] = [
  { v: 'publico', label: 'Público', ajuda: 'Endereço completo aparece na ficha pública.', icone: MapPin },
  { v: 'sob_contato', label: 'Sob contato', ajuda: 'Aparece só depois que a pessoa falar com a casa.', icone: Lock },
  { v: 'oculto', label: 'Oculto', ajuda: 'Endereço não aparece no site em nenhum momento.', icone: EyeOff },
];

const VISITANTES_OPCOES: { v: AceitaVisitantes; label: string; ajuda: string; icone: LucideIcon }[] = [
  { v: 'aberto', label: 'Aberto', ajuda: 'Qualquer pessoa pode visitar sem combinação prévia.', icone: Globe },
  { v: 'jogo_previo', label: 'Jogo prévio', ajuda: 'Visita combinada com a dirigência antes de ir.', icone: Calendar },
  { v: 'so_indicacao', label: 'Só por indicação', ajuda: 'Apenas quem é indicado por alguém da casa.', icone: Users },
];

const FOTO_OPCOES: { v: FotoRegistro; label: string; ajuda: string; icone: LucideIcon }[] = [
  { v: 'permitido', label: 'Permitido', ajuda: 'Fotos livres nas dependências da casa.', icone: Camera },
  { v: 'parcial', label: 'Com restrições', ajuda: 'Foto só em áreas e momentos combinados.', icone: AlertCircle },
  { v: 'proibido', label: 'Proibido', ajuda: 'Sem fotos em nenhuma área ritual.', icone: CameraOff },
];

function GrupoOpcoes<T extends string>({
  legend,
  descricao,
  opcoes,
  selecionado,
  onChange,
}: {
  legend: string;
  descricao: string;
  opcoes: { v: T; label: string; ajuda: string; icone: LucideIcon }[];
  selecionado: T;
  onChange(v: T): void;
}) {
  return (
    <fieldset className="space-y-3">
      <div>
        <legend className="eyebrow">{legend}</legend>
        <p className="mt-1 text-sm text-muted-foreground">{descricao}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {opcoes.map((o) => {
          const ativo = o.v === selecionado;
          const Icon = o.icone;
          return (
            <label
              key={o.v}
              className={`relative flex cursor-pointer flex-col gap-2.5 rounded-lg border p-4 transition-all hover:shadow-soft-sm ${
                ativo
                  ? 'border-primary bg-primary/5 shadow-soft-sm'
                  : 'border-border bg-card hover:border-primary/40'
              }`}
            >
              <input
                type="radio"
                className="sr-only"
                name={legend}
                checked={ativo}
                onChange={() => onChange(o.v)}
              />
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
                  ativo
                    ? 'border-primary/30 bg-primary/10 text-primary'
                    : 'border-border bg-muted text-muted-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              {ativo ? (
                <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-3 w-3" />
                </span>
              ) : null}
              <span
                className={`text-sm font-semibold ${ativo ? 'text-primary' : 'text-foreground'}`}
              >
                {o.label}
              </span>
              <span className="text-xs leading-relaxed text-muted-foreground">{o.ajuda}</span>
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
    <form onSubmit={submit}>
      <p className="mb-8 text-sm text-muted-foreground">
        Você controla quanto a casa expõe. Mude quando quiser — as alterações
        se refletem imediatamente na ficha pública.
      </p>

      {/* 01 */}
      <section className="grid gap-6 border-b border-border pb-10 md:grid-cols-[140px_1fr]">
        <div className="flex items-baseline gap-3 md:flex-col md:gap-1 md:pt-1">
          <span className="font-mono text-3xl font-light text-primary/50 md:text-4xl">01</span>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Endereço</p>
        </div>
        <GrupoOpcoes
          legend="Endereço"
          descricao="Como o endereço físico aparece pra quem busca."
          opcoes={ENDERECO_OPCOES}
          selecionado={perfil.enderecoVisibilidade}
          onChange={(v) => setPerfil(perfil.comEnderecoVisibilidade(v))}
        />
      </section>

      {/* 02 */}
      <section className="grid gap-6 border-b border-border py-10 md:grid-cols-[140px_1fr]">
        <div className="flex items-baseline gap-3 md:flex-col md:gap-1 md:pt-1">
          <span className="font-mono text-3xl font-light text-primary/50 md:text-4xl">02</span>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Visitantes</p>
        </div>
        <GrupoOpcoes
          legend="Visitantes"
          descricao="Quem pode ir à casa e sob quais condições."
          opcoes={VISITANTES_OPCOES}
          selecionado={perfil.aceitaVisitantes}
          onChange={(v) => setPerfil(perfil.comAceitaVisitantes(v))}
        />
      </section>

      {/* 03 */}
      <section className="grid gap-6 py-10 md:grid-cols-[140px_1fr]">
        <div className="flex items-baseline gap-3 md:flex-col md:gap-1 md:pt-1">
          <span className="font-mono text-3xl font-light text-primary/50 md:text-4xl">03</span>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Imagem</p>
        </div>
        <GrupoOpcoes
          legend="Registro de imagem"
          descricao="Se visitantes podem fotografar dentro da casa."
          opcoes={FOTO_OPCOES}
          selecionado={perfil.fotoRegistro}
          onChange={(v) => setPerfil(perfil.comFotoRegistro(v))}
        />
      </section>

      <div className="border-t border-border pt-8 space-y-4">
        {salvar.error ? (
          <p
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
          >
            {salvar.error.message}
          </p>
        ) : null}

        {salvar.isSuccess ? (
          <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
            <Check className="h-4 w-4 shrink-0" />
            Configurações salvas com sucesso.
          </div>
        ) : null}

        <Button
          type="submit"
          variant="primary"
          disabled={salvar.isPending}
          className="w-full sm:w-auto"
        >
          {salvar.isPending ? 'Salvando…' : 'Salvar abertura'}
        </Button>
      </div>
    </form>
  );
}
