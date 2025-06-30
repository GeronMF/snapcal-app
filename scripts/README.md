# 🤖 Скрипты автоматизации SnapCal

## 📁 Содержимое папки

### `start-backend.sh` - Запуск бэкенда (Linux/macOS/WSL)

Автоматически подключается к продакшн серверу и запускает/перезапускает бэкенд.

**Требования:**

- `sshpass` для автоматического ввода пароля
- Bash shell

**Установка sshpass:**

```bash
# Ubuntu/Debian
sudo apt-get install sshpass

# macOS
brew install hudochenkov/sshpass/sshpass
```

**Использование:**

```bash
./scripts/start-backend.sh
```

### `start-backend.ps1` - Запуск бэкенда (Windows)

PowerShell версия скрипта для Windows пользователей.

**Требования:**

- PuTTY (для plink утилиты)
- PowerShell

**Установка PuTTY:**

- Скачать с https://www.putty.org/
- Или через Chocolatey: `choco install putty`

**Использование:**

```powershell
.\scripts\start-backend.ps1
```

## 🔧 Что делают скрипты

1. **Проверяют доступность** необходимых утилит
2. **Подключаются к серверу** с автоматическим вводом пароля
3. **Переходят** в папку проекта `/home/snapcalfun/www/backend`
4. **Проверяют статус** PM2 и порта 3333
5. **Запускают/перезапускают** приложение через PM2
6. **Показывают логи** для диагностики
7. **Проверяют API** на работоспособность

## ⚠️ Устранение проблем

### Linux/macOS: "sshpass command not found"

```bash
# Ubuntu/Debian
sudo apt-get update && sudo apt-get install sshpass

# CentOS/RHEL
sudo yum install sshpass

# macOS
brew install hudochenkov/sshpass/sshpass
```

### Windows: "plink command not found"

1. Установите PuTTY с официального сайта
2. Добавьте папку PuTTY в PATH
3. Или используйте полный путь: `"C:\Program Files\PuTTY\plink.exe"`

### "Permission denied" на Linux

```bash
chmod +x scripts/start-backend.sh
```

### "Execution policy" ошибка в PowerShell

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 🔐 Безопасность

**⚠️ ВАЖНО:** Скрипты содержат пароль в открытом виде!

**Для продакшн использования рекомендуется:**

1. Настройка SSH ключей вместо паролей
2. Использование переменных окружения
3. Шифрование скриптов

### Настройка SSH ключей (рекомендуется)

```bash
# Генерация ключа
ssh-keygen -t rsa -b 4096 -C "snapcal-deploy"

# Загрузите переменные из .env
source .env

# Копирование на сервер
ssh-copy-id -i ~/.ssh/id_rsa.pub -p $SSH_PORT $SSH_USER@$SSH_HOST

# После этого не нужен пароль
ssh $SSH_USER@$SSH_HOST -p $SSH_PORT
```

## 📖 Примеры использования

### Быстрый запуск

```bash
# Linux/macOS
cd /path/to/snapcal && ./scripts/start-backend.sh

# Windows
cd C:\Path\To\SnapCal && .\scripts\start-backend.ps1
```

### Запуск с логированием

```bash
# Linux/macOS
./scripts/start-backend.sh 2>&1 | tee deployment.log

# Windows
.\scripts\start-backend.ps1 | Tee-Object deployment.log
```

### Автоматизация через cron (Linux)

```bash
# Добавить в crontab для ежедневной проверки в 6:00
0 6 * * * /path/to/snapcal/scripts/start-backend.sh >> /var/log/snapcal-deploy.log 2>&1
```

---

**💡 Совет:** Сначала попробуйте скрипты вручную, чтобы убедиться в их работоспособности, а затем интегрируйте в CI/CD или автоматизированные процессы.
