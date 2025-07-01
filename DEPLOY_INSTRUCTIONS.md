# Инструкции по развертыванию SnapCal Backend

## 📋 Обязательные файлы для загрузки на сервер

### 1. Backend файлы (обновить на сервере):

```
backend/src/config/database.js → /home/snapcalfun/www/backend/src/config/database.js
backend/src/routes/meals-mysql.js → /home/snapcalfun/www/backend/src/routes/meals-mysql.js
backend/deploy-migration.js → /home/snapcalfun/www/backend/deploy-migration.js
backend/database/migrations/002_add_missing_fields.sql → /home/snapcalfun/www/backend/database/migrations/002_add_missing_fields.sql
```

## 🚀 Пошаговое развертывание

### Шаг 1: Остановка PM2 процессов

```bash
# Подключение к серверу
ssh snapcalfun@decloud2376

# Остановка всех PM2 процессов (без sudo!)
pm2 stop all

# Проверка статуса
pm2 status
```

### Шаг 2: Загрузка файлов на сервер

**После остановки сервисов загрузите 4 файла:**

- `backend/src/config/database.js`
- `backend/src/routes/meals-mysql.js`
- `backend/deploy-migration.js`
- `backend/database/migrations/002_add_missing_fields.sql`

### Шаг 3: Создание папки для миграций (если не существует)

```bash
# На сервере
cd /home/snapcalfun/www/backend
mkdir -p database/migrations
```

### Шаг 4: Выполнение миграции базы данных

```bash
# На сервере в папке /home/snapcalfun/www/backend
node deploy-migration.js
```

### Шаг 5: Перезапуск PM2 процессов

```bash
# Запуск всех процессов (без sudo!)
pm2 start all

# Или если нужно перезапустить конкретное приложение
pm2 restart snapcal-backend

# Проверка что всё работает
pm2 status
pm2 logs
```

### Шаг 6: Проверка работоспособности

```bash
# Проверка API
curl https://snapcal.fun/api/test

# Проверка логов в реальном времени
pm2 logs snapcal-backend --lines 50
```

## 🔧 PM2 команды (без sudo!)

### Основные команды:

```bash
# Просмотр всех процессов
pm2 status

# Запуск приложения
pm2 start server.js --name snapcal-backend

# Остановка процесса
pm2 stop snapcal-backend

# Перезапуск процесса
pm2 restart snapcal-backend

# Удаление процесса
pm2 delete snapcal-backend

# Просмотр логов
pm2 logs snapcal-backend

# Просмотр логов в реальном времени
pm2 logs snapcal-backend --lines 100

# Очистка логов
pm2 flush

# Сохранение текущих процессов для автозапуска
pm2 save

# Настройка автозапуска при перезагрузке сервера
pm2 startup
```

### Мониторинг:

```bash
# Просмотр детальной информации
pm2 describe snapcal-backend

# Мониторинг в реальном времени
pm2 monit

# Просмотр метрик
pm2 web
```

## ⚠️ Важные замечания

1. **Никогда не используйте sudo с PM2** - все команды выполняются от пользователя snapcalfun
2. **Всегда останавливайте PM2 перед обновлением файлов** - избегайте конфликтов
3. **Проверяйте логи после перезапуска** - убедитесь что нет ошибок
4. **Делайте бэкап БД перед миграциями** - безопасность данных
5. **Тестируйте изменения локально** - перед развертыванием на продакшн

## 🔍 Диагностика проблем

### Если PM2 не запускается:

```bash
# Проверка процессов Node.js
ps aux | grep node

# Проверка занятых портов
netstat -tulpn | grep :3333

# Перезапуск PM2 демона
pm2 kill
pm2 resurrect
```

### Если миграция не выполняется:

```bash
# Проверка что файл существует
ls -la /home/snapcalfun/www/backend/deploy-migration.js

# Проверка прав доступа
chmod +x /home/snapcalfun/www/backend/deploy-migration.js

# Ручная проверка подключения к БД
cd /home/snapcalfun/www/backend
node -e "require('dotenv').config(); console.log(process.env.DB_HOST);"
```

## 📊 Результат успешного развертывания

После выполнения всех шагов:

- ✅ Новые блюда добавляются в начало списка
- ✅ AI confidence сохраняется после перелогина
- ✅ Создание аккаунтов работает без ошибок
- ✅ AI анализ работает стабильно
- ✅ API не падает по таймаутам
