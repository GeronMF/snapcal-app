import CaloriesChart from '@/components/CaloriesChart';
import MealList from '@/components/MealList';
import NutrientsChart from '@/components/NutrientsChart';
import colors from '@/constants/colors';
import { useMeals } from '@/contexts/MealsContext';
import { useUser } from '@/contexts/UserContext';
import i18n from '@/i18n';
import { calculateCaloriesConsumed } from '@/utils/calorieCalculator';
import { format } from 'date-fns';
import { enUS, es, pl, ru, uk } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Calendar } from 'react-native-calendars';

const localeMap = {
  ru,
  en: enUS,
  es,
  pl,
  uk,
};

const calendarLabels = {
  ru: {
    monthNames: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
    monthNamesShort: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
    dayNames: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
    dayNamesShort: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  },
  en: {
    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  },
  es: {
    monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  },
  pl: {
    monthNames: ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'],
    monthNamesShort: ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'],
    dayNames: ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'],
    dayNamesShort: ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb'],
  },
  uk: {
    monthNames: ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'],
    monthNamesShort: ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер', 'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру'],
    dayNames: ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'Пʼятниця', 'Субота'],
    dayNamesShort: ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  },
};

export default function HistoryScreen() {
  const { meals, removeMeal, toggleFavorite, favoriteMeals } = useMeals();
  const { user, calculateTargetCalories } = useUser();
  
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedDayMeals, setSelectedDayMeals] = useState<any[]>([]);
  const [markedDates, setMarkedDates] = useState<any>({});
  
  // Получаем локаль для календаря
  const calendarLocale = localeMap[user?.language || 'en'];
  
  // Получаем актуальную дневную норму калорий
  const dailyTarget = calculateTargetCalories();
  
  // Group meals by date for calendar marking with color coding
  useEffect(() => {
    const mealsByDate: { [date: string]: any[] } = {};
    
    meals.forEach(meal => {
      // Нормализуем дату так же как в MealsContext
      const normalizedDate = meal.date.includes('T') ? meal.date.split('T')[0] : meal.date;
      
      if (!mealsByDate[normalizedDate]) {
        mealsByDate[normalizedDate] = [];
      }
      mealsByDate[normalizedDate].push(meal);
    });
    
    // Сортируем блюда в каждой дате по времени (новые сверху)
    Object.keys(mealsByDate).forEach(date => {
      mealsByDate[date].sort((a, b) => b.timestamp - a.timestamp);
    });
    
    // Create marked dates object for calendar with color coding
    const marked: any = {};
    
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
      // Сохраняем существующую цветовую схему для выбранной даты
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: 'transparent', // Убираем стандартный цвет выбора
        selectedTextColor: marked[selectedDate].customStyles?.text?.color || colors.neutral[800],
        customStyles: {
          ...marked[selectedDate].customStyles,
          container: {
            ...marked[selectedDate].customStyles?.container,
            borderWidth: 3, // Увеличиваем границу для выбранной даты
          },
        },
      };
    } else {
      // Selected date has no meals
      const dateColors = getDateColor(selectedDate, []);
      marked[selectedDate] = {
        selected: true,
        selectedColor: 'transparent',
        selectedTextColor: dateColors.textColor,
        customStyles: {
          container: {
            backgroundColor: dateColors.backgroundColor,
            borderWidth: 3,
            borderColor: dateColors.borderColor,
            borderRadius: 16,
          },
          text: {
            color: dateColors.textColor,
            fontWeight: '700',
          },
        },
      };
    }
    
    setMarkedDates(marked);
    
    // Update selected day meals
    setSelectedDayMeals(mealsByDate[selectedDate] || []);
  }, [meals, selectedDate, dailyTarget]);
  
  // Handle date selection
  const handleDateSelect = (day: any) => {
    setSelectedDate(day.dateString);
  };
  
  // Format date for display
  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(user?.language || 'en', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Формат месяца для календаря
  const getMonthFormat = (date: Date) => {
    return format(date, 'LLLL yyyy', { locale: calendarLocale });
  };
  
  // Calculate total calories for selected day
  const totalCalories = calculateCaloriesConsumed(selectedDayMeals);
  
  // Determine color for calories value based on target
  const caloriesColor = totalCalories > dailyTarget ? colors.error[600] : colors.primary[600];

  // Calculate week data for charts
  const getWeekData = () => {
    const selectedDay = new Date(selectedDate);
    const weekDays = [];
    const weekMeals: any[] = [];
    
    // Get 7 days including selected day (3 days before, selected day, 3 days after)
    for (let i = -3; i <= 3; i++) {
      const day = new Date(selectedDay);
      day.setDate(selectedDay.getDate() + i);
      const dayString = format(day, 'yyyy-MM-dd');
      
      weekDays.push({
        date: dayString,
        day: format(day, 'EEE'), // Short day name
        meals: meals.filter(meal => {
          const mealDate = meal.date.includes('T') ? meal.date.split('T')[0] : meal.date;
          return mealDate === dayString;
        })
      });
    }
    
    // Calculate nutrients for the week
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    
    weekDays.forEach(day => {
      day.meals.forEach(meal => {
        totalProtein += meal.protein || 0;
        totalCarbs += meal.carbs || 0;
        totalFat += meal.fat || 0;
      });
    });
    
    // Calculate calories per day for chart
    const caloriesData = weekDays.map(day => ({
      day: day.day,
      date: day.date,
      calories: calculateCaloriesConsumed(day.meals)
    }));
    
    return {
      nutrients: { protein: totalProtein, carbs: totalCarbs, fat: totalFat },
      calories: caloriesData
    };
  };

  const weekData = getWeekData();

  // Handle meal deletion
  const handleDeleteMeal = async (id: string) => {
    await removeMeal(id);
  };

  // Handle favorite toggle
  const handleToggleFavorite = async (id: string) => {
    await toggleFavorite(id);
  };

  const lang = user?.language || 'en';
  const labels = (lang === 'ru' || lang === 'uk') ? calendarLabels[lang] : calendarLabels['en'];

  return (
    <View style={styles.container}>
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
          <View style={[styles.legendItem, styles.legendItemGreen]}>
            <Text style={styles.legendText}>{i18n.t('targetMet')}</Text>
          </View>
          <View style={[styles.legendItem, styles.legendItemRed]}>
            <Text style={styles.legendText}>{i18n.t('targetExceeded')}</Text>
          </View>
          <View style={[styles.legendItem, styles.legendItemYellow]}>
            <Text style={styles.legendText}>{i18n.t('noRecords')}</Text>
          </View>
        </View>
        
        {/* Charts */}
        <View style={styles.chartsContainer}>
          <CaloriesChart 
            data={weekData.calories} 
            dailyTarget={dailyTarget} 
            onBarPress={(date) => setSelectedDate(date)}
          />
          <NutrientsChart 
            data={weekData.nutrients} 
          />
        </View>
        
        <View style={styles.selectedDayContainer}>
          <Text style={styles.selectedDayText}>{formatDisplayDate(selectedDate)}</Text>
          
          <View style={styles.caloriesSummary}>
            <Text style={styles.caloriesLabel}>{i18n.t('caloriesConsumed')}</Text>
            <Text style={[styles.caloriesValue, { color: caloriesColor }]}>{totalCalories} kcal</Text>
          </View>
          
          <View style={styles.mealsContainer}>
            {selectedDayMeals.length === 0 ? (
              <Text style={styles.noMealsText}>{i18n.t('noMealsHistory')}</Text>
            ) : (
              <MealList 
                meals={selectedDayMeals} 
                compact={true}
                useScrollView={true}
                onDeleteMeal={handleDeleteMeal}
                onToggleFavorite={handleToggleFavorite}
                favoriteMeals={favoriteMeals}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </View>
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
    paddingBottom: 16,
  },
  calendar: {
    borderRadius: 10,
    elevation: 2,
    margin: 16,
    marginBottom: 8,
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  selectedDayContainer: {
    margin: 16,
    marginTop: 0,
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
    marginBottom: 12,
    fontFamily: 'Inter-SemiBold',
  },
  caloriesSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
    marginBottom: 12,
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
    marginTop: 4,
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
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 0,
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
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
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  legendText: {
    fontSize: 11,
    color: colors.neutral[700],
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  legendItemGreen: {
    backgroundColor: '#D1FAE5',
  },
  legendItemRed: {
    backgroundColor: '#FEE2E2',
  },
  legendItemYellow: {
    backgroundColor: '#FEF3C7',
  },
  chartsContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
});