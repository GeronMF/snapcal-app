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

  // Format calories to have commas
  const formatCalories = (calories: number) => {
    return calories.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{i18n.t('dailyTarget')}</Text>
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
          <Text style={styles.statLabel}>{i18n.t('consumed')}</Text>
          <Text style={styles.statValue}>{formatCalories(caloriesConsumed)} kcal</Text>
        </View>
        
        <View style={styles.stat}>
          <Text style={styles.statLabel}>{i18n.t('remaining')}</Text>
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
});

export default ProgressBar;