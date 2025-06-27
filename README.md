# SnapCal - AI-Powered Calorie Counter

Мобильное приложение для подсчета калорий с использованием искусственного интеллекта для анализа фотографий еды.

## 🚀 Функции

- **AI Анализ изображений**: Определение калорийности пищи через фотографии с помощью OpenAI GPT-4 Vision
- **Мультиязычность**: Поддержка 5 языков (русский, английский, украинский, польский, испанский)
- **Региональная кухня**: Распознавание традиционных блюд разных стран
- **Комментарии пользователя**: Уточнение размера порции и типа блюда
- **Кэширование**: Оптимизация повторных запросов
- **Безопасность**: JWT авторизация и защита данных

## 🏗️ Архитектура

- **Frontend**: React Native (Expo)
- **Backend**: Node.js + Express
- **Database**: MySQL
- **AI**: OpenAI GPT-4 Turbo
- **Image Processing**: Sharp
- **Authentication**: JWT

## 📱 Установка и запуск

### Backend

1. Перейдите в папку backend:
```bash
cd backend
```

2. Установите зависимости:
```bash
npm install
```

3. Настройте переменные окружения:
```bash
cp env.example .env
# Отредактируйте .env файл с вашими настройками
```

4. Выполните миграции базы данных:
```bash
mysql -u your_user -p your_database < database/migrations/001_add_ai_fields.sql
```

5. Запустите сервер:
```bash
npm start
```

### Frontend

1. Перейдите в папку frontend:
```bash
cd frontend
```

2. Установите зависимости:
```bash
npm install
```

3. Запустите приложение:
```bash
npx expo start
```

## 🤖 AI Конфигурация

### Получение OpenAI API ключа

1. Зарегистрируйтесь на [OpenAI Platform](https://platform.openai.com/)
2. Перейдите в [API Keys](https://platform.openai.com/api-keys)
3. Создайте новый API ключ
4. Добавьте его в `.env` файл как `OPENAI_API_KEY`

### Стоимость использования

- Примерная стоимость анализа одного изображения: 2-7 рублей
- Время анализа: 3-6 секунд
- Точность: 85-95% для региональных блюд

### Поддерживаемые языки

- 🇷🇺 Русский (региональные блюда: борщ, пельмени, блины)
- 🇺🇸 Английский (международная кухня)
- 🇺🇦 Украинский (вареники, сало, котлеты по-киевски)
- 🇵🇱 Польский (pierogi, bigos, kotlet schabowy)
- 🇪🇸 Испанский (paella, tapas, gazpacho)

## 📊 База данных

### Новые AI поля в таблице meals:

- `language` - язык анализа
- `ai_confidence` - уверенность AI (0.00-1.00)
- `ai_provider` - провайдер AI (openai)
- `portions` - описание размера порции
- `regional` - региональное блюдо (true/false)

## 🔧 API Endpoints

### AI Анализ
```
POST /api/ai/analyze-food
```
Параметры:
- `image` (file) - изображение еды
- `language` (string) - язык анализа (ru, en, uk, pl, es)
- `comment` (string, optional) - комментарий пользователя

### Meals
```
GET /api/meals - получить все приемы пищи
POST /api/meals - создать новый прием пищи
PUT /api/meals/:id - обновить прием пищи
DELETE /api/meals/:id - удалить прием пищи
```

## 🛡️ Безопасность

- JWT токены для авторизации
- Валидация всех входных данных
- Rate limiting для API запросов
- Сжатие и оптимизация изображений
- Исключение чувствительных данных из git

## 📈 Производительность

- Кэширование результатов AI анализа
- Оптимизация изображений (800x600, JPEG 85%)
- Fallback система при сбоях AI
- Parallel processing для множественных запросов

## 🔄 Deployment

Приложение развернуто на:
- **Backend**: snapcal.fun:3333
- **Database**: MySQL на том же сервере
- **Frontend**: Локально через Expo

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📝 Лицензия

Этот проект лицензирован под MIT License.

## 📞 Поддержка

Если у вас есть вопросы или проблемы, создайте issue в этом репозитории. 