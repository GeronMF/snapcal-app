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
} from 'react-native';
import i18n from '../i18n';
import colors from '../constants/colors';

type MealConfirmationProps = {
  imageUri: string;
  mealName: string;
  calories: number;
  isLoading: boolean;
  onConfirm: (name: string, calories: number, comment: string) => void;
  onCancel: () => void;
  initialComment?: string;
};

const MealConfirmation: React.FC<MealConfirmationProps> = ({
  imageUri,
  mealName,
  calories,
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoid}
    >
      <View style={styles.container}>
        <Text style={styles.title}>{i18n.t('confirmMeal')}</Text>
        
        <Image 
          source={{ uri: imageUri }} 
          style={styles.image}
          resizeMode="cover"
        />
        
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
          <Text style={{fontSize: 13, color: colors.neutral[500], marginBottom: 12}}>
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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
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
    color: colors.neutral[700],
  },
});

export default MealConfirmation;