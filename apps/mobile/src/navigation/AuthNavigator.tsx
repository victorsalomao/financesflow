import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import DomicilioScreen from '../screens/auth/DomicilioScreen';
import ConviteScreen from '../screens/auth/ConviteScreen';
import type { UsuarioData } from '../context/AuthContext';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  Domicilio: undefined;
  Convite: { codigoConvite: string; domicilioNome: string; usuario: UsuarioData };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0C0C14' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Domicilio" component={DomicilioScreen} />
      <Stack.Screen name="Convite" component={ConviteScreen} />
    </Stack.Navigator>
  );
}
