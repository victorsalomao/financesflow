import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { T } from '../theme/tokens';
import { formatCurrency } from '../utils/format';
import type { InterpretacaoResposta } from '../services/api';

interface Props {
  interpretacao: InterpretacaoResposta;
  onAplicar: () => void;
  onDescartar: () => void;
  // Quando true, mostra estado de erro (não há nada utilizável na interpretação)
  modoErro?: boolean;
  mensagemErro?: string;
}

function corDaConfianca(c: number): string {
  if (c >= 0.85) return T.emerald;
  if (c >= 0.6) return T.text;
  return T.amber;
}

function formatarDataBR(iso: string | null): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function formatarTipo(tipo: 'despesa' | 'receita' | null): string {
  if (tipo === 'despesa') return 'Despesa';
  if (tipo === 'receita') return 'Receita';
  return '';
}

function Linha({ label, valor, ausente, sufixo }: {
  label: string; valor: string; ausente?: boolean; sufixo?: string;
}) {
  return (
    <View style={{
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'flex-start', paddingVertical: 6,
    }}>
      <Text style={{ fontSize: 12, color: T.muted, fontWeight: '500' }}>
        {label}
      </Text>
      <View style={{ flex: 1, alignItems: 'flex-end', marginLeft: 12 }}>
        {ausente ? (
          <Text style={{ fontSize: 13, color: T.amber, fontWeight: '500' }}>
            ⚠ Não detectada
          </Text>
        ) : (
          <>
            <Text style={{ fontSize: 15, color: T.text, textAlign: 'right' }}>
              {valor}
            </Text>
            {sufixo ? (
              <Text style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
                {sufixo}
              </Text>
            ) : null}
          </>
        )}
      </View>
    </View>
  );
}

export function PreviewCard({
  interpretacao, onAplicar, onDescartar, modoErro, mensagemErro,
}: Props) {
  if (modoErro) {
    return (
      <View style={{
        backgroundColor: T.card,
        borderWidth: 1, borderColor: T.amber + '50',
        borderRadius: 18, padding: 20, marginBottom: 24,
      }}>
        <Text style={{
          fontSize: 10, fontWeight: '700', letterSpacing: 3,
          color: T.muted, textTransform: 'uppercase',
          marginBottom: 12,
        }}>
          Não foi possível interpretar
        </Text>
        <Text style={{ fontSize: 14, color: T.text, marginBottom: 16, lineHeight: 20 }}>
          {mensagemErro ?? 'Tente reformular a frase ou preencha os campos manualmente.'}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <Pressable
            onPress={onDescartar}
            style={({ pressed }) => ({
              height: 36, paddingHorizontal: 16, borderRadius: 10,
              borderWidth: 1, borderColor: T.border,
              justifyContent: 'center', alignItems: 'center',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ color: T.sub, fontSize: 13, fontWeight: '700' }}>Fechar</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const i = interpretacao;
  const corConfianca = corDaConfianca(i.confianca_geral);

  return (
    <View style={{
      backgroundColor: T.card,
      borderWidth: 1, borderColor: T.violet + '50',
      borderRadius: 18, padding: 20, marginBottom: 24,
    }}>
      <Text style={{
        fontSize: 10, fontWeight: '700', letterSpacing: 3,
        color: T.muted, textTransform: 'uppercase',
        marginBottom: 12,
      }}>
        Interpretação
      </Text>

      <Linha label="Descrição" valor={i.descricao ?? ''} ausente={!i.descricao} />
      <Linha label="Valor" valor={i.valor != null ? formatCurrency(i.valor) : ''} ausente={i.valor == null} />
      <Linha label="Data" valor={formatarDataBR(i.data_transacao)} ausente={!i.data_transacao} />
      <Linha label="Tipo" valor={formatarTipo(i.tipo)} ausente={!i.tipo} />
      <Linha label="Categoria" valor={i.categoria_nome ?? ''} ausente={!i.categoria_nome} />

      <View style={{ height: 1, backgroundColor: T.border, marginVertical: 12 }} />

      <View style={{
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 16,
      }}>
        <Text style={{ fontSize: 12, color: T.muted, fontWeight: '500' }}>Confiança</Text>
        <Text style={{ fontSize: 14, color: corConfianca, fontWeight: '700' }}>
          {Math.round(i.confianca_geral * 100)}%
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Pressable
          onPress={onDescartar}
          style={({ pressed }) => ({
            flex: 1, height: 44, borderRadius: 12,
            borderWidth: 1, borderColor: T.border,
            justifyContent: 'center', alignItems: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ color: T.sub, fontSize: 14, fontWeight: '700' }}>Descartar</Text>
        </Pressable>
        <Pressable
          onPress={onAplicar}
          style={({ pressed }) => ({
            flex: 1, height: 44, borderRadius: 12,
            backgroundColor: T.violet,
            justifyContent: 'center', alignItems: 'center',
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>Aplicar</Text>
        </Pressable>
      </View>
    </View>
  );
}
