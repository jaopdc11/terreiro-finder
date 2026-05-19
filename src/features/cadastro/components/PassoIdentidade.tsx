import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/ui/button';
import { Combobox } from '@/shared/ui/combobox';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import type { TradicaoPrincipal } from '@/features/casas/schemas';
import { passoIdentidadeSchema, type PassoIdentidadeInput } from '../schemas';
import { sugestoesPapelPara } from '../sugestoesPapel';

const TRADICOES = [
  { v: 'umbanda', label: 'Umbanda' },
  { v: 'candomble', label: 'Candomblé' },
  { v: 'quimbanda', label: 'Quimbanda' },
  { v: 'omoloco', label: 'Omolocô' },
  { v: 'xamba', label: 'Xambá' },
  { v: 'outra', label: 'Outra' },
] as const;

interface Props {
  inicial: Partial<PassoIdentidadeInput>;
  onAvancar(v: PassoIdentidadeInput): void;
}

export function PassoIdentidade({ inicial, onAvancar }: Props) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PassoIdentidadeInput>({
    resolver: zodResolver(passoIdentidadeSchema),
    defaultValues: inicial,
  });

  const tradicaoAtual = watch('tradicao_principal') as TradicaoPrincipal | undefined;
  const sugestoesAtuais = sugestoesPapelPara(tradicaoAtual ?? null);

  return (
    <form onSubmit={handleSubmit(onAvancar)} className="space-y-4" noValidate>
      <div className="space-y-1">
        <Label htmlFor="c-nome">Nome da casa</Label>
        <Input id="c-nome" {...register('nome')} aria-invalid={!!errors.nome} />
        {errors.nome ? (
          <p role="alert" className="text-sm text-destructive">{errors.nome.message}</p>
        ) : null}
      </div>

      <div className="space-y-1">
        <Label htmlFor="c-sacerdote">Sacerdote(isa) (opcional)</Label>
        <Input id="c-sacerdote" {...register('sacerdote_nome')} placeholder="Ex.: Mãe Maria de Oxóssi" />
        {errors.sacerdote_nome ? (
          <p role="alert" className="text-sm text-destructive">{errors.sacerdote_nome.message}</p>
        ) : null}
      </div>

      <div className="space-y-1">
        <Label htmlFor="c-tradicao">Tradição principal</Label>
        <select
          id="c-tradicao"
          {...register('tradicao_principal')}
          className="flex h-11 w-full border-0 border-b border-foreground/30 bg-transparent px-0 py-2 text-base focus:border-primary focus:outline-none"
        >
          <option value="">Escolhe…</option>
          {TRADICOES.map((t) => (
            <option key={t.v} value={t.v}>{t.label}</option>
          ))}
        </select>
        {errors.tradicao_principal ? (
          <p role="alert" className="text-sm text-destructive">{errors.tradicao_principal.message}</p>
        ) : null}
      </div>

      <div className="space-y-1">
        <Label htmlFor="c-papel">Como você é chamada(o) na casa?</Label>
        <Controller
          control={control}
          name="papel_dirigencia"
          render={({ field }) => (
            <Combobox
              id="c-papel"
              value={field.value ?? ''}
              onChange={field.onChange}
              sugestoes={sugestoesAtuais}
              placeholder="Ex.: Mãe de Santo, Babalorixá, Tata"
              aria-invalid={!!errors.papel_dirigencia}
            />
          )}
        />
        <p className="text-xs text-muted-foreground">
          Use o termo que a sua casa adota. Texto livre — as sugestões servem só
          de guia. Esse título aparece na ficha pública.
        </p>
        {errors.papel_dirigencia ? (
          <p role="alert" className="text-sm text-destructive">
            {errors.papel_dirigencia.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-1">
        <Label htmlFor="c-desc">Sobre a casa (opcional)</Label>
        <textarea
          id="c-desc"
          rows={4}
          {...register('descricao')}
          placeholder="História, linhagem, dia de gira…"
          className="flex w-full border-0 border-b border-foreground/30 bg-transparent px-0 py-2 text-base focus:border-primary focus:outline-none"
        />
        {errors.descricao ? (
          <p role="alert" className="text-sm text-destructive">{errors.descricao.message}</p>
        ) : null}
      </div>

      <div className="space-y-1">
        <Label htmlFor="c-validacao">Como podemos validar sua dirigência?</Label>
        <textarea
          id="c-validacao"
          rows={3}
          {...register('canal_validacao')}
          aria-invalid={!!errors.canal_validacao}
          placeholder={
            'Ex.: "Instagram oficial da casa @minhacasa", "telefone fixo do espaço (47) 3344-0000 — você pode ligar e perguntar pela Mãe Maria", "comprovante via WhatsApp +55 47 9XXXX-XXXX"'
          }
          className="flex w-full border-0 border-b border-foreground/30 bg-transparent px-0 py-2 text-base focus:border-primary focus:outline-none"
        />
        <p className="text-xs text-muted-foreground">
          A gente contata por esse canal antes de aprovar — só assim a casa
          sai <strong>verificada</strong>. Sem prova externa de dirigência,
          o cadastro vira indicação comum.
        </p>
        {errors.canal_validacao ? (
          <p role="alert" className="text-sm text-destructive">
            {errors.canal_validacao.message}
          </p>
        ) : null}
      </div>

      <div className="flex justify-end">
        <Button type="submit">Próximo</Button>
      </div>
    </form>
  );
}
