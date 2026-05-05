import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable,
  ActivityIndicator, RefreshControl, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { api, DashboardData, CategoriaData, MetaData, TransacaoData, DivisaoData } from '../../services/api';
import { formatCurrency, currentMonthParam } from '../../utils/format';
import { T } from '../../theme/tokens';
import { getCategoryColor } from '../../constants/categories';

const DISPLAY_FONT = Platform.OS === 'ios' ? 'Georgia' : 'serif';

function formatMonthDisplay(date: Date): string {
  const s = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);
  const parts = s.split(' ');
  return parts[0].charAt(0).toUpperCase() + parts[0].slice(1) + ' ' + parts[parts.length - 1];
}

function getUserInitials(nome?: string | null): string {
  if (!nome) return '?';
  return nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

// ─── AvatarPair ───────────────────────────────────────────────────
function AvatarPair({ initials, size = 30 }: { initials: string; size?: number }) {
  return (
    <View style={{ width: size * 1.65, height: size }}>
      <View style={{
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: T.violet,
        borderWidth: 2, borderColor: T.bg,
        justifyContent: 'center', alignItems: 'center',
        position: 'absolute', left: 0, zIndex: 2,
      }}>
        <Text style={{ fontSize: size * 0.32, fontWeight: '700', color: '#fff' }}>{initials}</Text>
      </View>
      <View style={{
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: T.pink,
        borderWidth: 2, borderColor: T.bg,
        justifyContent: 'center', alignItems: 'center',
        position: 'absolute', left: size * 0.62, zIndex: 1,
      }}>
        <Text style={{ fontSize: size * 0.44 }}>❤</Text>
      </View>
    </View>
  );
}

// ─── HeroCard ─────────────────────────────────────────────────────
function HeroCard({
  data,
  divisao,
  usuarioId,
  viewDate,
  onPrev,
  onNext,
}: {
  data: DashboardData;
  divisao: DivisaoData | null;
  usuarioId?: string;
  viewDate: Date;
  onPrev: () => void;
  onNext: () => void;
}) {
  const now = new Date();
  const isCurrentMonth = isSameMonth(viewDate, now);
  const isPositive = data.saldo >= 0;

  // Coloca o usuário logado na esquerda (violeta), parceiro na direita (rosa)
  const membros = divisao?.divisao ?? [];
  const eu = membros.find(m => m.usuario_id === usuarioId);
  const parceiro = membros.find(m => m.usuario_id !== usuarioId);
  const gastoEsq = eu?.gasto_real ?? 0;
  const gastoDir = parceiro?.gasto_real ?? 0;
  const totalConjunto = gastoEsq + gastoDir;
  const pctEsq = totalConjunto === 0 ? 50 : (gastoEsq / totalConjunto) * 100;
  const pctDir = totalConjunto === 0 ? 50 : (gastoDir / totalConjunto) * 100;
  const nomeEsq = eu?.usuario_nome?.split(' ')[0] ?? 'Você';
  const nomeDir = parceiro?.usuario_nome?.split(' ')[0] ?? 'Parceiro(a)';

  return (
    <View style={{
      marginTop: 14, marginHorizontal: 16,
      backgroundColor: '#1A1642',
      borderRadius: 24,
      borderWidth: 1, borderColor: 'rgba(124,106,247,0.2)',
      overflow: 'hidden',
      paddingVertical: 20, paddingHorizontal: 24,
    }}>
      {/* Orbs decorativos */}
      <View pointerEvents="none" style={{ position: 'absolute', top: -40, right: -30, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(124,106,247,0.08)' }} />
      <View pointerEvents="none" style={{ position: 'absolute', bottom: -30, left: -20, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(244,114,182,0.06)' }} />

      {/* Month picker */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <Pressable
          onPress={onPrev}
          style={({ pressed }) => ({
            width: 28, height: 28, borderRadius: 8,
            backgroundColor: 'rgba(255,255,255,0.07)',
            justifyContent: 'center', alignItems: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Ionicons name="chevron-back" size={14} color={T.text} />
        </Pressable>
        <Text style={{ fontSize: 12, color: T.sub, fontWeight: '600', letterSpacing: 0.5 }}>
          {formatMonthDisplay(viewDate)}
        </Text>
        <Pressable
          onPress={onNext}
          disabled={isCurrentMonth}
          style={({ pressed }) => ({
            width: 28, height: 28, borderRadius: 8,
            backgroundColor: 'rgba(255,255,255,0.07)',
            justifyContent: 'center', alignItems: 'center',
            opacity: isCurrentMonth ? 0.3 : pressed ? 0.7 : 1,
          })}
        >
          <Ionicons name="chevron-forward" size={14} color={T.text} />
        </Pressable>
      </View>

      {/* Saldo label */}
      <Text style={{ fontSize: 11, color: T.muted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>
        Saldo do Casal
      </Text>

      {/* Balance hero */}
      <Text style={{
        fontSize: 40, fontWeight: '800', letterSpacing: -2,
        color: isPositive ? T.text : T.rose,
        lineHeight: 44, marginBottom: 16,
        fontFamily: DISPLAY_FONT,
      }}>
        {formatCurrency(data.saldo)}
      </Text>

      {/* Income / Expense pills */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
        <View style={{
          flexDirection: 'row', alignItems: 'center', gap: 6,
          backgroundColor: 'rgba(34,211,165,0.1)',
          borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
          borderWidth: 1, borderColor: 'rgba(34,211,165,0.2)',
        }}>
          <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: T.emerald }} />
          <Text style={{ fontSize: 12, fontWeight: '700', color: T.emerald }}>
            +{formatCurrency(data.total_receitas)}
          </Text>
        </View>
        <View style={{
          flexDirection: 'row', alignItems: 'center', gap: 6,
          backgroundColor: 'rgba(248,113,113,0.1)',
          borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
          borderWidth: 1, borderColor: 'rgba(248,113,113,0.2)',
        }}>
          <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: T.rose }} />
          <Text style={{ fontSize: 12, fontWeight: '700', color: T.rose }}>
            -{formatCurrency(data.total_despesas)}
          </Text>
        </View>
      </View>

      {/* Couple contribution bar */}
      <View style={{ marginTop: 0 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
          <Text style={{ fontSize: 10, color: T.muted, letterSpacing: 1, textTransform: 'uppercase' }}>
            Contribuição do casal
          </Text>
          <Text style={{ fontSize: 10, color: T.sub }}>
            {`${Math.round(pctEsq)}% · ${Math.round(pctDir)}%`}
          </Text>
        </View>
        <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden', flexDirection: 'row' }}>
          <View style={{ height: '100%', width: `${pctEsq}%` as any, backgroundColor: T.violet }} />
          <View style={{ height: '100%', width: `${pctDir}%` as any, backgroundColor: T.pink }} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
          <Text style={{ fontSize: 11, color: T.sub }}>
            <Text style={{ color: T.violet, fontWeight: '700' }}>{nomeEsq}</Text>
            {` ${formatCurrency(gastoEsq)}`}
          </Text>
          <Text style={{ fontSize: 11, color: T.sub }}>
            <Text style={{ color: T.pink, fontWeight: '700' }}>{nomeDir}</Text>
            {` ${formatCurrency(gastoDir)}`}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── QuickActions ─────────────────────────────────────────────────
function QuickActions({ navigation }: { navigation: any }) {
  const actions = [
    { label: 'Adicionar', iconName: 'add' as const, color: T.violet, onPress: () => navigation.navigate('AddTransaction') },
    { label: 'Transações', iconName: 'swap-horizontal' as const, color: T.blue, onPress: () => navigation.navigate('Transacoes') },
    { label: 'Metas', iconName: 'flag' as const, color: T.pink, onPress: () => navigation.navigate('Metas') },
  ];

  return (
    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
      {actions.map(a => (
        <Pressable
          key={a.label}
          onPress={a.onPress}
          style={({ pressed }) => ({
            flex: 1, backgroundColor: T.card,
            borderWidth: 1, borderColor: T.border,
            borderRadius: 14, paddingTop: 10, paddingBottom: 8,
            alignItems: 'center', gap: 6,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <View style={{
            width: 36, height: 36, borderRadius: 11,
            backgroundColor: a.color + '18',
            justifyContent: 'center', alignItems: 'center',
          }}>
            <Ionicons name={a.iconName} size={17} color={a.color} />
          </View>
          <Text style={{ fontSize: 10, color: T.sub, fontWeight: '600' }}>{a.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────
function SectionHeader({ label, onViewAll }: { label: string; onViewAll: () => void }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <Text style={{ fontSize: 12, fontWeight: '700', color: T.sub, textTransform: 'uppercase', letterSpacing: 2 }}>
        {label}
      </Text>
      <Pressable onPress={onViewAll} hitSlop={8}>
        <Text style={{ fontSize: 11, color: T.violet, fontWeight: '600' }}>Ver tudo</Text>
      </Pressable>
    </View>
  );
}

// ─── CategorySection ──────────────────────────────────────────────
function CategorySection({ categorias, onViewAll }: { categorias: CategoriaData[]; onViewAll: () => void }) {
  const max = Math.max(...categorias.map(c => c.total), 1);

  return (
    <View style={{ marginBottom: 20 }}>
      <SectionHeader label="Por categoria" onViewAll={onViewAll} />
      <View style={{ backgroundColor: T.card, borderRadius: 18, borderWidth: 1, borderColor: T.border, padding: 16 }}>
        {categorias.slice(0, 5).map((cat, i) => {
          const cor = cat.cor ?? getCategoryColor(cat.categoria_nome);
          const pct = (cat.total / max) * 100;
          return (
            <View key={cat.categoria_id} style={{ marginBottom: i < Math.min(categorias.length, 5) - 1 ? 14 : 0 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: cor }} />
                  <Text style={{ fontSize: 13, color: T.text, fontWeight: '500' }}>{cat.categoria_nome}</Text>
                </View>
                <Text style={{ fontSize: 12, color: T.sub, fontWeight: '600' }}>{formatCurrency(cat.total)}</Text>
              </View>
              <View style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                <View style={{ height: '100%', width: `${pct}%` as any, backgroundColor: cor, borderRadius: 2 }} />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ─── MiniGoalRings ────────────────────────────────────────────────
function MiniGoalRings({ metas, onViewAll }: { metas: MetaData[]; onViewAll: () => void }) {
  if (metas.length === 0) return null;
  const RING = 64, STROKE = 5, R = (RING - STROKE) / 2, CIRC = 2 * Math.PI * R;

  return (
    <View style={{ marginBottom: 20 }}>
      <SectionHeader label="Metas" onViewAll={onViewAll} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
        {metas.slice(0, 3).map(g => {
          const pct = g.valor_alvo > 0 ? Math.min((g.valor_atual / g.valor_alvo) * 100, 100) : 0;
          const cor = g.cor ?? T.violet;
          const filled = (pct / 100) * CIRC;
          return (
            <Pressable
              key={g.id}
              onPress={onViewAll}
              style={({ pressed }) => ({
                backgroundColor: T.card, borderWidth: 1, borderColor: T.border,
                borderRadius: 16, padding: 12,
                alignItems: 'center', gap: 6, minWidth: 90,
                opacity: pressed ? 0.75 : 1,
              })}
            >
              <View style={{ position: 'relative', width: RING, height: RING }}>
                <Svg width={RING} height={RING} style={{ transform: [{ rotate: '-90deg' }] }}>
                  <Circle cx={RING / 2} cy={RING / 2} r={R} stroke="rgba(255,255,255,0.06)" strokeWidth={STROKE} fill="none" />
                  <Circle cx={RING / 2} cy={RING / 2} r={R} stroke={cor} strokeWidth={STROKE} fill="none"
                    strokeDasharray={`${filled} ${CIRC - filled}`} strokeLinecap="round" />
                </Svg>
                <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 20 }}>{pct >= 100 ? '✅' : (g.icone ?? '🎯')}</Text>
                </View>
              </View>
              <Text style={{ fontSize: 11, color: T.text, fontWeight: '600', textAlign: 'center', lineHeight: 14 }} numberOfLines={2}>
                {g.nome}
              </Text>
              <Text style={{ fontSize: 11, color: cor, fontWeight: '700' }}>{Math.round(pct)}%</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ─── TransactionRow ───────────────────────────────────────────────
function TransactionRow({ t }: { t: TransacaoData }) {
  const isReceita = t.tipo === 'receita';
  const cor = getCategoryColor(t.categoria_nome);
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center',
      padding: 13, paddingHorizontal: 16,
      borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
    }}>
      <View style={{
        width: 40, height: 40, borderRadius: 13,
        backgroundColor: cor + '18', borderWidth: 1, borderColor: cor + '28',
        justifyContent: 'center', alignItems: 'center', marginRight: 12,
      }}>
        <Ionicons name={isReceita ? 'trending-up' : 'trending-down'} size={16} color={cor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: T.text }} numberOfLines={1}>{t.descricao}</Text>
        <Text style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>
          {t.categoria_nome ?? (isReceita ? 'Receita' : 'Outros')}
          {t.usuario_nome ? ` · ${t.usuario_nome}` : ''}
        </Text>
      </View>
      <Text style={{ fontSize: 13, fontWeight: '700', color: isReceita ? T.emerald : T.rose }}>
        {isReceita ? '+' : '−'}{formatCurrency(t.valor)}
      </Text>
    </View>
  );
}

// ─── DashboardScreen ──────────────────────────────────────────────
export default function DashboardScreen() {
  const { token, usuario } = useAuth();
  const navigation = useNavigation<any>();

  const [viewDate, setViewDate] = useState(new Date());
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [categorias, setCategorias] = useState<CategoriaData[]>([]);
  const [metas, setMetas] = useState<MetaData[]>([]);
  const [divisao, setDivisao] = useState<DivisaoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const [dash, cats, goals, div] = await Promise.all([
        api.dashboard.resumo(token),
        api.dashboard.categorias(token, currentMonthParam(viewDate)),
        api.metas.listar(token),
        api.dashboard.divisao(token, currentMonthParam(viewDate)),
      ]);
      setDashboard(dash);
      setCategorias(cats);
      setMetas(goals);
      setDivisao(div);
    } catch {}
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, viewDate]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  function prevMonth() {
    setViewDate(d => {
      const n = new Date(d);
      n.setMonth(n.getMonth() - 1);
      return n;
    });
  }

  function nextMonth() {
    const now = new Date();
    if (!isSameMonth(viewDate, now)) {
      setViewDate(d => {
        const n = new Date(d);
        n.setMonth(n.getMonth() + 1);
        return n;
      });
    }
  }

  const userInitials = getUserInitials(usuario?.nome);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={{
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 24, paddingTop: 12, marginBottom: 4,
      }}>
        <View>
          <Text style={{ fontSize: 11, color: T.muted, marginBottom: 2, letterSpacing: 0.5 }} numberOfLines={1}>
            Olá, {usuario?.nome?.split(' ')[0]} 👋
          </Text>
          <Text style={{ fontSize: 20, fontWeight: '800', color: T.text, letterSpacing: -0.5 }}>
            FinançasFlow
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <AvatarPair initials={userInitials} size={30} />
          <Pressable
            style={({ pressed }) => ({
              width: 36, height: 36, borderRadius: 11,
              backgroundColor: T.card, borderWidth: 1, borderColor: T.border,
              justifyContent: 'center', alignItems: 'center',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Ionicons name="notifications-outline" size={17} color={T.sub} />
          </Pressable>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={T.violet} style={{ marginTop: 80 }} />
      ) : dashboard ? (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(); }}
              tintColor={T.violet}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <HeroCard data={dashboard} divisao={divisao} usuarioId={usuario?.id} viewDate={viewDate} onPrev={prevMonth} onNext={nextMonth} />

          <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
            <QuickActions navigation={navigation} />

            {categorias.length > 0 && (
              <CategorySection
                categorias={categorias}
                onViewAll={() => navigation.navigate('Transacoes')}
              />
            )}

            {(dashboard.transacoes_recentes?.length ?? 0) > 0 && (
              <View style={{ marginBottom: 20 }}>
                <SectionHeader label="Recentes" onViewAll={() => navigation.navigate('Transacoes')} />
                <View style={{ backgroundColor: T.card, borderRadius: 18, borderWidth: 1, borderColor: T.border, overflow: 'hidden' }}>
                  {dashboard.transacoes_recentes.slice(0, 4).map((t, i) => (
                    <View key={t.id} style={{ borderBottomWidth: i < Math.min(dashboard.transacoes_recentes.length, 4) - 1 ? 1 : 0, borderBottomColor: 'rgba(255,255,255,0.04)' }}>
                      <TransactionRow t={t} />
                    </View>
                  ))}
                </View>
              </View>
            )}

            <MiniGoalRings metas={metas} onViewAll={() => navigation.navigate('Metas')} />
          </View>
        </ScrollView>
      ) : (
        <View style={{ alignItems: 'center', marginTop: 80 }}>
          <Ionicons name="cloud-offline-outline" size={44} color={T.muted} />
          <Text style={{ color: T.sub, marginTop: 12, fontSize: 14 }}>
            Não foi possível carregar
          </Text>
          <Pressable
            onPress={() => { setLoading(true); load(); }}
            style={{ marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, backgroundColor: T.card, borderWidth: 1, borderColor: T.border }}
          >
            <Text style={{ color: T.violet, fontWeight: '600', fontSize: 13 }}>Tentar novamente</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}
