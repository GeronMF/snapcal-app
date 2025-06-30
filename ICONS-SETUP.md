# 🎨 Настройка иконок для SnapCal

## 📋 Пошаговая инструкция

### 1. 📁 Создайте структуру папок

Создайте следующие папки в `frontend/assets/`:

```
frontend/assets/
├── images/
│   ├── icon.png                    # Основная иконка (1024×1024)
│   ├── adaptive-icon.png           # Адаптивная иконка Android (1024×1024)
│   ├── favicon.png                 # Веб-фавикон (64×64)
│   └── splash.png                  # Экран загрузки
├── icons/
│   ├── android/
│   │   ├── google-play-512.png     # 512×512 - Google Play Store
│   │   ├── app-icon-192.png        # 192×192 - xxhdpi
│   │   ├── app-icon-144.png        # 144×144 - xhdpi
│   │   ├── app-icon-96.png         # 96×96 - hdpi
│   │   ├── app-icon-72.png         # 72×72 - mdpi
│   │   └── small-icon-48.png       # 48×48 - Small icon
│   └── ios/
│       ├── app-store-1024.png      # 1024×1024 - App Store
│       ├── iphone-retina-180.png   # 180×180 - iPhone Retina
│       ├── iphone-spotlight-120.png # 120×120 - iPhone Spotlight
│       ├── iphone-old-60.png       # 60×60 - iPhone старые модели
│       ├── ipad-pro-spotlight-87.png # 87×87 - iPad Pro Spotlight
│       └── ipad-home-76.png        # 76×76 - iPad Home Screen
```

### 2. 📱 Переименуйте ваши иконки

**Android иконки:**
- `512×512 Google Play (hi-res)` → `google-play-512.png`
- `192×192 App icon (xxhdpi)` → `app-icon-192.png`
- `144×144 App icon (xhdpi)` → `app-icon-144.png`
- `96×96 App icon (hdpi)` → `app-icon-96.png`
- `72×72 App icon (mdpi)` → `app-icon-72.png`
- `48×48 Small icon` → `small-icon-48.png`

**iOS иконки:**
- `1024×1024 App Store (marketing icon)` → `app-store-1024.png`
- `180×180 iPhone Retina icon` → `iphone-retina-180.png`
- `120×120 iPhone Spotlight icon` → `iphone-spotlight-120.png`
- `60×60 iPhone (older models)` → `iphone-old-60.png`
- `87×87 iPad Pro Spotlight icon` → `ipad-pro-spotlight-87.png`
- `76×76 iPad Home Screen` → `ipad-home-76.png`

### 3. 🎯 Основные иконки для Expo

Поместите в папку `frontend/assets/images/`:

1. **icon.png** (1024×1024) - Скопируйте вашу иконку 1024×1024 из iOS папки
2. **adaptive-icon.png** (1024×1024) - Для Android, должна учитывать безопасную зону
3. **favicon.png** (64×64) - Уменьшенная версия основной иконки

### 4. ⚙️ Конфигурация уже настроена

Файлы `app.json` и `app.production.json` уже обновлены с правильными настройками:

- ✅ Основная иконка для всех платформ
- ✅ Адаптивная иконка для Android
- ✅ Настройки для App Store и Google Play
- ✅ Веб-фавикон

### 5. 🚀 Команды для сборки с иконками

```bash
# Переход в папку frontend
cd frontend

# Очистка кэша Expo
npx expo start --clear

# Предварительный просмотр
npx expo start

# Сборка для Android
npx expo build:android --type=app-bundle

# Сборка для iOS
npx expo build:ios --type=archive
```

## 📖 Дополнительные настройки

### 🤖 Для Google Play Store

1. Используйте `google-play-512.png` как основную иконку в Google Play Console
2. Adaptive icon автоматически будет использовать `adaptive-icon.png`
3. Убедитесь, что adaptive icon имеет безопасную зону (66% от размера)

### 🍎 Для Apple App Store

1. Используйте `app-store-1024.png` в App Store Connect
2. Остальные размеры iOS автоматически сгенерируются из основной иконки
3. Все иконки должны быть без скругленных углов (iOS добавит их автоматически)

## ✅ Проверочный список

- [ ] Все иконки в формате PNG
- [ ] Все иконки квадратные
- [ ] Основная иконка (1024×1024) размещена в `/assets/images/icon.png`
- [ ] Адаптивная иконка размещена в `/assets/images/adaptive-icon.png`
- [ ] Веб-фавикон размещен в `/assets/images/favicon.png`
- [ ] Дополнительные иконки размещены в соответствующих папках
- [ ] Кэш Expo очищен после добавления иконок
- [ ] Приложение протестировано на устройстве

## 🔧 Устранение проблем

**Если иконка не отображается:**
1. Проверьте правильность пути в конфигурации
2. Очистите кэш: `npx expo start --clear`
3. Убедитесь, что файл существует и имеет правильное расширение

**Если иконка выглядит размыто:**
1. Используйте высококачественные PNG файлы
2. Убедитесь, что размеры точно соответствуют требованиям
3. Избегайте сжатия иконок

**Для адаптивной иконки Android:**
1. Основной элемент должен занимать ~66% от размера
2. Фон должен заполнять всю площадь
3. Избегайте мелких деталей по краям 