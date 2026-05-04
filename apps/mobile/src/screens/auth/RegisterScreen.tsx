import React, { useRef, useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'> };

type FocusedField = 'nome' | 'email' | 'senha' | null;

const BG      = '#09091A';
const CARD    = '#13142A';
const BORDER  = 'rgba(255,255,255,0.07)';
const DIVIDER = 'rgba(255,255,255,0.05)';
const FOCUS   = 'rgba(124,106,247,0.5)';
const VIOLET  = '#7C6AF7';
const ROSE    = '#F87171';
const TEXT    = '#EDEEFF';
const SUB     = '#7E7CA0';
const MUTED   = '#4A4869';

export default function RegisterScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<FocusedField>(null);
  const emailRef = useRef<TextInput>(null);
  const senhaRef = useRef<TextInput>(null);

  function clearError() {
    if (error) setError('');
  }

  async function handleRegister() {
    setError('');
    if (!nome.trim()) { setError('Informe seu nome.'); return; }
    if (!email.trim()) { setError('Informe seu e-mail.'); return; }
    if (!senha) { setError('Informe sua senha.'); return; }
    if (!email.includes('@')) { setError('E-mail inválido.'); return; }
    if (senha.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return; }

    setLoading(true);
    try {
      const data = await api.auth.registro(nome.trim(), email.trim().toLowerCase(), senha);
      signIn(data.access_token, data.usuario);
      navigation.replace('Domicilio');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Não foi possível criar a conta.');
    } finally {
      setLoading(false);
    }
  }

  function fieldBorder(field: Exclude<FocusedField, null>, fallback: string) {
    return focusedField === field ? FOCUS : fallback;
  }
  function fieldIcon(field: Exclude<FocusedField, null>) {
    return focusedField === field ? VIOLET : MUTED;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: BG }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 28, paddingTop: 16, paddingBottom: 60 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => ({
              width: 36, height: 36, borderRadius: 10,
              backgroundColor: CARD,
              borderWidth: 1, borderColor: BORDER,
              justifyContent: 'center', alignItems: 'center',
              marginBottom: 36,
              opacity: pressed ? 0.7 : 1,
            })}
            hitSlop={8}
          >
            <Ionicons name="chevron-back" size={20} color={SUB} />
          </Pressable>

          <Text style={{
            fontSize: 28, fontWeight: '800', color: TEXT,
            letterSpacing: -0.8, marginBottom: 6,
          }}>
            Criar conta
          </Text>
          <Text style={{ fontSize: 14, color: MUTED, marginBottom: 32 }}>
            Como você quer ser chamado(a)?
          </Text>

          {/* Campos agrupados */}
          <View style={{
            backgroundColor: CARD,
            borderRadius: 16, borderWidth: 1, borderColor: BORDER,
            overflow: 'hidden', marginBottom: 16,
          }}>
            {/* Nome */}
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              paddingHorizontal: 16, height: 56,
              borderBottomWidth: 1, borderBottomColor: fieldBorder('nome', DIVIDER),
            }}>
              <Ionicons name="person-outline" size={17} color={fieldIcon('nome')} style={{ marginRight: 12 }} />
              <TextInput
                style={{ flex: 1, color: TEXT, fontSize: 15 }}
                placeholder="Seu nome"
                placeholderTextColor={MUTED}
                value={nome}
                onChangeText={(v) => { setNome(v); clearError(); }}
                onFocus={() => setFocusedField('nome')}
                onBlur={() => setFocusedField(null)}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
              />
            </View>

            {/* E-mail */}
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              paddingHorizontal: 16, height: 56,
              borderTopWidth: 1, borderTopColor: focusedField === 'email' ? FOCUS : 'transparent',
              borderBottomWidth: 1, borderBottomColor: fieldBorder('email', DIVIDER),
            }}>
              <Ionicons name="mail-outline" size={17} color={fieldIcon('email')} style={{ marginRight: 12 }} />
              <TextInput
                ref={emailRef}
                style={{ flex: 1, color: TEXT, fontSize: 15 }}
                placeholder="E-mail"
                placeholderTextColor={MUTED}
                value={email}
                onChangeText={(v) => { setEmail(v); clearError(); }}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => senhaRef.current?.focus()}
              />
            </View>

            {/* Senha */}
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              paddingHorizontal: 16, height: 56,
              borderTopWidth: 1, borderTopColor: focusedField === 'senha' ? FOCUS : 'transparent',
            }}>
              <Ionicons name="lock-closed-outline" size={17} color={fieldIcon('senha')} style={{ marginRight: 12 }} />
              <TextInput
                ref={senhaRef}
                style={{ flex: 1, color: TEXT, fontSize: 15 }}
                placeholder="Senha (mín. 6 caracteres)"
                placeholderTextColor={MUTED}
                value={senha}
                onChangeText={(v) => { setSenha(v); clearError(); }}
                onFocus={() => setFocusedField('senha')}
                onBlur={() => setFocusedField(null)}
                secureTextEntry={!showSenha}
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />
              <Pressable onPress={() => setShowSenha(v => !v)} hitSlop={10}>
                <Ionicons
                  name={showSenha ? 'eye-off-outline' : 'eye-outline'}
                  size={18} color={MUTED}
                />
              </Pressable>
            </View>
          </View>

          {/* Erro inline */}
          {!!error && (
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: 8,
              backgroundColor: 'rgba(248,113,113,0.1)',
              borderWidth: 1, borderColor: 'rgba(248,113,113,0.25)',
              borderRadius: 10, paddingVertical: 9, paddingHorizontal: 12,
              marginBottom: 14,
            }}>
              <Ionicons name="alert-circle-outline" size={14} color={ROSE} />
              <Text style={{ fontSize: 12, color: ROSE, fontWeight: '500', flex: 1 }}>
                {error}
              </Text>
            </View>
          )}

          <Pressable
            onPress={handleRegister}
            disabled={loading}
            style={({ pressed }) => ({
              height: 54, borderRadius: 14,
              backgroundColor: VIOLET,
              justifyContent: 'center', alignItems: 'center',
              opacity: pressed || loading ? 0.85 : 1,
              shadowColor: VIOLET,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 14,
              elevation: 8,
            })}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '800', letterSpacing: -0.3 }}>
                Cadastrar
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
