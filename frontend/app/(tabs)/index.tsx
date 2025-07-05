import AILoadingModal from '@/components/AILoadingModal';
import CameraButton from '@/components/CameraButton';
import CommentModal from '@/components/CommentModal';
import MealCard from '@/components/MealCard';
import MealConfirmation from '@/components/MealConfirmation';
import MealList from '@/components/MealList';
import ProgressBar from '@/components/ProgressBar';
import colors from '@/constants/colors';
import { useMeals } from '@/contexts/MealsContext';
import { useUser } from '@/contexts/UserContext';
import i18n from '@/i18n';
import { Meal } from '@/types';
import { analyzeFood } from '@/utils/mockData';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, Type, X } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function HomeScreen() {
  const { user, setUserData } = useUser();
  const { todayMeals, favoriteMeals, addMeal, removeMeal, toggleFavorite, addMealFromFavorite } = useMeals();
  const [permission, requestPermission] = useCameraPermissions();
  
  const [cameraVisible, setCameraVisible] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedData, setAnalyzedData] = useState<{ 
    name: string; 
    calories: number; 
    protein?: number; 
    carbs?: number; 
    fat?: number;
    confidence?: number;
    portions?: string;
    regional?: boolean;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  
  const cameraRef = useRef<CameraView>(null);
  
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [pendingPhotoUri, setPendingPhotoUri] = useState<string | null>(null);
  const [pendingComment, setPendingComment] = useState('');
  
  // Новые состояния для текстового описания
  const [textDescriptionModalVisible, setTextDescriptionModalVisible] = useState(false);
  const [textDescription, setTextDescription] = useState('');
  
  // Request camera permission on mount
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);
  
  // Handle opening the camera
  const handleOpenCamera = () => {
    if (!permission?.granted) {
      requestPermission();
      return;
    }
    setCameraVisible(true);
  };
  
  // Toggle camera facing
  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };
  
  // Take a picture
  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync();
      setPendingPhotoUri(photo.uri);
      setCommentModalVisible(true);
      setCameraVisible(false);
    } catch (error) {
      console.error('Error taking picture:', error);
    }
  };
  
  const handleCommentSubmit = async (comment: string) => {
    if (!pendingPhotoUri) return;
    setPendingComment(comment);
    setCommentModalVisible(false);
    setIsAnalyzing(true);
    try {
      // Передаем комментарий и язык пользователя в analyzeFood
      const userLanguage = user?.language || 'en';
      const result = await analyzeFood(pendingPhotoUri, comment, userLanguage);
      setImageUri(pendingPhotoUri);
      setAnalyzedData(result);
    } catch (error) {
      console.error('Error analyzing food:', error);
    } finally {
      setIsAnalyzing(false);
      setPendingPhotoUri(null);
    }
  };
  
  // Handle meal confirmation
  const handleConfirmMeal = async (name: string, calories: number, comment: string) => {
    if (!analyzedData) return;
    
    try {
      setIsSaving(true);
      
      // Add meal to storage with all AI data
      await addMeal({
        name,
        calories,
        protein: analyzedData.protein || 0,
        carbs: analyzedData.carbs || 0,
        fat: analyzedData.fat || 0,
        userId: user?.id || '',
        comment,
        imageUri: imageUri === 'text-analysis' ? undefined : imageUri || undefined,
        // AI analysis fields
        confidence: analyzedData.confidence,
        portions: analyzedData.portions,
        language: user?.language || 'en',
        provider: 'openai',
        regional: analyzedData.regional,
      });
      
      // Reset state
      setImageUri(null);
      setAnalyzedData(null);
    } catch (error) {
      console.error('Error saving meal:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Cancel meal confirmation
  const handleCancelMeal = () => {
    setImageUri(null);
    setAnalyzedData(null);
  };
  
  // Delete a meal
  const handleDeleteMeal = async (id: string) => {
    await removeMeal(id);
  };

  // Toggle favorite status
  const handleToggleFavorite = async (id: string) => {
    await toggleFavorite(id);
  };

  // Handle showing options
  const handleShowOptions = () => {
    setShowOptions(true);
  };

  // Handle selecting camera option
  const handleSelectCamera = () => {
    setShowOptions(false);
    handleOpenCamera();
  };

  // Handle selecting favorites option
  const handleSelectFavorites = () => {
    setShowOptions(false);
    setShowFavorites(true);
  };

  // Handle adding meal from favorites
  const handleAddFromFavorites = async (meal: Meal) => {
    await addMealFromFavorite(meal);
    setShowFavorites(false);
  };

  // Новые функции для галереи и текстового описания
  const handleSelectGallery = async () => {
    try {
      console.log('🔍 Открытие галереи...');
      
      // Запрашиваем разрешение на доступ к галерее
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('📱 Результат разрешения галереи:', permissionResult);
      
      if (permissionResult.granted === false) {
        Alert.alert(i18n.t('error'), 'Разрешение на доступ к галерее отклонено');
        return;
      }

      // Открываем галерею
      console.log('📸 Запуск launchImageLibraryAsync...');
      const result = await ImagePicker.launchImageLibraryAsync();
      console.log('📸 Результат выбора изображения:', result);

      if (!result.canceled && result.assets[0]) {
        console.log('✅ Изображение выбрано, обрабатываем...');
        
        // Разделяем операции по времени, чтобы избежать конфликта
        setTimeout(() => {
          setShowOptions(false);
          console.log('✅ Модальное окно закрыто');
          
          setTimeout(() => {
            setPendingPhotoUri(result.assets[0].uri);
            console.log('✅ URI изображения установлен:', result.assets[0].uri);
            
            setTimeout(() => {
              setCommentModalVisible(true);
              console.log('✅ Модальное окно комментария открыто');
            }, 200);
          }, 100);
        }, 100);
      } else {
        console.log('❌ Изображение не выбрано или отменено');
      }
    } catch (error) {
      console.error('❌ Ошибка при открытии галереи:', error);
      Alert.alert(i18n.t('error'), 'Ошибка при открытии галереи');
    }
  };

  const handleSelectTextDescription = () => {
    setShowOptions(false);
    setTextDescriptionModalVisible(true);
  };

  const handleTextDescriptionSubmit = async () => {
    if (!textDescription.trim()) {
      Alert.alert(i18n.t('error'), 'Пожалуйста, введите описание еды');
      return;
    }

    setTextDescriptionModalVisible(false);
    setIsAnalyzing(true);
    
    try {
      const userLanguage = user?.language || 'en';
      // Анализируем текстовое описание - используем пустую строку вместо null
      const result = await analyzeFood('', textDescription, userLanguage);
      setImageUri('text-analysis'); // Специальное значение для текстового анализа
      setAnalyzedData(result); // Убираем проверку на result.data
      setPendingComment(textDescription);
    } catch (error) {
      console.error('Error analyzing text description:', error);
      Alert.alert(i18n.t('error'), 'Ошибка анализа описания');
    } finally {
      setIsAnalyzing(false);
      setTextDescription('');
    }
  };
  
  // Render camera permission UI
  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }
  
  // Render camera permission denied UI
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.permissionText}>{i18n.t('cameraPermissionDenied')}</Text>
          <TouchableOpacity 
            style={styles.permissionButton} 
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>{i18n.t('next')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{i18n.t('appName')}</Text>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ProgressBar />
        
        <CameraButton 
          onPress={handleShowOptions} 
          isLoading={isAnalyzing}
        />
        
        <View style={styles.mealsSection}>
          <Text style={styles.sectionTitle}>{i18n.t('todayMeals')}</Text>
          <MealList 
            meals={todayMeals} 
            onDeleteMeal={handleDeleteMeal}
            onToggleFavorite={handleToggleFavorite}
            emptyText={i18n.t('noMealsYet')}
            useScrollView={true}
            showNutrients={false}
            favoriteMeals={favoriteMeals}
          />
        </View>
      </ScrollView>
      
      {/* Camera Modal */}
      <Modal
        visible={cameraVisible}
        animationType="slide"
        onRequestClose={() => setCameraVisible(false)}
      >
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
          >
            <View style={styles.cameraControls}>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setCameraVisible(false)}
              >
                <X size={24} color={colors.white} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.flipButton} 
                onPress={toggleCameraFacing}
              >
                <Camera size={24} color={colors.white} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.captureButton} 
              onPress={takePicture}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          </CameraView>
        </View>
      </Modal>
      
      {/* Meal Confirmation Modal */}
      <Modal
        visible={!!analyzedData && (!!imageUri || imageUri === 'text-analysis')}
        animationType="slide"
        transparent
        onRequestClose={handleCancelMeal}
      >
        <View style={styles.modalOverlay}>
          <MealConfirmation
            imageUri={imageUri === 'text-analysis' ? '' : imageUri || ''}
            mealName={analyzedData?.name || ''}
            calories={analyzedData?.calories || 0}
            protein={analyzedData?.protein}
            carbs={analyzedData?.carbs}
            fat={analyzedData?.fat}
            confidence={analyzedData?.confidence}
            portions={analyzedData?.portions}
            regional={analyzedData?.regional}
            isLoading={isSaving}
            onConfirm={handleConfirmMeal}
            onCancel={handleCancelMeal}
            initialComment={pendingComment}
          />
        </View>
      </Modal>
      
      {/* AI Loading Modal */}
      <AILoadingModal 
        visible={isAnalyzing}
      />

      {/* Options Modal */}
      <Modal
        visible={showOptions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.optionsContainer}>
            <Text style={styles.optionsTitle}>{i18n.t('chooseOption')}</Text>
            
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={handleSelectCamera}
            >
              <Camera size={24} color={colors.primary[500]} />
              <Text style={styles.optionText}>{i18n.t('takePicture')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={handleSelectGallery}
            >
              <ImageIcon size={24} color={colors.primary[500]} />
              <Text style={styles.optionText}>{i18n.t('uploadFromGallery')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={handleSelectFavorites}
            >
              <Text style={styles.optionText}>{i18n.t('addFromFavorites')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={handleSelectTextDescription}
            >
              <Type size={24} color={colors.primary[500]} />
              <Text style={styles.optionText}>{i18n.t('describeWithText')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowOptions(false)}
            >
              <Text style={styles.cancelButtonText}>{i18n.t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Favorites Modal */}
      <Modal
        visible={showFavorites}
        animationType="slide"
        onRequestClose={() => setShowFavorites(false)}
      >
        <SafeAreaView style={styles.favoritesContainer}>
          <View style={styles.favoritesHeader}>
            <TouchableOpacity onPress={() => setShowFavorites(false)}>
              <X size={24} color={colors.neutral[600]} />
            </TouchableOpacity>
            <Text style={styles.favoritesTitle}>{i18n.t('favorites')}</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <ScrollView style={styles.favoritesContent}>
            {favoriteMeals.length === 0 ? (
              <Text style={styles.noFavoritesText}>{i18n.t('noFavorites')}</Text>
            ) : (
              favoriteMeals.map((meal, idx) => (
                <MealCard 
                  key={meal.id + '-' + idx}
                  meal={meal} 
                  compact={true} 
                  showNutrients={true}
                  onSelect={handleAddFromFavorites}
                />
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Comment Modal */}
      <CommentModal
        visible={commentModalVisible}
        onSubmit={handleCommentSubmit}
        onCancel={() => { setCommentModalVisible(false); setPendingPhotoUri(null); }}
      />

      {/* Text Description Modal */}
      <Modal
        visible={textDescriptionModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTextDescriptionModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.textModalContainer}>
            <Text style={styles.textModalTitle}>{i18n.t('describeWithText')}</Text>
            
            <TextInput
              style={styles.textInput}
              value={textDescription}
              onChangeText={setTextDescription}
              placeholder={i18n.t('textDescriptionPlaceholder')}
              placeholderTextColor={colors.neutral[400]}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            
            <View style={styles.textModalButtons}>
              <TouchableOpacity 
                style={styles.textCancelButton}
                onPress={() => {
                  setTextDescriptionModalVisible(false);
                  setTextDescription('');
                }}
              >
                <Text style={styles.textCancelButtonText}>{i18n.t('cancel')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.textSubmitButton}
                onPress={handleTextDescriptionSubmit}
              >
                <Text style={styles.textSubmitButtonText}>{i18n.t('confirm')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
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
    paddingBottom: 24,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionText: {
    fontSize: 16,
    color: colors.neutral[700],
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Inter-Regular',
  },
  permissionButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  mealsSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral[800],
    marginHorizontal: 16,
    marginBottom: 8,
    fontFamily: 'Inter-SemiBold',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: colors.black,
  },
  camera: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: colors.white,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
  },

  optionsContainer: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
  },
  optionsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.neutral[800],
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Inter-SemiBold',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[200],
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  optionText: {
    fontSize: 16,
    color: colors.primary[700],
    fontWeight: '500',
    marginLeft: 8,
    fontFamily: 'Inter-Medium',
  },
  cancelButton: {
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.neutral[600],
    textAlign: 'center',
    fontFamily: 'Inter-Medium',
  },
  favoritesContainer: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  favoritesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  favoritesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral[800],
    fontFamily: 'Inter-SemiBold',
  },
  favoritesContent: {
    flex: 1,
    padding: 16,
  },

  noFavoritesText: {
    fontSize: 16,
    color: colors.neutral[500],
    textAlign: 'center',
    padding: 40,
    fontFamily: 'Inter-Regular',
  },

  textModalContainer: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
  },
  textModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.neutral[800],
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Inter-SemiBold',
  },
  textInput: {
    height: 100,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.neutral[800],
    fontFamily: 'Inter-Regular',
  },
  textModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  textCancelButton: {
    flex: 1,
    backgroundColor: colors.neutral[100],
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  textCancelButtonText: {
    fontSize: 16,
    color: colors.neutral[600],
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  textSubmitButton: {
    flex: 2,
    backgroundColor: colors.primary[500],
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  textSubmitButtonText: {
    fontSize: 16,
    color: colors.white,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
});