import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Platform,
  Switch,
  ScrollView,
  Alert
} from 'react-native';
import { useUser } from '@/contexts/UserContext';
import LanguageSelector from '@/components/LanguageSelector';
import { Language, Gender, ActivityLevel, Goal } from '@/types';
import i18n from '@/i18n';
import colors from '@/constants/colors';
import { TextInput } from 'react-native-gesture-handler';
import { ChevronDown, ChevronRight } from 'lucide-react-native';

export default function SettingsScreen() {
  const { user, setUserData, updateLanguage } = useUser();
  
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const [isNotificationsExpanded, setIsNotificationsExpanded] = useState(false);
  const [isLanguageExpanded, setIsLanguageExpanded] = useState(false);
  
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [goal, setGoal] = useState<Goal>('maintain');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  // Update local state when user data changes
  useEffect(() => {
    if (user) {
      setAge(user.age ? user.age.toString() : '');
      setGender(user.gender || 'male');
      setHeight(user.height ? user.height.toString() : '');
      setWeight(user.weight ? user.weight.toString() : '');
      setActivityLevel(user.activityLevel || 'moderate');
      setGoal(user.goal || 'maintain');
    }
  }, [user]);
  
  // Toggle sections
  const toggleProfileSection = () => setIsProfileExpanded(!isProfileExpanded);
  const toggleNotificationsSection = () => setIsNotificationsExpanded(!isNotificationsExpanded);
  const toggleLanguageSection = () => setIsLanguageExpanded(!isLanguageExpanded);
  
  // Handle language change
  const handleLanguageChange = (language: Language) => {
    updateLanguage(language);
  };
  
  // Handle profile update
  const handleProfileUpdate = async () => {
    const ageNum = parseInt(age, 10);
    const heightNum = parseInt(height, 10);
    const weightNum = parseInt(weight, 10);
    
    // Validation
    if (isNaN(ageNum) || ageNum <= 0 || ageNum > 120) {
      Alert.alert(
        'Неверный возраст',
        'Пожалуйста, введите корректный возраст (1-120 лет)',
        [{ text: 'OK' }]
      );
      return;
    }
    
    if (isNaN(heightNum) || heightNum <= 0 || heightNum > 300) {
      Alert.alert(
        'Неверный рост',
        'Пожалуйста, введите корректный рост (в сантиметрах)',
        [{ text: 'OK' }]
      );
      return;
    }
    
    if (isNaN(weightNum) || weightNum <= 0 || weightNum > 500) {
      Alert.alert(
        'Неверный вес',
        'Пожалуйста, введите корректный вес (в килограммах)',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Update user data
    await setUserData({ 
      age: ageNum,
      gender: gender,
      height: heightNum,
      weight: weightNum,
      activityLevel: activityLevel,
      goal: goal
    });
    
    Alert.alert(
      'Успешно',
      'Профиль обновлен успешно',
      [{ text: 'OK' }]
    );
  };
  
  // Handle notification toggle
  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    // Here you would typically save this preference and register/unregister for notifications
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{i18n.t('settingsTitle')}</Text>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Settings */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.sectionHeader} 
            onPress={toggleProfileSection}
          >
            <Text style={styles.sectionTitle}>{i18n.t('profileSettings')}</Text>
            {isProfileExpanded ? (
              <ChevronDown size={20} color={colors.neutral[500]} />
            ) : (
              <ChevronRight size={20} color={colors.neutral[500]} />
            )}
          </TouchableOpacity>
          
          {isProfileExpanded && (
            <View style={styles.sectionContent}>
              {/* Gender Field */}
              <Text style={styles.label}>{i18n.t('gender')}</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={[styles.radioButton, gender === 'male' && styles.radioSelected]}
                  onPress={() => setGender('male')}
                >
                  <Text style={[styles.radioText, gender === 'male' && styles.radioTextSelected]} numberOfLines={2} ellipsizeMode="tail">
                    {i18n.t('male')}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.radioButton, gender === 'female' && styles.radioSelected]}
                  onPress={() => setGender('female')}
                >
                  <Text style={[styles.radioText, gender === 'female' && styles.radioTextSelected]} numberOfLines={2} ellipsizeMode="tail">
                    {i18n.t('female')}
                  </Text>
                </TouchableOpacity>
              </View>
              
              {/* Age Field */}
              <Text style={styles.label}>{i18n.t('age')}</Text>
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                placeholder="25"
                keyboardType="numeric"
                placeholderTextColor={colors.neutral[400]}
              />
              
              {/* Height Field */}
              <Text style={styles.label}>{i18n.t('height')}</Text>
              <TextInput
                style={styles.input}
                value={height}
                onChangeText={setHeight}
                placeholder="175"
                keyboardType="numeric"
                placeholderTextColor={colors.neutral[400]}
              />
              
              {/* Weight Field */}
              <Text style={styles.label}>{i18n.t('weight')}</Text>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                placeholder="70"
                keyboardType="numeric"
                placeholderTextColor={colors.neutral[400]}
              />

              {/* Activity Level Field */}
              <Text style={styles.label}>{i18n.t('activityLevel')}</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={[styles.radioButton, activityLevel === 'sedentary' && styles.radioSelected]}
                  onPress={() => setActivityLevel('sedentary')}
                >
                  <Text style={[styles.radioText, activityLevel === 'sedentary' && styles.radioTextSelected]} numberOfLines={2} ellipsizeMode="tail">
                    {i18n.t('activityLevels.sedentary')}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.radioButton, activityLevel === 'light' && styles.radioSelected]}
                  onPress={() => setActivityLevel('light')}
                >
                  <Text style={[styles.radioText, activityLevel === 'light' && styles.radioTextSelected]} numberOfLines={2} ellipsizeMode="tail">
                    {i18n.t('activityLevels.light')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.radioButton, activityLevel === 'moderate' && styles.radioSelected]}
                  onPress={() => setActivityLevel('moderate')}
                >
                  <Text style={[styles.radioText, activityLevel === 'moderate' && styles.radioTextSelected]} numberOfLines={2} ellipsizeMode="tail">
                    {i18n.t('activityLevels.moderate')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.radioButton, activityLevel === 'active' && styles.radioSelected]}
                  onPress={() => setActivityLevel('active')}
                >
                  <Text style={[styles.radioText, activityLevel === 'active' && styles.radioTextSelected]} numberOfLines={2} ellipsizeMode="tail">
                    {i18n.t('activityLevels.active')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.radioButton, activityLevel === 'veryActive' && styles.radioSelected]}
                  onPress={() => setActivityLevel('veryActive')}
                >
                  <Text style={[styles.radioText, activityLevel === 'veryActive' && styles.radioTextSelected]} numberOfLines={2} ellipsizeMode="tail">
                    {i18n.t('activityLevels.veryActive')}
                  </Text>
                </TouchableOpacity>
              </View>
              {/* Описания уровней активности */}
              <View style={{marginBottom: 16}}>
                <Text style={{fontSize: 13, color: colors.neutral[500], marginBottom: 2}}>
                  <Text style={{fontWeight: 'bold'}}>{i18n.t('activityLevels.sedentary')}:</Text> {i18n.t('activityDescriptions.sedentary')}
                </Text>
                <Text style={{fontSize: 13, color: colors.neutral[500], marginBottom: 2}}>
                  <Text style={{fontWeight: 'bold'}}>{i18n.t('activityLevels.light')}:</Text> {i18n.t('activityDescriptions.light')}
                </Text>
                <Text style={{fontSize: 13, color: colors.neutral[500], marginBottom: 2}}>
                  <Text style={{fontWeight: 'bold'}}>{i18n.t('activityLevels.moderate')}:</Text> {i18n.t('activityDescriptions.moderate')}
                </Text>
                <Text style={{fontSize: 13, color: colors.neutral[500], marginBottom: 2}}>
                  <Text style={{fontWeight: 'bold'}}>{i18n.t('activityLevels.active')}:</Text> {i18n.t('activityDescriptions.active')}
                </Text>
                <Text style={{fontSize: 13, color: colors.neutral[500]}}>
                  <Text style={{fontWeight: 'bold'}}>{i18n.t('activityLevels.veryActive')}:</Text> {i18n.t('activityDescriptions.veryActive')}
                </Text>
              </View>

              {/* Goal Field */}
              <Text style={styles.label}>{i18n.t('goal')}</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={[styles.radioButton, goal === 'lose' && styles.radioSelected]}
                  onPress={() => setGoal('lose')}
                >
                  <Text style={[styles.radioText, goal === 'lose' && styles.radioTextSelected]} numberOfLines={2} ellipsizeMode="tail">
                    {i18n.t('goals.lose')}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.radioButton, goal === 'maintain' && styles.radioSelected]}
                  onPress={() => setGoal('maintain')}
                >
                  <Text style={[styles.radioText, goal === 'maintain' && styles.radioTextSelected]} numberOfLines={2} ellipsizeMode="tail">
                    {i18n.t('goals.maintain')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.radioButton, goal === 'gain' && styles.radioSelected]}
                  onPress={() => setGoal('gain')}
                >
                  <Text style={[styles.radioText, goal === 'gain' && styles.radioTextSelected]} numberOfLines={2} ellipsizeMode="tail">
                    {i18n.t('goals.gain')}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                style={styles.updateButton}
                onPress={handleProfileUpdate}
              >
                <Text style={styles.updateButtonText}>{i18n.t('updateProfile')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* Notification Settings */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.sectionHeader} 
            onPress={toggleNotificationsSection}
          >
            <Text style={styles.sectionTitle}>{i18n.t('notificationSettings')}</Text>
            {isNotificationsExpanded ? (
              <ChevronDown size={20} color={colors.neutral[500]} />
            ) : (
              <ChevronRight size={20} color={colors.neutral[500]} />
            )}
          </TouchableOpacity>
          
          {isNotificationsExpanded && (
            <View style={styles.sectionContent}>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>{i18n.t('enableNotifications')}</Text>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={toggleNotifications}
                  trackColor={{ false: colors.neutral[300], true: colors.primary[400] }}
                  thumbColor={notificationsEnabled ? colors.primary[500] : colors.neutral[100]}
                />
              </View>
              
              {notificationsEnabled && (
                <Text style={styles.notificationNote}>
                  Notification settings will be available in the PRO version.
                </Text>
              )}
            </View>
          )}
        </View>
        
        {/* Language Settings */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.sectionHeader} 
            onPress={toggleLanguageSection}
          >
            <Text style={styles.sectionTitle}>{i18n.t('languageSettings')}</Text>
            {isLanguageExpanded ? (
              <ChevronDown size={20} color={colors.neutral[500]} />
            ) : (
              <ChevronRight size={20} color={colors.neutral[500]} />
            )}
          </TouchableOpacity>
          
          {isLanguageExpanded && (
            <View style={styles.sectionContent}>
              <LanguageSelector
                selectedLanguage={user?.language || 'ru'}
                onSelectLanguage={handleLanguageChange}
              />
            </View>
          )}
        </View>
        
        {/* App Information */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>SnapCal v1.0.0</Text>
          <Text style={styles.appDescription}>
            Take photos of your meals to track calories.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 40 : 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.neutral[900],
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[800],
    fontFamily: 'Inter-SemiBold',
  },
  sectionContent: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    color: colors.neutral[600],
    marginBottom: 8,
    fontFamily: 'Inter-Regular',
  },
  input: {
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    fontFamily: 'Inter-Regular',
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  radioButton: {
    flexBasis: '48%',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
    alignItems: 'center',
    marginBottom: 8,
    minHeight: 48,
  },
  radioSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  radioText: {
    fontSize: 16,
    color: colors.neutral[600],
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  radioTextSelected: {
    color: colors.primary[700],
    fontWeight: '500',
  },
  updateButton: {
    backgroundColor: colors.primary[500],
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  updateButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: colors.neutral[800],
    fontFamily: 'Inter-Regular',
  },
  notificationNote: {
    fontSize: 12,
    color: colors.neutral[500],
    fontStyle: 'italic',
    fontFamily: 'Inter-Regular',
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 16,
  },
  appVersion: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[800],
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  appDescription: {
    fontSize: 14,
    color: colors.neutral[500],
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
});