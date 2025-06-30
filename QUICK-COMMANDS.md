# ⚡ Быстрые команды для SnapCal

## 🚀 Подключение к серверу

```bash
# Обычное подключение (данные см. в .env файле)
ssh [USER]@[HOST] -p [PORT]

# С автоматическим вводом пароля (Linux/WSL)
# Сначала загрузите переменные из .env:
source .env
sshpass -p "$SSH_PASSWORD" ssh $SSH_USER@$SSH_HOST -p $SSH_PORT

# Переход в папку бэкенда после подключения
cd /home/snapcalfun/www/backend
```

## 🤖 Автоматический запуск бэкенда

```bash
# Linux/WSL/macOS
./scripts/start-backend.sh

# Windows PowerShell
.\scripts\start-backend.ps1
```

## 📱 Локальная разработка

```bash
# Frontend (React Native/Expo)
cd frontend
npx expo start                    # Запуск с QR кодом
npx expo start --tunnel           # Для внешнего доступа
npx expo start --clear            # Очистка кэша

# Очистка и перезапуск
npx expo r --clear
```

## 🔧 Управление сервером (PM2)

```bash
pm2 status snapcal               # Статус приложения
pm2 logs snapcal                 # Просмотр логов
pm2 restart snapcal              # Перезапуск
pm2 monit                        # Мониторинг
```

## 🗄️ База данных

```bash
# Резервное копирование (ОБЯЗАТЕЛЬНО перед изменениями!)
mysqldump -u [username] -p snapcal_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Подключение к БД
mysql -u [username] -p snapcal_db
```

## 🌐 Проверка API

```bash
curl -I https://snapcal.fun/api/health    # Проверка работы API
curl -I https://snapcal.fun               # Проверка домена
```

## 📊 Мониторинг системы

```bash
df -h                            # Место на диске
free -h                          # Использование памяти
netstat -tulpn | grep :3333      # Проверка порта 3333
```

## 🎨 Иконки приложения

```bash
# Очистка кэша после добавления иконок
cd frontend
npx expo start --clear
```

---

**Совет**: Сохраните эти команды как закладки или алиасы для быстрого доступа!
