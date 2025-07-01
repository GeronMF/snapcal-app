# Исправления критических ошибок - развертывание

## Проблемы

1. **❌ Ошибка создания аккаунта**: `Unknown column 'daily_calories' in 'SET'`
2. **❌ AI confidence сбрасывается**: после перелогина теряется точность AI анализа

## Решения

### 1. Миграция базы данных

**🔴 КРИТИЧНО - БЕЗ ЭТОГО НЕ БУДУТ РАБОТАТЬ РЕГИСТРАЦИИ!**

#### Файлы для загрузки на сервер:

```
database/migrations/002_add_missing_fields.sql
deploy-migration.js
```

#### Команды на продакшен сервере:

```bash
# 1. Перейти в директорию бэкенда
cd /home/snapcalfun/www/backend

# 2. Установить зависимости для миграции (если не установлены)
npm install mysql2 dotenv

# 3. Выполнить миграцию
node deploy-migration.js
```

### 2. Обновление backend файлов

#### Файлы для замены:

```
backend/src/config/database.js         → /home/snapcalfun/www/backend/src/config/database.js
backend/src/routes/meals-mysql.js      → /home/snapcalfun/www/backend/src/routes/meals-mysql.js
```

### 3. Обновление frontend файлов

#### Файлы для замены:

```
frontend/utils/api.ts                  → локальная разработка
frontend/contexts/MealsContext.tsx     → локальная разработка
```

## Проверка исправлений

### 1. Проверка создания аккаунта

- Попробовать создать новый аккаунт через приложение
- Должен пройти без ошибки `daily_calories`

### 2. Проверка AI confidence

- Сделать AI анализ еды
- Проверить что отображается процент точности
- Перелогиниться
- Проверить что процент точности сохранился

## Результат

✅ **Создание аккаунта**: Работает без ошибок  
✅ **AI confidence**: Сохраняется после перелогина  
✅ **AI данные**: Все поля (confidence, language, provider, portions, regional) сохраняются

## Дополнительные улучшения

### Новые поля в базе данных:

**Таблица `users`:**

- `daily_calories` INT - суточная норма калорий

**Таблица `meals`:**

- `confidence` DECIMAL(3,2) - точность AI (0.00-1.00)
- `language` VARCHAR(5) - язык анализа (en, ru, uk, pl, es)
- `ai_provider` VARCHAR(50) - провайдер AI (openai, manual, fallback)
- `portions` TEXT - описание порции
- `regional` BOOLEAN - региональное блюдо

### Новые индексы:

- `idx_meals_confidence` - для фильтрации по точности
- `idx_meals_language` - для поиска по языку
- `idx_meals_ai_provider` - для статистики по провайдерам
- `idx_meals_regional` - для региональных блюд

## Команды для быстрого развертывания

```bash
# На продакшен сервере:
cd /home/snapcalfun/www/backend

# Выполнить миграцию
node deploy-migration.js

# Перезапустить сервер (если нужно)
# pm2 restart snapcal
```
