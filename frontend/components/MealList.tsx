import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import colors from '../constants/colors';
import i18n from '../i18n';
import { Meal } from '../types';
import MealCard from './MealCard';

type MealListProps = {
  meals: Meal[];
  onDeleteMeal?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  emptyText?: string;
  compact?: boolean;
  useScrollView?: boolean;
  showNutrients?: boolean;
  favoriteMeals?: Meal[];
};

const MealList: React.FC<MealListProps> = ({ 
  meals, 
  onDeleteMeal,
  onToggleFavorite,
  emptyText = i18n.t('noMealsYet'),
  compact = false,
  useScrollView = false,
  showNutrients = false,
  favoriteMeals = [],
}) => {
  // Render empty state
  if (!meals.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyText}</Text>
      </View>
    );
  }

  if (useScrollView) {
    return (
      <View style={styles.listContainer}>
        {meals.map((item, idx) => (
          <MealCard
            key={item.id + '-' + idx}
            meal={item}
            onDelete={onDeleteMeal}
            onToggleFavorite={onToggleFavorite}
            compact={compact}
            showNutrients={showNutrients}
            favoriteMeals={favoriteMeals}
          />
        ))}
      </View>
    );
  }

  return (
    <FlatList
      data={meals}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <MealCard
          meal={item}
          onDelete={onDeleteMeal}
          onToggleFavorite={onToggleFavorite}
          compact={compact}
          showNutrients={showNutrients}
          favoriteMeals={favoriteMeals}
        />
      )}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingVertical: 8,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.neutral[500],
    textAlign: 'center',
  },
});

export default MealList;