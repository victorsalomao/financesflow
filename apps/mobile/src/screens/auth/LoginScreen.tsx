import React, { useRef, useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'> };

const P = {
  bg:      '#09091A',
  card:    '#13142A',
  border:  'rgba(255,255,255,0.07)',
  divider: 'rgba(255,255,255,0.05)',
  focus:   'rgba(124,106,247,0.5)',
  violet:  '#7C6AF7',
  pink:    '#F472B6',
  rose:    '#F87171',
  emerald: '#22D3A5',
  text:    '#EDEEFF',
  sub:     '#7E7CA0',
  muted:   '#4A4869',
};

type FocusedField = 'email' | 'senha' | null;

function BackgroundDecor() {
  const { width: W } = useWindowDimensions();
  return (
    <Svg
      width={W}
      height={340}
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      <Circle cx={W + 20} cy={-20} r={220} fill="rgba(124,106,247,0.07)" />
      <Circle cx={W + 20} cy={-20} r={140} fill="rgba(124,106,247,0.06)" />
      <Circle cx={-40} cy={280} r={130} fill="rgba(244,114,182,0.05)" />
      <Circle cx={W / 2} cy={120} r={80} fill="rgba(124,106,247,0.03)" />
    </Svg>
  );
}

export default function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [focusedField, setFocusedField] = useState<FocusedField>(null);
  const senhaRef = useRef<TextInput>(null);

  function handleEmailChange(value: string) {
    setEmail(value);
    if (error) setError('');
  }

  function handleSenhaChange(value: string) {
    setSenha(value);
    if (error) setError('');
  }

  async function handleLogin() {
    setError('');
    if (!email.trim()) { setError('Informe seu e-mail.'); return; }
    if (!senha) { setError('Informe sua senha.'); return; }
    if (!email.includes('@')) { setError('E-mail inválido.'); return; }

    setLoading(true);
    try {
      const data = await api.auth.login(email.trim().toLowerCase(), senha);
      signIn(data.access_token, data.usuario);
      if (!data.usuario.domicilio_id) {
        navigation.replace('Domicilio');
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  }

  function handleForgotPassword() {
    if (!email.trim()) { setError('Digite seu e-mail primeiro.'); return; }
    if (!email.includes('@')) { setError('E-mail inválido.'); return; }
    // TODO v2: integrar com api.auth.recuperarSenha(email) quando endpoint existir
    setError('');
    setForgotSent(true);
    setTimeout(() => setForgotSent(false), 3000);
  }

  const emailBorder = focusedField === 'email' ? P.focus : P.divider;
  const senhaBorder = focusedField === 'senha' ? P.focus : 'transparent';
  const emailIcon   = focusedField === 'email' ? P.violet : P.muted;
  const senhaIcon   = focusedField === 'senha' ? P.violet : P.muted;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: P.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <BackgroundDecor />

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: 28,
            paddingBottom: 60,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={{ alignItems: 'center', marginBottom: 52 }}>
            <View style={{ position: 'relative', marginBottom: 20 }}>
              <View style={{
                position: 'absolute',
                width: 80, height: 80, borderRadius: 28,
                backgroundColor: 'rgba(124,106,247,0.25)',
                transform: [{ scale: 1.4 }],
              }} />
              <View style={{
                width: 72, height: 72, borderRadius: 24,
                backgroundColor: P.violet,
                justifyContent: 'center', alignItems: 'center',
                borderWidth: 1.5,
                borderColor: 'rgba(200,190,255,0.35)',
                shadowColor: P.violet,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.5,
                shadowRadius: 16,
                elevation: 10,
              }}>
                <Ionicons name="wallet" size={34} color="#FFF" />
              </View>
            </View>

            <Text style={{
              fontSize: 32, fontWeight: '800', color: P.text,
              letterSpacing: -1, marginBottom: 6,
            }}>
              FinançasFlow
            </Text>
            <Text style={{ fontSize: 14, color: P.muted, letterSpacing: 0.3 }}>
              Suas finanças, juntos.
            </Text>
          </View>

          {/* Form */}
          <View>
            {/* Campos agrupados */}
            <View style={{
              backgroundColor: P.card,
              borderRadius: 16, borderWidth: 1, borderColor: P.border,
              overflow: 'hidden', marginBottom: 16,
            }}>
              {/* E-mail */}
              <View style={{
                flexDirection: 'row', alignItems: 'center',
                paddingHorizontal: 16, height: 56,
                borderBottomWidth: 1, borderBottomColor: emailBorder,
              }}>
                <Ionicons name="mail-outline" size={17} color={emailIcon} style={{ marginRight: 12 }} />
                <TextInput
                  style={{ flex: 1, color: P.text, fontSize: 15 }}
                  placeholder="E-mail"
                  placeholderTextColor={P.muted}
                  value={email}
                  onChangeText={handleEmailChange}
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
                borderTopWidth: 1, borderTopColor: senhaBorder,
              }}>
                <Ionicons name="lock-closed-outline" size={17} color={senhaIcon} style={{ marginRight: 12 }} />
                <TextInput
                  ref={senhaRef}
                  style={{ flex: 1, color: P.text, fontSize: 15 }}
                  placeholder="Senha"
                  placeholderTextColor={P.muted}
                  value={senha}
                  onChangeText={handleSenhaChange}
                  onFocus={() => setFocusedField('senha')}
                  onBlur={() => setFocusedField(null)}
                  secureTextEntry={!showSenha}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <Pressable onPress={() => setShowSenha(v => !v)} hitSlop={10}>
                  <Ionicons
                    name={showSenha ? 'eye-off-outline' : 'eye-outline'}
                    size={18} color={P.muted}
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
                <Ionicons name="alert-circle-outline" size={14} color={P.rose} />
                <Text style={{ fontSize: 12, color: P.rose, fontWeight: '500', flex: 1 }}>
                  {error}
                </Text>
              </View>
            )}

            {/* Toast sucesso "Esqueci minha senha" */}
            {forgotSent && (
              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 8,
                backgroundColor: 'rgba(34,211,165,0.1)',
                borderWidth: 1, borderColor: 'rgba(34,211,165,0.25)',
                borderRadius: 10, paddingVertical: 9, paddingHorizontal: 12,
                marginBottom: 14,
              }}>
                <Ionicons name="checkmark-circle-outline" size={14} color={P.emerald} />
                <Text style={{ fontSize: 12, color: P.emerald, fontWeight: '500', flex: 1 }}>
                  Link de redefinição enviado!
                </Text>
              </View>
            )}

            {/* Entrar */}
            <Pressable
              onPress={handleLogin}
              disabled={loading}
              style={({ pressed }) => ({
                height: 54, borderRadius: 14,
                backgroundColor: P.violet,
                justifyContent: 'center', alignItems: 'center',
                opacity: pressed || loading ? 0.85 : 1,
                marginBottom: 12,
                shadowColor: P.violet,
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
                  Entrar
                </Text>
              )}
            </Pressable>

            {/* Criar conta */}
            <Pressable
              onPress={() => navigation.navigate('Register')}
              style={({ pressed }) => ({
                height: 54, borderRadius: 14,
                borderWidth: 1.5, borderColor: 'rgba(124,106,247,0.35)',
                justifyContent: 'center', alignItems: 'center',
                backgroundColor: 'rgba(124,106,247,0.07)',
                opacity: pressed ? 0.75 : 1,
                marginBottom: 20,
              })}
            >
              <Text style={{ color: P.violet, fontSize: 16, fontWeight: '700' }}>
                Criar conta nova
              </Text>
            </Pressable>

            {/* Esqueci minha senha */}
            <Pressable
              onPress={handleForgotPassword}
              style={({ pressed }) => ({ alignItems: 'center', opacity: pressed ? 0.6 : 1 })}
              hitSlop={8}
            >
              <Text style={{ fontSize: 13, color: P.sub, letterSpacing: 0.1 }}>
                Esqueci minha senha
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
