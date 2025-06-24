import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Alert,
  Animated,
  SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import i18n from '@/i18n';
import colors from '@/constants/colors';
import { Gender, ActivityLevel } from '@/utils/calorieCalculator';
import { Goal } from '@/types';
import { useUser } from '@/contexts/UserContext';

export default function ProfileSetupScreen() {
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [goal, setGoal] = useState<Goal>('maintain');
  const [loading, setLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const router = useRouter();
  const [animationEnded, setAnimationEnded] = useState(false);
  const { reloadUser } = useUser();

  const showSuccessNotification = () => {
    setShowSuccessMessage(true);
    setAnimationEnded(false);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowSuccessMessage(false);
        setAnimationEnded(true);
      });
    }, 2000);
  };

  useEffect(() => {
    if (animationEnded) {
      router.replace('/(tabs)');
    }
  }, [animationEnded, router]);

  // Расчёт дневной нормы калорий (формула Миффлина-Сан Жеора)
  const calculateDailyCalories = (age: number, gender: Gender, height: number, weight: number, activityLevel: ActivityLevel, goal: Goal) => {
    // Базовый метаболизм (BMR)
    let bmr = 0;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Коэффициенты активности
    const activityMultipliers = {
      sedentary: 1.2,      // Сидячий образ жизни
      light: 1.375,        // Лёгкая активность
      moderate: 1.55,      // Умеренная активность
      active: 1.725,       // Высокая активность
      veryActive: 1.9      // Очень высокая активность
    };

    // Общий расход энергии (TDEE)
    const tdee = bmr * activityMultipliers[activityLevel];

    // Корректировка в зависимости от цели
    let dailyCalories = tdee;
    if (goal === 'lose') {
      dailyCalories = tdee - 500; // Дефицит 500 калорий для похудения
    } else if (goal === 'gain') {
      dailyCalories = tdee + 300; // Профицит 300 калорий для набора веса
    }

    return Math.round(dailyCalories);
  };

  const handleProfileSetup = async () => {
    const ageNum = parseInt(age, 10);
    const heightNum = parseInt(height, 10);
    const weightNum = parseInt(weight, 10);
    
    // Валидация
    if (isNaN(ageNum) || ageNum <= 0 || ageNum > 120) {
      Alert.alert(i18n.t('error'), 'Пожалуйста, введите корректный возраст (1-120 лет)');
      return;
    }
    
    if (isNaN(heightNum) || heightNum <= 0 || heightNum > 300) {
      Alert.alert(i18n.t('error'), 'Пожалуйста, введите корректный рост (в сантиметрах)');
      return;
    }
    
    if (isNaN(weightNum) || weightNum <= 0 || weightNum > 500) {
      Alert.alert(i18n.t('error'), 'Пожалуйста, введите корректный вес (в килограммах)');
      return;
    }

    setLoading(true);
    try {
      // Получаем токен и данные пользователя
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      
      if (!token || !userData) {
        Alert.alert(i18n.t('error'), 'Ошибка авторизации');
        return;
      }

      const user = JSON.parse(userData);
      const dailyCalories = calculateDailyCalories(ageNum, gender, heightNum, weightNum, activityLevel, goal);

      // Обновляем профиль на сервере
      const response = await fetch('https://snapcal.fun/api/users/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          age: ageNum,
          gender,
          height: heightNum,
          weight: weightNum,
          activityLevel,
          goal,
          dailyCalories
        }),
      });

      const data = await response.json();
      
      console.log('Server response:', data); // Временно для диагностики

      if (response.ok && data.success) {
        // Получаем актуальные данные (они могут быть в data.data.user или data.data)
        const responseData = data.data.user || data.data;
        
        // Обновляем данные пользователя локально
        const updatedUser = {
          ...user,
          age: responseData.age,
          gender: responseData.gender,
          height: responseData.height,
          weight: responseData.weight,
          activityLevel: responseData.activity_level,
          goal: responseData.goal,
          dailyCalories: responseData.dailyCalories
        };

        console.log('Saving user data:', updatedUser); // Для диагностики
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Перезагружаем данные в UserContext
        await reloadUser();
        
        showSuccessNotification();
      } else {
        Alert.alert(i18n.t('error'), data.error || 'Ошибка обновления профиля');
      }
    } catch (e) {
      Alert.alert(i18n.t('error'), 'Не удалось сохранить профиль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {showSuccessMessage && (
          <Animated.View style={[styles.successNotification, { opacity: fadeAnim }]}>
            <Text style={styles.successText}>{i18n.t('profileSetupSuccess')}</Text>
          </Animated.View>
        )}
        
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text style={styles.title}>{i18n.t('profileSetup')}</Text>
            <Text style={styles.subtitle}>{i18n.t('fillDataForCalories')}</Text>
            
            {/* Пол */}
            <Text style={styles.label}>{i18n.t('gender')}</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={[styles.radioButton, gender === 'male' && styles.radioSelected]}
                onPress={() => setGender('male')}
              >
                <Text style={[styles.radioText, gender === 'male' && styles.radioTextSelected]}>
                  {i18n.t('male')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.radioButton, gender === 'female' && styles.radioSelected]}
                onPress={() => setGender('female')}
              >
                <Text style={[styles.radioText, gender === 'female' && styles.radioTextSelected]}>
                  {i18n.t('female')}
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Возраст */}
            <Text style={styles.label}>{i18n.t('age')}</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              placeholder="25"
              keyboardType="numeric"
              placeholderTextColor={colors.neutral[400]}
            />
            
            {/* Рост */}
            <Text style={styles.label}>{i18n.t('height')} (см)</Text>
            <TextInput
              style={styles.input}
              value={height}
              onChangeText={setHeight}
              placeholder="175"
              keyboardType="numeric"
              placeholderTextColor={colors.neutral[400]}
            />
            
            {/* Вес */}
            <Text style={styles.label}>{i18n.t('weight')} (кг)</Text>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              placeholder="70"
              keyboardType="numeric"
              placeholderTextColor={colors.neutral[400]}
            />

            {/* Уровень активности */}
            <Text style={styles.label}>{i18n.t('activityLevel')}</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={[styles.radioButton, activityLevel === 'sedentary' && styles.radioSelected]}
                onPress={() => setActivityLevel('sedentary')}
              >
                <Text style={[styles.radioText, activityLevel === 'sedentary' && styles.radioTextSelected]}>
                  {i18n.t('activityLevels.sedentary')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.radioButton, activityLevel === 'light' && styles.radioSelected]}
                onPress={() => setActivityLevel('light')}
              >
                <Text style={[styles.radioText, activityLevel === 'light' && styles.radioTextSelected]}>
                  {i18n.t('activityLevels.light')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.radioButton, activityLevel === 'moderate' && styles.radioSelected]}
                onPress={() => setActivityLevel('moderate')}
              >
                <Text style={[styles.radioText, activityLevel === 'moderate' && styles.radioTextSelected]}>
                  {i18n.t('activityLevels.moderate')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.radioButton, activityLevel === 'active' && styles.radioSelected]}
                onPress={() => setActivityLevel('active')}
              >
                <Text style={[styles.radioText, activityLevel === 'active' && styles.radioTextSelected]}>
                  {i18n.t('activityLevels.active')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.radioButton, activityLevel === 'veryActive' && styles.radioSelected]}
                onPress={() => setActivityLevel('veryActive')}
              >
                <Text style={[styles.radioText, activityLevel === 'veryActive' && styles.radioTextSelected]}>
                  {i18n.t('activityLevels.veryActive')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Цель */}
            <Text style={styles.label}>{i18n.t('goal')}</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={[styles.radioButton, goal === 'lose' && styles.radioSelected]}
                onPress={() => setGoal('lose')}
              >
                <Text style={[styles.radioText, goal === 'lose' && styles.radioTextSelected]}>
                  {i18n.t('goals.lose')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.radioButton, goal === 'maintain' && styles.radioSelected]}
                onPress={() => setGoal('maintain')}
              >
                <Text style={[styles.radioText, goal === 'maintain' && styles.radioTextSelected]}>
                  {i18n.t('goals.maintain')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.radioButton, goal === 'gain' && styles.radioSelected]}
                onPress={() => setGoal('gain')}
              >
                <Text style={[styles.radioText, goal === 'gain' && styles.radioTextSelected]}>
                  {i18n.t('goals.gain')}
                </Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleProfileSetup}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? i18n.t('loading') : i18n.t('saveProfile')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  successNotification: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: colors.success[500] || '#10B981',
    padding: 16,
    borderRadius: 12,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  successText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: colors.primary[400],
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
    color: colors.neutral[600],
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[800],
    marginBottom: 12,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.primary[400],
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: colors.white,
    color: '#333',
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
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  radioTextSelected: {
    color: colors.primary[700],
    fontWeight: '500',
  },
  button: {
    backgroundColor: colors.primary[400],
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: colors.primary[400],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: '#FFB088',
    shadowOpacity: 0.1,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  keyboardView: {
    flex: 1,
  },
}); 