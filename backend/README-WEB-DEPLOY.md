# 🌐 Деплой веб-версии SnapCal на snapcal.fun

## 📋 Обзор

Веб-версия SnapCal теперь интегрирована в ваш существующий Node.js сервер и будет доступна по адресу `https://snapcal.fun`

## 🚀 Что было добавлено

### 1. Статические файлы
```backend/public/
├── index.html      # Главная страница веб-приложения
├── styles.css      # CSS стили
└── app.js          # JavaScript функциональность
```

### 2. Изменения в сервере
- **backend/src/index.js**: Добавлена поддержка статических файлов и SPA routing
- Express теперь отдает веб-приложение для всех не-API запросов

### 3. Улучшения AI API
- Увеличен таймаут до 2 минут
- Оптимизированы параметры OpenAI (detail: "low", размер изображения 512x384)
- Улучшена обработка ошибок таймаута

## 📦 Деплой на продакшн

### Шаг 1: Загрузка файлов на сервер
```bash
# Скопируйте папку public на сервер в директорию backend/
scp -r backend/public/ user@snapcal.fun:/path/to/your/app/backend/

# Или используйте git
git add backend/public/
git commit -m "Add web version"
git push
```

### Шаг 2: Обновление сервера
```bash
# На сервере snapcal.fun
cd /path/to/your/app/backend/
git pull origin main

# Перезапуск Node.js приложения
pm2 restart snapcal-backend
# или
systemctl restart snapcal-backend
```

### Шаг 3: Проверка nginx конфигурации
Убедитесь что nginx правильно проксирует запросы:
```nginx
server {
    listen 80;
    server_name snapcal.fun;
    
    # Статические файлы (если нужно кешировать)
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
        proxy_pass http://localhost:3333;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Все остальные запросы
    location / {
        proxy_pass http://localhost:3333;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🌟 Функциональность веб-версии

### ✅ Что работает:
- 🔐 Регистрация и авторизация
- 📸 Загрузка изображений (drag & drop)
- 🤖 AI анализ еды (с улучшенными таймаутами)
- 💾 Сохранение приемов пищи
- 🌍 Поддержка 5 языков
- 📱 Адаптивный дизайн

### 🔄 Процесс использования:
1. Пользователь заходит на `https://snapcal.fun`
2. Регистрируется или входит в аккаунт
3. Загружает фото еды
4. Получает AI анализ калорийности
5. Сохраняет результат в базу данных

## ⚙️ Переменные окружения

Добавьте в `.env` на сервере:
```env
# AI оптимизация
AI_MODEL=gpt-4-vision-preview
AI_MAX_TOKENS=500
AI_CACHE_ENABLED=true
AI_FALLBACK_ENABLED=true

# Таймауты
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🔧 Отладка

### Проверка работы веб-версии:
```bash
# Проверка статических файлов
curl https://snapcal.fun/styles.css
curl https://snapcal.fun/app.js

# Проверка API
curl https://snapcal.fun/api/health

# Проверка главной страницы
curl https://snapcal.fun/
```

### Логи сервера:
```bash
# PM2 логи
pm2 logs snapcal-backend

# Системные логи
journalctl -u snapcal-backend -f
```

## 📊 Мониторинг

После деплоя проверьте:
- ✅ Главная страница загружается: `https://snapcal.fun`
- ✅ API работает: `https://snapcal.fun/api/health`
- ✅ Регистрация пользователей
- ✅ AI анализ изображений
- ✅ Сохранение в базу данных

## 🚨 Решение проблем

### Проблема: 404 для статических файлов
```bash
# Проверьте права доступа
chmod -R 755 backend/public/

# Проверьте структуру файлов
ls -la backend/public/
```

### Проблема: AI анализ не работает
```bash
# Проверьте переменные окружения
echo $OPENAI_API_KEY

# Проверьте логи AI сервиса
grep "AI Analysis" /var/log/snapcal.log
```

### Проблема: Таймауты
- Проверьте интернет соединение сервера
- Увеличьте таймауты в nginx
- Проверьте нагрузку на OpenAI API

## 🎯 Следующие шаги

1. **Мониторинг**: Настройте мониторинг AI запросов
2. **Кеширование**: Включите кеширование AI результатов
3. **Аналитика**: Добавьте Google Analytics
4. **SEO**: Добавьте мета-теги и sitemap
5. **PWA**: Превратите в Progressive Web App

## 📱 Связь с мобильным приложением

Веб-версия использует тот же API что и мобильное приложение:
- Общая база данных пользователей
- Синхронизация приемов пищи
- Единая система авторизации

Пользователи могут использовать один аккаунт на всех платформах! 