import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { saveAuth, loadAuth, clearAuth } from '../services/storage';

export interface UsuarioData {
  id: string;
  auth_id: string;
  nome: string;
  email: string;
  domicilio_id: string | null;
}

export interface DomicilioInfo {
  id: string;
  nome: string;
  codigo_convite: string;
}

interface AuthState {
  token: string | null;
  usuario: UsuarioData | null;
  domicilio: DomicilioInfo | null;
}

interface AuthContextType extends AuthState {
  loading: boolean;
  signIn: (token: string, usuario: UsuarioData) => void;
  signOut: () => void;
  updateUsuario: (usuario: UsuarioData) => void;
  updateDomicilio: (domicilio: DomicilioInfo) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({ token: null, usuario: null, domicilio: null });
  const [loading, setLoading] = useState(true);

  // Restaura sessão ao montar
  useEffect(() => {
    let mounted = true;
    (async () => {
      const stored = await loadAuth();
      if (mounted && stored) {
        setAuth({ token: stored.token, usuario: stored.usuario, domicilio: stored.domicilio });
      }
      if (mounted) setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  // Persiste a cada mudança relevante (depois do boot)
  useEffect(() => {
    if (loading) return;
    if (auth.token && auth.usuario) {
      saveAuth({ token: auth.token, usuario: auth.usuario, domicilio: auth.domicilio })
        .catch(() => { /* falha de write é não-bloqueante; sessão persiste em memória */ });
    }
  }, [auth, loading]);

  function signIn(token: string, usuario: UsuarioData) {
    setAuth(prev => ({ ...prev, token, usuario }));
  }

  function signOut() {
    setAuth({ token: null, usuario: null, domicilio: null });
    clearAuth().catch(() => { /* não-bloqueante */ });
  }

  function updateUsuario(usuario: UsuarioData) {
    setAuth(prev => ({ ...prev, usuario }));
  }

  function updateDomicilio(domicilio: DomicilioInfo) {
    setAuth(prev => ({ ...prev, domicilio }));
  }

  return (
    <AuthContext.Provider value={{ ...auth, loading, signIn, signOut, updateUsuario, updateDomicilio }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
