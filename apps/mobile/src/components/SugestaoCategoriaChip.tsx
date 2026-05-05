import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../theme/tokens';

interface Props {
  visible: boolean;
}

export function SugestaoCategoriaChip({ visible }: Props) {
  if (!visible) return null;
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center',
      paddingVertical: 8, gap: 6,
    }}>
      <Ionicons name="bulb-outline" size={12} color={T.violet} />
      <Text style={{ fontSize: 11, fontWeight: '500', color: T.muted }}>
        Categoria sugerida com base na descrição
      </Text>
    </View>
  );
}
