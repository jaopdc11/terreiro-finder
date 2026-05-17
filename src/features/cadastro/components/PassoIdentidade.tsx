import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { passoIdentidadeSchema, type PassoIdentidadeInput } from '../schemas';
import { SUGESTOES_PAPEL } from '../sugestoesPapel';

const TRADICOES = [
  { v: 'umbanda', label: 'Umbanda' },
  { v: 'candomble', label: 'Candomblé' },
  { v: 'quimbanda', label: 'Quimbanda' },
  { v: 'tambor_de_mina', label: 'Tambor de Mina' },
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
    handleSubmit,
    formState: { errors },
  } = useForm<PassoIdentidadeInput>({
    resolver: zodResolver(passoIdentidadeSchema),
    defaultValues: inicial,
  });

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
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
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
        <Input
          id="c-papel"
          list="sugestoes-papel"
          {...register('papel_dirigencia')}
          aria-invalid={!!errors.papel_dirigencia}
          placeholder="Ex.: Mãe de Santo, Babalorixá, Tata"
        />
        <datalist id="sugestoes-papel">
          {SUGESTOES_PAPEL.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
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
          className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
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
          className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
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
