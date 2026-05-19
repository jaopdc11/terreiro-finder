import { Button } from '@/shared/ui/button';
import { useTeclaEsc } from '@/shared/hooks/useTeclaEsc';

interface Props {
  aberto: boolean;
  onPermitir(): void;
  onFechar(): void;
}

/**
 * Modal de consentimento contextual antes de chamar a API de geolocalização
 * do browser. Explica o uso em pt-BR — o prompt nativo do browser aparece
 * depois (sem como suprimir), mas o usuário já entra predisposto a aceitar.
 */
export function ModalPermissaoGeo({ aberto, onPermitir, onFechar }: Props) {
  useTeclaEsc(aberto, onFechar);

  if (!aberto) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-geo-titulo"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Fechar"
        onClick={onFechar}
        className="absolute inset-0 bg-foreground/50"
      />

      <div className="relative w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-soft-lg">
        <h2
          id="modal-geo-titulo"
          className="text-lg font-semibold tracking-tight text-foreground"
        >
          Usar sua localização?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Com sua permissão, o Encruza mostra primeiro as casas mais próximas
          de você e centraliza o mapa onde você está. Sua localização{' '}
          <strong className="text-foreground">não sai do seu navegador</strong>
          {' '}— a gente não guarda nem envia nada pro servidor.
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          Em seguida, o navegador também vai pedir confirmação.
        </p>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onFechar}>
            Agora não
          </Button>
          <Button type="button" variant="primary" size="sm" onClick={onPermitir}>
            Permitir
          </Button>
        </div>
      </div>
    </div>
  );
}
