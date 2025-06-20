# SnapCal - Приложение для определения калорийности пищи

SnapCal - это мобильное приложение для определения калорийности пищи по фотографиям с использованием AI.

## 🚀 Быстрый старт

### Предварительные требования

- Docker и Docker Compose
- Node.js 18+ (для локальной разработки)
- PostgreSQL (для продакшена)

### Локальная разработка

1. **Клонируйте репозиторий:**
```bash
git clone <repository-url>
cd SnapCal13052025
```

2. **Запустите приложение с помощью Docker Compose:**
```bash
docker-compose up -d
```

3. **Проверьте статус сервисов:**
```bash
docker-compose ps
```

4. **Откройте приложение:**
- Фронтенд: http://localhost:8081
- Бэкенд API: http://localhost:3000
- База данных: localhost:5432

### Структура проекта

```
├── frontend/          # React Native приложение
├── backend/           # Node.js API сервер
├── database/          # SQL скрипты и миграции
├── deploy/            # Конфигурация для продакшена
└── docker-compose.yml # Docker конфигурация
```

## 🔧 Конфигурация

### Переменные окружения

Создайте файл `.env` в папке `backend/`:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=snapcal
DB_USER=user
DB_PASSWORD=password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

## 📱 API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация пользователя
- `POST /api/auth/login` - Вход пользователя
- `GET /api/auth/me` - Получить текущего пользователя

### Пользователи
- `PUT /api/users/profile` - Обновить профиль
- `GET /api/users/stats` - Получить статистику

### Приемы пищи
- `GET /api/meals` - Получить все приемы пищи
- `POST /api/meals` - Создать новый прием пищи
- `PUT /api/meals/:id` - Обновить прием пищи
- `DELETE /api/meals/:id` - Удалить прием пищи
- `POST /api/meals/upload` - Загрузить изображение

### AI анализ
- `POST /api/ai/analyze` - Анализ изображения еды
- `GET /api/ai/status` - Статус AI сервиса

## 🗄️ База данных

### Структура таблиц

**users:**
- id (UUID, Primary Key)
- name (VARCHAR)
- email (VARCHAR, Unique)
- password_hash (VARCHAR)
- language (VARCHAR)
- age (INTEGER)
- gender (VARCHAR)
- height (INTEGER)
- weight (DECIMAL)
- activity_level (VARCHAR)
- goal (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**meals:**
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- name (VARCHAR)
- calories (INTEGER)
- protein (DECIMAL)
- carbs (DECIMAL)
- fat (DECIMAL)
- image_uri (TEXT)
- comment (TEXT)
- is_favorite (BOOLEAN)
- date (DATE)
- timestamp (BIGINT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

## 🚀 Продакшен развертывание

### Настройка сервера

1. **Подключитесь к серверу:**
```bash
ssh user@your-server.com
```

2. **Установите Docker и Docker Compose:**
```bash
# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Установка Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

3. **Настройте Nginx:**
```bash
# Скопируйте конфигурацию
sudo cp deploy/nginx.conf /etc/nginx/sites-available/snapcal
sudo ln -s /etc/nginx/sites-available/snapcal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

4. **Настройте SSL (опционально):**
```bash
# Установите Certbot
sudo apt install certbot python3-certbot-nginx

# Получите SSL сертификат
sudo certbot --nginx -d snapcal.fun -d www.snapcal.fun
```

### Развертывание приложения

1. **Клонируйте код на сервер:**
```bash
git clone <repository-url> /var/www/snapcal
cd /var/www/snapcal
```

2. **Настройте переменные окружения для продакшена:**
```bash
cp backend/env.example backend/.env
# Отредактируйте .env файл с продакшен настройками
```

3. **Запустите приложение:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

4. **Проверьте статус:**
```bash
docker-compose ps
docker-compose logs -f
```

## 🔒 Безопасность

- Все пароли хешируются с помощью bcrypt
- JWT токены для аутентификации
- Rate limiting для защиты от DDoS
- Валидация входных данных
- CORS настройки для безопасности

## 📊 Мониторинг

- Health check endpoint: `GET /health`
- Логирование запросов с помощью Morgan
- Обработка ошибок с детальной информацией

## 🤝 Разработка

### Добавление новых функций

1. Создайте новую ветку:
```bash
git checkout -b feature/new-feature
```

2. Внесите изменения в код

3. Протестируйте изменения:
```bash
# Тесты бэкенда
cd backend && npm test

# Линтинг фронтенда
cd frontend && npm run lint
```

4. Создайте Pull Request

### Структура кода

- **Backend**: MVC архитектура с Express.js
- **Frontend**: React Native с Expo
- **Database**: PostgreSQL с миграциями
- **API**: RESTful API с JWT аутентификацией

## 📞 Поддержка

Если у вас есть вопросы или проблемы:

1. Проверьте логи: `docker-compose logs`
2. Проверьте статус сервисов: `docker-compose ps`
3. Создайте Issue в репозитории

## 📄 Лицензия

MIT License - см. файл LICENSE для деталей. 