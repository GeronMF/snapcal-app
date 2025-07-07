const demoTranslations = {
    ru: {
        'demo.title': '🧪 SlimIQ Demo',
        'demo.description': 'Попробуйте AI анализ калорийности прямо сейчас',
        'back': '← Назад к главной',
        'upload.title': 'Загрузите фото еды',
        'upload.description': 'Нажмите или перетащите изображение сюда',
        'analyze': '🤖 Анализировать с AI',
        'reset': '🔄 Выбрать другое фото',
        'loading.title': 'Анализируем изображение...',
        'loading.description': 'AI определяет калории и питательные вещества',
        'result.title': '📊 Результат анализа',
        'hero.subtitle': 'Сделайте фото еды и получите анализ калорийности'
    },
    en: {
        'demo.title': '🧪 SlimIQ Demo',
        'demo.description': 'Try AI calorie analysis right now',
        'back': '← Back to Home',
        'upload.title': 'Upload Food Photo',
        'upload.description': 'Click or drag an image here',
        'analyze': '🤖 Analyze with AI',
        'reset': '🔄 Choose Another Photo',
        'loading.title': 'Analyzing image...',
        'loading.description': 'AI is determining calories and nutrients',
        'result.title': '📊 Analysis Result',
        'hero.subtitle': 'Take a photo of your food and get a calorie analysis'
    },
    uk: {
        'demo.title': '🧪 SlimIQ Demo',
        'demo.description': 'Спробуйте AI аналіз калорійності прямо зараз',
        'back': '← Назад до головної',
        'upload.title': 'Завантажте фото їжі',
        'upload.description': 'Натисніть або перетягніть зображення сюди',
        'analyze': '🤖 Аналізувати з AI',
        'reset': '🔄 Вибрати інше фото',
        'loading.title': 'Аналізуємо зображення...',
        'loading.description': 'AI визначає калорійність та поживні речовини',
        'result.title': '📊 Результат аналізу',
        'hero.subtitle': 'Зробіть фото їжі і отримайте аналіз калорійності'
    },
    pl: {
        'demo.title': '🧪 SlimIQ Demo',
        'demo.description': 'Wypróbuj analizę kalorii AI już teraz',
        'back': '← Powrót do strony głównej',
        'upload.title': 'Prześlij zdjęcie jedzenia',
        'upload.description': 'Kliknij lub przeciągnij obraz tutaj',
        'analyze': '🤖 Analizuj z AI',
        'reset': '🔄 Wybierz inne zdjęcie',
        'loading.title': 'Analizowanie obrazu...',
        'loading.description': 'AI określa kalorie i składniki odżywcze',
        'result.title': '📊 Wynik analizy',
        'hero.subtitle': 'Wykonaj zdjęcie jedzenia i uzyskaj analizę kalorii'
    },
    es: {
        'demo.title': '🧪 SlimIQ Demo',
        'demo.description': 'Prueba el análisis de calorías con IA ahora mismo',
        'back': '← Volver al inicio',
        'upload.title': 'Subir foto de comida',
        'upload.description': 'Haz clic o arrastra una imagen aquí',
        'analyze': '🤖 Analizar con IA',
        'reset': '🔄 Elegir otra foto',
        'loading.title': 'Analizando imagen...',
        'loading.description': 'La IA está determinando calorías y nutrientes',
        'result.title': '📊 Resultado del análisis',
        'hero.subtitle': 'Toma una foto de tu comida y obtén un análisis de calorías'
    }
};

let currentLang = 'ru';

function changeLanguage() {
    const select = document.getElementById('languageSelect');
    currentLang = select.value;
    
    document.documentElement.lang = currentLang;
    document.documentElement.setAttribute('data-lang', currentLang);
    
    updateTranslations();
    localStorage.setItem('snapcal-lang', currentLang);
}

function updateTranslations() {
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        if (demoTranslations[currentLang] && demoTranslations[currentLang][key]) {
            element.textContent = demoTranslations[currentLang][key];
        }
    });
}



// Переменные для демо
let selectedFile = null;

// Обработка загрузки файлов
document.addEventListener('DOMContentLoaded', function() {
    const savedLang = localStorage.getItem('snapcal-lang') || 'ru';
    currentLang = savedLang;
    const languageSelect = document.getElementById('languageSelect');
    languageSelect.value = savedLang;
    languageSelect.addEventListener('change', changeLanguage);
    changeLanguage();
    
    // Обработчики для загрузки файлов
    document.getElementById('fileInput').addEventListener('change', handleFileSelect);
    
    // Обработчики для кнопок
    document.getElementById('analyzeBtn').addEventListener('click', analyzeImage);
    document.getElementById('resetBtn').addEventListener('click', resetDemo);
    
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });
});

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите изображение');
        return;
    }
    
    selectedFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('previewImage').src = e.target.result;
        document.getElementById('previewSection').style.display = 'block';
        document.getElementById('uploadArea').style.display = 'none';
    };
    reader.readAsDataURL(file);
}

function resetDemo() {
    selectedFile = null;
    document.getElementById('previewSection').style.display = 'none';
    document.getElementById('resultSection').style.display = 'none';
    document.getElementById('loadingSection').style.display = 'none';
    document.getElementById('uploadArea').style.display = 'block';
    document.getElementById('fileInput').value = '';
}

async function analyzeImage() {
    if (!selectedFile) return;
    
    document.getElementById('loadingSection').style.display = 'block';
    document.getElementById('resultSection').style.display = 'none';
    
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('language', currentLang);
    
    try {
        const response = await fetch('/api/ai/analyze', {
            method: 'POST',
            body: formData,
            signal: AbortSignal.timeout(120000) // 2 минуты таймаут
        });
        
        const result = await response.json();
        
        document.getElementById('loadingSection').style.display = 'none';
        
        if (result.success) {
            displayResult(result.data);
        } else {
            alert('Ошибка анализа: ' + result.error);
        }
    } catch (error) {
        document.getElementById('loadingSection').style.display = 'none';
        alert('Ошибка сети: ' + error.message);
    }
}

function displayResult(data) {
    const resultContent = document.getElementById('resultContent');
    resultContent.innerHTML = `
        <h4>${data.food_name || 'Неизвестное блюдо'}</h4>
        <div class="nutrition-grid">
            <div class="nutrition-item">
                <div class="nutrition-value">${Math.round(data.calories || 0)}</div>
                <div>Калории</div>
            </div>
            <div class="nutrition-item">
                <div class="nutrition-value">${Math.round(data.protein || 0)}г</div>
                <div>Белки</div>
            </div>
            <div class="nutrition-item">
                <div class="nutrition-value">${Math.round(data.carbs || 0)}г</div>
                <div>Углеводы</div>
            </div>
            <div class="nutrition-item">
                <div class="nutrition-value">${Math.round(data.fat || 0)}г</div>
                <div>Жиры</div>
            </div>
        </div>
        <p><strong>Уверенность AI:</strong> ${Math.round(data.confidence || 0)}%</p>
        <p><em>Это демо-версия. Для полного функционала скачайте мобильное приложение!</em></p>
    `;
    
    document.getElementById('resultSection').style.display = 'block';
} 