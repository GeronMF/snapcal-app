// Admin AI Panel JavaScript
let currentData = null;

// Загрузка данных при старте
document.addEventListener('DOMContentLoaded', loadData);

async function loadData() {
    try {
        showLoading();
        
        // Загружаем статус системы
        await loadSystemStatus();
        
        // Загружаем статистику
        await loadStats();
        
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        showError('Ошибка загрузки данных: ' + error.message);
    }
}

async function loadSystemStatus() {
    try {
        // Загружаем статус AI системы
        const response = await fetch('/api/admin/ai/status');
        
        if (response.ok) {
            const data = await response.json();
            displaySystemInfo(data.data);
        } else if (response.status === 401) {
            showError('Ошибка авторизации. Обновите страницу и введите учетные данные.');
        } else {
            showError('Ошибка загрузки статуса системы');
        }
    } catch (error) {
        showError('Не удалось загрузить статус системы');
    }
}

async function loadStats() {
    try {
        const response = await fetch('/api/admin/ai/stats');
        if (response.ok) {
            const data = await response.json();
            displayStats(data.data.stats);
        } else {
            document.getElementById('statsInfo').innerHTML = 
                '<div class="error">Статистика недоступна</div>';
        }
    } catch (error) {
        document.getElementById('statsInfo').innerHTML = 
            '<div class="error">Ошибка загрузки статистики</div>';
    }
}

function displaySystemInfo(data) {
    const systemStatus = document.getElementById('systemStatus');
    const systemInfo = document.getElementById('systemInfo');
    
    systemStatus.className = 'status-indicator status-active';
    
    systemInfo.innerHTML = `
        <div class="provider-item active">
            <div class="provider-info">
                <div class="provider-name">Активный провайдер: ${data.activeProvider?.name || 'Неизвестно'}</div>
                <div class="provider-details">Статус: OK</div>
            </div>
        </div>
        <div style="margin-top: 15px; font-size: 0.9rem; color: #666;">
            <div>Версия: ${data.systemInfo?.version || '3.0.0'}</div>
            <div>Последнее обновление: ${new Date().toLocaleTimeString()}</div>
        </div>
    `;
    
    // Обновляем информацию о провайдерах
    if (data.providers) {
        displayProviders(data.providers);
    }
}

function displayBasicInfo(healthData) {
    const systemStatus = document.getElementById('systemStatus');
    const systemInfo = document.getElementById('systemInfo');
    
    systemStatus.className = 'status-indicator status-active';
    
    systemInfo.innerHTML = `
        <div class="provider-item active">
            <div class="provider-info">
                <div class="provider-name">Сервер работает</div>
                <div class="provider-details">Статус: ${healthData.status}</div>
            </div>
        </div>
        <div style="margin-top: 15px; font-size: 0.9rem; color: #666;">
            <div>Окружение: ${healthData.environment}</div>
            <div>Время: ${new Date(healthData.timestamp).toLocaleString()}</div>
        </div>
    `;
    
    document.getElementById('providersInfo').innerHTML = 
        '<div class="error">Детальная информация о провайдерах недоступна (требуется авторизация)</div>';
}

function displayProviders(providers) {
    const providersInfo = document.getElementById('providersInfo');
    
    const providersHtml = providers.map(provider => `
        <div class="provider-item ${provider.active ? 'active' : ''}">
            <div class="provider-info">
                <div class="provider-name">
                    ${provider.name.toUpperCase()}
                    ${provider.active ? '(Активный)' : ''}
                </div>
                <div class="provider-details">
                    Статус: ${provider.available ? '✅ Доступен' : '❌ Недоступен'} | 
                    Приоритет: ${provider.priority} |
                    ${provider.enabled ? 'Включен' : 'Отключен'}
                </div>
            </div>
            <div class="provider-actions">
                <button class="btn btn-primary" onclick="testProvider('${provider.name}')">
                    Тест
                </button>
                ${!provider.active ? 
                    `<button class="btn btn-warning" onclick="switchProvider('${provider.name}')">
                        Активировать
                    </button>` : 
                    '<span class="btn btn-success" style="cursor: default;">Активен</span>'
                }
            </div>
        </div>
    `).join('');
    
    providersInfo.innerHTML = providersHtml;
}

function displayStats(stats) {
    const statsInfo = document.getElementById('statsInfo');
    
    if (!stats || stats.length === 0) {
        statsInfo.innerHTML = '<div>Статистика пока не собрана</div>';
        return;
    }
    
    // Группируем статистику по провайдерам
    const grouped = stats.reduce((acc, stat) => {
        if (!acc[stat.provider]) {
            acc[stat.provider] = { total: 0, successful: 0 };
        }
        acc[stat.provider].total += stat.total_requests;
        acc[stat.provider].successful += stat.successful_requests;
        return acc;
    }, {});
    
    const statsHtml = Object.entries(grouped).map(([provider, data]) => `
        <div class="stat-item">
            <div class="stat-value">${data.total}</div>
            <div class="stat-label">${provider.toUpperCase()}<br>запросов</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${Math.round(data.successful / data.total * 100)}%</div>
            <div class="stat-label">${provider.toUpperCase()}<br>успешно</div>
        </div>
    `).join('');
    
    statsInfo.innerHTML = `<div class="stats-grid">${statsHtml}</div>`;
}

async function switchProvider(provider) {
    try {
        showMessage('Переключение провайдера...', 'info');
        
        const response = await fetch('/api/admin/ai/switch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ provider })
        });
        
        if (response.ok) {
            showMessage(`Провайдер переключен на ${provider}`, 'success');
            setTimeout(loadData, 1000);
        } else {
            const error = await response.text();
            showMessage(`Ошибка переключения: ${error}`, 'error');
        }
    } catch (error) {
        showMessage(`Ошибка: ${error.message}`, 'error');
    }
}

async function testProvider(provider) {
    try {
        showMessage(`Тестирование ${provider}...`, 'info');
        
        const response = await fetch('/api/admin/ai/test', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ provider })
        });
        
        if (response.ok) {
            const result = await response.json();
            showMessage(`${provider}: Работает ✅`, 'success');
        } else {
            showMessage(`Ошибка тестирования ${provider}`, 'error');
        }
    } catch (error) {
        showMessage(`Ошибка: ${error.message}`, 'error');
    }
}

function showLoading() {
    document.getElementById('systemInfo').innerHTML = '<div class="loading">Загрузка...</div>';
    document.getElementById('providersInfo').innerHTML = '<div class="loading">Загрузка...</div>';
    document.getElementById('statsInfo').innerHTML = '<div class="loading">Загрузка...</div>';
}

function showMessage(message, type = 'info') {
    // Создаем временное уведомление
    const notification = document.createElement('div');
    notification.className = type === 'success' ? 'success' : 
                           type === 'error' ? 'error' : 'loading';
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '80px';
    notification.style.right = '20px';
    notification.style.zIndex = '1000';
    notification.style.maxWidth = '300px';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

function showError(message) {
    showMessage(message, 'error');
}

// Автообновление каждые 30 секунд
setInterval(loadData, 30000); 