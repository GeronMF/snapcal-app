# Инструкции по развертыванию исправлений AI анализа

## Проблема

AI анализ работает нестабильно:

- GIF анимация не всегда отображается при первом запуске
- Таймауты запросов к OpenAI API
- Неконсистентная работа после перелогинов

## Исправления

### 1. Frontend изменения (React Native)

**Файл: `frontend/components/AILoadingModal.tsx`**

- ✅ Улучшена предзагрузка GIF анимации
- ✅ Добавлен fallback для случаев ошибки загрузки GIF
- ✅ Глобальная предзагрузка при загрузке модуля

**Файл: `frontend/utils/api.ts`**

- ✅ Увеличен таймаут до 120 секунд (было 90)
- ✅ Добавлен retry механизм (2 попытки с задержкой 2 сек)
- ✅ Улучшена диагностика ошибок сети и таймаутов

### 2. Backend изменения (Node.js)

**Файл: `backend/src/services/aiAnalysisService.js`**

- ✅ Добавлено детальное логирование с уникальными ID запросов
- ✅ Улучшена обработка ошибок OpenAI API
- ✅ Добавлен мониторинг времени выполнения этапов

**Файл: `backend/src/routes/ai.js`**

- ✅ Добавлен middleware для логирования запросов
- ✅ Улучшена обработка различных типов ошибок
- ✅ Добавлены коды ошибок для frontend

**Новые файлы:**

- ✅ `backend/src/middleware/requestLogger.js` - детальное логирование
- ✅ `backend/src/config/aiConfig.js` - централизованная конфигурация
- ✅ `backend/diagnostic-ai.js` - инструмент диагностики

## Файлы для загрузки на продакшн сервер

### На сервер snapcal.fun в папку `/home/snapcalfun/www/backend/`:

1. **Обязательные файлы backend:**

   ```
   src/services/aiAnalysisService.js
   src/routes/ai.js
   src/middleware/requestLogger.js
   src/config/aiConfig.js
   diagnostic-ai.js
   ```

2. **Команды для загрузки через SSH:**

   ```bash
   # Подключение к серверу
   ssh snapcalfun@your-server -p 22

   # Переход в папку backend
   cd /home/snapcalfun/www/backend

   # Создание резервных копий
   cp src/services/aiAnalysisService.js src/services/aiAnalysisService.js.backup
   cp src/routes/ai.js src/routes/ai.js.backup

   # Загрузка новых файлов (через scp или другой способ)
   # scp local-path/file server:/home/snapcalfun/www/backend/path/
   ```

3. **После загрузки файлов:**

   ```bash
   # Перезапуск приложения
   pm2 restart snapcal-backend

   # Проверка логов
   pm2 logs snapcal-backend

   # Запуск диагностики
   node diagnostic-ai.js
   ```

## Мониторинг после развертывания

### 1. Проверка логов в реальном времени:

```bash
# Общие логи приложения
pm2 logs snapcal-backend

# Фильтрация логов AI анализа
pm2 logs snapcal-backend | grep "AI Analysis"

# Поиск ошибок таймаута
pm2 logs snapcal-backend | grep -i "timeout\|timed out"
```

### 2. Ключевые метрики для отслеживания:

- ✅ Время выполнения AI анализа (должно быть < 60 сек)
- ✅ Частота ошибок таймаута (должна снизиться)
- ✅ Успешность предзагрузки GIF
- ✅ Количество retry попыток

### 3. Что искать в логах:

```
🔍 [requestId] - уникальный ID запроса для трассировки
⏱️ [requestId] Total analysis time: Xms - время выполнения
❌ [requestId] AI Analysis error - ошибки анализа
🔄 [requestId] Using fallback - использование fallback
📦 [requestId] Returning cached result - кэшированные результаты
```

## Тестирование после развертывания

### 1. Функциональные тесты:

- [ ] Загрузка фото → отображение GIF анимации
- [ ] Успешный анализ изображения
- [ ] Повторный анализ без перелогина
- [ ] Работа после перелогина
- [ ] Fallback при таймауте

### 2. Нагрузочные тесты:

- [ ] Несколько параллельных запросов
- [ ] Большие изображения (близко к лимиту 10MB)
- [ ] Последовательные запросы от одного пользователя

## Откат изменений (если потребуется)

```bash
# Восстановление из резервных копий
cd /home/snapcalfun/www/backend
cp src/services/aiAnalysisService.js.backup src/services/aiAnalysisService.js
cp src/routes/ai.js.backup src/routes/ai.js

# Удаление новых файлов
rm src/middleware/requestLogger.js
rm src/config/aiConfig.js
rm diagnostic-ai.js

# Перезапуск
pm2 restart snapcal-backend
```

## Дополнительные рекомендации

### 1. Настройки окружения (.env):

Рекомендуется добавить в продакшн .env файл:

```
AI_CACHE_ENABLED=true
AI_FALLBACK_ENABLED=true
AI_MAX_TOKENS=500
LOG_LEVEL=info
```

### 2. Мониторинг производительности:

- Настроить алерты на высокое время отклика (>30 сек)
- Мониторить использование памяти
- Отслеживать частоту ошибок

### 3. Планы на будущее:

- Добавить Redis для кэширования результатов
- Реализовать балансировку нагрузки для AI запросов
- Добавить health-check endpoints

---

**Важно:** Все изменения протестированы локально и готовы к развертыванию. Frontend изменения автоматически подхватятся при следующем билде мобильного приложения.
