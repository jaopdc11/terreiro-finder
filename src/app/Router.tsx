import { Route, Routes } from 'react-router-dom';
import { Header } from '@/shared/components/layout/Header';
import { Footer } from '@/shared/components/layout/Footer';
import { Home } from './pages/Home';
import { NaoEncontrado } from './pages/NaoEncontrado';
import { Politica } from './pages/Politica';
import { Login } from '@/features/auth/pages/Login';
import { Cadastro } from '@/features/auth/pages/Cadastro';
import { RecuperarSenha } from '@/features/auth/pages/RecuperarSenha';
import { Onboarding } from '@/features/onboarding/components/Onboarding';
import { BannerCTADirigencia } from '@/features/auth/components/BannerCTADirigencia';
import { Buscar } from '@/features/busca/pages/Buscar';
import { CasaFicha } from '@/features/casas/pages/CasaFicha';
import { Indicar } from '@/features/indicacao/pages/Indicar';
import { Admin } from '@/features/moderacao/pages/Admin';
import { Reivindicar } from '@/features/painel/pages/Reivindicar';
import { Painel } from '@/features/painel/pages/Painel';
import { Cadastrar } from '@/features/cadastro/pages/Cadastrar';
import { Protegido } from './guards/Protegido';

export function Router() {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#conteudo-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[3000] focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Pular pro conteúdo principal
      </a>
      <Header />
      <BannerCTADirigencia />
      <Onboarding />
      <main id="conteudo-principal" className="flex-1">
        <Routes>
          <Route path="/" element={<Buscar />} />
          <Route path="/casa/:slug" element={<CasaFicha />} />
          <Route path="/sobre" element={<Home />} />
          <Route path="/politica" element={<Politica />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/recuperar-senha" element={<RecuperarSenha />} />
          <Route
            path="/indicar"
            element={
              <Protegido>
                <Indicar />
              </Protegido>
            }
          />
          <Route
            path="/reivindicar"
            element={
              <Protegido>
                <Reivindicar />
              </Protegido>
            }
          />
          <Route
            path="/painel"
            element={
              <Protegido>
                <Painel />
              </Protegido>
            }
          />
          <Route
            path="/cadastrar"
            element={
              <Protegido>
                <Cadastrar />
              </Protegido>
            }
          />
          <Route
            path="/admin"
            element={
              <Protegido role="admin">
                <Admin />
              </Protegido>
            }
          />
          <Route path="*" element={<NaoEncontrado />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
