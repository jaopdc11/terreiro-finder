import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import type { Casa } from '@/features/casas/domain/Casa';
import { useSalvarPerfil } from '../hooks/usePainel';

interface Props {
  casa: Casa;
}

export function AbaPerfil({ casa }: Props) {
  const salvar = useSalvarPerfil(casa.id);
  const [descricao, setDescricao] = useState(casa.descricao ?? '');
  const [sacerdote, setSacerdote] = useState(casa.sacerdoteNome ?? '');
  const [antesVisita, setAntesVisita] = useState(casa.textoAntesVisita ?? '');
  const [whatsapp, setWhatsapp] = useState(casa.contato?.whatsapp ?? '');
  const [telefone, setTelefone] = useState(casa.contato?.telefone ?? '');
  const [email, setEmail] = useState(casa.contato?.email ?? '');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    salvar.mutate({
      descricao: descricao.trim() || null,
      sacerdoteNome: sacerdote.trim() || null,
      textoAntesVisita: antesVisita.trim() || null,
      whatsapp: whatsapp.trim() || null,
      telefone: telefone.trim() || null,
      emailContato: email.trim() || null,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="p-sacerdote">Sacerdote(isa)</Label>
        <Input
          id="p-sacerdote"
          value={sacerdote}
          onChange={(e) => setSacerdote(e.target.value)}
          placeholder="Ex.: Mãe Maria de Oxóssi"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="p-desc">Sobre a casa</Label>
        <textarea
          id="p-desc"
          rows={5}
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="História da casa, linhagem, dia de gira, etc."
          className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="p-antes">Antes da primeira visita</Label>
        <textarea
          id="p-antes"
          rows={4}
          value={antesVisita}
          onChange={(e) => setAntesVisita(e.target.value)}
          placeholder="Roupa, horário, postura — o que quem chega precisa saber."
          className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <fieldset className="space-y-3 rounded-lg border border-border p-4">
        <legend className="px-2 text-sm font-medium">Contato direto</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <Label htmlFor="p-wa">WhatsApp</Label>
            <Input
              id="p-wa"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="p-tel">Telefone</Label>
            <Input
              id="p-tel"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="p-mail">Email</Label>
            <Input
              id="p-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
      </fieldset>

      {salvar.error ? (
        <p role="alert" className="text-sm text-destructive">
          {salvar.error.message}
        </p>
      ) : null}
      {salvar.isSuccess ? (
        <p className="text-sm text-primary">Perfil salvo.</p>
      ) : null}

      <Button type="submit" disabled={salvar.isPending}>
        {salvar.isPending ? 'Salvando…' : 'Salvar perfil'}
      </Button>
    </form>
  );
}
