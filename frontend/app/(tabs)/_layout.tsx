import React from 'react';
import { Tabs } from 'expo-router';
import { Camera, History, Settings as SettingsIcon } from 'lucide-react-native';
import colors from '@/constants/colors';
import i18n from '@/i18n';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary[500],
          tabBarInactiveTintColor: colors.neutral[400],
          tabBarStyle: {
            borderTopColor: colors.neutral[200],
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontFamily: 'Inter-Medium',
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: i18n.t('appName'),
            tabBarIcon: ({ color, size }) => (
              <Camera size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: i18n.t('historyTitle'),
            tabBarIcon: ({ color, size }) => (
              <History size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: i18n.t('settingsTitle'),
            tabBarIcon: ({ color, size }) => (
              <SettingsIcon size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});