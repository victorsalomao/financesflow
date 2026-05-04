import React from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { T } from '../../theme/tokens';
import { getCategoryColor, getCategoryEmoji } from '../../constants/categories';
import { formatCurrency, formatDateLong } from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'TransactionDetail'>;

function DetailRow({ label, value, isLast }: { label: string; value: string; isLast: boolean }) {
  return (
    <View style={{
      paddingHorizontal: 16, paddingVertical: 14,
      borderBottomWidth: isLast ? 0 : 1,
      borderBottomColor: 'rgba(255,255,255,0.05)',
    }}>
      <Text style={{
        fontSize: 10, fontWeight: '700', letterSpacing: 1.5,
        color: T.muted, textTransform: 'uppercase', marginBottom: 4,
      }}>
        {label}
      </Text>
      <Text style={{ fontSize: 15, color: T.text }}>{value}</Text>
    </View>
  );
}

export default function TransactionDetailScreen({ route, navigation }: Props) {
  const { transacao } = route.params;
  const { token } = useAuth();
  const isReceita = transacao.tipo === 'receita';
  const accentColor = isReceita ? T.emerald : T.rose;
  const cor = getCategoryColor(transacao.categoria_nome);
  const emoji = getCategoryEmoji(transacao.categoria_nome);

  function handleExcluir() {
    Alert.alert(
      'Excluir transação',
      `Excluir "${transacao.descricao}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.transacoes.deletar(transacao.id, token!);
              navigation.goBack();
            } catch (e: unknown) {
              Alert.alert('Erro', e instanceof Error ? e.message : 'Não foi possível excluir.');
            }
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center',
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
          <Ionicons name="chevron-back" size={20} color={T.sub} />
        </Pressable>
        <Text style={{
          flex: 1, textAlign: 'center', fontSize: 16,
          fontWeight: '700', color: T.text, letterSpacing: -0.3,
          marginRight: 36,
        }}>
          Detalhes
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        {/* Hero */}
        <View style={{ alignItems: 'center', marginTop: 24, marginBottom: 32 }}>
          <View style={{
            width: 88, height: 88, borderRadius: 28,
            backgroundColor: cor + '22',
            borderWidth: 1, borderColor: cor + '40',
            justifyContent: 'center', alignItems: 'center',
            marginBottom: 18,
          }}>
            <Text style={{ fontSize: 40 }}>{emoji}</Text>
          </View>
          <Text style={{
            fontSize: 40, fontWeight: '800', color: accentColor,
            letterSpacing: -1.5,
          }}>
            {isReceita ? '+' : '−'}{formatCurrency(transacao.valor)}
          </Text>
          <Text style={{ fontSize: 12, color: T.muted, marginTop: 4, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase' }}>
            {isReceita ? 'Receita' : 'Despesa'}
          </Text>
        </View>

        {/* Lista de campos */}
        <View style={{
          backgroundColor: T.card, borderRadius: 16,
          borderWidth: 1, borderColor: T.border,
          overflow: 'hidden',
        }}>
          <DetailRow label="Descrição" value={transacao.descricao} isLast={false} />
          <DetailRow
            label="Categoria"
            value={transacao.categoria_nome ? `${emoji} ${transacao.categoria_nome}` : 'Sem categoria'}
            isLast={false}
          />
          <DetailRow label="Data" value={formatDateLong(transacao.data)} isLast={false} />
          <DetailRow label="Registrado por" value={transacao.usuario_nome ?? '—'} isLast={true} />
        </View>
      </ScrollView>

      {/* Botões fixos */}
      <View style={{
        flexDirection: 'row', gap: 12,
        paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16,
        borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
        backgroundColor: T.bg,
      }}>
        <Pressable
          onPress={() => navigation.navigate('EditTransaction', { transacao })}
          style={({ pressed }) => ({
            flex: 1, height: 50, borderRadius: 12,
            backgroundColor: T.card, borderWidth: 1, borderColor: T.border,
            justifyContent: 'center', alignItems: 'center',
            flexDirection: 'row', gap: 8,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Ionicons name="create-outline" size={18} color={T.text} />
          <Text style={{ color: T.text, fontSize: 15, fontWeight: '700' }}>Editar</Text>
        </Pressable>
        <Pressable
          onPress={handleExcluir}
          style={({ pressed }) => ({
            flex: 1, height: 50, borderRadius: 12,
            backgroundColor: 'rgba(248,113,113,0.10)',
            borderWidth: 1, borderColor: 'rgba(248,113,113,0.35)',
            justifyContent: 'center', alignItems: 'center',
            flexDirection: 'row', gap: 8,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Ionicons name="trash-outline" size={18} color={T.rose} />
          <Text style={{ color: T.rose, fontSize: 15, fontWeight: '700' }}>Excluir</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
