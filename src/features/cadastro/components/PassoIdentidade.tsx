import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { passoIdentidadeSchema, type PassoIdentidadeInput } from '../schemas';

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

      <div className="flex justify-end">
        <Button type="submit">Próximo</Button>
      </div>
    </form>
  );
}
