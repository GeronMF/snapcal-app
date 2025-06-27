import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useMeals } from '../contexts/MealsContext';
import { useUser } from '../contexts/UserContext';
import { calculateCaloriesConsumed } from '../utils/calorieCalculator';
import i18n from '../i18n';
import colors from '../constants/colors';

const ProgressBar: React.FC = () => {
  const { user, calculateTargetCalories } = useUser();
  const { todayMeals } = useMeals();
  
  const progressAnim = React.useRef(new Animated.Value(0)).current;
  const [percentage, setPercentage] = React.useState(0);
  
  // Calculate calories consumed
  const caloriesConsumed = calculateCaloriesConsumed(todayMeals);
  const dailyTarget = user ? calculateTargetCalories() : 2000;
  const caloriesRemaining = dailyTarget - caloriesConsumed;

  // Calculate total nutrients and AI confidence
  const totalNutrients = todayMeals.reduce((acc, meal) => {
    // Безопасно преобразуем в числа
    const protein = typeof meal.protein === 'string' ? parseFloat(meal.protein) || 0 : meal.protein || 0;
    const carbs = typeof meal.carbs === 'string' ? parseFloat(meal.carbs) || 0 : meal.carbs || 0;
    const fat = typeof meal.fat === 'string' ? parseFloat(meal.fat) || 0 : meal.fat || 0;
    const confidence = typeof meal.confidence === 'string' ? parseFloat(meal.confidence) || 0 : meal.confidence || 0;
    

    
    return {
      protein: acc.protein + protein,
      carbs: acc.carbs + carbs,
      fat: acc.fat + fat,
      confidenceSum: acc.confidenceSum + confidence,
      confidenceCount: acc.confidenceCount + (confidence > 0 ? 1 : 0)
    };
  }, { protein: 0, carbs: 0, fat: 0, confidenceSum: 0, confidenceCount: 0 });

  const averageConfidence = totalNutrients.confidenceCount > 0 
    ? (totalNutrients.confidenceSum / totalNutrients.confidenceCount) * 100 
    : 0;



  // Calculate percentage of target consumed (capped at 100%)
  useEffect(() => {
    const newPercentage = Math.min(100, (caloriesConsumed / dailyTarget) * 100);

    setPercentage(newPercentage);
    
    Animated.timing(progressAnim, {
      toValue: newPercentage / 100,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [caloriesConsumed, dailyTarget, progressAnim]);

  // Determine the color of the progress bar based on percentage
  const getProgressBarColor = () => {
    if (percentage >= 100) return colors.error[500]; // Over limit
    if (percentage >= 90) return colors.warning[500]; // Near limit
    return colors.primary[500]; // Normal progress
  };

  // Get confidence color
  const getConfidenceColor = () => {
    if (averageConfidence >= 90) return colors.success[500];
    if (averageConfidence >= 70) return colors.warning[500];
    return colors.error[500];
  };

  // Format calories to have commas
  const formatCalories = (calories: number) => {
    return calories.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Format number with one decimal place
  const formatNumber = (num: number | null | undefined) => {
    if (isNaN(num as number) || num === null || num === undefined) return '0';
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

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{safeTranslate('dailyTarget', 'Daily Target')}</Text>
        <Text style={styles.targetValue}>{formatCalories(dailyTarget)} kcal</Text>
      </View>
      
      <View style={styles.progressContainer}>
        <Animated.View 
          style={[
            styles.progressBar,
            { 
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: getProgressBarColor(),
            },
          ]}
        />
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>{safeTranslate('consumed', 'Consumed')}</Text>
          <Text style={styles.statValue}>{formatCalories(caloriesConsumed)} kcal</Text>
        </View>
        
        <View style={styles.stat}>
          <Text style={styles.statLabel}>{safeTranslate('remaining', 'Remaining')}</Text>
          <Text 
            style={[
              styles.statValue, 
              caloriesRemaining < 0 ? styles.negativeValue : null
            ]}
          >
            {caloriesRemaining < 0 ? '-' : ''}{formatCalories(Math.abs(caloriesRemaining))} kcal
          </Text>
        </View>
      </View>

      {/* Nutrients Summary */}
      <View style={styles.nutrientsContainer}>
        <Text style={styles.nutrientsTitle}>{safeTranslate('nutrients', 'Nutrients')}</Text>
        <View style={styles.nutrientsRow}>
          <View style={styles.nutrient}>
            <Text style={styles.nutrientValue}>{formatNumber(totalNutrients.protein)}g</Text>
            <Text style={styles.nutrientLabel}>{safeTranslate('protein', 'Protein')}</Text>
          </View>
          <View style={styles.nutrient}>
            <Text style={styles.nutrientValue}>{formatNumber(totalNutrients.carbs)}g</Text>
            <Text style={styles.nutrientLabel}>{safeTranslate('carbs', 'Carbs')}</Text>
          </View>
          <View style={styles.nutrient}>
            <Text style={styles.nutrientValue}>{formatNumber(totalNutrients.fat)}g</Text>
            <Text style={styles.nutrientLabel}>{safeTranslate('fat', 'Fat')}</Text>
          </View>
        </View>
      </View>

      {/* AI Confidence */}
      {totalNutrients.confidenceCount > 0 ? (
        <View style={styles.confidenceContainer}>
          <Text style={styles.confidenceLabel}>{safeTranslate('aiConfidence', 'AI Confidence')}</Text>
          <Text style={[styles.confidenceValue, { color: getConfidenceColor() }]}>
            {Math.round(averageConfidence || 0).toString()}%
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    margin: 16,
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[800],
  },
  targetValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  progressContainer: {
    height: 12,
    backgroundColor: colors.neutral[100],
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stat: {
    alignItems: 'flex-start',
  },
  statLabel: {
    fontSize: 12,
    color: colors.neutral[500],
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[800],
  },
  negativeValue: {
    color: colors.error[500],
  },
  nutrientsContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    paddingTop: 16,
    marginBottom: 12,
  },
  nutrientsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[700],
    marginBottom: 12,
  },
  nutrientsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  nutrient: {
    alignItems: 'center',
  },
  nutrientValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary[500],
    marginBottom: 4,
  },
  nutrientLabel: {
    fontSize: 12,
    color: colors.neutral[500],
  },
  confidenceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    paddingTop: 12,
  },
  confidenceLabel: {
    fontSize: 14,
    color: colors.neutral[600],
  },
  confidenceValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProgressBar;