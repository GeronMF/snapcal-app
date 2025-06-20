import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@/contexts/UserContext';
import { isOnboarded, setOnboarded } from '@/utils/storage';
import LanguageSelector from '@/components/LanguageSelector';
import { OnboardingStep, Language, Gender, Goal, FormErrors } from '@/types';
import i18n from '@/i18n';
import colors from '@/constants/colors';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

export default function OnboardingScreen() {
  const router = useRouter();
  const { setUserData, calculateCalorieTarget } = useUser();
  
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('language');
  const [language, setLanguage] = useState<Language>('en');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<Gender>('male');
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [goal, setGoal] = useState<Goal>('maintain');
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Check if user has completed onboarding
  useEffect(() => {
    async function checkOnboarding() {
      const onboarded = await isOnboarded();
      if (onboarded) {
        router.replace('/(tabs)');
      }
    }
    
    checkOnboarding();
  }, [router]);
  
  // Handle language selection
  const handleLanguageChange = (selectedLanguage: Language) => {
    setLanguage(selectedLanguage);
    i18n.locale = selectedLanguage;
  };
  
  // Input validation
  const validateInputs = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (currentStep === 'personal') {
      if (!age || parseInt(age, 10) <= 0) newErrors.age = 'Please enter a valid age';
      if (!height || parseInt(height, 10) <= 0) newErrors.height = 'Please enter a valid height';
      if (!weight || parseInt(weight, 10) <= 0) newErrors.weight = 'Please enter a valid weight';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Navigate to next step
  const handleNext = () => {
    if (!validateInputs()) return;
    
    switch (currentStep) {
      case 'language':
        setCurrentStep('personal');
        break;
      case 'personal':
        setCurrentStep('goals');
        break;
      case 'goals':
        completeOnboarding();
        break;
    }
  };
  
  // Navigate to previous step
  const handleBack = () => {
    switch (currentStep) {
      case 'personal':
        setCurrentStep('language');
        break;
      case 'goals':
        setCurrentStep('personal');
        break;
      default:
        break;
    }
  };
  
  // Complete onboarding and save user data
  const completeOnboarding = async () => {
    const ageNum = parseInt(age, 10);
    const heightNum = parseInt(height, 10);
    const weightNum = parseInt(weight, 10);
    
    // Calculate daily calorie target
    const dailyCalorieTarget = calculateCalorieTarget(ageNum, gender, heightNum, weightNum, goal);
    
    // Save user data
    await setUserData({
      language,
      age: ageNum,
      gender,
      height: heightNum,
      weight: weightNum,
      goal,
      dailyCalorieTarget,
    });
    
    // Mark onboarding as complete
    await setOnboarded(true);
    
    // Navigate to main app
    router.replace('/(tabs)');
  };
  
  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'language':
        return (
          <LanguageSelector
            selectedLanguage={language}
            onSelectLanguage={handleLanguageChange}
          />
        );
      case 'personal':
        return (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>{i18n.t('personalInfo')}</Text>
            
            <Text style={styles.label}>{i18n.t('age')}</Text>
            <TextInput
              style={[styles.input, errors.age && styles.inputError]}
              value={age}
              onChangeText={setAge}
              placeholder="25"
              keyboardType="numeric"
              placeholderTextColor={colors.neutral[400]}
            />
            {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
            
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
            
            <Text style={styles.label}>{i18n.t('height')}</Text>
            <TextInput
              style={[styles.input, errors.height && styles.inputError]}
              value={height}
              onChangeText={setHeight}
              placeholder="175"
              keyboardType="numeric"
              placeholderTextColor={colors.neutral[400]}
            />
            {errors.height && <Text style={styles.errorText}>{errors.height}</Text>}
            
            <Text style={styles.label}>{i18n.t('weight')}</Text>
            <TextInput
              style={[styles.input, errors.weight && styles.inputError]}
              value={weight}
              onChangeText={setWeight}
              placeholder="70"
              keyboardType="numeric"
              placeholderTextColor={colors.neutral[400]}
            />
            {errors.weight && <Text style={styles.errorText}>{errors.weight}</Text>}
          </View>
        );
      case 'goals':
        return (
          <View style={styles.goalsContainer}>
            <Text style={styles.formTitle}>{i18n.t('goal')}</Text>
            
            <TouchableOpacity
              style={[styles.goalButton, goal === 'lose' && styles.goalSelected]}
              onPress={() => setGoal('lose')}
            >
              <Text style={[styles.goalText, goal === 'lose' && styles.goalTextSelected]}>
                {i18n.t('goalLose')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.goalButton, goal === 'maintain' && styles.goalSelected]}
              onPress={() => setGoal('maintain')}
            >
              <Text style={[styles.goalText, goal === 'maintain' && styles.goalTextSelected]}>
                {i18n.t('goalMaintain')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.goalButton, goal === 'gain' && styles.goalSelected]}
              onPress={() => setGoal('gain')}
            >
              <Text style={[styles.goalText, goal === 'gain' && styles.goalTextSelected]}>
                {i18n.t('goalGain')}
              </Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{i18n.t('onboardingTitle')}</Text>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderStepContent()}
      </ScrollView>
      
      <View style={styles.footer}>
        {currentStep !== 'language' && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ChevronLeft size={20} color={colors.neutral[600]} />
            <Text style={styles.backButtonText}>{i18n.t('back')}</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentStep === 'goals' ? i18n.t('done') : i18n.t('next')}
          </Text>
          {currentStep !== 'goals' && (
            <ChevronRight size={20} color={colors.white} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: colors.neutral[900],
    textAlign: 'center',
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  formContainer: {
    padding: 24,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: colors.neutral[800],
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: colors.neutral[700],
    marginBottom: 8,
    fontFamily: 'Inter-Medium',
  },
  input: {
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    fontFamily: 'Inter-Regular',
  },
  inputError: {
    borderColor: colors.error[500],
  },
  errorText: {
    color: colors.error[500],
    fontSize: 14,
    marginTop: -12,
    marginBottom: 16,
    fontFamily: 'Inter-Regular',
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  radioButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  radioSelected: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  radioText: {
    color: colors.neutral[800],
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  radioTextSelected: {
    color: colors.white,
    fontWeight: '500',
  },
  goalsContainer: {
    padding: 24,
  },
  goalButton: {
    padding: 16,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  goalSelected: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  goalText: {
    color: colors.neutral[800],
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  goalTextSelected: {
    color: colors.white,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  backButtonText: {
    color: colors.neutral[600],
    fontSize: 16,
    marginLeft: 4,
    fontFamily: 'Inter-Medium',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[500],
    padding: 12,
    borderRadius: 8,
    minWidth: 100,
    justifyContent: 'center',
  },
  nextButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '500',
    marginRight: 4,
    fontFamily: 'Inter-Medium',
  },
});