import React from 'react';
import { View, Text, Pressable, Share, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { T } from '../../theme/tokens';

function getUserInitials(nome?: string | null): string {
  if (!nome) return '?';
  return nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{
        fontSize: 10, fontWeight: '700', letterSpacing: 2.5,
        color: T.muted, textTransform: 'uppercase',
        paddingHorizontal: 4, marginBottom: 8,
      }}>
        {label}
      </Text>
      <View style={{
        backgroundColor: T.card, borderRadius: 16,
        borderWidth: 1, borderColor: T.border, overflow: 'hidden',
      }}>
        {children}
      </View>
    </View>
  );
}

function MenuItem({
  icon,
  label,
  sublabel,
  onPress,
  danger,
  accent,
}: {
  icon: string;
  label: string;
  sublabel?: string;
  onPress: () => void;
  danger?: boolean;
  accent?: string;
}) {
  const color = danger ? T.rose : accent ?? T.sub;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row', alignItems: 'center',
        padding: 13, paddingHorizontal: 16,
        backgroundColor: pressed ? 'rgba(255,255,255,0.03)' : 'transparent',
        borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
      })}
    >
      <View style={{
        width: 34, height: 34, borderRadius: 10,
        backgroundColor: color + '15',
        borderWidth: 1, borderColor: color + '25',
        justifyContent: 'center', alignItems: 'center',
        marginRight: 12, flexShrink: 0,
      }}>
        <Ionicons name={icon as any} size={16} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, color: danger ? T.rose : T.text, fontWeight: '500' }}>
          {label}
        </Text>
        {sublabel && (
          <Text style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>{sublabel}</Text>
        )}
      </View>
      {!danger && <Ionicons name="chevron-forward" size={15} color={T.muted} />}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { usuario, domicilio, signOut } = useAuth();

  const initials = getUserInitials(usuario?.nome);

  function handleLogout() {
    Alert.alert('Sair', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOut },
    ]);
  }

  function handleConvidar() {
    if (!domicilio) return;
    Alert.alert(
      domicilio.nome,
      `Código de convite:\n\n${domicilio.codigo_convite}`,
      [
        { text: 'Fechar', style: 'cancel' },
        {
          text: 'Compartilhar',
          onPress: () => Share.share({
            message: `Olá! Te convido para gerenciarmos nossas finanças juntos no FinançasFlow.\n\n🏠 ${domicilio.nome}\n🔑 Código: ${domicilio.codigo_convite}\n\nBaixe o app e use esse código para entrar!`,
          }),
        },
      ],
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 0 }}>
        <Text style={{ fontSize: 20, fontWeight: '800', color: T.text, letterSpacing: -0.5 }}>
          Perfil
        </Text>
      </View>

      {/* Avatar hero */}
      <View style={{ alignItems: 'center', paddingTop: 20, paddingBottom: 16 }}>
        <View style={{ position: 'relative', marginBottom: 14 }}>
          {/* Glow ring */}
          <View style={{
            position: 'absolute', top: -8, left: -8, right: -8, bottom: -8,
            borderRadius: 46,
            backgroundColor: 'rgba(124,106,247,0.15)',
          }} />
          {/* Avatar principal */}
          <View style={{
            width: 76, height: 76, borderRadius: 38,
            backgroundColor: T.violet,
            justifyContent: 'center', alignItems: 'center',
            borderWidth: 2, borderColor: 'rgba(180,170,255,0.3)',
          }}>
            <Text style={{ fontSize: 26, fontWeight: '800', color: '#fff' }}>{initials}</Text>
          </View>
          {/* Avatar parceiro(a) */}
          <View style={{
            position: 'absolute', bottom: -4, right: -8,
            width: 34, height: 34, borderRadius: 17,
            backgroundColor: T.pink,
            borderWidth: 2, borderColor: T.bg,
            justifyContent: 'center', alignItems: 'center',
          }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>❤</Text>
          </View>
        </View>

        <Text style={{ fontSize: 18, fontWeight: '800', color: T.text, letterSpacing: -0.3, marginBottom: 2 }}>
          {usuario?.nome}
        </Text>
        <Text style={{ fontSize: 12, color: T.muted, marginBottom: 8 }}>{usuario?.email}</Text>

        {domicilio && (
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 6,
            backgroundColor: 'rgba(244,114,182,0.1)',
            borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5,
            borderWidth: 1, borderColor: 'rgba(244,114,182,0.2)',
          }}>
            <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: T.pink }} />
            <Text style={{ fontSize: 12, color: T.pink, fontWeight: '600' }}>
              {domicilio.nome}
            </Text>
          </View>
        )}
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} contentContainerStyle={{ paddingBottom: 8 }}
        showsVerticalScrollIndicator={false}>
        <Section label="Conta">
          <MenuItem icon="person-outline" label="Editar perfil" onPress={() => {}} accent={T.violet} />
          <MenuItem icon="lock-closed-outline" label="Alterar senha" onPress={() => {}} accent={T.violet} />
          <MenuItem
            icon="notifications-outline"
            label="Notificações"
            sublabel="WhatsApp e push"
            onPress={() => {}}
            accent={T.violet}
          />
        </Section>

        <Section label="Domicílio">
          <MenuItem
            icon="home-outline"
            label={domicilio?.nome ?? 'Meu domicílio'}
            sublabel={domicilio?.codigo_convite ? `Código: ${domicilio.codigo_convite}` : undefined}
            onPress={() => {}}
            accent={T.pink}
          />
          <MenuItem
            icon="person-add-outline"
            label="Convidar parceiro(a)"
            sublabel="Compartilhar código de acesso"
            onPress={handleConvidar}
            accent={T.pink}
          />
        </Section>

        <Section label="Sessão">
          <MenuItem icon="log-out-outline" label="Sair" onPress={handleLogout} danger />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}
