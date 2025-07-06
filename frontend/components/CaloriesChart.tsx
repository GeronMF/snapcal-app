import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../constants/colors';
import i18n from '../i18n';

type DayCalories = {
  day: string;
  calories: number;
  date: string;
};

type CaloriesChartProps = {
  data: DayCalories[];
  dailyTarget: number;
  onBarPress?: (date: string) => void;
};

const CaloriesChart: React.FC<CaloriesChartProps> = ({ data, dailyTarget, onBarPress }) => {
  const maxCalories = Math.max(...data.map(d => d.calories), dailyTarget);
  
  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{i18n.t('caloriesChartTitle')}</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Нет данных</Text>
        </View>
      </View>
    );
  }

  // Высота линии цели относительно максимального значения
  const targetLinePosition = maxCalories > 0 ? (1 - dailyTarget / maxCalories) * 100 : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{i18n.t('caloriesChartTitle')}</Text>
      
      <View style={styles.chartContainer}>
        {/* Целевая линия */}
        <View style={[styles.targetLine, { top: `${targetLinePosition}%` }]}> 
          <View style={styles.targetLineBar} />
          <Text style={styles.targetLineText}>{i18n.t('goal')}: {dailyTarget} ккал</Text>
        </View>
        
        {/* Столбцы графика */}
        <View style={styles.barsContainer}>
          {data.map((item, index) => {
            const barHeight = maxCalories > 0 ? (item.calories / maxCalories) * 100 : 0;
            const isExceeded = item.calories > dailyTarget;
            
            return (
              <View key={index} style={styles.barWrapper}>
                <TouchableOpacity style={styles.barContainer} onPress={() => onBarPress && onBarPress(item.date)} activeOpacity={0.7}>
                  <View style={[
                    styles.bar,
                    {
                      height: `${barHeight}%`,
                      backgroundColor: isExceeded ? colors.error[500] : colors.primary[500]
                    }
                  ]} />
                </TouchableOpacity>
                <Text style={styles.dayLabel}>{item.day}</Text>
                <Text style={styles.caloriesLabel}>{item.calories}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[800],
    marginBottom: 12,
    fontFamily: 'Inter-SemiBold',
  },
  chartContainer: {
    height: 200,
  },
  targetLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  targetLineBar: {
    flex: 1,
    height: 1,
    backgroundColor: colors.neutral[400],
    marginRight: 8,
  },
  targetLineText: {
    fontSize: 10,
    color: colors.neutral[500],
    fontFamily: 'Inter-Regular',
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: '100%',
    paddingTop: 20,
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
  },
  barContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: 20,
    marginBottom: 8,
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 2,
  },
  dayLabel: {
    fontSize: 10,
    color: colors.neutral[600],
    fontFamily: 'Inter-Medium',
    marginBottom: 2,
  },
  caloriesLabel: {
    fontSize: 9,
    color: colors.neutral[500],
    fontFamily: 'Inter-Regular',
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 14,
    color: colors.neutral[500],
    fontFamily: 'Inter-Regular',
  },
});

export default CaloriesChart; 