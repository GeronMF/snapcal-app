import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import colors from '../constants/colors';
import i18n from '../i18n';

type NutrientsData = {
  protein: number;
  carbs: number;
  fat: number;
};

type NutrientsChartProps = {
  data: NutrientsData;
};

const NutrientsChart: React.FC<NutrientsChartProps> = ({ data }) => {
  const total = data.protein + data.carbs + data.fat;
  
  if (total === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{i18n.t('nutrientsChartTitle')}</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Нет данных</Text>
        </View>
      </View>
    );
  }

  const proteinPercent = (data.protein / total) * 100;
  const carbsPercent = (data.carbs / total) * 100;
  const fatPercent = (data.fat / total) * 100;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{i18n.t('nutrientsChartTitle')}</Text>
      
      <View style={styles.chartContainer}>
        {/* Простая круговая диаграмма из полос */}
        <View style={styles.circleChart}>
          <View style={[styles.segment, styles.proteinSegment, { 
            width: `${proteinPercent}%` 
          }]} />
          <View style={[styles.segment, styles.carbsSegment, { 
            width: `${carbsPercent}%` 
          }]} />
          <View style={[styles.segment, styles.fatSegment, { 
            width: `${fatPercent}%` 
          }]} />
        </View>
        
        {/* Легенда */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
            <Text style={styles.legendText}>{i18n.t('protein')}: {data.protein.toFixed(1)}г ({proteinPercent.toFixed(1)}%)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.legendText}>{i18n.t('carbs')}: {data.carbs.toFixed(1)}г ({carbsPercent.toFixed(1)}%)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendText}>{i18n.t('fat')}: {data.fat.toFixed(1)}г ({fatPercent.toFixed(1)}%)</Text>
          </View>
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
    alignItems: 'center',
  },
  circleChart: {
    flexDirection: 'row',
    height: 20,
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 16,
  },
  segment: {
    height: '100%',
  },
  proteinSegment: {
    backgroundColor: '#3B82F6',
  },
  carbsSegment: {
    backgroundColor: '#F59E0B',
  },
  fatSegment: {
    backgroundColor: '#EF4444',
  },
  legend: {
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: colors.neutral[600],
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

export default NutrientsChart; 