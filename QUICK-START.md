# SnapCal - Быстрый старт 🚀

## Статус проекта ✅

- ✅ AI конфигурация настроена
- ✅ Backend работает на продакшн сервере
- ✅ Frontend подключается к API
- ✅ SSH доступ настроен
- ✅ Автоматизация развертывания готова

## Рабочий процесс

### 1. Разработка Frontend

```bash
cd frontend
npm start
# Тестируем через Expo Go, подключение к https://snapcal.fun
```

### 2. Разработка Backend

```bash
cd backend
npm run dev
# Локальная разработка, затем заливаем файлы на сервер
```

### 3. Деплой Backend изменений

**AI ОБЯЗАТЕЛЬНО указывает какие файлы и куда загружать!**

SSH подключение:

```bash
ssh [USER]@[HOST] -p [PORT]
# Данные для подключения см. в файле .env
# Путь: /home/snapcalfun/www/backend
```

Или через скрипты:

- Windows: `scripts/start-backend.ps1`
- Linux/macOS: `scripts/start-backend.sh`

## Технологический стек

- **Frontend**: React Native/Expo (локальная разработка)
- **Backend**: Node.js/Express (продакшн сервер, порт 3333)
- **База данных**: MySQL (продакшн)
- **Домен**: snapcal.fun
- **Мультиязычность**: 5 языков (en, es, pl, ru, uk)

## Важные принципы

1. **Frontend тестируется локально** через Expo Go
2. **Backend дорабатывается локально**, затем заливается на сервер
3. **AI указывает файлы для загрузки** при изменении backend
4. **Осторожно с продакшн БД** - всегда тестировать изменения
5. **Использовать i18n** для всех текстовых строк

## Полезные команды

```bash
# Проверка здоровья API
curl https://snapcal.fun/health

# Локальный запуск backend
cd backend && npm run dev

# Локальный запуск frontend
cd frontend && npm start

# SSH подключение
ssh [USER]@[HOST] -p [PORT]
```

## Структура проекта

```
SnapCal13052025/
├── backend/           # Node.js сервер (продакшн)
├── frontend/          # React Native приложение (локально)
├── scripts/           # Автоматизация
├── docs/             # Документация
└── .cursorrules      # AI конфигурация ✅
```

---

_Последнее обновление: Проект полностью настроен и работает_ ✅
