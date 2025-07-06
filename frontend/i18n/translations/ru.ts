export default {
  // General
  appName: 'SlimIQ',
  next: 'Далее',
  back: 'Назад',
  save: 'Сохранить',
  cancel: 'Отмена',
  edit: 'Редактировать',
  delete: 'Удалить',
  confirm: 'Подтвердить',
  done: 'Готово',
  optional: 'не обязательно',
  
  // Onboarding
  welcome: 'Добро пожаловать в SlimIQ!',
  onboardingTitle: 'Давайте настроим ваш профиль',
  selectLanguage: 'Выберите язык',
  personalInfo: 'Персональная информация',
  age: 'Возраст',
  gender: 'Пол',
  male: 'Мужской',
  female: 'Женский',
  other: 'Другой',
  height: 'Рост (см)',
  weight: 'Вес (кг)',
  goal: 'Какая ваша цель?',
  goalLose: 'Похудеть',
  goalMaintain: 'Поддерживать вес',
  goalGain: 'Набрать вес',
  activityLevel: 'Уровень активности',
  activityLevels: {
    sedentary: 'Сидячий',
    light: 'Легкий',
    moderate: 'Умеренный',
    active: 'Активный',
    veryActive: 'Очень активный'
  },
  activityDescriptions: {
    sedentary: 'Мало или совсем нет физической активности',
    light: 'Лёгкая активность или упражнения 1–3 раза в неделю',
    moderate: 'Умеренные упражнения или спорт 3–5 раз в неделю',
    active: 'Интенсивные тренировки 6–7 раз в неделю',
    veryActive: 'Очень интенсивные тренировки, физическая работа или тренировки 2 раза в день'
  },
  goals: {
    lose: 'Похудение',
    maintain: 'Поддержание',
    gain: 'Набор массы'
  },
  
  // Main Screen
  takePicture: 'Сделать фото еды',
  addFoodPortion: 'Добавить порцию еды',
  dailyTarget: 'Дневная норма калорий',
  remaining: 'Осталось',
  consumed: 'Потреблено',
  todayMeals: 'Сегодняшние приемы пищи',
  noMealsYet: 'Сегодня еще нет записей о еде',
  analyzing: 'Анализ вашей еды...',
  confirmMeal: 'Подтвердить прием пищи',
  mealCalories: 'Калории',
  addToFavorites: 'В избранное',
  removeFromFavorites: 'Убрать из избранного',
  favorites: 'Избранное',
  addFromFavorites: 'Добавить из избранного',
  chooseOption: 'Выберите вариант',
  noFavorites: 'Нет избранных блюд',
  uploadFromGallery: 'Загрузить из галереи',
  describeWithText: 'Описать еду текстом',
  textAnalysis: 'Анализ по описанию',
  textDescriptionPlaceholder: 'Опишите вашу еду (например: овсяная каша с медом и орехами, 200 грамм)',
  
  // History
  historyTitle: 'История',
  noMealsHistory: 'История приемов пищи пуста',
  caloriesConsumed: 'Потреблено калорий',
  
  // Settings
  settingsTitle: 'Настройки',
  profileSettings: 'Настройки профиля',
  notificationSettings: 'Настройки уведомлений',
  enableNotifications: 'Включить уведомления',
  reminderTime: 'Время напоминания',
  languageSettings: 'Настройки языка',
  currentLanguage: 'Текущий язык',
  updateProfile: 'Обновить профиль',
  
  // Messages
  mealSaved: 'Регистрация прошла успешно!',
  targetReached: 'Вы достигли своей дневной нормы калорий!',
  targetExceeded: 'Вы превысили свою дневную норму калорий!',
  registrationSuccess: 'Пользователь успешно зарегистрирован!',
  
  // Errors
  cameraPermissionDenied: 'Доступ к камере был отклонен',
  formError: 'Пожалуйста, заполните все обязательные поля',
  loadingError: 'Ошибка загрузки данных',
  
  // New translations
  comment: 'Комментарий',
  commentPlaceholder: 'Добавьте комментарий к блюду...',
  commentExample: 'Пример: две ложки сахара, или суп на говядине',
  name: 'Имя',
  email: 'Email',
  password: 'Пароль',
  register: 'Зарегистрироваться',
  alreadyHaveAccount: 'Уже есть аккаунт? Войти',
  loading: 'Загрузка...',
  error: 'Ошибка',
  login: 'Вход',
  signIn: 'Войти',
  noAccount: 'Нет аккаунта? Зарегистрироваться',
  loginSuccess: 'Вход выполнен!',
  loginError: 'Ошибка входа',
  serverError: 'Не удалось связаться с сервером',
  logout: 'Выйти из аккаунта',
  profileSetup: 'Настройка профиля',
  setupProfile: 'Настройка профиля',
  fillDataForCalories: 'Заполните данные для расчёта дневной нормы калорий',
  saveProfile: 'Сохранить профиль',
  profileSetupSuccess: 'Профиль успешно настроен!',
  
  // AI Analysis
  aiAnalysis: 'Анализ ИИ',
  aiConfidence: 'Точность ИИ',
  time: 'Время',
  calories: 'Калории',
  accuracy: 'Точность',
  regional: 'Региональное',
  portionSize: 'Размер порции',
  nutrients: 'Питательные вещества',
  protein: 'Белки',
  carbs: 'Углеводы',
  fat: 'Жиры',
  
  // Legal & Support
  legalAndSupport: 'Юридическая информация и поддержка',
  termsOfService: '📋 Условия использования',
  privacyPolicy: '🔒 Политика конфиденциальности',
  contactUs: '📞 Связаться с нами',
  
  // Calendar status
  targetMet: 'Норма соблюдена',
  targetExceeded: 'Норма превышена',
  noRecords: 'Нет\nзаписей',
  
  // New translation
  caloriesChartTitle: 'Калории по дням (неделя)',
  nutrientsChartTitle: 'Питательные вещества (неделя)',
};