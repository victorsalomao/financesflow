import React, { useState, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import {
  View, Text, SectionList, Pressable,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { api, TransacaoData } from '../../services/api';
import { formatCurrency } from '../../utils/format';
import { T } from '../../theme/tokens';
import { getCategoryColor } from '../../constants/categories';

type FilterType = 'todas' | 'despesa' | 'receita';

// Each section has ONE data item = the full array of transactions for that date
type GroupedSection = {
  title: string;
  data: [TransacaoData[]];
};

function groupByDate(transacoes: TransacaoData[]): GroupedSection[] {
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

  const map: Record<string, TransacaoData[]> = {};
  for (const t of transacoes) {
    const key = t.data.split('T')[0];
    if (!map[key]) map[key] = [];
    map[key].push(t);
  }

  return Object.entries(map)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => {
      let title: string;
      if (date === todayStr) title = 'Hoje';
      else if (date === yesterdayStr) title = 'Ontem';
      else {
        const d = new Date(date + 'T12:00:00');
        title = d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' });
        title = title.charAt(0).toUpperCase() + title.slice(1);
      }
      return { title, data: [items] as [TransacaoData[]] };
    });
}

function TransactionItem({
  item,
  isLast,
  onDelete,
  onPress,
}: {
  item: TransacaoData;
  isLast: boolean;
  onDelete: (id: string) => void;
  onPress: (item: TransacaoData) => void;
}) {
  const isReceita = item.tipo === 'receita';
  const cor = getCategoryColor(item.categoria_nome);

  return (
    <Pressable
      onPress={() => onPress(item)}
      onLongPress={() => Alert.alert(
        'Excluir transação',
        `Excluir "${item.descricao}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Excluir', style: 'destructive', onPress: () => onDelete(item.id) },
        ],
      )}
      style={({ pressed }) => ({
        flexDirection: 'row', alignItems: 'center',
        padding: 13, paddingHorizontal: 16,
        backgroundColor: pressed ? 'rgba(255,255,255,0.03)' : 'transparent',
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: 'rgba(255,255,255,0.04)',
      })}
    >
      <View style={{
        width: 44, height: 44, borderRadius: 13,
        backgroundColor: cor + '18',
        borderWidth: 1, borderColor: cor + '28',
        justifyContent: 'center', alignItems: 'center',
        marginRight: 12, flexShrink: 0,
      }}>
        <Ionicons name={isReceita ? 'trending-up' : 'trending-down'} size={18} color={cor} />
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: T.text }} numberOfLines={1}>
          {item.descricao}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
          {item.categoria_nome && (
            <View style={{
              backgroundColor: cor + '18',
              borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1,
            }}>
              <Text style={{ fontSize: 10, color: cor, fontWeight: '600' }}>
                {item.categoria_nome}
              </Text>
            </View>
          )}
          {item.usuario_nome && (
            <Text style={{ fontSize: 11, color: T.muted }}>· {item.usuario_nome}</Text>
          )}
        </View>
      </View>

      <Text style={{ fontSize: 14, fontWeight: '700', color: isReceita ? T.emerald : T.rose, flexShrink: 0 }}>
        {isReceita ? '+' : '−'}{formatCurrency(item.valor)}
      </Text>
    </Pressable>
  );
}

const FILTERS: { label: string; value: FilterType }[] = [
  { label: 'Todas', value: 'todas' },
  { label: 'Despesas', value: 'despesa' },
  { label: 'Receitas', value: 'receita' },
];

const FILTER_ACTIVE_COLORS: Record<FilterType, string> = {
  todas:   T.violet,
  despesa: T.rose,
  receita: T.emerald,
};

const FILTER_ACTIVE_BG: Record<FilterType, string> = {
  todas:   'rgba(124,106,247,0.09)',
  despesa: 'rgba(248,113,113,0.09)',
  receita: 'rgba(34,211,165,0.09)',
};

const FILTER_ACTIVE_BORDER: Record<FilterType, string> = {
  todas:   'rgba(124,106,247,0.25)',
  despesa: 'rgba(248,113,113,0.25)',
  receita: 'rgba(34,211,165,0.25)',
};

export default function TransactionListScreen() {
  const { token } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [transacoes, setTransacoes] = useState<TransacaoData[]>([]);
  const [filter, setFilter] = useState<FilterType>('todas');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const params: Record<string, string> = {};
      if (filter !== 'todas') params['tipo'] = filter;
      const data = await api.transacoes.listar(token, params);
      setTransacoes(data);
    } catch {}
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, filter]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleDelete(id: string) {
    if (!token) return;
    try {
      await api.transacoes.deletar(id, token);
      setTransacoes(prev => prev.filter(t => t.id !== id));
    } catch (e: unknown) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Não foi possível excluir.');
    }
  }

  const total = transacoes.reduce(
    (acc, t) => acc + (t.tipo === 'receita' ? t.valor : -t.valor),
    0,
  );
  const sections = groupByDate(transacoes);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 0 }}>
        <Text style={{ fontSize: 20, fontWeight: '800', color: T.text, letterSpacing: -0.5, marginBottom: 2 }}>
          Transações
        </Text>
        <Text style={{ fontSize: 11, color: T.muted }}>
          {transacoes.length} registros · saldo{' '}
          <Text style={{ color: total >= 0 ? T.emerald : T.rose, fontWeight: '700' }}>
            {formatCurrency(Math.abs(total))}
          </Text>
        </Text>
      </View>

      {/* Filtros */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}>
        {FILTERS.map(f => {
          const active = filter === f.value;
          const color = FILTER_ACTIVE_COLORS[f.value];
          return (
            <Pressable
              key={f.value}
              onPress={() => setFilter(f.value)}
              style={{
                flex: 1, height: 36, borderRadius: 10,
                backgroundColor: active ? FILTER_ACTIVE_BG[f.value] : T.card,
                justifyContent: 'center', alignItems: 'center',
                borderWidth: 1,
                borderColor: active ? FILTER_ACTIVE_BORDER[f.value] : T.border,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: active ? color : T.muted, letterSpacing: 0.3 }}>
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {loading ? (
        <ActivityIndicator color={T.violet} style={{ marginTop: 60 }} />
      ) : (
        <SectionList<TransacaoData[], GroupedSection>
          sections={sections}
          keyExtractor={(items, index) => items[0]?.id ?? String(index)}
          renderItem={({ item: items }) => (
            <View style={{
              backgroundColor: T.card,
              marginHorizontal: 16, marginBottom: 8,
              borderRadius: 16,
              borderWidth: 1, borderColor: T.border,
              overflow: 'hidden',
            }}>
              {items.map((t, i) => (
                <TransactionItem
                  key={t.id}
                  item={t}
                  isLast={i === items.length - 1}
                  onDelete={handleDelete}
                  onPress={(transacao) => navigation.navigate('TransactionDetail', { transacao })}
                />
              ))}
            </View>
          )}
          renderSectionHeader={({ section: { title } }) => (
            <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 4, backgroundColor: T.bg }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: T.muted, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                {title}
              </Text>
            </View>
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(); }}
              tintColor={T.violet}
            />
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 80 }}>
              <View style={{
                width: 72, height: 72, borderRadius: 24,
                backgroundColor: T.card,
                borderWidth: 1, borderColor: T.border,
                justifyContent: 'center', alignItems: 'center',
                marginBottom: 16,
              }}>
                <Ionicons name="receipt-outline" size={32} color={T.muted} />
              </View>
              <Text style={{ color: T.sub, fontSize: 14, fontWeight: '600', textAlign: 'center' }}>
                {filter === 'todas' ? 'Nenhuma transação' : `Nenhuma ${filter === 'despesa' ? 'despesa' : 'receita'}`}
              </Text>
              <Text style={{ color: T.muted, fontSize: 12, marginTop: 4, textAlign: 'center' }}>
                {filter === 'todas' ? 'Adicione pelo botão + abaixo' : 'Tente outro filtro'}
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={true}
        />
      )}
    </SafeAreaView>
  );
}
