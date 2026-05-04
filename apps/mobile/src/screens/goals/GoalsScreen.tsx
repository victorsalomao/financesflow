import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable,
  TextInput, Modal, ActivityIndicator, Alert, RefreshControl,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../context/AuthContext';
import { api, MetaData } from '../../services/api';
import { formatCurrency } from '../../utils/format';
import { T } from '../../theme/tokens';

const ICONES = ['✈️', '🏠', '🎓', '🚗', '💍', '⭐', '🏖️', '💻', '🎯', '💰'];
const CORES  = ['#7C6AF7', '#F472B6', '#22D3A5', '#F87171', '#FBBF24', '#4ECDC4', '#DDA0DD', '#45B7D1'];

const RING_SIZE = 64;
const RING_STROKE = 5;
const RING_R = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRC = 2 * Math.PI * RING_R;

function ProgressRing({ pct, cor }: { pct: number; cor: string }) {
  const filled = (pct / 100) * RING_CIRC;
  return (
    <Svg width={RING_SIZE} height={RING_SIZE} style={{ transform: [{ rotate: '-90deg' }] }}>
      <Circle
        cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_R}
        stroke="rgba(255,255,255,0.06)" strokeWidth={RING_STROKE} fill="none"
      />
      <Circle
        cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_R}
        stroke={cor} strokeWidth={RING_STROKE} fill="none"
        strokeDasharray={`${filled} ${RING_CIRC - filled}`}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function SummaryCard({ metas, totalGuardado }: { metas: MetaData[]; totalGuardado: number }) {
  return (
    <View style={{
      marginHorizontal: 16, marginTop: 14, marginBottom: 16,
      backgroundColor: '#1A0F28',
      borderRadius: 20,
      borderWidth: 1, borderColor: 'rgba(244,114,182,0.15)',
      paddingVertical: 16, paddingHorizontal: 18,
      overflow: 'hidden',
    }}>
      <View pointerEvents="none" style={{ position: 'absolute', top: -30, right: -20, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(244,114,182,0.07)' }} />

      <Text style={{ fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>
        Total economizado
      </Text>
      <Text style={{
        fontSize: 32, fontWeight: '800', color: T.text,
        letterSpacing: -1.5, marginBottom: 12,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
      }}>
        {formatCurrency(totalGuardado)}
      </Text>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        {metas.map(g => {
          const pct = g.valor_alvo > 0 ? Math.min((g.valor_atual / g.valor_alvo) * 100, 100) : 0;
          const cor = g.cor ?? T.violet;
          return (
            <View key={g.id} style={{ flex: 1, gap: 4 }}>
              <Text style={{ fontSize: 11 }}>{g.icone ?? '🎯'}</Text>
              <View style={{ height: 3, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 2 }}>
                <View style={{ height: '100%', width: `${pct}%` as any, backgroundColor: cor, borderRadius: 2 }} />
              </View>
              <Text style={{ fontSize: 9, color: T.muted, fontWeight: '600' }}>{Math.round(pct)}%</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function GoalCard({ meta, onDelete }: { meta: MetaData; onDelete: (id: string) => void }) {
  const pct = meta.valor_alvo > 0 ? Math.min((meta.valor_atual / meta.valor_alvo) * 100, 100) : 0;
  const cor = meta.cor ?? T.violet;
  const done = pct >= 100;

  const diasRestantes = meta.data_limite
    ? Math.ceil((new Date(meta.data_limite).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Pressable
      onLongPress={() => Alert.alert(
        'Excluir meta',
        `Excluir "${meta.nome}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Excluir', style: 'destructive', onPress: () => onDelete(meta.id) },
        ],
      )}
      style={({ pressed }) => ({
        backgroundColor: T.card,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: done ? cor + '30' : pressed ? cor + '40' : T.border,
        padding: 18,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
      })}
    >
      <View style={{ position: 'relative', width: RING_SIZE, height: RING_SIZE, flexShrink: 0 }}>
        <ProgressRing pct={pct} cor={cor} />
        <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 22 }}>{done ? '✅' : (meta.icone ?? '🎯')}</Text>
        </View>
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: T.text, flex: 1 }} numberOfLines={1}>
            {meta.nome}
          </Text>
          <Text style={{ fontSize: 13, fontWeight: '800', color: cor, marginLeft: 8 }}>
            {pct.toFixed(0)}%
          </Text>
        </View>

        <Text style={{
          fontSize: 20, fontWeight: '800', color: cor,
          letterSpacing: -0.5, marginBottom: 1,
          fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        }}>
          {formatCurrency(meta.valor_atual)}
        </Text>
        <Text style={{ fontSize: 11, color: T.muted }}>de {formatCurrency(meta.valor_alvo)}</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
          {done ? (
            <View style={{ backgroundColor: 'rgba(34,211,165,0.12)', borderRadius: 5, paddingHorizontal: 7, paddingVertical: 2 }}>
              <Text style={{ fontSize: 10, color: T.emerald, fontWeight: '700' }}>✓ Meta atingida!</Text>
            </View>
          ) : diasRestantes !== null && diasRestantes > 0 ? (
            <View style={{ backgroundColor: cor + '15', borderRadius: 5, paddingHorizontal: 7, paddingVertical: 2 }}>
              <Text style={{ fontSize: 10, color: cor, fontWeight: '600' }}>{diasRestantes}d restantes</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
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

function NovaMetaModal({
  visible,
  onClose,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { nome: string; valor_alvo: number; data_limite?: string; icone?: string; cor?: string }) => void;
}) {
  const { bottom: bottomInset } = useSafeAreaInsets();
  const [nome, setNome] = useState('');
  const [valor, setValor] = useState('');
  const [icone, setIcone] = useState(ICONES[0]);
  const [cor, setCor] = useState(CORES[0]);
  const [dataSelecionada, setDataSelecionada] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  function openDatePicker() {
    setTempDate(dataSelecionada ?? new Date());
    setShowDatePicker(true);
  }

  function confirmDate() {
    setDataSelecionada(tempDate);
    setShowDatePicker(false);
  }

  function handleSave() {
    const v = parseFloat(valor.replace(/\./g, '').replace(',', '.'));
    if (!nome.trim() || !v || v <= 0) {
      Alert.alert('Atenção', 'Preencha nome e valor alvo.');
      return;
    }
    onSave({
      nome: nome.trim(),
      valor_alvo: v,
      data_limite: dataSelecionada ? formatDateISO(dataSelecionada) : undefined,
      icone,
      cor,
    });
    setNome(''); setValor(''); setDataSelecionada(null);
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(9,9,26,0.85)', justifyContent: 'flex-end' }}>
          <View style={{
            backgroundColor: T.surface,
            borderTopLeftRadius: 28, borderTopRightRadius: 28,
            borderWidth: 1, borderColor: T.border,
            padding: 24,
            paddingBottom: Math.max(bottomInset, 16),
          }}>
            <View style={{ width: 36, height: 3, backgroundColor: T.muted, borderRadius: 2, alignSelf: 'center', marginBottom: 24 }} />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: T.text }}>Nova meta</Text>
              <Pressable onPress={onClose} hitSlop={12}>
                <Ionicons name="close" size={22} color={T.sub} />
              </Pressable>
            </View>

            {/* Campos Nome, Valor, Data */}
            <View style={{
              backgroundColor: T.card, borderRadius: 14,
              borderWidth: 1, borderColor: T.border,
              overflow: 'hidden', marginBottom: 16,
            }}>
              <View style={{
                flexDirection: 'row', alignItems: 'center',
                paddingHorizontal: 16, height: 52,
                borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
              }}>
                <Ionicons name="flag-outline" size={15} color={T.muted} style={{ marginRight: 10 }} />
                <TextInput
                  style={{ flex: 1, color: T.text, fontSize: 15 }}
                  placeholder="Nome da meta"
                  placeholderTextColor={T.muted}
                  value={nome}
                  onChangeText={setNome}
                />
              </View>
              <View style={{
                flexDirection: 'row', alignItems: 'center',
                paddingHorizontal: 16, height: 52,
                borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
              }}>
                <Ionicons name="cash-outline" size={15} color={T.muted} style={{ marginRight: 10 }} />
                <TextInput
                  style={{ flex: 1, color: T.text, fontSize: 15 }}
                  placeholder="Valor alvo (R$)"
                  placeholderTextColor={T.muted}
                  value={valor}
                  onChangeText={setValor}
                  keyboardType="numeric"
                />
              </View>
              {/* Data limite — DateTimePicker (substituiu TextInput) */}
              <Pressable
                onPress={openDatePicker}
                style={({ pressed }) => ({
                  flexDirection: 'row', alignItems: 'center',
                  paddingHorizontal: 16, height: 52,
                  backgroundColor: pressed ? 'rgba(255,255,255,0.03)' : 'transparent',
                })}
              >
                <Ionicons name="calendar-outline" size={15} color={T.muted} style={{ marginRight: 10 }} />
                <Text style={{ flex: 1, color: dataSelecionada ? T.text : T.muted, fontSize: 15 }}>
                  {dataSelecionada ? formatDateDisplay(dataSelecionada) : 'Data limite (opcional)'}
                </Text>
                <Ionicons name="chevron-forward" size={14} color={T.muted} />
              </Pressable>
            </View>

            {/* Ícones */}
            <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 2.5, color: T.muted, textTransform: 'uppercase', marginBottom: 10 }}>
              Ícone
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {ICONES.map(ic => (
                <Pressable
                  key={ic}
                  onPress={() => setIcone(ic)}
                  style={{
                    width: 46, height: 46, borderRadius: 13, marginRight: 8,
                    backgroundColor: icone === ic ? 'rgba(124,106,247,0.18)' : T.card,
                    justifyContent: 'center', alignItems: 'center',
                    borderWidth: 1,
                    borderColor: icone === ic ? 'rgba(124,106,247,0.4)' : T.border,
                  }}
                >
                  <Text style={{ fontSize: 22 }}>{ic}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Cores */}
            <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 2.5, color: T.muted, textTransform: 'uppercase', marginBottom: 10 }}>
              Cor
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
              {CORES.map(c => (
                <Pressable
                  key={c}
                  onPress={() => setCor(c)}
                  style={{
                    width: 34, height: 34, borderRadius: 17, backgroundColor: c,
                    borderWidth: cor === c ? 2.5 : 0, borderColor: '#FFF',
                    shadowColor: cor === c ? c : 'transparent',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.6, shadowRadius: 6,
                  }}
                />
              ))}
            </View>

            <Pressable
              onPress={handleSave}
              style={({ pressed }) => ({
                height: 52, borderRadius: 14, backgroundColor: T.pink,
                justifyContent: 'center', alignItems: 'center',
                opacity: pressed ? 0.85 : 1,
                flexDirection: 'row', gap: 8,
              })}
            >
              <Ionicons name="heart-outline" size={18} color="#09091A" />
              <Text style={{ color: '#09091A', fontSize: 16, fontWeight: '800' }}>Criar meta</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

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
        }}>
          <View style={{ width: 36, height: 3, backgroundColor: T.muted, borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 4 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 14 }}>
            <Pressable onPress={() => setShowDatePicker(false)} hitSlop={10}>
              <Text style={{ color: T.sub, fontSize: 15 }}>Cancelar</Text>
            </Pressable>
            <Text style={{ color: T.text, fontSize: 15, fontWeight: '700' }}>Data limite</Text>
            <Pressable onPress={confirmDate} hitSlop={10}>
              <Text style={{ color: T.pink, fontSize: 15, fontWeight: '700' }}>Confirmar</Text>
            </Pressable>
          </View>
          <DateTimePicker
            value={tempDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, date) => { if (date) setTempDate(date); }}
            minimumDate={new Date()}
            locale="pt-BR"
            style={{ backgroundColor: T.surface }}
            textColor={T.text}
          />
        </View>
      </Modal>
    </Modal>
  );
}

export default function GoalsScreen() {
  const { token } = useAuth();
  const [metas, setMetas] = useState<MetaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const data = await api.metas.listar(token);
      setMetas(data);
    } catch {}
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  async function handleSave(formData: Parameters<typeof api.metas.criar>[0]) {
    if (!token) return;
    try {
      const nova = await api.metas.criar(formData, token);
      setMetas(prev => [nova, ...prev]);
      setModalVisible(false);
    } catch (e: unknown) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Não foi possível criar a meta.');
    }
  }

  async function handleDelete(id: string) {
    if (!token) return;
    try {
      await api.metas.deletar(id, token);
      setMetas(prev => prev.filter(m => m.id !== id));
    } catch (e: unknown) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Não foi possível excluir.');
    }
  }

  const totalGuardado = metas.reduce((acc, m) => acc + m.valor_atual, 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={{
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
        paddingHorizontal: 24, paddingTop: 12, paddingBottom: 0,
      }}>
        <View>
          <Text style={{ fontSize: 20, fontWeight: '800', color: T.text, letterSpacing: -0.5, marginBottom: 2 }}>
            Metas
          </Text>
          {metas.length > 0 && (
            <Text style={{ fontSize: 11, color: T.muted }}>
              {metas.length} objetivo{metas.length > 1 ? 's' : ''} ·{' '}
              <Text style={{ color: T.pink, fontWeight: '700' }}>
                {formatCurrency(totalGuardado)} guardados
              </Text>
            </Text>
          )}
        </View>

        <Pressable
          onPress={() => setModalVisible(true)}
          style={({ pressed }) => ({
            height: 34, paddingHorizontal: 14, borderRadius: 10,
            backgroundColor: 'rgba(244,114,182,0.12)',
            borderWidth: 1, borderColor: 'rgba(244,114,182,0.3)',
            justifyContent: 'center', alignItems: 'center',
            flexDirection: 'row', gap: 4,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Ionicons name="add" size={18} color={T.pink} />
          <Text style={{ color: T.pink, fontSize: 13, fontWeight: '700' }}>Nova</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color={T.violet} style={{ marginTop: 60 }} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(); }}
              tintColor={T.violet}
            />
          }
          contentContainerStyle={{ padding: 12, paddingHorizontal: 16, paddingBottom: 100 }}
        >
          {metas.length > 0 && (
            <SummaryCard metas={metas} totalGuardado={totalGuardado} />
          )}

          {metas.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 80 }}>
              <View style={{
                width: 80, height: 80, borderRadius: 28,
                backgroundColor: T.card, borderWidth: 1, borderColor: T.border,
                justifyContent: 'center', alignItems: 'center', marginBottom: 16,
              }}>
                <Text style={{ fontSize: 36 }}>🎯</Text>
              </View>
              <Text style={{ color: T.sub, fontSize: 15, fontWeight: '600', textAlign: 'center' }}>
                Nenhuma meta ainda
              </Text>
              <Text style={{ color: T.muted, fontSize: 13, marginTop: 4, textAlign: 'center' }}>
                Crie a primeira meta do casal!
              </Text>
              <Pressable
                onPress={() => setModalVisible(true)}
                style={({ pressed }) => ({
                  marginTop: 24, height: 50, borderRadius: 14,
                  backgroundColor: T.pink, paddingHorizontal: 28,
                  justifyContent: 'center', alignItems: 'center',
                  opacity: pressed ? 0.85 : 1, flexDirection: 'row', gap: 8,
                })}
              >
                <Ionicons name="heart-outline" size={18} color="#09091A" />
                <Text style={{ color: '#09091A', fontSize: 15, fontWeight: '800' }}>Criar primeira meta</Text>
              </Pressable>
            </View>
          ) : (
            metas.map(m => <GoalCard key={m.id} meta={m} onDelete={handleDelete} />)
          )}
        </ScrollView>
      )}

      <NovaMetaModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
      />
    </SafeAreaView>
  );
}
