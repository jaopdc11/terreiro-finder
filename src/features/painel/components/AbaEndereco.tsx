import { useEffect, useRef, useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { useEnderecoPorCep } from '@/shared/hooks/useEnderecoPorCep';
import { formatarCep } from '@/shared/lib/cep';
import type { Casa } from '@/features/casas/domain/Casa';
import { useGeocodarEndereco, useSalvarEndereco } from '../hooks/usePainel';
import { MapaSeletorPino } from './MapaSeletorPino';

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

  // Busca ViaCEP automática quando CEP atinge 8 dígitos
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

  // Geocoding automático quando temos endereço minimamente completo
  const ultimoGeocodAplicado = useRef<string>('');
  useEffect(() => {
    if (!logradouro.trim() || !cidade.trim() || !estado.trim()) return;
    // Só dispara geocode automático se o usuário NÃO está ajustando o pin manualmente
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
    }, 600); // debounce leve
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
    <form onSubmit={submit} className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Digite o CEP que preenchemos o resto. O pino do mapa é calculado
        automaticamente — você pode ajustar manualmente se precisar.
      </p>

      {/* CEP em destaque, primeira coisa */}
      <div className="space-y-1.5">
        <Label htmlFor="e-cep">CEP</Label>
        <div className="flex items-center gap-2">
          <Input
            id="e-cep"
            value={cep}
            onChange={(e) => setCep(formatarCep(e.target.value))}
            placeholder="88307-000"
            inputMode="numeric"
            maxLength={9}
            className="max-w-[12rem]"
          />
          {viacep.isFetching ? (
            <span className="text-xs text-muted-foreground">Buscando…</span>
          ) : viacep.error ? (
            <span className="text-xs text-destructive">
              Erro: {viacep.error.message}
            </span>
          ) : viacep.isSuccess && viacep.data === null && cep.replace(/\D/g, '').length === 8 ? (
            <span className="text-xs text-destructive">CEP não encontrado</span>
          ) : viacep.isSuccess && viacep.data && !viacep.data.logradouro ? (
            <span className="text-xs text-muted-foreground">
              CEP genérico — preencha a rua manualmente
            </span>
          ) : viacep.isSuccess && viacep.data ? (
            <span className="text-xs text-primary">✓ Endereço preenchido</span>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[3fr_1fr]">
        <div className="space-y-1.5">
          <Label htmlFor="e-log">Logradouro</Label>
          <Input
            id="e-log"
            value={logradouro}
            onChange={(e) => setLogradouro(e.target.value)}
            placeholder="Ex.: Rua das Cabaças"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="e-num">Número</Label>
          <Input
            id="e-num"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="e-comp">Complemento (opcional)</Label>
        <Input
          id="e-comp"
          value={complemento}
          onChange={(e) => setComplemento(e.target.value)}
          placeholder="Ex.: fundos, sala 2"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="e-bairro">Bairro</Label>
          <Input
            id="e-bairro"
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="e-cid">Cidade</Label>
          <Input
            id="e-cid"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_3fr]">
        <div className="space-y-1.5">
          <Label htmlFor="e-uf">UF</Label>
          <Input
            id="e-uf"
            value={estado}
            onChange={(e) => setEstado(e.target.value.toUpperCase())}
            maxLength={2}
            required
          />
        </div>
      </div>

      {/* Mini-mapa com pino arrastável */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Posição no mapa</Label>
          {geocodar.isPending ? (
            <span className="text-xs text-muted-foreground">Calculando…</span>
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
            setAjustarPino(true); // trava o geocode automático após drag manual
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

      {salvar.error ? (
        <p role="alert" className="text-sm text-destructive">
          {salvar.error.message}
        </p>
      ) : null}
      {salvar.isSuccess ? (
        <p className="text-sm text-primary">Endereço salvo.</p>
      ) : null}

      <Button type="submit" disabled={salvar.isPending}>
        {salvar.isPending ? 'Salvando…' : 'Salvar endereço'}
      </Button>
    </form>
  );
}
