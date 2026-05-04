import React from 'react';
import { View, Text, Pressable, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useAuth } from '../../context/AuthContext';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Convite'>;
  route: RouteProp<AuthStackParamList, 'Convite'>;
};

export default function ConviteScreen({ route }: Props) {
  const { updateUsuario } = useAuth();
  const { codigoConvite, domicilioNome, usuario } = route.params;

  async function handleCompartilhar() {
    try {
      await Share.share({
        message: `Olá! Te convido para gerenciarmos nossas finanças juntos no FinançasFlow.\n\n🏠 ${domicilioNome}\n🔑 Código: ${codigoConvite}\n\nBaixe o app e use esse código para entrar!`,
      });
    } catch {
      Alert.alert('Erro', 'Não foi possível compartilhar o convite.');
    }
  }

  function handleEntrarApp() {
    // Atualiza usuario com domicilio_id → RootNavigator detecta e muda para App
    updateUsuario(usuario);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0C0C14', justifyContent: 'center' }}>
      <View style={{ paddingHorizontal: 24 }}>
        {/* Título */}
        <Text style={{ fontSize: 28, fontWeight: '700', color: '#F1F0FF', textAlign: 'center', marginBottom: 8 }}>
          Tudo pronto! 🎉
        </Text>
        <Text style={{ fontSize: 15, color: '#9896B0', textAlign: 'center', marginBottom: 40 }}>
          {domicilioNome} foi criado com sucesso
        </Text>

        {/* Card código */}
        <View style={{
          backgroundColor: '#161622',
          borderRadius: 20,
          borderWidth: 1,
          borderColor: '#2A2A3E',
          padding: 24,
          alignItems: 'center',
          marginBottom: 32,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontSize: 20, marginRight: 8 }}>💕</Text>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#F1F0FF' }}>{domicilioNome}</Text>
          </View>

          <Text style={{ fontSize: 13, color: '#9896B0', marginBottom: 12, letterSpacing: 1 }}>
            CÓDIGO DE CONVITE
          </Text>

          <View style={{
            backgroundColor: '#1A1A28',
            borderRadius: 12,
            paddingVertical: 14,
            paddingHorizontal: 24,
            borderWidth: 1,
            borderColor: '#7C6AF730',
            marginBottom: 12,
          }}>
            <Text style={{
              fontSize: 24, fontWeight: '700', color: '#7C6AF7',
              letterSpacing: 6, textAlign: 'center',
            }}>
              {codigoConvite}
            </Text>
          </View>

          <Text style={{ fontSize: 12, color: '#5C5A74' }}>Válido por 30 dias</Text>
        </View>

        {/* Texto convite */}
        <Text style={{ fontSize: 15, color: '#9896B0', textAlign: 'center', marginBottom: 24 }}>
          Convide seu parceiro(a) para{'\n'}acessar juntos
        </Text>

        {/* Botão compartilhar */}
        <Pressable
          onPress={handleCompartilhar}
          style={({ pressed }) => ({
            height: 52, borderRadius: 12,
            backgroundColor: '#F472B6',
            flexDirection: 'row',
            justifyContent: 'center', alignItems: 'center',
            opacity: pressed ? 0.85 : 1,
            marginBottom: 16,
          })}
        >
          <Ionicons name="share-outline" size={20} color="#0C0C14" style={{ marginRight: 8 }} />
          <Text style={{ color: '#0C0C14', fontSize: 16, fontWeight: '700' }}>
            Compartilhar convite
          </Text>
        </Pressable>

        {/* Ir para o app */}
        <Pressable
          onPress={handleEntrarApp}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, alignItems: 'center', padding: 12 })}
        >
          <Text style={{ color: '#7C6AF7', fontSize: 16, fontWeight: '600' }}>
            Ir para o app →
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
