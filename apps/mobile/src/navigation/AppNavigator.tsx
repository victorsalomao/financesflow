import React from 'react';
import { Pressable, View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import TransactionListScreen from '../screens/transactions/TransactionListScreen';
import GoalsScreen from '../screens/goals/GoalsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from './RootNavigator';

export type AppTabParamList = {
  Dashboard: undefined;
  Transacoes: undefined;
  AddTab: undefined;
  Metas: undefined;
  Perfil: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();

const BG = '#09091A';
const VIOLET = '#7C6AF7';
const MUTED = '#4A4869';

function FABTabButton() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <Pressable
      onPress={() => navigation.navigate('AddTransaction')}
      style={({ pressed }) => ({
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        opacity: pressed ? 0.88 : 1,
      })}
    >
      {/* Glow layer */}
      <View style={{
        position: 'absolute',
        width: 60, height: 60, borderRadius: 30,
        backgroundColor: 'rgba(124,106,247,0.25)',
        transform: [{ scale: 1.3 }],
      }} />
      {/* Button */}
      <View style={{
        width: 60, height: 60, borderRadius: 30,
        backgroundColor: VIOLET,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(180,170,255,0.4)',
        shadowColor: VIOLET,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.6,
        shadowRadius: 14,
        elevation: 10,
      }}>
        <Ionicons name="add" size={28} color="#FFF" />
      </View>
    </Pressable>
  );
}

function PlaceholderScreen() {
  return <View style={{ flex: 1, backgroundColor: BG }} />;
}

function TabIcon({
  name,
  nameFocused,
  focused,
  label,
}: {
  name: keyof typeof Ionicons.glyphMap;
  nameFocused: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  label: string;
}) {
  return (
    <View style={{ alignItems: 'center', paddingTop: 4 }}>
      <Ionicons
        name={focused ? nameFocused : name}
        size={22}
        color={focused ? VIOLET : MUTED}
      />
      <Text style={{
        fontSize: 10, fontWeight: focused ? '700' : '500',
        color: focused ? VIOLET : MUTED,
        marginTop: 3,
        letterSpacing: 0.3,
      }}>
        {label}
      </Text>
      {focused && (
        <View style={{
          width: 18, height: 2.5, borderRadius: 2,
          backgroundColor: VIOLET,
          marginTop: 3,
        }} />
      )}
    </View>
  );
}

export function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0E0F1E',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.05)',
          height: 82,
          paddingBottom: 0,
          paddingTop: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.4,
          shadowRadius: 16,
          elevation: 20,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="grid-outline" nameFocused="grid" focused={focused} label="Início" />
          ),
        }}
      />
      <Tab.Screen
        name="Transacoes"
        component={TransactionListScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="swap-horizontal-outline" nameFocused="swap-horizontal" focused={focused} label="Transações" />
          ),
        }}
      />
      <Tab.Screen
        name="AddTab"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: '',
          tabBarButton: () => <FABTabButton />,
        }}
      />
      <Tab.Screen
        name="Metas"
        component={GoalsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="flag-outline" nameFocused="flag" focused={focused} label="Metas" />
          ),
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="people-outline" nameFocused="people" focused={focused} label="Perfil" />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
