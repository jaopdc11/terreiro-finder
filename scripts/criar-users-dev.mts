import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.test' });

const admin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});

const SENHA = 'senhaforte';

async function criar(email: string, role: 'admin' | 'dirigente' | 'visitante', nome: string): Promise<string> {
  // Apaga se já existir
  const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const existente = list?.users.find((u) => u.email === email);
  if (existente) await admin.auth.admin.deleteUser(existente.id);

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: SENHA,
    email_confirm: true,
    user_metadata: { nome_completo: nome },
  });
  if (error || !data.user) throw error ?? new Error('createUser');

  if (role !== 'visitante') {
    const { error: upErr } = await admin.from('profiles').update({ role }).eq('id', data.user.id);
    if (upErr) throw upErr;
  }
  return data.user.id;
}

const adminId = await criar('admin@terreiros.dev', 'admin', 'Admin Dev');
const dirigenteId = await criar('dirigente@terreiros.dev', 'dirigente', 'Pai João Dev');
const visitanteId = await criar('visitante@terreiros.dev', 'visitante', 'Visitante Dev');

// Vincula dirigente à dev-tenda-pai-joao (umbanda)
const { data: casa } = await admin.from('casas').select('id').eq('slug', 'dev-tenda-pai-joao').single();
if (casa) {
  await admin
    .from('casa_dirigentes')
    .upsert({ casa_id: casa.id, user_id: dirigenteId, papel: 'principal' }, { onConflict: 'casa_id,user_id' });
}

// Cria 1 indicação pendente (pro visitante) pra admin ver no /admin
await admin.from('indicacoes_casa').delete().eq('user_id', visitanteId);
await admin.from('indicacoes_casa').insert({
  user_id: visitanteId,
  nome: 'Tenda da Mãe Iemanjá',
  cidade: 'Itajaí',
  estado: 'SC',
  bairro: 'Praia Brava',
  tradicao_principal: 'umbanda',
  observacoes: 'Conheci pela vizinha; eles abrem nas sextas.',
  canal_contato: 'Instagram @tenda-mae-iemanja',
  status: 'pendente',
});

// Cria 1 reivindicação pendente (visitante reivindica casa não-verificada)
const { data: casaIndicada } = await admin
  .from('casas')
  .select('id')
  .eq('slug', 'dev-casa-indicada')
  .single();
if (casaIndicada) {
  await admin.from('reivindicacoes').delete().eq('user_id', visitanteId);
  await admin.from('casas').update({ whatsapp: '47988887777' }).eq('id', casaIndicada.id);
  await admin.from('reivindicacoes').insert({
    user_id: visitanteId,
    casa_id: casaIndicada.id,
    observacoes:
      'Sou dirigente principal há 12 anos. Mãe Joaquina nos iniciou em 2013.',
    status: 'pendente',
  });
}

console.log('✓ Users criados:');
console.log('  admin@terreiros.dev      / senhaforte (role: admin)');
console.log('  dirigente@terreiros.dev  / senhaforte (role: dirigente, vinculado a dev-tenda-pai-joao)');
console.log('  visitante@terreiros.dev  / senhaforte (role: visitante)');
console.log('');
console.log('Pra moderar:');
console.log('  - 1 indicação pendente (Tenda da Mãe Iemanjá)');
console.log('  - 1 reivindicação pendente (Casa Indicada [DEV])');
