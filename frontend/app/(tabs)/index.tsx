import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Platform,
  Modal,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Camera, X } from 'lucide-react-native';
import { useUser } from '@/contexts/UserContext';
import { useMeals } from '@/contexts/MealsContext';
import { Meal } from '@/types';
import ProgressBar from '@/components/ProgressBar';
import CameraButton from '@/components/CameraButton';
import MealList from '@/components/MealList';
import MealCard from '@/components/MealCard';
import MealConfirmation from '@/components/MealConfirmation';
import { analyzeFood } from '@/utils/mockData';
import i18n from '@/i18n';
import colors from '@/constants/colors';
import CommentModal from '@/components/CommentModal';

export default function HomeScreen() {
  const { user, setUserData } = useUser();
  const { todayMeals, favoriteMeals, addMeal, removeMeal, toggleFavorite, addMealFromFavorite } = useMeals();
  const [permission, requestPermission] = useCameraPermissions();
  
  const [cameraVisible, setCameraVisible] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedData, setAnalyzedData] = useState<{ name: string; calories: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  
  const cameraRef = useRef<CameraView>(null);
  
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [pendingPhotoUri, setPendingPhotoUri] = useState<string | null>(null);
  const [pendingComment, setPendingComment] = useState('');
  
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
      // Передаем комментарий в analyzeFood
      const result = await analyzeFood(pendingPhotoUri, comment);
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
    if (!imageUri) return;
    
    try {
      setIsSaving(true);
      
      // Add meal to storage
      await addMeal({
        name,
        calories,
        protein: 0,
        carbs: 0,
        fat: 0,
        userId: user?.id || '',
        comment,
        imageUri,
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
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.permissionText}>{i18n.t('cameraPermissionDenied')}</Text>
          <TouchableOpacity 
            style={styles.permissionButton} 
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>{i18n.t('next')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
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
        visible={!!imageUri && !!analyzedData}
        animationType="slide"
        transparent
        onRequestClose={handleCancelMeal}
      >
        <View style={styles.modalOverlay}>
          <MealConfirmation
            imageUri={imageUri || ''}
            mealName={analyzedData?.name || ''}
            calories={analyzedData?.calories || 0}
            isLoading={isSaving}
            onConfirm={handleConfirmMeal}
            onCancel={handleCancelMeal}
            initialComment={pendingComment}
          />
        </View>
      </Modal>
      
      {/* Loading Modal */}
      <Modal
        visible={isAnalyzing}
        transparent
        animationType="fade"
      >
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary[500]} />
            <Text style={styles.loadingText}>{i18n.t('analyzing')}</Text>
          </View>
        </View>
      </Modal>

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
              onPress={handleSelectFavorites}
            >
              <Text style={styles.optionText}>{i18n.t('addFromFavorites')}</Text>
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
                <TouchableOpacity
                  key={meal.id + '-' + idx}
                  onPress={() => handleAddFromFavorites(meal)}
                  activeOpacity={0.7}
                >
                  <MealCard meal={meal} compact={true} disableTouch={true} />
                </TouchableOpacity>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '80%',
  },
  loadingText: {
    fontSize: 16,
    color: colors.neutral[800],
    marginTop: 16,
    fontFamily: 'Inter-Medium',
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
});