#!/bin/bash

# Скрипт для запуска бэкенда SnapCal на продакшн сервере

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Запуск бэкенда SnapCal...${NC}"

# Проверка доступности sshpass
if ! command -v sshpass &> /dev/null; then
    echo -e "${YELLOW}⚠️  sshpass не установлен. Установите его для автоматизации:${NC}"
    echo "Ubuntu/Debian: sudo apt-get install sshpass"
    echo "macOS: brew install hudochenkov/sshpass/sshpass"
    echo -e "${YELLOW}Используйте обычное SSH подключение:${NC}"
    echo "ssh snapcalfun@decloud2376.zahid.host -p 32762"
    exit 1
fi

# SSH подключение с автоматическим выполнением команд
echo -e "${GREEN}📡 Подключение к серверу...${NC}"

sshpass -p '5c3c0bcc-8b91-45c9-8610-9dc02ad53cb5' ssh -p 32762 snapcalfun@decloud2376.zahid.host << 'EOF'
echo "🔍 Проверка статуса сервера..."

# Переход в папку проекта
cd /home/snapcalfun/www/backend

echo "📂 Текущая папка: $(pwd)"

# Проверка PM2
echo "🔧 Проверка PM2 процессов..."
pm2 list

# Проверка порта 3333
echo "🌐 Проверка порта 3333..."
netstat -tulpn | grep :3333

# Попытка запуска
echo "🚀 Запуск приложения..."

# Проверяем, есть ли процесс snapcal в PM2
if pm2 list | grep -q "snapcal"; then
    echo "🔄 Перезапуск существующего процесса..."
    pm2 restart snapcal
else
    echo "▶️  Создание нового процесса..."
    pm2 start npm --name "snapcal" -- start
fi

# Ждем немного и проверяем статус
sleep 3
pm2 status snapcal

# Проверка логов
echo "📋 Последние логи:"
pm2 logs snapcal --lines 10

# Проверка API
echo "🩺 Проверка API..."
curl -I http://localhost:3333/api/health || echo "API пока недоступен"

echo "✅ Скрипт завершен. Проверьте статус выше."
EOF

echo -e "${GREEN}✅ Подключение завершено${NC}"
echo -e "${YELLOW}📋 Следующие шаги:${NC}"
echo "1. Проверьте статус PM2 выше"
echo "2. Если есть ошибки, подключитесь вручную для отладки"
echo "3. Проверьте API: https://snapcal.fun/api/health" 