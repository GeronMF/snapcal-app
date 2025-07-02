// Отладочный скрипт для проверки загрузки файлов privacy
document.addEventListener('DOMContentLoaded', function() {
    const debugList = document.getElementById('debug-list');
    const testContent = document.getElementById('test-content');
    
    if (!debugList) {
        console.error('debug-list element not found');
        return;
    }
    
    // Проверяем, загрузился ли privacy-translations.js
    if (typeof getTranslation === 'function') {
        debugList.innerHTML += '<li style="color: green;">✅ privacy-translations.js загружен</li>';
        
        // Тестируем функцию переводов
        try {
            const testTranslation = getTranslation('privacy.title', 'ru');
            debugList.innerHTML += '<li>Тест перевода: ' + (testTranslation || 'null') + '</li>';
        } catch (e) {
            debugList.innerHTML += '<li style="color: orange;">⚠️ Ошибка при тестировании getTranslation: ' + e.message + '</li>';
        }
    } else {
        debugList.innerHTML += '<li style="color: red;">❌ privacy-translations.js НЕ загружен (getTranslation не найдена)</li>';
        debugList.innerHTML += '<li>typeof getTranslation = ' + typeof getTranslation + '</li>';
    }
    
    // Проверяем, загрузился ли privacy-content.js
    if (typeof PRIVACY_CONTENT === 'object' && PRIVACY_CONTENT !== null) {
        debugList.innerHTML += '<li style="color: green;">✅ privacy-content.js загружен</li>';
        debugList.innerHTML += '<li>Доступные языки: ' + Object.keys(PRIVACY_CONTENT).join(', ') + '</li>';
        
        // Тестируем контент
        if (PRIVACY_CONTENT.ru) {
            if (testContent) {
                testContent.innerHTML = PRIVACY_CONTENT.ru;
            }
            debugList.innerHTML += '<li style="color: green;">✅ Русский контент найден (длина: ' + PRIVACY_CONTENT.ru.length + ' символов)</li>';
        } else {
            debugList.innerHTML += '<li style="color: red;">❌ Русский контент отсутствует</li>';
        }
    } else {
        debugList.innerHTML += '<li style="color: red;">❌ privacy-content.js НЕ загружен или PRIVACY_CONTENT не определен</li>';
        debugList.innerHTML += '<li>typeof PRIVACY_CONTENT = ' + typeof PRIVACY_CONTENT + '</li>';
        debugList.innerHTML += '<li>PRIVACY_CONTENT = ' + PRIVACY_CONTENT + '</li>';
    }
    
    // Проверяем элементы страницы
    const mainElement = document.getElementById('privacy-main-content');
    if (mainElement) {
        debugList.innerHTML += '<li style="color: green;">✅ Элемент privacy-main-content найден</li>';
    } else {
        debugList.innerHTML += '<li style="color: orange;">⚠️ Элемент privacy-main-content НЕ найден (это нормально для тестовой страницы)</li>';
    }
    
    // Проверяем глобальные переменные
    debugList.innerHTML += '<li>Все глобальные переменные: ' + Object.keys(window).filter(key => key.includes('privacy') || key.includes('PRIVACY')).join(', ') + '</li>';
    
    console.log('Debug script завершен');
    console.log('PRIVACY_CONTENT:', typeof PRIVACY_CONTENT, PRIVACY_CONTENT);
    console.log('getTranslation:', typeof getTranslation);
}); 