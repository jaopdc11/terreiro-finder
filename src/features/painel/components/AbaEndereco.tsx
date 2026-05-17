import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import type { Casa } from '@/features/casas/domain/Casa';
import { useGeocodarEndereco, useSalvarEndereco } from '../hooks/usePainel';

interface Props {
  casa: Casa;
}

/**
 * Edita endereço da casa: logradouro/numero/complemento/bairro/cidade/estado/cep
 * + coordenadas opcionais. Botão "Localizar no mapa" chama Nominatim
 * (best-effort) e preenche os campos lat/lng.
 *
 * Validação no service: cidade+estado obrigatórios; lat/lng só passam se
 * ambos estiverem informados (PerfilAbertura controla se aparece publicamente,
 * mas pin no mapa só com coords).
 */
export function AbaEndereco({ casa }: Props) {
  const salvar = useSalvarEndereco(casa.id);
  const geocodar = useGeocodarEndereco();

  const [logradouro, setLogradouro] = useState(casa.logradouro ?? '');
  const [numero, setNumero] = useState(casa.numero ?? '');
  const [complemento, setComplemento] = useState(casa.complemento ?? '');
  const [bairro, setBairro] = useState(casa.bairro ?? '');
  const [cidade, setCidade] = useState(casa.cidade);
  const [estado, setEstado] = useState(casa.estado);
  const [cep, setCep] = useState(casa.cep ?? '');
  const [lat, setLat] = useState(casa.coordenadas ? String(casa.coordenadas.lat) : '');
  const [lng, setLng] = useState(casa.coordenadas ? String(casa.coordenadas.lng) : '');

  const parseCoord = (v: string): number | null => {
    const t = v.trim();
    if (t.length === 0) return null;
    const n = Number(t.replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  };

  const localizar = async () => {
    const partes = [logradouro, numero, bairro, cidade, estado, 'Brasil']
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    if (partes.length < 2) return;
    const r = await geocodar.mutateAsync(partes.join(', '));
    if (r) {
      setLat(String(r.coordenadas.lat));
      setLng(String(r.coordenadas.lng));
    }
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
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Endereço só aparece publicamente se a aba <strong>Abertura</strong> permitir
        (<em>público</em>). Coordenadas posicionam o pin no mapa em qualquer
        caso — você pode preencher manualmente ou clicar em "Localizar no mapa".
      </p>

      <div className="grid gap-3 sm:grid-cols-[3fr_1fr]">
        <div className="space-y-1">
          <Label htmlFor="e-log">Logradouro</Label>
          <Input
            id="e-log"
            value={logradouro}
            onChange={(e) => setLogradouro(e.target.value)}
            placeholder="Ex.: Rua das Cabaças"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="e-num">Número</Label>
          <Input
            id="e-num"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="e-comp">Complemento</Label>
        <Input
          id="e-comp"
          value={complemento}
          onChange={(e) => setComplemento(e.target.value)}
          placeholder="Ex.: fundos, sala 2"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="e-bairro">Bairro</Label>
          <Input
            id="e-bairro"
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="e-cep">CEP</Label>
          <Input id="e-cep" value={cep} onChange={(e) => setCep(e.target.value)} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[3fr_1fr]">
        <div className="space-y-1">
          <Label htmlFor="e-cid">Cidade</Label>
          <Input
            id="e-cid"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
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

      <fieldset className="space-y-3 rounded-lg border border-border p-4">
        <legend className="px-2 text-sm font-medium">Coordenadas (pin no mapa)</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="e-lat">Latitude</Label>
            <Input
              id="e-lat"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="-26.9078"
              inputMode="decimal"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="e-lng">Longitude</Label>
            <Input
              id="e-lng"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="-48.6614"
              inputMode="decimal"
            />
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={localizar}
          disabled={geocodar.isPending}
        >
          {geocodar.isPending ? 'Buscando…' : 'Localizar no mapa'}
        </Button>
        {geocodar.isSuccess && !geocodar.data ? (
          <p className="text-sm text-muted-foreground">
            Não encontramos esse endereço. Você pode preencher lat/lng manualmente.
          </p>
        ) : null}
        {geocodar.error ? (
          <p role="alert" className="text-sm text-destructive">
            Erro na busca: {geocodar.error.message}
          </p>
        ) : null}
      </fieldset>

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
