import React from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { T } from '../theme/tokens';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  loading: boolean;
  disabled: boolean;
}

export function CommandBar({ value, onChangeText, onSubmit, loading, disabled }: Props) {
  const canSubmit = !disabled && !loading && value.trim().length >= 3;

  return (
    <View style={{
      backgroundColor: T.card,
      borderWidth: 1,
      borderColor: T.violet + '30',
      borderRadius: 16,
      padding: 14,
      marginBottom: 24,
    }}>
      <Text style={{
        fontSize: 10, fontWeight: '700', letterSpacing: 3,
        color: T.muted, textTransform: 'uppercase',
        marginBottom: 8,
      }}>
        Captura Assistida
      </Text>

      <TextInput
        style={{
          color: T.text, fontSize: 15, lineHeight: 21,
          minHeight: 60, padding: 0,
          textAlignVertical: 'top',
        }}
        placeholder="Descreva a transação em uma frase"
        placeholderTextColor={T.muted}
        value={value}
        onChangeText={onChangeText}
        multiline
        editable={!loading}
      />

      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
        <Pressable
          onPress={onSubmit}
          disabled={!canSubmit}
          hitSlop={8}
          style={({ pressed }) => ({
            height: 36,
            paddingHorizontal: 16,
            borderRadius: 10,
            backgroundColor: canSubmit ? T.violet : T.violet + '40',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            gap: 6,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          {loading ? (
            <>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }}>
                Interpretando...
              </Text>
            </>
          ) : (
            <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }}>
              Interpretar
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
