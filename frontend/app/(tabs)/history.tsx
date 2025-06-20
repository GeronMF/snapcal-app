import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  Platform,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { useMeals } from '@/contexts/MealsContext';
import { useUser } from '@/contexts/UserContext';
import MealList from '@/components/MealList';
import { Calendar } from 'react-native-calendars';
import { format } from 'date-fns';
import i18n from '@/i18n';
import colors from '@/constants/colors';
import { calculateCaloriesConsumed } from '@/utils/calorieCalculator';

export default function HistoryScreen() {
  const { meals } = useMeals();
  const { user } = useUser();
  
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedDayMeals, setSelectedDayMeals] = useState<any[]>([]);
  const [markedDates, setMarkedDates] = useState<any>({});
  
  // Group meals by date for calendar marking with color coding
  useEffect(() => {
    const mealsByDate: { [date: string]: any[] } = {};
    
    meals.forEach(meal => {
      if (!mealsByDate[meal.date]) {
        mealsByDate[meal.date] = [];
      }
      mealsByDate[meal.date].push(meal);
    });
    
    // Create marked dates object for calendar with color coding
    const marked: any = {};
    const dailyTarget = user?.dailyCalorieTarget || 2000;
    
    // Function to get color based on calorie consumption
    const getDateColor = (date: string, mealsForDate: any[]) => {
      if (!mealsForDate || mealsForDate.length === 0) {
        // No meals - yellow
        return {
          textColor: '#D97706', // Amber 600
          backgroundColor: '#FEF3C7', // Amber 100
          borderColor: '#F59E0B', // Amber 500
        };
      }
      
      const totalCalories = calculateCaloriesConsumed(mealsForDate);
      
      if (totalCalories > dailyTarget) {
        // Over target - red
        return {
          textColor: '#DC2626', // Red 600
          backgroundColor: '#FEE2E2', // Red 100
          borderColor: '#EF4444', // Red 500
        };
      } else {
        // Under or at target - green
        return {
          textColor: '#059669', // Green 600
          backgroundColor: '#D1FAE5', // Green 100
          borderColor: '#10B981', // Green 500
        };
      }
    };
    
    // Mark all dates with meals
    Object.keys(mealsByDate).forEach(date => {
      const colors = getDateColor(date, mealsByDate[date]);
      marked[date] = {
        marked: true,
        customStyles: {
          container: {
            backgroundColor: colors.backgroundColor,
            borderWidth: 1,
            borderColor: colors.borderColor,
            borderRadius: 16,
          },
          text: {
            color: colors.textColor,
            fontWeight: '600',
          },
        },
      };
    });
    
    // Add selection to currently selected date
    if (marked[selectedDate]) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: colors.primary[500],
        selectedTextColor: colors.white,
      };
    } else {
      // Selected date has no meals
      const colors = getDateColor(selectedDate, []);
      marked[selectedDate] = {
        selected: true,
        customStyles: {
          container: {
            backgroundColor: colors.backgroundColor,
            borderWidth: 2,
            borderColor: colors.borderColor,
            borderRadius: 16,
          },
          text: {
            color: colors.textColor,
            fontWeight: '700',
          },
        },
      };
    }
    
    setMarkedDates(marked);
    
    // Update selected day meals
    setSelectedDayMeals(mealsByDate[selectedDate] || []);
  }, [meals, selectedDate, user?.dailyCalorieTarget]);
  
  // Handle date selection
  const handleDateSelect = (day: any) => {
    setSelectedDate(day.dateString);
  };
  
  // Format date for display
  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.locale, { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Calculate total calories for selected day
  const totalCalories = calculateCaloriesConsumed(selectedDayMeals);
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{i18n.t('historyTitle')}</Text>
      </View>
      
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Calendar
          style={styles.calendar}
          theme={{
            calendarBackground: colors.white,
            textSectionTitleColor: colors.neutral[700],
            selectedDayBackgroundColor: colors.primary[500],
            selectedDayTextColor: colors.white,
            todayTextColor: colors.primary[500],
            dayTextColor: colors.neutral[800],
            textDisabledColor: colors.neutral[400],
            dotColor: colors.primary[500],
            arrowColor: colors.primary[500],
            monthTextColor: colors.neutral[900],
            indicatorColor: colors.primary[500],
            textDayFontFamily: 'Inter-Regular',
            textMonthFontFamily: 'Inter-Medium',
            textDayHeaderFontFamily: 'Inter-Medium',
          }}
          markedDates={markedDates}
          markingType={'custom'}
          onDayPress={handleDateSelect}
          hideExtraDays={true}
          enableSwipeMonths={true}
        />
        
        {/* Color Legend */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#D1FAE5', borderColor: '#10B981' }]} />
            <Text style={styles.legendText}>Норма соблюдена</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FEE2E2', borderColor: '#EF4444' }]} />
            <Text style={styles.legendText}>Норма превышена</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]} />
            <Text style={styles.legendText}>Нет записей</Text>
          </View>
        </View>
        
        <View style={styles.selectedDayContainer}>
          <Text style={styles.selectedDayText}>{formatDisplayDate(selectedDate)}</Text>
          
          <View style={styles.caloriesSummary}>
            <Text style={styles.caloriesLabel}>{i18n.t('caloriesConsumed')}</Text>
            <Text style={styles.caloriesValue}>{totalCalories} kcal</Text>
          </View>
          
          <View style={styles.mealsContainer}>
            {selectedDayMeals.length === 0 ? (
              <Text style={styles.noMealsText}>{i18n.t('noMealsHistory')}</Text>
            ) : (
              <MealList 
                meals={selectedDayMeals} 
                compact={true}
                useScrollView={true}
              />
            )}
          </View>
        </View>
      </ScrollView>
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
  calendar: {
    borderRadius: 10,
    elevation: 2,
    margin: 16,
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  selectedDayContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedDayText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral[800],
    marginBottom: 16,
    fontFamily: 'Inter-SemiBold',
  },
  caloriesSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
    marginBottom: 16,
  },
  caloriesLabel: {
    fontSize: 14,
    color: colors.neutral[600],
    fontFamily: 'Inter-Regular',
  },
  caloriesValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary[600],
    fontFamily: 'Inter-SemiBold',
  },
  mealsContainer: {
    marginTop: 8,
  },
  noMealsText: {
    fontSize: 16,
    color: colors.neutral[500],
    textAlign: 'center',
    padding: 24,
    fontFamily: 'Inter-Regular',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: -8,
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: colors.neutral[600],
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
});