import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'Domicilio'> };

export default function DomicilioScreen({ navigation }: Props) {
  const { token, updateUsuario, updateDomicilio } = useAuth();
  const [nomeCasa, setNomeCasa] = useState('');
  const [codigo, setCodigo] = useState('');
  const [loadingCriar, setLoadingCriar] = useState(false);
  const [loadingEntrar, setLoadingEntrar] = useState(false);

  async function handleCriar() {
    if (!nomeCasa.trim()) {
      Alert.alert('Atenção', 'Dê um nome para a casa de vocês.');
      return;
    }
    setLoadingCriar(true);
    try {
      const data = await api.auth.criarDomicilio(nomeCasa.trim(), token!);
      // Armazena domicilio no contexto mas NÃO atualiza usuario ainda
      // para evitar que RootNavigator mude para App antes de mostrar ConviteScreen
      updateDomicilio(data.domicilio);
      navigation.replace('Convite', {
        codigoConvite: data.domicilio.codigo_convite,
        domicilioNome: data.domicilio.nome,
        usuario: data.usuario,
      });
    } catch (e: unknown) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Tente novamente.');
    } finally {
      setLoadingCriar(false);
    }
  }

  async function handleEntrar() {
    if (codigo.trim().length < 4) {
      Alert.alert('Atenção', 'Informe o código de convite.');
      return;
    }
    setLoadingEntrar(true);
    try {
      const data = await api.auth.entrarDomicilio(codigo.trim().toUpperCase(), token!);
      updateDomicilio(data.domicilio);
      updateUsuario(data.usuario);
      // RootNavigator redireciona automaticamente ao detectar domicilio_id
    } catch (e: unknown) {
      Alert.alert('Código inválido', e instanceof Error ? e.message : 'Tente novamente.');
    } finally {
      setLoadingEntrar(false);
    }
  }

  const BG = '#09091A';
  const CARD = '#13142A';
  const BORDER = 'rgba(255,255,255,0.07)';
  const VIOLET = '#7C6AF7';
  const PINK = '#F472B6';
  const TEXT = '#EDEEFF';
  const MUTED = '#4A4869';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: BG }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 28, paddingTop: 40, paddingBottom: 60 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Ícone */}
          <View style={{ alignItems: 'center', marginBottom: 28 }}>
            <View style={{
              width: 72, height: 72, borderRadius: 24,
              backgroundColor: 'rgba(244,114,182,0.12)',
              borderWidth: 1, borderColor: 'rgba(244,114,182,0.2)',
              justifyContent: 'center', alignItems: 'center',
            }}>
              <Text style={{ fontSize: 34 }}>🏠</Text>
            </View>
          </View>

          <Text style={{
            fontSize: 28, fontWeight: '800', color: TEXT,
            letterSpacing: -0.8, marginBottom: 6,
          }}>
            Seu espaço
          </Text>
          <Text style={{ fontSize: 14, color: MUTED, marginBottom: 28 }}>
            Como vamos chamar a casa de vocês?
          </Text>

          {/* Criar casa */}
          <View style={{
            backgroundColor: CARD, borderRadius: 14,
            borderWidth: 1, borderColor: BORDER,
            overflow: 'hidden', marginBottom: 12,
          }}>
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              paddingHorizontal: 16, height: 54,
            }}>
              <Ionicons name="home-outline" size={17} color={MUTED} style={{ marginRight: 12 }} />
              <TextInput
                style={{ flex: 1, color: TEXT, fontSize: 15 }}
                placeholder="Ex: Casa do Victor e Maria"
                placeholderTextColor={MUTED}
                value={nomeCasa}
                onChangeText={setNomeCasa}
                returnKeyType="done"
                onSubmitEditing={handleCriar}
              />
            </View>
          </View>

          <Pressable
            onPress={handleCriar}
            disabled={loadingCriar}
            style={({ pressed }) => ({
              height: 54, borderRadius: 14,
              backgroundColor: PINK,
              flexDirection: 'row',
              justifyContent: 'center', alignItems: 'center',
              gap: 8,
              opacity: pressed || loadingCriar ? 0.85 : 1,
              marginBottom: 32,
            })}
          >
            {loadingCriar ? (
              <ActivityIndicator color="#09091A" />
            ) : (
              <>
                <Ionicons name="heart-outline" size={18} color="#09091A" />
                <Text style={{ color: '#09091A', fontSize: 16, fontWeight: '800' }}>
                  Criar nossa casa
                </Text>
              </>
            )}
          </Pressable>

          {/* Divisor */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />
            <Text style={{ color: MUTED, fontSize: 12, marginHorizontal: 14, letterSpacing: 0.5 }}>
              já tem convite?
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />
          </View>

          {/* Entrar com código */}
          <View style={{
            backgroundColor: CARD, borderRadius: 14,
            borderWidth: 1, borderColor: BORDER,
            overflow: 'hidden', marginBottom: 12,
          }}>
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              paddingHorizontal: 16, height: 54,
            }}>
              <Ionicons name="key-outline" size={17} color={MUTED} style={{ marginRight: 12 }} />
              <TextInput
                style={{ flex: 1, color: VIOLET, fontSize: 15, fontWeight: '700', letterSpacing: 2 }}
                placeholder="CÓDIGO DE CONVITE"
                placeholderTextColor={MUTED}
                value={codigo}
                onChangeText={t => setCodigo(t.toUpperCase())}
                autoCapitalize="characters"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleEntrar}
              />
            </View>
          </View>

          <Pressable
            onPress={handleEntrar}
            disabled={loadingEntrar}
            style={({ pressed }) => ({
              height: 54, borderRadius: 14,
              borderWidth: 1.5, borderColor: 'rgba(124,106,247,0.35)',
              backgroundColor: 'rgba(124,106,247,0.07)',
              justifyContent: 'center', alignItems: 'center',
              opacity: pressed || loadingEntrar ? 0.8 : 1,
            })}
          >
            {loadingEntrar ? (
              <ActivityIndicator color={VIOLET} />
            ) : (
              <Text style={{ color: VIOLET, fontSize: 16, fontWeight: '700' }}>
                Entrar com código
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
