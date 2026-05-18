import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
  passoAberturaContatoSchema,
  type PassoAberturaContatoInput,
} from '../schemas';

interface Props {
  inicial: Partial<PassoAberturaContatoInput>;
  onVoltar(): void;
  onSubmit(v: PassoAberturaContatoInput): void;
  carregando: boolean;
  erroServidor: string | null;
}

const ENDERECO = [
  { v: 'publico', label: 'Público' },
  { v: 'sob_contato', label: 'Sob contato' },
  { v: 'oculto', label: 'Oculto' },
] as const;
const VISITANTES = [
  { v: 'aberto', label: 'Aberto' },
  { v: 'jogo_previo', label: 'Jogo prévio' },
  { v: 'so_indicacao', label: 'Só por indicação' },
] as const;
const FOTO = [
  { v: 'permitido', label: 'Permitida' },
  { v: 'parcial', label: 'Com restrições' },
  { v: 'proibido', label: 'Proibida' },
] as const;

export function PassoAberturaContato({
  inicial,
  onVoltar,
  onSubmit,
  carregando,
  erroServidor,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PassoAberturaContatoInput>({
    resolver: zodResolver(passoAberturaContatoSchema),
    defaultValues: {
      endereco_visibilidade: 'sob_contato',
      aceita_visitantes: 'jogo_previo',
      foto_registro: 'parcial',
      ...inicial,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <fieldset className="space-y-3 border border-foreground/15 p-5">
        <legend className="px-2 text-sm font-medium">Endereço público</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {ENDERECO.map((o) => (
            <label key={o.v} className="cursor-pointer border border-foreground/15 p-3 text-sm transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <input
                type="radio"
                value={o.v}
                {...register('endereco_visibilidade')}
                className="sr-only"
              />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-3 border border-foreground/15 p-5">
        <legend className="px-2 text-sm font-medium">Aceita visitantes</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {VISITANTES.map((o) => (
            <label key={o.v} className="cursor-pointer border border-foreground/15 p-3 text-sm transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <input
                type="radio"
                value={o.v}
                {...register('aceita_visitantes')}
                className="sr-only"
              />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-3 border border-foreground/15 p-5">
        <legend className="px-2 text-sm font-medium">Registro de imagem</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {FOTO.map((o) => (
            <label key={o.v} className="cursor-pointer border border-foreground/15 p-3 text-sm transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <input
                type="radio"
                value={o.v}
                {...register('foto_registro')}
                className="sr-only"
              />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-4 border border-foreground/15 p-5">
        <legend className="px-2 text-sm font-medium">Como te contatar</legend>
        <p className="text-xs text-muted-foreground">
          Pelo menos um canal. Aparece direto na ficha pública.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <Label htmlFor="c-wa">WhatsApp</Label>
            <Input id="c-wa" {...register('whatsapp')} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="c-tel">Telefone</Label>
            <Input id="c-tel" {...register('telefone')} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="c-mail">Email</Label>
            <Input id="c-mail" type="email" {...register('email_contato')} />
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="c-site">Site da casa (opcional)</Label>
          <Input
            id="c-site"
            type="url"
            placeholder="https://"
            {...register('site')}
          />
          {errors.site ? (
            <p role="alert" className="text-xs text-destructive">
              {errors.site.message}
            </p>
          ) : null}
          <p className="text-xs text-muted-foreground">
            Caso a casa tenha página própria, blog ou Linktree. Aparece como
            link externo na ficha pública.
          </p>
        </div>
        {/* Erro do refine global aparece no campo "" (root). */}
        {(errors as Record<string, unknown>)[''] ? (
          <p role="alert" className="text-sm text-destructive">
            {(errors as Record<string, { message?: string }>)['']?.message}
          </p>
        ) : null}
      </fieldset>

      <div className="space-y-1">
        <Label htmlFor="c-antes">Antes da primeira visita (opcional)</Label>
        <textarea
          id="c-antes"
          rows={4}
          {...register('texto_antes_visita')}
          placeholder="Roupa, horário, postura — o que quem chega precisa saber."
          className="flex w-full border-0 border-b border-foreground/30 bg-transparent px-0 py-2 text-base focus:border-primary focus:outline-none"
        />
        {errors.texto_antes_visita ? (
          <p role="alert" className="text-sm text-destructive">
            {errors.texto_antes_visita.message}
          </p>
        ) : null}
      </div>

      <div className="border-l-2 border-foreground bg-muted/40 p-4 text-sm">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            {...register('consentimento')}
            className="mt-1 h-4 w-4"
          />
          <span>
            Confirmo que sou da dirigência desta casa e autorizo a publicação
            das informações acima, sabendo que poderemos editar ou pedir
            arquivamento a qualquer momento. Li a{' '}
            <Link
              to="/politica"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              política de privacidade
            </Link>
            .
          </span>
        </label>
        {errors.consentimento ? (
          <p role="alert" className="mt-2 text-sm text-destructive">
            {errors.consentimento.message}
          </p>
        ) : null}
      </div>

      {erroServidor ? (
        <p role="alert" className="text-sm text-destructive">
          {erroServidor}
        </p>
      ) : null}

      <div className="flex justify-between">
        <Button type="button" variant="ghost" onClick={onVoltar}>Voltar</Button>
        <Button type="submit" disabled={carregando}>
          {carregando ? 'Enviando…' : 'Enviar cadastro'}
        </Button>
      </div>
    </form>
  );
}
