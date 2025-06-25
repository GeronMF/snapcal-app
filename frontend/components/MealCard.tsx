import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Meal } from '../types';
import { format } from 'date-fns';
import { Trash2, Heart, HeartOff } from 'lucide-react-native';
import i18n from '../i18n';
import colors from '../constants/colors';

type MealCardProps = {
  meal: Meal;
  onDelete?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onSelect?: (meal: Meal) => void;
  compact?: boolean;
  disableTouch?: boolean;
};

const MealCard: React.FC<MealCardProps> = ({ meal, onDelete, onToggleFavorite, onSelect, compact = false, disableTouch = false }) => {
  const { id, imageUri, name, calories, timestamp, isFavorite } = meal;
  
  // Format time
  const formattedTime = format(new Date(timestamp), 'HH:mm');
  
  const showActionDialog = () => {
    const options = [];
    
    if (onToggleFavorite) {
      if (isFavorite) {
        options.push({
          text: '💔 Убрать из избранного',
          onPress: () => onToggleFavorite(id),
        });
      } else {
        options.push({
          text: '❤️ Добавить в избранное',
          onPress: () => onToggleFavorite(id),
        });
      }
    }
    
    if (onDelete) {
      options.push({
        text: '🗑️ Удалить',
        onPress: () => onDelete(id),
        style: 'destructive' as const,
      });
    }
    
    // Только показываем диалог если есть действия
    if (options.length > 0) {
      options.push({
        text: 'Отмена',
        style: 'cancel' as const,
      });
      
      Alert.alert(
        name,
        `${calories} калорий • ${formattedTime}`,
        options
      );
    }
  };

  const handlePress = () => {
    if (onSelect) {
      // Если есть onSelect - это режим выбора из избранных
      onSelect(meal);
    } else if ((onToggleFavorite || onDelete)) {
      // Иначе показываем диалог действий только если есть доступные действия
      showActionDialog();
    }
  };

  const cardContent = (
    <View style={[styles.container, compact && styles.compactContainer]}>
      <Image
        source={{ 
          uri: (imageUri && imageUri.trim() !== '') 
            ? imageUri 
            : 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=400' 
        }}
        style={[styles.image, compact && styles.compactImage]}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>{name}</Text>
          <Text style={styles.time}>{formattedTime}</Text>
        </View>
        <View style={styles.calorieContainer}>
          <Text style={styles.calories}>{calories} {i18n.t('mealCalories')}</Text>
        </View>
      </View>
      
      <View style={styles.statusIndicator}>
        {isFavorite && onToggleFavorite && (
          <Heart size={20} color={colors.error[500]} fill={colors.error[500]} />
        )}
      </View>
    </View>
  );
  
  if (disableTouch) {
    return cardContent;
  }
  
  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      {cardContent}
    </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[800],
    flex: 1,
  },
  time: {
    fontSize: 12,
    color: colors.neutral[500],
    marginLeft: 8,
  },
  calorieContainer: {
    marginTop: 4,
  },
  calories: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary[600],
  },
  statusIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});

export default MealCard;