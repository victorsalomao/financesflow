import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Modal, Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { T } from '../../theme/tokens';
import { CATEGORIAS } from '../../constants/categories';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'AddTransaction'> };
type Tipo = 'despesa' | 'receita';

function formatValorInput(raw: string): string {
  const nums = raw.replace(/\D/g, '');
  if (!nums) return '';
  const cents = parseInt(nums, 10);
  return (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseValor(formatted: string): number {
  return parseFloat(formatted.replace(/\./g, '').replace(',', '.')) || 0;
}

function formatDateDisplay(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}/${date.getFullYear()}`;
}

function formatDateISO(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

export default function AddTransactionScreen({ navigation }: Props) {
  const { token } = useAuth();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const descricaoRef = useRef<TextInput>(null);

  const [tipo, setTipo] = useState<Tipo>('despesa');
  const [valorRaw, setValorRaw] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const popAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (saved) {
      Animated.spring(popAnim, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true }).start();
      const t = setTimeout(() => navigation.goBack(), 1400);
      return () => clearTimeout(t);
    }
  }, [saved]);

  const isDespesa = tipo === 'despesa';
  const accentColor = isDespesa ? T.rose : T.emerald;

  function handleValorChange(text: string) {
    const nums = text.replace(/\D/g, '');
    setValorRaw(formatValorInput(nums ? text : ''));
  }

  function openDatePicker() {
    setTempDate(dataSelecionada);
    setShowDatePicker(true);
  }

  function confirmDate() {
    setDataSelecionada(tempDate);
    setShowDatePicker(false);
  }

  async function handleSalvar() {
    const valor = parseValor(valorRaw);
    if (!valor || valor <= 0) { Alert.alert('Atenção', 'Informe um valor válido.'); return; }
    if (!descricao.trim()) { Alert.alert('Atenção', 'Informe uma descrição.'); return; }
    setLoading(true);
    try {
      await api.transacoes.criar({
        descricao: descricao.trim(),
        valor,
        tipo,
        data_transacao: formatDateISO(dataSelecionada),
      }, token!);
      setSaved(true);
    } catch (e: unknown) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Não foi possível salvar.');
    } finally {
      setLoading(false);
    }
  }

  if (saved) {
    return (
      <View style={{ flex: 1, backgroundColor: T.bg, justifyContent: 'center', alignItems: 'center', gap: 16 }}>
        <Animated.View style={{
          transform: [{ scale: popAnim }], opacity: popAnim,
          width: 80, height: 80, borderRadius: 40,
          backgroundColor: accentColor + '20',
          borderWidth: 2, borderColor: accentColor,
          justifyContent: 'center', alignItems: 'center',
        }}>
          <Ionicons name="checkmark" size={36} color={accentColor} />
        </Animated.View>
        <Text style={{ fontSize: 18, fontWeight: '700', color: T.text }}>Salvo!</Text>
        <Text style={{ fontSize: 13, color: T.muted }}>
          {isDespesa ? 'Despesa' : 'Receita'} registrada com sucesso
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: T.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8,
        }}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={12}
            style={({ pressed }) => ({
              width: 36, height: 36, borderRadius: 10,
              backgroundColor: T.card, borderWidth: 1, borderColor: T.border,
              justifyContent: 'center', alignItems: 'center',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Ionicons name="close" size={18} color={T.sub} />
          </Pressable>

          <Text style={{ fontSize: 16, fontWeight: '700', color: T.text, letterSpacing: -0.3 }}>
            Nova Transação
          </Text>

          <Pressable
            onPress={handleSalvar}
            disabled={loading}
            hitSlop={8}
            style={({ pressed }) => ({
              height: 34, paddingHorizontal: 14, borderRadius: 10,
              backgroundColor: accentColor + '20',
              borderWidth: 1, borderColor: accentColor + '50',
              justifyContent: 'center', alignItems: 'center',
              opacity: pressed || loading ? 0.7 : 1,
            })}
          >
            {loading ? (
              <ActivityIndicator size="small" color={accentColor} />
            ) : (
              <Text style={{ color: accentColor, fontSize: 13, fontWeight: '700' }}>Salvar</Text>
            )}
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Toggle tipo */}
          <View style={{
            flexDirection: 'row', backgroundColor: T.card,
            borderRadius: 14, borderWidth: 1, borderColor: T.border,
            marginBottom: 32, padding: 4,
          }}>
            {(['despesa', 'receita'] as Tipo[]).map(t => {
              const active = tipo === t;
              const color = t === 'despesa' ? T.rose : T.emerald;
              const activeBg = t === 'despesa' ? 'rgba(248,113,113,0.09)' : 'rgba(34,211,165,0.09)';
              const activeBorder = t === 'despesa' ? 'rgba(248,113,113,0.21)' : 'rgba(34,211,165,0.21)';
              return (
                <Pressable
                  key={t}
                  onPress={() => setTipo(t)}
                  style={{
                    flex: 1, height: 42, borderRadius: 10,
                    justifyContent: 'center', alignItems: 'center',
                    backgroundColor: active ? activeBg : 'transparent',
                    borderWidth: 1,
                    borderColor: active ? activeBorder : 'transparent',
                    flexDirection: 'row', gap: 6,
                  }}
                >
                  <Ionicons
                    name={t === 'despesa' ? 'trending-down' : 'trending-up'}
                    size={16}
                    color={active ? color : T.muted}
                  />
                  <Text style={{ fontSize: 14, fontWeight: '700', letterSpacing: 0.2, color: active ? color : T.muted }}>
                    {t === 'despesa' ? 'Despesa' : 'Receita'}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Valor hero */}
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <Text style={{
              fontSize: 11, fontWeight: '700', letterSpacing: 2.5,
              color: T.muted, textTransform: 'uppercase', marginBottom: 10,
            }}>
              Valor (R$)
            </Text>
            <TextInput
              style={{
                fontSize: 46, fontWeight: '800', color: accentColor,
                textAlign: 'center', letterSpacing: -2, minWidth: 140,
                borderBottomWidth: 2, borderBottomColor: accentColor + '50', paddingBottom: 6,
              }}
              placeholder="0,00"
              placeholderTextColor={T.muted}
              value={valorRaw}
              onChangeText={handleValorChange}
              keyboardType="numeric"
              returnKeyType="next"
              onSubmitEditing={() => descricaoRef.current?.focus()}
            />
          </View>

          {/* Campos */}
          <View style={{
            backgroundColor: T.card, borderRadius: 16,
            borderWidth: 1, borderColor: T.border,
            overflow: 'hidden', marginBottom: 20,
          }}>
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              paddingHorizontal: 16, height: 54,
              borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
            }}>
              <Ionicons name="pencil-outline" size={16} color={T.muted} style={{ marginRight: 12 }} />
              <TextInput
                ref={descricaoRef}
                style={{ flex: 1, color: T.text, fontSize: 15 }}
                placeholder="Descrição"
                placeholderTextColor={T.muted}
                value={descricao}
                onChangeText={setDescricao}
                returnKeyType="done"
                onSubmitEditing={handleSalvar}
              />
            </View>

            <Pressable
              onPress={openDatePicker}
              style={({ pressed }) => ({
                flexDirection: 'row', alignItems: 'center',
                paddingHorizontal: 16, height: 54,
                backgroundColor: pressed ? 'rgba(255,255,255,0.03)' : 'transparent',
              })}
            >
              <Ionicons name="calendar-outline" size={16} color={T.muted} style={{ marginRight: 12 }} />
              <Text style={{ flex: 1, color: T.text, fontSize: 15 }}>
                {formatDateDisplay(dataSelecionada)}
              </Text>
              <Ionicons name="chevron-forward" size={14} color={T.muted} />
            </Pressable>
          </View>

          {/* Categorias */}
          <Text style={{
            fontSize: 10, fontWeight: '700', letterSpacing: 3,
            color: T.muted, textTransform: 'uppercase', marginBottom: 12,
          }}>
            Categoria
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {CATEGORIAS.map(cat => {
              const selected = categoriaSelecionada === cat.nome;
              return (
                <Pressable
                  key={cat.nome}
                  onPress={() => setCategoriaSelecionada(selected ? '' : cat.nome)}
                  style={{
                    width: '22.5%', aspectRatio: 1, borderRadius: 14,
                    backgroundColor: selected ? cat.cor + '22' : T.card,
                    borderWidth: 1,
                    borderColor: selected ? cat.cor + '50' : T.border,
                    justifyContent: 'center', alignItems: 'center', gap: 4,
                  }}
                >
                  <Text style={{ fontSize: 20 }}>{cat.emoji}</Text>
                  <Text style={{
                    fontSize: 9, fontWeight: '600', letterSpacing: 0.3,
                    color: selected ? cat.cor : T.muted, textAlign: 'center',
                  }}>
                    {cat.nome}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* Botão principal — FORA do ScrollView */}
        <View style={{
          paddingHorizontal: 16, paddingTop: 12,
          paddingBottom: Math.max(bottomInset, 16),
          borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
          backgroundColor: T.bg,
        }}>
          <Pressable
            onPress={handleSalvar}
            disabled={loading}
            style={({ pressed }) => ({
              height: 54, borderRadius: 14, backgroundColor: accentColor,
              justifyContent: 'center', alignItems: 'center',
              opacity: pressed || loading ? 0.85 : 1,
              flexDirection: 'row', gap: 8,
            })}
          >
            {loading ? (
              <ActivityIndicator color="#09091A" />
            ) : (
              <>
                <Ionicons
                  name={isDespesa ? 'remove-circle-outline' : 'add-circle-outline'}
                  size={20} color="#09091A"
                />
                <Text style={{ color: '#09091A', fontSize: 16, fontWeight: '800', letterSpacing: -0.3 }}>
                  Salvar {isDespesa ? 'despesa' : 'receita'}
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </SafeAreaView>

      {/* DateTimePicker Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
          onPress={() => setShowDatePicker(false)}
        />
        <View style={{
          backgroundColor: T.surface,
          borderTopLeftRadius: 24, borderTopRightRadius: 24,
          borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
          paddingBottom: Math.max(bottomInset, 16),
        }}>
          <View style={{
            width: 36, height: 3, backgroundColor: T.muted,
            borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 4,
          }} />
          <View style={{
            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
            paddingHorizontal: 24, paddingVertical: 14,
          }}>
            <Pressable onPress={() => setShowDatePicker(false)} hitSlop={10}>
              <Text style={{ color: T.sub, fontSize: 15 }}>Cancelar</Text>
            </Pressable>
            <Text style={{ color: T.text, fontSize: 15, fontWeight: '700' }}>Data da transação</Text>
            <Pressable onPress={confirmDate} hitSlop={10}>
              <Text style={{ color: accentColor, fontSize: 15, fontWeight: '700' }}>Confirmar</Text>
            </Pressable>
          </View>
          <DateTimePicker
            value={tempDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, date) => { if (date) setTempDate(date); }}
            maximumDate={new Date()}
            locale="pt-BR"
            style={{ backgroundColor: T.surface }}
            textColor={T.text}
          />
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
