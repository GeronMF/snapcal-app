# 🔐 Настройка файла .env для SnapCal

## Важная информация о безопасности

GitHub обнаружил в репозитории чувствительные данные (SSH пароли) и отправил предупреждение. Все такие данные были удалены из публичных файлов и перенесены в `.env` файл.

## Настройка .env файла

### 1. Создание .env файла

Скопируйте файл `env.example` в `.env`:

```bash
cp env.example .env
```

### 2. Заполнение реальными данными

Отредактируйте файл `.env` и замените placeholder значения на реальные:

```bash
# SSH Configuration for Production Server
SSH_HOST=decloud2376.zahid.host
SSH_PORT=32762
SSH_USER=snapcalfun
SSH_PASSWORD=5c3c0bcc-8b91-45c9-8610-9dc02ad53cb5

# Production Database
PROD_DB_HOST=localhost
PROD_DB_PORT=3306
PROD_DB_NAME=snapcal_prod
PROD_DB_USER=snapcal_user
PROD_DB_PASSWORD=your-db-password

# Application Settings
APP_PORT=3333
APP_DOMAIN=snapcal.fun
```

### 3. Проверка безопасности

- ✅ Файл `.env` добавлен в `.gitignore`
- ✅ Чувствительные данные не попадают в репозиторий
- ✅ Скрипты автоматически загружают переменные из `.env`

## Использование

### Bash/Linux/macOS

```bash
# Скрипты автоматически загружают .env
./scripts/start-backend.sh

# Или вручную:
source .env
ssh $SSH_USER@$SSH_HOST -p $SSH_PORT
```

### PowerShell/Windows

```powershell
# Скрипт автоматически загружает .env
.\scripts\start-backend.ps1
```

## Что было исправлено

1. **Удалены пароли** из всех публичных файлов:

   - `scripts/start-backend.sh`
   - `scripts/start-backend.ps1`
   - `SSH-CONFIG.md`
   - `QUICK-COMMANDS.md`
   - `QUICK-START.md`
   - `docs/ai-guidelines.md`
   - `AI-SETUP.md`
   - `.cursorrules`

2. **Добавлена поддержка .env** в скрипты
3. **Обновлена документация** с безопасными примерами
4. **Создан файл `env.example`** для новых разработчиков

## Для новых разработчиков

1. Склонируйте репозиторий
2. Скопируйте `env.example` в `.env`
3. Получите реальные данные для подключения у администратора
4. Заполните `.env` файл
5. Используйте скрипты как обычно

## ⚠️ Безопасность

- **НИКОГДА** не коммитьте файл `.env` в репозиторий
- **НЕ ДЕЛИТЕСЬ** содержимым `.env` файла публично
- **ИСПОЛЬЗУЙТЕ** SSH ключи вместо паролей когда возможно
- **РЕГУЛЯРНО МЕНЯЙТЕ** пароли доступа
