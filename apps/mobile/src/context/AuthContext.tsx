import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  signIn: (token: string, usuario: UsuarioData) => void;
  signOut: () => void;
  updateUsuario: (usuario: UsuarioData) => void;
  updateDomicilio: (domicilio: DomicilioInfo) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({ token: null, usuario: null, domicilio: null });

  function signIn(token: string, usuario: UsuarioData) {
    setAuth(prev => ({ ...prev, token, usuario }));
  }

  function signOut() {
    setAuth({ token: null, usuario: null, domicilio: null });
  }

  function updateUsuario(usuario: UsuarioData) {
    setAuth(prev => ({ ...prev, usuario }));
  }

  function updateDomicilio(domicilio: DomicilioInfo) {
    setAuth(prev => ({ ...prev, domicilio }));
  }

  return (
    <AuthContext.Provider value={{ ...auth, signIn, signOut, updateUsuario, updateDomicilio }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
