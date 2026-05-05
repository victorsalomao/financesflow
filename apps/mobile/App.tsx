import './global.css';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { CategoriasProvider } from './src/context/CategoriasContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <AuthProvider>
      <CategoriasProvider>
        <StatusBar style="light" backgroundColor="#0C0C14" />
        <RootNavigator />
      </CategoriasProvider>
    </AuthProvider>
  );
}
