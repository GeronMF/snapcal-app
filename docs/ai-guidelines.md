# Руководство для AI помощника - Проект SnapCal

## Обзор проекта
SnapCal - это мультиязычное мобильное приложение для управления календарем и событиями. Проект включает в себя фронтенд на React Native/Expo, бэкенд на Node.js и систему развертывания на Docker. Приложение поддерживает 5 языков: английский, испанский, польский, русский и украинский.

## Архитектура развертывания
- **Frontend**: Разработка локально через Expo Go, подключение к продакшн API
- **Backend**: Продакшн сервер с Node.js на порту 3333 
- **Домен**: snapcal.fun с настроенным обратным прокси
- **База данных**: MySQL на продакшн сервере с реальными данными клиентов
- **Файлы**: Загруженные фото хранятся в папке backend/public/
- **Поток данных**: Frontend (Expo Go) → https://snapcal.fun → localhost:3333 → MySQL

## Доступ к продакшн серверу

### SSH подключение
```bash
# Подключение к продакшн серверу
ssh snapcalfun@decloud2376.zahid.host -p 32762
# Пароль: 5c3c0bcc-8b91-45c9-8610-9dc02ad53cb5
```

### Основные команды на сервере
```bash
# Переход в папку проекта
cd /path/to/snapcal

# Просмотр статуса приложения
pm2 list
pm2 status snapcal

# Просмотр логов
pm2 logs snapcal
pm2 logs snapcal --lines 100

# Перезапуск приложения
pm2 restart snapcal

# Остановка/запуск
pm2 stop snapcal
pm2 start snapcal

# Просмотр процессов на порту 3333
netstat -tulpn | grep :3333

# Проверка состояния MySQL
systemctl status mysql

# Просмотр свободного места
df -h

# Просмотр использования памяти
free -h
top
```

### Развертывание обновлений
```bash
# Подключение к серверу
ssh snapcalfun@decloud2376.zahid.host -p 32762

# Переход в папку проекта
cd /path/to/snapcal

# Обновление кода (если используется git)
git pull origin main

# Установка зависимостей
cd backend && npm install

# Запуск миграций БД (ОСТОРОЖНО!)
npm run migrate

# Перезапуск приложения
pm2 restart snapcal

# Проверка работоспособности
curl -I https://snapcal.fun/api/health
```

### Работа с базой данных
```bash
# Подключение к MySQL
mysql -u username -p snapcal_db

# Резервное копирование БД
mysqldump -u username -p snapcal_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Восстановление БД
mysql -u username -p snapcal_db < backup_file.sql

# Просмотр таблиц
mysql -u username -p -e "SHOW TABLES;" snapcal_db
```

### Мониторинг и отладка
```bash
# Просмотр активных соединений
ss -tulpn | grep :3333

# Проверка nginx (если используется)
systemctl status nginx
nginx -t

# Просмотр логов nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Проверка SSL сертификата
openssl s_client -connect snapcal.fun:443 -servername snapcal.fun

# Тест API
curl -X GET https://snapcal.fun/api/health
curl -X GET https://snapcal.fun/api/status
```

## Архитектура проекта

### Структура папок
```
SNAPCAL13052025/
├── backend/                    # Node.js/Express сервер
│   ├── src/                   # Исходный код сервера
│   ├── public/                # Статические файлы
│   ├── Dockerfile            # Docker конфигурация
│   ├── package.json          # Зависимости бэкенда
│   └── snapcal.db           # MySQL база данных (продакшн сервер)
├── frontend/                  # React Native/Expo приложение
│   ├── app/                  # Основные экраны приложения
│   ├── components/           # Переиспользуемые компоненты
│   ├── contexts/             # React контексты
│   ├── hooks/                # Пользовательские хуки
│   ├── i18n/                 # Интернационализация
│   │   └── translations/     # Переводы (en, es, pl, ru, uk)
│   ├── src/screens/          # Экраны приложения
│   ├── types/                # TypeScript типы
│   ├── utils/                # Утилиты
│   └── package.json          # Зависимости фронтенда
├── database/                  # Скрипты и миграции БД
├── deploy/                    # Конфигурация развертывания
├── docs/                      # Документация проекта
└── .cursorrules              # Правила для AI
```

## Правила разработки

### Языковые предпочтения
- **Все ответы AI должны быть на русском языке**
- Комментарии в коде - на русском
- Названия переменных и функций - на английском
- Документация - на русском

### Стандарты кодирования

#### Frontend (React Native/Expo)
- Использовать функциональные компоненты с хуками
- Состояние управлять через useState/useEffect
- Для сложной логики состояния использовать useReducer
- Стилизация: StyleSheet или styled-components для React Native
- Типизация: TypeScript обязательно
- Навигация: React Navigation
- Интернационализация: react-i18next
- Поддержка всех 5 языков: en, es, pl, ru, uk

#### Backend (Node.js)
- Express.js для API (порт 3333)
- Middleware для аутентификации и валидации
- Обязательная обработка ошибок
- Логирование всех важных операций
- RESTful API принципы
- Обслуживание статических файлов (фото) из public/
- Использование переменных окружения для конфигурации
- Поддержка CORS для фронтенда

#### База данных (MySQL)
- Использовать подготовленные запросы (prepared statements)
- Валидация данных на уровне схемы
- Индексы для оптимизации запросов
- Поддержка UTF-8 для многоязычного контента
- Миграции для версионирования схемы БД

### Безопасность
1. Валидация всех входящих данных
2. Санитизация пользовательского ввода
3. HTTPS для всех соединений (домен snapcal.fun)
4. Защита от SQL инъекций
5. Rate limiting для API
6. Безопасные заголовки HTTP
7. **ОСОБАЯ ОСТОРОЖНОСТЬ**: Работа с реальными продакшн данными
8. Обязательное резервное копирование перед изменениями БД
9. Тестирование всех изменений API на безопасность

