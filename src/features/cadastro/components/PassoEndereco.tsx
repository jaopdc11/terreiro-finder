import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { passoEnderecoSchema, type PassoEnderecoInput } from '../schemas';

interface Props {
  inicial: Partial<PassoEnderecoInput>;
  onVoltar(): void;
  onAvancar(v: PassoEnderecoInput): void;
}

export function PassoEndereco({ inicial, onVoltar, onAvancar }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PassoEnderecoInput>({
    resolver: zodResolver(passoEnderecoSchema),
    defaultValues: inicial,
  });

  return (
    <form onSubmit={handleSubmit(onAvancar)} className="space-y-4" noValidate>
      <p className="text-sm text-muted-foreground">
        Endereço guia o pin no mapa. Mesmo se você escolher esconder o endereço
        público depois, a casa precisa ter localização pra aparecer.
      </p>

      <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
        <div className="space-y-1">
          <Label htmlFor="c-log">Logradouro (rua, avenida) — opcional</Label>
          <Input id="c-log" {...register('logradouro')} placeholder="Rua das Flores" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="c-num">Número (opcional)</Label>
          <Input id="c-num" {...register('numero')} />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="c-comp">Complemento (opcional)</Label>
        <Input id="c-comp" {...register('complemento')} placeholder="Casa dos fundos, salão 2…" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="c-bairro">Bairro</Label>
          <Input id="c-bairro" {...register('bairro')} aria-invalid={!!errors.bairro} />
          {errors.bairro ? (
            <p role="alert" className="text-sm text-destructive">{errors.bairro.message}</p>
          ) : null}
        </div>
        <div className="space-y-1">
          <Label htmlFor="c-cep">CEP (opcional)</Label>
          <Input id="c-cep" {...register('cep')} placeholder="88300-000" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[3fr_1fr]">
        <div className="space-y-1">
          <Label htmlFor="c-cidade">Cidade</Label>
          <Input
            id="c-cidade"
            defaultValue={inicial.cidade ?? 'Itajaí'}
            {...register('cidade')}
            aria-invalid={!!errors.cidade}
          />
          {errors.cidade ? (
            <p role="alert" className="text-sm text-destructive">{errors.cidade.message}</p>
          ) : null}
        </div>
        <div className="space-y-1">
          <Label htmlFor="c-estado">Estado (sigla)</Label>
          <Input
            id="c-estado"
            maxLength={2}
            defaultValue={inicial.estado ?? 'SC'}
            {...register('estado')}
            aria-invalid={!!errors.estado}
          />
          {errors.estado ? (
            <p role="alert" className="text-sm text-destructive">{errors.estado.message}</p>
          ) : null}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Vamos tentar achar o ponto no mapa automaticamente pelo endereço. Se
        não rolar, você consegue ajustar depois no painel.
      </p>

      <div className="flex justify-between">
        <Button type="button" variant="ghost" onClick={onVoltar}>Voltar</Button>
        <Button type="submit">Próximo</Button>
      </div>
    </form>
  );
}
