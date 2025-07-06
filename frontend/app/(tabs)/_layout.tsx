import colors from '@/constants/colors';
import { Camera, History, Settings as SettingsIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Импортируем компоненты страниц напрямую
import HistoryScreen from './history';
import HomeScreen from './index';
import SettingsScreen from './settings';

export default function TabLayout() {
  const [activeTab, setActiveTab] = useState('index');

  const renderScreen = () => {
    switch (activeTab) {
      case 'index':
        return <HomeScreen />;
      case 'history':
        return <HistoryScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {renderScreen()}
      </View>
      
      {/* Custom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'index' && styles.activeTab]}
          onPress={() => setActiveTab('index')}
        >
          <Camera 
            size={24} 
            color={activeTab === 'index' ? colors.primary[500] : colors.neutral[400]} 
          />
          <Text style={[
            styles.tabLabel, 
            activeTab === 'index' && styles.activeTabLabel
          ]}>
            SlimIQ
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <History 
            size={24} 
            color={activeTab === 'history' ? colors.primary[500] : colors.neutral[400]} 
          />
          <Text style={[
            styles.tabLabel, 
            activeTab === 'history' && styles.activeTabLabel
          ]}>
            История
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'settings' && styles.activeTab]}
          onPress={() => setActiveTab('settings')}
        >
          <SettingsIcon 
            size={24} 
            color={activeTab === 'settings' ? colors.primary[500] : colors.neutral[400]} 
          />
          <Text style={[
            styles.tabLabel, 
            activeTab === 'settings' && styles.activeTabLabel
          ]}>
            Настройки
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    paddingBottom: 20,
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    // Можно добавить дополнительные стили для активной вкладки
  },
  tabLabel: {
    fontSize: 12,
    color: colors.neutral[400],
    marginTop: 4,
    textAlign: 'center',
  },
  activeTabLabel: {
    color: colors.primary[500],
    fontWeight: '600',
  },
});