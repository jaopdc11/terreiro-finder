import { Route, Routes } from 'react-router-dom';
import { Header } from '@/shared/components/layout/Header';
import { Footer } from '@/shared/components/layout/Footer';
import { Home } from './pages/Home';
import { NaoEncontrado } from './pages/NaoEncontrado';
import { Login } from '@/features/auth/pages/Login';
import { Cadastro } from '@/features/auth/pages/Cadastro';
import { RecuperarSenha } from '@/features/auth/pages/RecuperarSenha';
import { Onboarding } from '@/features/onboarding/components/Onboarding';

export function Router() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <Onboarding />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/recuperar-senha" element={<RecuperarSenha />} />
          <Route path="*" element={<NaoEncontrado />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
