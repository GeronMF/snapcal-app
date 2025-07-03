import { format } from 'date-fns';
import { Heart, HeartOff, Trash2, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Dimensions, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../constants/colors';
import i18n from '../i18n';
import { Meal } from '../types';

const { width: screenWidth } = Dimensions.get('window');

type MealCardProps = {
  meal: Meal;
  onDelete?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onSelect?: (meal: Meal) => void;
  compact?: boolean;
  disableTouch?: boolean;
  showNutrients?: boolean;
};

const MealCard: React.FC<MealCardProps> = ({ 
  meal, 
  onDelete, 
  onToggleFavorite, 
  onSelect, 
  compact = false, 
  disableTouch = false,
  showNutrients = false
}) => {
  const { 
    id, 
    imageUri, 
    name, 
    calories, 
    protein, 
    carbs, 
    fat, 
    confidence, 
    regional, 
    timestamp, 
    isFavorite 
  } = meal;
  
  const [modalVisible, setModalVisible] = useState(false);
  
  // Format time
  const formattedTime = format(new Date(timestamp), 'HH:mm');
  
  // Безопасное преобразование в строки
  const safeName = name ? name.toString() : 'Unknown Meal';
  const safeCalories = calories ? calories.toString() : '0';
  const safeFormattedTime = formattedTime ? formattedTime.toString() : '00:00';
  
  // Get confidence color
  const getConfidenceColor = () => {
    if (!confidence) return colors.neutral[500];
    const confidencePercent = confidence * 100;
    if (confidencePercent >= 90) return colors.success[500];
    if (confidencePercent >= 70) return colors.warning[500];
    return colors.error[500];
  };

  // Format number with one decimal place
  const formatNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined || isNaN(num as number)) return '0';
    const numValue = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(numValue)) return '0';
    return (Math.round(numValue * 10) / 10).toString();
  };

  // Safe translation function
  const safeTranslate = (key: string, fallback: string = key) => {
    try {
      const translation = i18n.t(key);
      if (translation === null || translation === undefined) {
        return fallback;
      }
      return String(translation);
    } catch (error) {
      return fallback;
    }
  };
  
  const showDetailModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleAction = (action: 'favorite' | 'delete') => {
    closeModal();
    if (action === 'favorite' && onToggleFavorite) {
      onToggleFavorite(id);
    } else if (action === 'delete' && onDelete) {
      Alert.alert(
        'Удалить прием пищи',
        'Вы уверены, что хотите удалить этот прием пищи?',
        [
          { text: 'Отмена', style: 'cancel' },
          { text: 'Удалить', style: 'destructive', onPress: () => onDelete(id) }
        ]
      );
    }
  };

  const handlePress = () => {
    // Всегда показываем модальное окно при клике
    showDetailModal();
  };

  // Проверяем условие для нутриентов
  const shouldShowNutrients = showNutrients && ((protein && protein > 0) || (carbs && carbs > 0) || (fat && fat > 0));

  const cardContent = (
    <View style={[styles.container, compact && styles.compactContainer]}>
      <Image
        source={{ 
          uri: (imageUri && imageUri.trim() !== '') 
            ? imageUri 
            : 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400' 
        }}
        style={[styles.image, compact && styles.compactImage]}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>{safeName}</Text>
            {regional ? (
              <View style={styles.regionalBadge}>
                <Text style={styles.regionalText}>{safeTranslate('regional', 'Региональное')}</Text>
              </View>
            ) : null}
          </View>
        </View>
        
        <Text style={styles.time}>{safeFormattedTime}</Text>
        
        <View style={styles.calorieContainer}>
          <Text style={styles.calories}>{safeCalories} kcal</Text>
          {(confidence && confidence > 0) ? (
            <Text style={[styles.confidence, { color: getConfidenceColor() }]}>
              {Math.round((confidence || 0) * 100).toString()}%
            </Text>
          ) : null}
        </View>

        {/* Nutrients Display */}
        {shouldShowNutrients ? (
          <View style={styles.nutrientsContainer}>
            <View style={styles.nutrient}>
              <Text style={styles.nutrientValue}>{formatNumber(protein || 0)}g</Text>
              <Text style={styles.nutrientLabel}>{safeTranslate('protein', 'Белки')}</Text>
            </View>
            <View style={styles.nutrient}>
              <Text style={styles.nutrientValue}>{formatNumber(carbs || 0)}g</Text>
              <Text style={styles.nutrientLabel}>{safeTranslate('carbs', 'Углеводы')}</Text>
            </View>
            <View style={styles.nutrient}>
              <Text style={styles.nutrientValue}>{formatNumber(fat || 0)}g</Text>
              <Text style={styles.nutrientLabel}>{safeTranslate('fat', 'Жиры')}</Text>
            </View>
          </View>
        ) : null}
      </View>
      
      <View style={styles.statusIndicator}>
        {(isFavorite && onToggleFavorite) ? (
          <Heart size={20} color={colors.error[500]} fill={colors.error[500]} />
        ) : null}
      </View>
    </View>
  );
  
  return (
    <>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        {cardContent}
      </TouchableOpacity>

      {/* Detailed Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{safeName}</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <X size={24} color={colors.neutral[600]} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Main Image */}
              <Image
                source={{ 
                  uri: (imageUri && imageUri.trim() !== '') 
                    ? imageUri 
                    : 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400' 
                }}
                style={styles.modalImage}
                resizeMode="cover"
              />

              {/* Basic Info */}
              <View style={styles.modalSection}>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>{safeTranslate('time', 'Время')}:</Text>
                  <Text style={styles.modalValue}>{safeFormattedTime}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>{safeTranslate('calories', 'Калории')}:</Text>
                  <Text style={styles.modalValue}>{safeCalories} kcal</Text>
                </View>
              </View>

              {/* Nutrients */}
              {((protein && protein > 0) || (carbs && carbs > 0) || (fat && fat > 0)) ? (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>{safeTranslate('nutrients', 'Питательные вещества')}</Text>
                  <View style={styles.nutrientsGrid}>
                    <View style={styles.modalNutrient}>
                      <Text style={styles.modalNutrientValue}>{formatNumber(protein || 0)}г</Text>
                      <Text style={styles.modalNutrientLabel}>{safeTranslate('protein', 'Белки')}</Text>
                    </View>
                    <View style={styles.modalNutrient}>
                      <Text style={styles.modalNutrientValue}>{formatNumber(carbs || 0)}г</Text>
                      <Text style={styles.modalNutrientLabel}>{safeTranslate('carbs', 'Углеводы')}</Text>
                    </View>
                    <View style={styles.modalNutrient}>
                      <Text style={styles.modalNutrientValue}>{formatNumber(fat || 0)}г</Text>
                      <Text style={styles.modalNutrientLabel}>{safeTranslate('fat', 'Жиры')}</Text>
                    </View>
                  </View>
                </View>
              ) : null}

              {/* AI Info */}
              {(confidence && confidence > 0) || regional ? (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>{safeTranslate('aiAnalysis', 'AI Анализ')}</Text>
                  {confidence && confidence > 0 ? (
                    <View style={styles.modalRow}>
                      <Text style={styles.modalLabel}>{safeTranslate('accuracy', 'Точность')}:</Text>
                      <Text style={[styles.modalValue, { color: getConfidenceColor() }]}>
                        {Math.round((confidence || 0) * 100).toString()}%
                      </Text>
                    </View>
                  ) : null}
                  {regional ? (
                    <View style={styles.modalRegionalBadge}>
                      <Text style={styles.modalRegionalText}>🏛️ {safeTranslate('regional', 'Региональное блюдо')}</Text>
                    </View>
                  ) : null}
                </View>
              ) : null}
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={closeModal}
              >
                <X size={20} color={colors.neutral[600]} />
              </TouchableOpacity>
              
              {onSelect && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.favoriteButton]}
                  onPress={() => {
                    closeModal();
                    onSelect(meal);
                  }}
                >
                  <Text style={styles.actionButtonText}>
                    {safeTranslate('addFromFavorites', 'Добавить из избранного')}
                  </Text>
                </TouchableOpacity>
              )}
              
              {onToggleFavorite && (
                <TouchableOpacity 
                  style={[styles.actionButton, isFavorite ? styles.unfavoriteButton : styles.favoriteButton]}
                  onPress={() => handleAction('favorite')}
                >
                  {isFavorite ? (
                    <HeartOff size={16} color={colors.white} />
                  ) : (
                    <Heart size={16} color={colors.white} />
                  )}
                  <Text style={styles.actionButtonText}>
                    {isFavorite ? safeTranslate('removeFromFavorites', 'Убрать') : safeTranslate('addToFavorites', 'Избранное')}
                  </Text>
                </TouchableOpacity>
              )}
              
              {onDelete && (
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleAction('delete')}
                >
                  <Trash2 size={20} color={colors.white} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  compactContainer: {
    marginVertical: 4,
    marginHorizontal: 0,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    margin: 8,
  },
  compactImage: {
    width: 60,
    height: 60,
  },
  content: {
    flex: 1,
    padding: 8,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[800],
    flex: 1,
  },
  regionalBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  regionalText: {
    fontSize: 10,
    color: colors.primary[700],
    fontWeight: '500',
  },
  time: {
    fontSize: 12,
    color: colors.neutral[500],
    marginTop: 2,
  },
  calorieContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  calories: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary[600],
  },
  confidence: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
  },
  nutrientsContainer: {
    flexDirection: 'row',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  nutrient: {
    alignItems: 'center',
    marginRight: 16,
  },
  nutrientValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary[500],
  },
  nutrientLabel: {
    fontSize: 10,
    color: colors.neutral[500],
    marginTop: 2,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    width: '100%',
    maxHeight: '90%',
    minHeight: '75%',
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral[900],
    flex: 1,
    marginRight: 12,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.neutral[100],
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: 16,
  },
  modalImage: {
    width: '100%',
    aspectRatio: 16/9,
    borderRadius: 12,
    marginVertical: 16,
  },
  modalSection: {
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[800],
    marginBottom: 12,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  modalLabel: {
    fontSize: 14,
    color: colors.neutral[600],
  },
  modalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[800],
  },
  modalValuePrimary: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary[600],
  },
  nutrientsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    padding: 16,
  },
  modalNutrient: {
    alignItems: 'center',
  },
  modalNutrientValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary[600],
    marginBottom: 4,
  },
  modalNutrientLabel: {
    fontSize: 12,
    color: colors.neutral[500],
  },
  modalRegionalBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  modalRegionalText: {
    fontSize: 12,
    color: colors.primary[700],
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    gap: 10,
  },
  cancelButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.error[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButton: {
    backgroundColor: colors.primary[500],
  },
  unfavoriteButton: {
    backgroundColor: colors.warning[500],
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.white,
  },
});

export default MealCard;