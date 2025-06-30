# 🔐 SSH конфигурация для SnapCal продакшн сервера

## 📡 Подключение к серверу

### Конфигурация

Все чувствительные данные хранятся в файле `.env`. Создайте файл `.env` на основе `env.example` со следующими переменными:

```bash
SSH_HOST=your-server-host
SSH_PORT=your-ssh-port
SSH_USER=your-username
SSH_PASSWORD=your-password
```

### Команда подключения

```bash
# Загрузите переменные из .env
source .env

# Подключение
ssh $SSH_USER@$SSH_HOST -p $SSH_PORT
```

## 🔐 Автоматизация подключения

### Вариант 1: SSH ключи (Рекомендуется)

```bash
# Генерация SSH ключа (на локальной машине)
ssh-keygen -t rsa -b 4096 -C "snapcal-key"

# Загрузите переменные
source .env

# Копирование ключа на сервер
ssh-copy-id -i ~/.ssh/id_rsa.pub -p $SSH_PORT $SSH_USER@$SSH_HOST

# После этого подключение без пароля:
ssh $SSH_USER@$SSH_HOST -p $SSH_PORT
```

### Вариант 2: Использование sshpass (Linux/WSL)

```bash
# Установка sshpass (Ubuntu/Debian)
sudo apt-get install sshpass

# Загрузите переменные из .env
source .env

# Подключение с автоматическим вводом пароля
sshpass -p "$SSH_PASSWORD" ssh $SSH_USER@$SSH_HOST -p $SSH_PORT
```

### Вариант 3: SSH конфиг файл

Создайте файл `~/.ssh/config`:

```
Host snapcal
    HostName [ВАШЕ_ЗНАЧЕНИЕ_SSH_HOST]
    Port [ВАШЕ_ЗНАЧЕНИЕ_SSH_PORT]
    User [ВАШЕ_ЗНАЧЕНИЕ_SSH_USER]
    IdentityFile ~/.ssh/id_rsa
```

Затем подключение просто:

```bash
ssh snapcal
```

### Вариант 4: PowerShell с автоматизацией (Windows)

```powershell
# Используйте скрипт .\scripts\start-backend.ps1
# который автоматически загружает переменные из .env
```

## 🔧 Основные команды на сервере

### Управление приложением (PM2)

```bash
# Просмотр всех процессов
pm2 list

# Статус конкретного приложения
pm2 status snapcal

# Просмотр логов (последние 100 строк)
pm2 logs snapcal --lines 100

# Мониторинг в реальном времени
pm2 monit

# Перезапуск приложения
pm2 restart snapcal

# Остановка приложения
pm2 stop snapcal

# Запуск приложения
pm2 start snapcal

# Информация о процессе
pm2 info snapcal
```

### Проверка системы

```bash
# Проверка порта 3333
netstat -tulpn | grep :3333
ss -tulpn | grep :3333

# Состояние MySQL
systemctl status mysql

# Использование диска
df -h

# Использование памяти
free -h
top

# Проверка процессов
ps aux | grep node
ps aux | grep mysql
```

### Работа с логами

```bash
# Логи приложения
pm2 logs snapcal

# Логи системы
journalctl -u mysql
journalctl -u nginx

# Логи веб-сервера (если nginx)
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Поиск ошибок в логах
pm2 logs snapcal | grep -i error
```

## 🚀 Развертывание и обновления

### Полный цикл обновления

```bash
# 1. Подключение к серверу (используйте .env переменные)
source .env
ssh $SSH_USER@$SSH_HOST -p $SSH_PORT

# 2. Переход в папку проекта
cd /home/snapcalfun/www/backend

# 3. Резервное копирование БД (ОБЯЗАТЕЛЬНО!)
mysqldump -u [username] -p snapcal_db > backup_$(date +%Y%m%d_%H%M%S).sql

# 4. Обновление кода
git pull origin main

# 5. Установка зависимостей
cd backend && npm install

# 6. Запуск миграций (если есть)
npm run migrate  # ОСТОРОЖНО с продакшн данными!

# 7. Перезапуск приложения
pm2 restart snapcal

# 8. Проверка работоспособности
curl -I https://snapcal.fun/api/health
pm2 logs snapcal --lines 20
```

### Быстрая проверка работоспособности

```bash
# Проверка API
curl -X GET https://snapcal.fun/api/health
curl -X GET https://snapcal.fun/api/status

# Проверка соединения с БД
mysql -u [username] -p -e "SELECT 1;"

# Проверка процесса Node.js
pm2 status snapcal
```

## 🗄️ Работа с базой данных

### Подключение к MySQL

```bash
# Подключение к БД
mysql -u [username] -p snapcal_db

# Основные команды SQL
SHOW TABLES;
DESCRIBE users;
SELECT COUNT(*) FROM users;
SHOW PROCESSLIST;
```

### Резервное копирование

```bash
# Создание backup
mysqldump -u [username] -p snapcal_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Сжатый backup
mysqldump -u [username] -p snapcal_db | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Восстановление из backup
mysql -u [username] -p snapcal_db < backup_file.sql
```

## 🌐 Работа с веб-сервером

### Nginx (если используется)

```bash
# Проверка конфигурации
nginx -t

# Перезагрузка конфигурации
systemctl reload nginx

# Статус службы
systemctl status nginx

# Проверка обратного прокси
curl -I http://localhost:3333
curl -I https://snapcal.fun
```

### SSL сертификат

```bash
# Проверка сертификата
openssl s_client -connect snapcal.fun:443 -servername snapcal.fun

# Информация о сертификате
curl -vI https://snapcal.fun 2>&1 | grep -A 10 "Server certificate"
```

## 📁 Файловая система

### Структура проекта на сервере

```bash
# Переход в папку проекта
cd /home/snapcalfun/www/backend

# Размер папки проекта
du -sh /home/snapcalfun/www/backend

# Права доступа
ls -la /home/snapcalfun/www/backend
```

### Загруженные файлы (фото)

```bash
# Проверка папки с фото
ls -la /home/snapcalfun/www/backend/public/
du -sh /home/snapcalfun/www/backend/public/

# Очистка старых файлов (ОСТОРОЖНО!)
find /home/snapcalfun/www/backend/public/ -name "*.jpg" -mtime +30 -type f
```

## ⚠️ Безопасность

- **НИКОГДА** не размещайте пароли в коде или документации
- Используйте файл `.env` для хранения чувствительных данных
- Файл `.env` добавлен в `.gitignore` и не попадает в репозиторий
- Регулярно создавайте резервные копии базы данных
- Используйте SSH ключи вместо паролей когда это возможно

## 📞 Экстренные контакты и процедуры

### Если приложение не отвечает

1. Проверить статус: `pm2 status snapcal`
2. Посмотреть логи: `pm2 logs snapcal --lines 50`
3. Перезапустить: `pm2 restart snapcal`
4. Проверить порт: `netstat -tulpn | grep :3333`

### Если БД недоступна

1. Проверить статус: `systemctl status mysql`
2. Перезапустить: `systemctl restart mysql`
3. Проверить соединения: `mysql -u [username] -p`
4. Посмотреть логи: `journalctl -u mysql`

---

**Примечание**: Замените `[username]` на реальное имя пользователя БД и `/path/to/snapcal` на фактический путь к проекту на сервере.
