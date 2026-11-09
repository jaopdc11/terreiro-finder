import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Check, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useEnderecoPorCep } from '@/shared/hooks/useEnderecoPorCep';
import { formatarCep } from '@/shared/lib/cep';
import type { Casa } from '@/features/casas/domain/Casa';
import { useGeocodarEndereco, useSalvarEndereco } from '../hooks/usePainel';
import { MapaSeletorPino } from './MapaSeletorPino';

const campoClass =
  'w-full border-0 border-b border-border bg-transparent pb-3 pt-1 text-lg text-foreground transition-colors placeholder:text-muted-foreground/30 focus:border-primary focus:outline-none';

const labelClass =
  'mb-2 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground';

interface Props {
  casa: Casa;
}

/**
 * Edita endereço da casa. Fluxo otimista:
 *   1. Dirigente digita CEP → ViaCEP autocompleta logradouro/bairro/cidade/UF
 *   2. Digita número → geocoding (Nominatim) preenche lat/lng automaticamente
 *   3. lat/lng técnico fica escondido atrás de "Ajustar pino manualmente"
 */
export function AbaEndereco({ casa }: Props) {
  const salvar = useSalvarEndereco(casa.id);
  const geocodar = useGeocodarEndereco();

  const [cep, setCep] = useState(formatarCep(casa.cep ?? ''));
  const [logradouro, setLogradouro] = useState(casa.logradouro ?? '');
  const [numero, setNumero] = useState(casa.numero ?? '');
  const [complemento, setComplemento] = useState(casa.complemento ?? '');
  const [bairro, setBairro] = useState(casa.bairro ?? '');
  const [cidade, setCidade] = useState(casa.cidade);
  const [estado, setEstado] = useState(casa.estado);
  const [lat, setLat] = useState(casa.coordenadas ? String(casa.coordenadas.lat) : '');
  const [lng, setLng] = useState(casa.coordenadas ? String(casa.coordenadas.lng) : '');
  const [ajustarPino, setAjustarPino] = useState(false);

  const viacep = useEnderecoPorCep(cep);
  const ultimoCepAplicado = useRef<string | null>(null);
  useEffect(() => {
    const limpo = cep.replace(/\D/g, '');
    if (limpo.length !== 8 || !viacep.data) return;
    if (ultimoCepAplicado.current === limpo) return;
    ultimoCepAplicado.current = limpo;
    if (viacep.data.logradouro) setLogradouro(viacep.data.logradouro);
    if (viacep.data.bairro) setBairro(viacep.data.bairro);
    if (viacep.data.cidade) setCidade(viacep.data.cidade);
    if (viacep.data.uf) setEstado(viacep.data.uf);
  }, [cep, viacep.data]);

  const ultimoGeocodAplicado = useRef<string>('');
  useEffect(() => {
    if (!logradouro.trim() || !cidade.trim() || !estado.trim()) return;
    if (ajustarPino) return;
    const chave = `${logradouro}|${numero}|${cidade}|${estado}`;
    if (ultimoGeocodAplicado.current === chave) return;
    ultimoGeocodAplicado.current = chave;
    const partes = [logradouro, numero, bairro, cidade, estado, 'Brasil']
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    const id = window.setTimeout(() => {
      geocodar.mutate(partes.join(', '), {
        onSuccess: (r) => {
          if (r && !ajustarPino) {
            setLat(String(r.coordenadas.lat));
            setLng(String(r.coordenadas.lng));
          }
        },
      });
    }, 600);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logradouro, numero, bairro, cidade, estado, ajustarPino]);

  const parseCoord = (v: string): number | null => {
    const t = v.trim();
    if (t.length === 0) return null;
    const n = Number(t.replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    salvar.mutate({
      logradouro: logradouro.trim() || null,
      numero: numero.trim() || null,
      complemento: complemento.trim() || null,
      bairro: bairro.trim() || null,
      cidade: cidade.trim(),
      estado: estado.trim(),
      cep: cep.trim() || null,
      coordLat: parseCoord(lat),
      coordLng: parseCoord(lng),
    });
  };

  return (
    <form onSubmit={submit}>

      {/* 01 — ENDEREÇO */}
      <section className="grid gap-6 border-b border-border pb-10 md:grid-cols-[140px_1fr]">
        <div className="flex items-baseline gap-3 md:flex-col md:gap-1 md:pt-1">
          <span className="font-mono text-3xl font-light text-primary/50 md:text-4xl">01</span>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Endereço
          </p>
        </div>
        <div className="space-y-8">
          <p className="text-sm text-muted-foreground">
            Digite o CEP que preenchemos o resto automaticamente.
          </p>

          <div>
            <label htmlFor="e-cep" className={labelClass}>CEP</label>
            <div className="flex items-center gap-4">
              <input
                id="e-cep"
                value={cep}
                onChange={(e) => setCep(formatarCep(e.target.value))}
                placeholder="88307-000"
                inputMode="numeric"
                maxLength={9}
                className={`${campoClass} max-w-[10rem]`}
              />
              {viacep.isFetching ? (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Buscando…
                </span>
              ) : viacep.error ? (
                <span className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {viacep.error.message}
                </span>
              ) : viacep.isSuccess && viacep.data === null && cep.replace(/\D/g, '').length === 8 ? (
                <span className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" />
                  CEP não encontrado
                </span>
              ) : viacep.isSuccess && viacep.data && !viacep.data.logradouro ? (
                <span className="text-xs text-muted-foreground">
                  CEP genérico — preencha a rua manualmente
                </span>
              ) : viacep.isSuccess && viacep.data ? (
                <span className="flex items-center gap-1 text-xs text-primary">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Endereço preenchido
                </span>
              ) : null}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-[3fr_1fr]">
            <div>
              <label htmlFor="e-log" className={labelClass}>Logradouro</label>
              <input
                id="e-log"
                value={logradouro}
                onChange={(e) => setLogradouro(e.target.value)}
                placeholder="Ex.: Rua das Cabaças"
                className={campoClass}
              />
            </div>
            <div>
              <label htmlFor="e-num" className={labelClass}>Número</label>
              <input
                id="e-num"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                className={campoClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="e-comp" className={labelClass}>
              Complemento{' '}
              <span className="normal-case text-muted-foreground/60">(opcional)</span>
            </label>
            <input
              id="e-comp"
              value={complemento}
              onChange={(e) => setComplemento(e.target.value)}
              placeholder="Ex.: fundos, sala 2"
              className={campoClass}
            />
          </div>
        </div>
      </section>

      {/* 02 — CIDADE */}
      <section className="grid gap-6 border-b border-border py-10 md:grid-cols-[140px_1fr]">
        <div className="flex items-baseline gap-3 md:flex-col md:gap-1 md:pt-1">
          <span className="font-mono text-3xl font-light text-primary/50 md:text-4xl">02</span>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Cidade
          </p>
        </div>
        <div className="space-y-8">
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <label htmlFor="e-bairro" className={labelClass}>Bairro</label>
              <input
                id="e-bairro"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                className={campoClass}
              />
            </div>
            <div>
              <label htmlFor="e-cid" className={labelClass}>Cidade</label>
              <input
                id="e-cid"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                required
                className={campoClass}
              />
            </div>
          </div>
          <div className="max-w-[8rem]">
            <label htmlFor="e-uf" className={labelClass}>UF</label>
            <input
              id="e-uf"
              value={estado}
              onChange={(e) => setEstado(e.target.value.toUpperCase())}
              maxLength={2}
              required
              className={campoClass}
            />
          </div>
        </div>
      </section>

      {/* 03 — MAPA */}
      <section className="grid gap-6 py-10 md:grid-cols-[140px_1fr]">
        <div className="flex items-baseline gap-3 md:flex-col md:gap-1 md:pt-1">
          <span className="font-mono text-3xl font-light text-primary/50 md:text-4xl">03</span>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Mapa
          </p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={labelClass}>Posição no mapa</span>
            {geocodar.isPending ? (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Calculando…
              </span>
            ) : parseCoord(lat) !== null && parseCoord(lng) !== null ? (
              <span className="text-xs text-muted-foreground">
                Arraste o pino se a posição não estiver no lugar certo
              </span>
            ) : null}
          </div>
          <MapaSeletorPino
            lat={parseCoord(lat)}
            lng={parseCoord(lng)}
            onMudar={(novaLat, novaLng) => {
              setAjustarPino(true);
              setLat(String(novaLat));
              setLng(String(novaLng));
            }}
          />
          {parseCoord(lat) === null || parseCoord(lng) === null ? (
            <p className="text-xs text-muted-foreground">
              Preencha o endereço pra calcular o pino automaticamente.
            </p>
          ) : null}
        </div>
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
            Endereço salvo com sucesso.
          </div>
        ) : null}

        <Button
          type="submit"
          variant="primary"
          disabled={salvar.isPending}
          className="w-full sm:w-auto"
        >
          {salvar.isPending ? 'Salvando…' : 'Salvar endereço'}
        </Button>
      </div>
    </form>
  );
}
