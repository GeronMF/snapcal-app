# 🚀 Инструкции по развертыванию SnapCal на продакшен сервер

## Предварительные требования

### На сервере должно быть установлено:
- Ubuntu 20.04+ или CentOS 8+
- Docker и Docker Compose
- Git
- Nginx (для проксирования)
- SSL сертификат (Let's Encrypt)

## 📋 Пошаговое развертывание

### 1. Подготовка сервера

```bash
# Подключитесь к серверу
ssh user@your-server.com

# Обновите систему
sudo apt update && sudo apt upgrade -y

# Установите необходимые пакеты
sudo apt install -y curl git nginx certbot python3-certbot-nginx
```

### 2. Установка Docker

```bash
# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Добавьте пользователя в группу docker
sudo usermod -aG docker $USER

# Установка Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Перезапустите сессию или выполните
newgrp docker
```

### 3. Настройка проекта

```bash
# Создайте директорию для проекта
sudo mkdir -p /var/www/snapcal
sudo chown $USER:$USER /var/www/snapcal

# Клонируйте репозиторий
cd /var/www/snapcal
git clone <your-repository-url> .

# Создайте необходимые директории
mkdir -p backend/uploads
mkdir -p ssl
```

### 4. Настройка переменных окружения

```bash
# Скопируйте пример конфигурации
cp backend/env.example backend/.env

# Отредактируйте файл .env
nano backend/.env
```

**Содержимое .env файла для продакшена:**

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Database Configuration
DB_HOST=database
DB_PORT=5432
DB_NAME=snapcal
DB_USER=snapcal_user
DB_PASSWORD=your_secure_password_here

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 5. Настройка Nginx

```bash
# Скопируйте конфигурацию Nginx
sudo cp deploy/nginx.conf /etc/nginx/sites-available/snapcal

# Создайте символическую ссылку
sudo ln -s /etc/nginx/sites-available/snapcal /etc/nginx/sites-enabled/

# Удалите дефолтную конфигурацию
sudo rm -f /etc/nginx/sites-enabled/default

# Проверьте конфигурацию
sudo nginx -t

# Перезапустите Nginx
sudo systemctl reload nginx
```

### 6. Настройка SSL сертификата

```bash
# Получите SSL сертификат
sudo certbot --nginx -d snapcal.fun -d www.snapcal.fun

# Настройте автоматическое обновление
sudo crontab -e
# Добавьте строку:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

### 7. Настройка базы данных

```bash
# Создайте пользователя базы данных (если используете внешнюю БД)
sudo -u postgres psql

CREATE USER snapcal_user WITH PASSWORD 'your_secure_password_here';
CREATE DATABASE snapcal OWNER snapcal_user;
GRANT ALL PRIVILEGES ON DATABASE snapcal TO snapcal_user;
\q
```

### 8. Запуск приложения

```bash
# Перейдите в директорию проекта
cd /var/www/snapcal

# Сделайте скрипт развертывания исполняемым
chmod +x deploy/deploy.sh

# Запустите развертывание
./deploy/deploy.sh
```

### 9. Проверка развертывания

```bash
# Проверьте статус сервисов
docker-compose -f docker-compose.prod.yml ps

# Проверьте логи
docker-compose -f docker-compose.prod.yml logs -f

# Проверьте API
curl https://snapcal.fun/health

# Проверьте базу данных
docker-compose -f docker-compose.prod.yml exec database psql -U snapcal_user -d snapcal -c "\dt"
```

## 🔧 Настройка мониторинга

### Настройка логирования

```bash
# Создайте директорию для логов
sudo mkdir -p /var/log/snapcal
sudo chown $USER:$USER /var/log/snapcal

# Настройте ротацию логов
sudo nano /etc/logrotate.d/snapcal
```

**Содержимое /etc/logrotate.d/snapcal:**

```
/var/log/snapcal/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
}
```

### Настройка бэкапов

```bash
# Создайте скрипт для бэкапов
nano /var/www/snapcal/backup.sh
```

**Содержимое backup.sh:**

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/snapcal"
DATE=$(date +%Y%m%d_%H%M%S)

# Создайте бэкап базы данных
docker-compose -f docker-compose.prod.yml exec -T database pg_dump -U snapcal_user snapcal > $BACKUP_DIR/db_backup_$DATE.sql

# Создайте бэкап загруженных файлов
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz backend/uploads/

# Удалите старые бэкапы (оставьте последние 7)
find $BACKUP_DIR -name "db_backup_*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "uploads_backup_*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
# Сделайте скрипт исполняемым
chmod +x /var/www/snapcal/backup.sh

# Добавьте в cron для ежедневных бэкапов
crontab -e
# Добавьте строку:
# 0 2 * * * /var/www/snapcal/backup.sh
```

## 🔒 Безопасность

### Настройка файрвола

```bash
# Установите UFW
sudo apt install ufw

# Настройте правила
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### Настройка SSH

```bash
# Отредактируйте конфигурацию SSH
sudo nano /etc/ssh/sshd_config

# Добавьте/измените следующие строки:
Port 2222
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes

# Перезапустите SSH
sudo systemctl restart sshd
```

## 📊 Мониторинг и обслуживание

### Полезные команды

```bash
# Просмотр логов
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f database

# Перезапуск сервисов
docker-compose -f docker-compose.prod.yml restart backend

# Обновление приложения
cd /var/www/snapcal
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build

# Проверка использования диска
df -h
docker system df

# Очистка неиспользуемых Docker ресурсов
docker system prune -a
```

### Настройка алертов

```bash
# Установите мониторинг
sudo apt install -y htop iotop

# Создайте скрипт для проверки состояния
nano /var/www/snapcal/health-check.sh
```

**Содержимое health-check.sh:**

```bash
#!/bin/bash

# Проверка API
if ! curl -f https://snapcal.fun/health > /dev/null 2>&1; then
    echo "API is down!" | mail -s "SnapCal Alert" admin@snapcal.fun
fi

# Проверка диска
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "Disk usage is high: ${DISK_USAGE}%" | mail -s "SnapCal Alert" admin@snapcal.fun
fi
```

## 🚨 Устранение неполадок

### Частые проблемы

1. **Сервисы не запускаются:**
```bash
# Проверьте логи
docker-compose -f docker-compose.prod.yml logs

# Проверьте переменные окружения
cat backend/.env
```

2. **Проблемы с базой данных:**
```bash
# Подключитесь к базе данных
docker-compose -f docker-compose.prod.yml exec database psql -U snapcal_user -d snapcal

# Проверьте таблицы
\dt
```

3. **Проблемы с Nginx:**
```bash
# Проверьте конфигурацию
sudo nginx -t

# Проверьте логи
sudo tail -f /var/log/nginx/error.log
```

4. **Проблемы с SSL:**
```bash
# Обновите сертификат
sudo certbot renew

# Проверьте статус
sudo certbot certificates
```

## 📞 Поддержка

При возникновении проблем:

1. Проверьте логи: `docker-compose -f docker-compose.prod.yml logs -f`
2. Проверьте статус сервисов: `docker-compose -f docker-compose.prod.yml ps`
3. Проверьте использование ресурсов: `htop`
4. Создайте Issue в репозитории с подробным описанием проблемы

## 🔄 Обновления

Для обновления приложения:

```bash
cd /var/www/snapcal
git pull origin main
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

Или используйте скрипт развертывания:

```bash
./deploy/deploy.sh
``` 