### Интернационализация (i18n)
- Поддерживаемые языки: английский (en), испанский (es), польский (pl), русский (ru), украинский (uk)
- Все текстовые строки должны быть вынесены в файлы переводов
- Использовать структурированные ключи (например: "screens.login.welcomeMessage")
- Учитывать культурные особенности (форматы дат, валют, направление текста)
- При добавлении новых текстов обязательно создавать переводы для всех языков

### Тестирование
- Unit тесты для критической логики
- Integration тесты для API endpoints
- E2E тесты для ключевых пользовательских сценариев
- Тестирование на разных языках и локалях

## Рабочий процесс

### При получении задачи:
1. Изучить существующий код в релевантных файлах
2. Понять архитектуру и паттерны проекта
3. Предложить решение, соответствующее стилю проекта
4. Обеспечить обратную совместимость

### При написании кода:
1. Следовать существующим конвенциям
2. Добавлять комментарии для сложной логики
3. Обрабатывать edge cases
4. Включать валидацию ошибок

### При рефакторинге:
1. Не нарушать существующий API
2. Сохранять функциональность
3. Улучшать читаемость кода
4. Оптимизировать производительность

## Примеры использования

### Создание нового API endpoint
```javascript
// Пример правильного оформления endpoint
app.post('/api/events', validateAuth, validateEventData, async (req, res) => {
  try {
    // ВАЖНО: Осторожно с продакшн данными!
    logger.info('Создание нового события', { userId: req.user.id });
    
    // Логика создания события
    const event = await createEvent(req.body);
    
    res.status(201).json({ 
      success: true, 
      data: event,
      message: 'Событие успешно создано'
    });
  } catch (error) {
    logger.error('Ошибка при создании события:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Внутренняя ошибка сервера',
      code: 'EVENT_CREATE_FAILED'
    });
  }
});

// Пример загрузки файлов (фото)
app.post('/api/upload/photo', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Файл не загружен'
      });
    }

    const photoUrl = `${process.env.API_BASE_URL}/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      data: { url: photoUrl },
      message: 'Фото успешно загружено'
    });
  } catch (error) {
    logger.error('Ошибка загрузки фото:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка загрузки файла'
    });
  }
});
```

### Создание React Native компонента
```tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

interface EventCardProps {
  event: Event;
  onUpdate: (event: Event) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onUpdate }) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);

  // Обработка логики компонента
  useEffect(() => {
    // Логика инициализации
  }, [event]);

  return (
    <View style={styles.eventCard}>
      <Text style={styles.title}>
        {t('components.eventCard.title')}
      </Text>
      {/* Остальная разметка */}
    </View>
  );
};

const styles = StyleSheet.create({
  eventCard: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EventCard;
```

### Настройка API в React Native
```typescript
// utils/api.ts - Конфигурация API
const API_BASE_URL = __DEV__ 
  ? 'https://snapcal.fun' // Даже в разработке используем продакшн API
  : 'https://snapcal.fun';

export const api = {
  baseURL: API_BASE_URL,
  
  // Пример запроса к API
  async createEvent(eventData: EventData): Promise<ApiResponse<Event>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`,
        },
        body: JSON.stringify(eventData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Ошибка API');
      }

      return result;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Пример загрузки фото
  async uploadPhoto(uri: string): Promise<ApiResponse<{ url: string }>> {
    try {
      const formData = new FormData();
      formData.append('photo', {
        uri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      } as any);

      const response = await fetch(`${API_BASE_URL}/api/upload/photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`,
        },
        body: formData,
      });

      return await response.json();
    } catch (error) {
      console.error('Upload Error:', error);
      throw error;
    }
  }
};
```

### Пример файла переводов
```typescript
// frontend/i18n/translations/ru.ts
export default {
  screens: {
    login: {
      title: 'Вход в систему',
      welcomeMessage: 'Добро пожаловать в SnapCal',
      emailPlaceholder: 'Введите email',
      passwordPlaceholder: 'Введите пароль',
    },
  },
  components: {
    eventCard: {
      title: 'Событие',
      editButton: 'Редактировать',
      deleteButton: 'Удалить',
    },
  },
  common: {
    save: 'Сохранить',
    cancel: 'Отмена',
    loading: 'Загрузка...',
  },
};
```

## Часто используемые команды

### Docker
```bash
# Запуск в режиме разработки
docker-compose up

# Запуск в продакшене
docker-compose -f docker-compose.prod.yml up -d
```

### Разработка

#### Frontend (React Native/Expo)
```bash
# Установка зависимостей
cd frontend && npm install

# Запуск в режиме разработки (подключение к продакшн API)
npx expo start

# Открыть в Expo Go на устройстве
npx expo start --tunnel

# Запуск на iOS симуляторе
npx expo run:ios

# Запуск на Android эмуляторе
npx expo run:android

# Сборка для продакшена
npx expo build

# Важно: Frontend всегда подключается к https://snapcal.fun
# Реальные данные клиентов и фото из продакшн БД
```

#### Backend (Продакшн сервер)
```bash
# Установка зависимостей
cd backend && npm install

# Запуск сервера на порту 3333
npm run start
# или для разработки
npm run dev

# Запуск тестов
npm test

# Запуск миграций БД (ОСТОРОЖНО - продакшн данные!)
npm run migrate

# Проверка состояния сервера
curl https://snapcal.fun/api/health

# Просмотр логов
pm2 logs snapcal
```

## Контакты и поддержка
При возникновении вопросов по архитектуре или специфическим требованиям проекта, всегда обращайтесь к этому документу и файлу `.cursorrules`. 