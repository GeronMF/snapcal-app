// Простая версия SnapCal Web
document.addEventListener('DOMContentLoaded', function() {
    console.log('SnapCal Web loaded');
    
    // Проверка авторизации
    const token = localStorage.getItem('token');
    if (token) {
        showMainSection();
    } else {
        showAuthSection();
    }
    
    // Переключение форм
    document.getElementById('showRegister').onclick = function(e) {
        e.preventDefault();
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'block';
    };
    
    document.getElementById('showLogin').onclick = function(e) {
        e.preventDefault();
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
    };
    
    // Обработка входа
    document.getElementById('loginForm').onsubmit = async function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                showMainSection();
                alert('Успешный вход!');
            } else {
                alert(data.message || 'Ошибка входа');
            }
        } catch (error) {
            alert('Ошибка подключения');
        }
    };
    
    // Обработка регистрации
    document.getElementById('registerForm').onsubmit = async function(e) {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                showMainSection();
                alert('Регистрация успешна!');
            } else {
                alert(data.message || 'Ошибка регистрации');
            }
        } catch (error) {
            alert('Ошибка подключения');
        }
    };
    
    // Выход
    document.getElementById('logoutBtn').onclick = function() {
        localStorage.removeItem('token');
        showAuthSection();
    };
    
    // Загрузка изображения
    document.getElementById('uploadArea').onclick = function() {
        document.getElementById('imageInput').click();
    };
    
    document.getElementById('imageInput').onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.querySelector('.upload-placeholder').style.display = 'none';
                document.getElementById('previewImage').src = e.target.result;
                document.getElementById('previewImage').style.display = 'block';
                document.getElementById('analyzeBtn').disabled = false;
            };
            reader.readAsDataURL(file);
        }
    };
    
    // Анализ изображения
    document.getElementById('analyzeBtn').onclick = async function() {
        const file = document.getElementById('imageInput').files[0];
        if (!file) return;
        
        document.getElementById('loading').style.display = 'block';
        
        const formData = new FormData();
        formData.append('image', file);
        formData.append('comment', document.getElementById('commentInput').value);
        formData.append('language', document.getElementById('languageSelect').value);
        
        try {
            const response = await fetch('/api/ai/analyze', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
                body: formData
            });
            
            const data = await response.json();
            if (response.ok) {
                showResult(data.data);
            } else {
                alert(data.error || 'Ошибка анализа');
            }
        } catch (error) {
            alert('Ошибка AI анализа');
        } finally {
            document.getElementById('loading').style.display = 'none';
        }
    };
    
    // Сохранение результата
    document.getElementById('saveBtn').onclick = async function() {
        if (!window.currentResult) return;
        
        try {
            const response = await fetch('/api/meals', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: window.currentResult.name,
                    calories: window.currentResult.calories,
                    protein: window.currentResult.protein,
                    carbs: window.currentResult.carbs,
                    fat: window.currentResult.fat,
                    comment: document.getElementById('commentInput').value
                })
            });
            
            if (response.ok) {
                alert('Сохранено!');
                resetForm();
            } else {
                alert('Ошибка сохранения');
            }
        } catch (error) {
            alert('Ошибка сохранения');
        }
    };
    
    // Новый анализ
    document.getElementById('newAnalysisBtn').onclick = resetForm;
});

function showAuthSection() {
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('main-section').style.display = 'none';
}

function showMainSection() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('main-section').style.display = 'block';
}

function showResult(result) {
    window.currentResult = result;
    document.getElementById('resultImage').src = document.getElementById('previewImage').src;
    document.getElementById('resultName').textContent = result.name;
    document.getElementById('resultCalories').textContent = result.calories + ' ккал';
    document.getElementById('resultProtein').textContent = result.protein + 'г';
    document.getElementById('resultCarbs').textContent = result.carbs + 'г';
    document.getElementById('resultFat').textContent = result.fat + 'г';
    document.getElementById('resultConfidence').textContent = Math.round(result.confidence * 100) + '%';
    document.getElementById('analysis-result').style.display = 'block';
}

function resetForm() {
    document.querySelector('.upload-placeholder').style.display = 'flex';
    document.getElementById('previewImage').style.display = 'none';
    document.getElementById('analyzeBtn').disabled = true;
    document.getElementById('imageInput').value = '';
    document.getElementById('commentInput').value = '';
    document.getElementById('analysis-result').style.display = 'none';
    window.currentResult = null;
} 