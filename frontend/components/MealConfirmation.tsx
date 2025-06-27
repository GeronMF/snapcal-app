import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ScrollView,
} from 'react-native';
import i18n from '../i18n';
import colors from '../constants/colors';

type MealConfirmationProps = {
  imageUri: string;
  mealName: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  confidence?: number;
  portions?: string;
  regional?: boolean;
  isLoading: boolean;
  onConfirm: (name: string, calories: number, comment: string) => void;
  onCancel: () => void;
  initialComment?: string;
};

const MealConfirmation: React.FC<MealConfirmationProps> = ({
  imageUri,
  mealName,
  calories,
  protein = 0,
  carbs = 0,
  fat = 0,
  confidence,
  portions,
  regional,
  isLoading,
  onConfirm,
  onCancel,
  initialComment = '',
}) => {
  const [editedName, setEditedName] = useState(mealName);
  const [editedCalories, setEditedCalories] = useState(calories.toString());
  const [comment, setComment] = useState(initialComment);

  const handleConfirm = () => {
    Keyboard.dismiss();
    onConfirm(
      editedName,
      parseInt(editedCalories, 10) || 0,
      comment
    );
  };

  // Handle calories input - only allow numbers
  const handleCaloriesChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setEditedCalories(numericValue);
  };

  // Get confidence color
  const getConfidenceColor = () => {
    if (!confidence) return colors.neutral[500];
    const confidencePercent = confidence * 100;
    if (confidencePercent >= 90) return colors.success[500];
    if (confidencePercent >= 70) return colors.warning[500];
    return colors.error[500];
  };

  // Format number with one decimal place
  const formatNumber = (num: number | null | undefined) => {
    if (isNaN(num as number) || num === null || num === undefined) return '0';
    const numValue = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(numValue)) return '0';
    return (Math.round(numValue * 10) / 10).toString();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoid}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <Text style={styles.title}>{i18n.t('confirmMeal')}</Text>
          
          <Image 
            source={{ uri: imageUri }} 
            style={styles.image}
            resizeMode="cover"
          />

          {/* AI Analysis Info */}
          {confidence && (
            <View style={styles.aiInfoContainer}>
              <View style={styles.aiHeader}>
                <Text style={styles.aiTitle}>{i18n.t('aiAnalysis')}</Text>
                <View style={styles.confidenceContainer}>
                  <Text style={[styles.confidenceText, { color: getConfidenceColor() }]}>
                    {Math.round((confidence || 0) * 100).toString()}%
                  </Text>
                  {regional && (
                    <View style={styles.regionalBadge}>
                      <Text style={styles.regionalText}>{i18n.t('regional')}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Nutrients Display */}
              <View style={styles.nutrientsContainer}>
                <View style={styles.nutrient}>
                  <Text style={styles.nutrientValue}>{formatNumber(protein)}g</Text>
                  <Text style={styles.nutrientLabel}>{i18n.t('protein')}</Text>
                </View>
                <View style={styles.nutrient}>
                  <Text style={styles.nutrientValue}>{formatNumber(carbs)}g</Text>
                  <Text style={styles.nutrientLabel}>{i18n.t('carbs')}</Text>
                </View>
                <View style={styles.nutrient}>
                  <Text style={styles.nutrientValue}>{formatNumber(fat)}g</Text>
                  <Text style={styles.nutrientLabel}>{i18n.t('fat')}</Text>
                </View>
              </View>

              {/* Portion Description */}
              {portions && (
                <View style={styles.portionContainer}>
                  <Text style={styles.portionLabel}>{i18n.t('portionSize')}</Text>
                  <Text style={styles.portionText}>{portions}</Text>
                </View>
              )}
            </View>
          )}
          
          <View style={styles.formContainer}>
            <Text style={styles.label}>{i18n.t('appName')}</Text>
            <TextInput
              style={styles.input}
              value={editedName}
              onChangeText={setEditedName}
              placeholder="Meal name"
              placeholderTextColor={colors.neutral[400]}
            />
            
            <Text style={styles.label}>{i18n.t('mealCalories')}</Text>
            <TextInput
              style={styles.input}
              value={editedCalories}
              onChangeText={handleCaloriesChange}
              placeholder="0"
              placeholderTextColor={colors.neutral[400]}
              keyboardType="numeric"
            />
            
            <Text style={styles.label}>{i18n.t('comment')}</Text>
            <TextInput
              style={styles.input}
              value={comment}
              onChangeText={setComment}
              placeholder={i18n.t('commentPlaceholder')}
              placeholderTextColor={colors.neutral[400]}
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            <Text style={styles.commentHint}>
              {i18n.t('commentExample')}
            </Text>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={onCancel}
              disabled={isLoading}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>
                {i18n.t('cancel')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.confirmButton]} 
              onPress={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.buttonText}>{i18n.t('confirm')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    margin: 16,
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginTop: 100,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.neutral[800],
    textAlign: 'center',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  aiInfoContainer: {
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.neutral[100],
  },
  aiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[700],
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  regionalBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  regionalText: {
    fontSize: 12,
    color: colors.primary[700],
    fontWeight: '500',
  },
  nutrientsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  nutrient: {
    alignItems: 'center',
  },
  nutrientValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary[500],
    marginBottom: 4,
  },
  nutrientLabel: {
    fontSize: 12,
    color: colors.neutral[500],
  },
  portionContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    paddingTop: 12,
  },
  portionLabel: {
    fontSize: 12,
    color: colors.neutral[500],
    marginBottom: 4,
  },
  portionText: {
    fontSize: 14,
    color: colors.neutral[700],
  },
  formContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: colors.neutral[600],
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.neutral[50],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  commentHint: {
    fontSize: 13,
    color: colors.neutral[500],
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButton: {
    backgroundColor: colors.primary[500],
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  cancelButtonText: {
    color: colors.neutral[600],
  },
});

export default MealConfirmation;