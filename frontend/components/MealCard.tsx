import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Meal } from '../types';
import { format } from 'date-fns';
import { Trash2, Heart, HeartOff } from 'lucide-react-native';
import i18n from '../i18n';
import colors from '../constants/colors';

type MealCardProps = {
  meal: Meal;
  onDelete?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  compact?: boolean;
};

const MealCard: React.FC<MealCardProps> = ({ meal, onDelete, onToggleFavorite, compact = false }) => {
  const { id, imageUri, name, calories, timestamp, isFavorite } = meal;
  
  // Format time
  const formattedTime = format(new Date(timestamp), 'HH:mm');
  
  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      <Image
        source={{ uri: imageUri || 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=400' }}
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
      
      <View style={styles.actionButtons}>
        {onToggleFavorite && (
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => onToggleFavorite(id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {isFavorite ? (
              <Heart size={18} color={colors.error[500]} fill={colors.error[500]} />
            ) : (
              <HeartOff size={18} color={colors.neutral[400]} />
            )}
          </TouchableOpacity>
        )}
        
        {onDelete && (
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => onDelete(id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Trash2 size={18} color={colors.error[500]} />
          </TouchableOpacity>
        )}
      </View>
    </View>
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
  actionButtons: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MealCard;