# PowerShell скрипт для запуска бэкенда SnapCal на продакшн сервере

Write-Host "🚀 Запуск бэкенда SnapCal..." -ForegroundColor Green

# Загружаем переменные окружения из .env файла
if (Test-Path ".env") {
  Get-Content ".env" | Where-Object { $_ -match "^\s*[^#]" } | ForEach-Object {
    $key, $value = $_ -split "=", 2
    if ($key -and $value) {
      [Environment]::SetEnvironmentVariable($key.Trim(), $value.Trim(), "Process")
    }
  }
    
  $SSH_HOST = $env:SSH_HOST
  $SSH_PORT = $env:SSH_PORT
  $SSH_USER = $env:SSH_USER
  $SSH_PASSWORD = $env:SSH_PASSWORD
}
else {
  Write-Host "❌ Ошибка: файл .env не найден!" -ForegroundColor Red
  Write-Host "📝 Создайте файл .env на основе env.example" -ForegroundColor Yellow
  Write-Host "💡 Или используйте ручное подключение: ssh user@host -p port" -ForegroundColor Yellow
  exit 1
}

# Проверка наличия plink (PuTTY)
$plinkPath = Get-Command plink -ErrorAction SilentlyContinue

if (-not $plinkPath) {
  Write-Host "⚠️  Plink (PuTTY) не найден. Установите PuTTY:" -ForegroundColor Yellow
  Write-Host "https://www.putty.org/" -ForegroundColor Cyan
  Write-Host "Или используйте обычное SSH подключение:" -ForegroundColor Yellow
  Write-Host "ssh $SSH_USER@$SSH_HOST -p $SSH_PORT" -ForegroundColor White
  exit 1
}

Write-Host "📡 Подключение к серверу через Plink..." -ForegroundColor Green

# Создание временного скрипта для выполнения на сервере
$serverScript = @"
echo "🔍 Проверка статуса сервера..."
cd /home/snapcalfun/www/backend
echo "📂 Текущая папка: `$(pwd)"
echo "🔧 Проверка PM2 процессов..."
pm2 list
echo "🌐 Проверка порта 3333..."
netstat -tulpn | grep :3333
echo "🚀 Запуск приложения..."
if pm2 list | grep -q "snapcal"; then
    echo "🔄 Перезапуск существующего процесса..."
    pm2 restart snapcal
else
    echo "▶️  Создание нового процесса..."
    pm2 start npm --name "snapcal" -- start
fi
sleep 3
pm2 status snapcal
echo "📋 Последние логи:"
pm2 logs snapcal --lines 10
echo "🩺 Проверка API..."
curl -I http://localhost:3333/api/health || echo "API пока недоступен"
echo "✅ Скрипт завершен. Проверьте статус выше."
"@

# Сохранение скрипта во временный файл
$tempScript = [System.IO.Path]::GetTempFileName() + ".sh"
$serverScript | Out-File -FilePath $tempScript -Encoding UTF8

try {
  # Выполнение через plink
  & plink -ssh -P $SSH_PORT -pw $SSH_PASSWORD $SSH_USER@$SSH_HOST -m $tempScript
    
  Write-Host "✅ Подключение завершено" -ForegroundColor Green
  Write-Host "📋 Следующие шаги:" -ForegroundColor Yellow
  Write-Host "1. Проверьте статус PM2 выше" -ForegroundColor White
  Write-Host "2. Если есть ошибки, подключитесь вручную для отладки" -ForegroundColor White
  Write-Host "3. Проверьте API: https://snapcal.fun/api/health" -ForegroundColor White
}
catch {
  Write-Host "❌ Ошибка подключения: $_" -ForegroundColor Red
  Write-Host "Попробуйте подключиться вручную:" -ForegroundColor Yellow
  Write-Host "ssh $SSH_USER@$SSH_HOST -p $SSH_PORT" -ForegroundColor White
}
finally {
  # Удаление временного файла
  if (Test-Path $tempScript) {
    Remove-Item $tempScript -Force
  }
}

# Проверка API с локальной машины
Write-Host "🌐 Проверка API с локальной машины..." -ForegroundColor Green
try {
  $response = Invoke-WebRequest -Uri "https://snapcal.fun/api/health" -Method GET -TimeoutSec 10
  if ($response.StatusCode -eq 200) {
    Write-Host "✅ API работает! Статус: $($response.StatusCode)" -ForegroundColor Green
  }
  else {
    Write-Host "⚠️  API отвечает, но статус: $($response.StatusCode)" -ForegroundColor Yellow
  }
}
catch {
  Write-Host "❌ API недоступен: $($_.Exception.Message)" -ForegroundColor Red
  Write-Host "Возможно, сервер еще запускается. Подождите несколько минут." -ForegroundColor Yellow
} 