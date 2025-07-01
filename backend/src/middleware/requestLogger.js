const requestLogger = (req, res, next) => {
  // Генерируем уникальный ID для запроса
  req.requestId = Math.random().toString(36).substring(7);
  req.startTime = Date.now();
  
  // Логируем начало запроса
  console.log(`🌐 [${req.requestId}] ${req.method} ${req.originalUrl} - Start`);
  console.log(`👤 [${req.requestId}] User-Agent: ${req.get('User-Agent') || 'Unknown'}`);
  console.log(`📧 [${req.requestId}] User ID: ${req.user?.id || 'Unauthorized'}`);
  
  // Переопределяем res.json для логирования ответа
  const originalJson = res.json.bind(res);
  res.json = function(data) {
    const duration = Date.now() - req.startTime;
    console.log(`✅ [${req.requestId}] Response sent in ${duration}ms with status ${res.statusCode}`);
    
    if (!data.success && data.error) {
      console.log(`❌ [${req.requestId}] Error response: ${data.error}`);
    }
    
    return originalJson(data);
  };
  
  // Переопределяем res.status для отслеживания ошибок
  const originalStatus = res.status.bind(res);
  res.status = function(code) {
    if (code >= 400) {
      const duration = Date.now() - req.startTime;
      console.log(`🔴 [${req.requestId}] Error status ${code} after ${duration}ms`);
    }
    return originalStatus(code);
  };
  
  next();
};

// Специальный логгер для AI запросов
const aiRequestLogger = (req, res, next) => {
  if (req.file) {
    console.log(`📸 [${req.requestId}] Image uploaded: ${req.file.size || req.file.buffer?.length || 0} bytes`);
    console.log(`🎯 [${req.requestId}] MIME type: ${req.file.mimetype}`);
    console.log(`📄 [${req.requestId}] Original name: ${req.file.originalname}`);
  }
  
  if (req.body.comment) {
    console.log(`💬 [${req.requestId}] Comment: "${req.body.comment}"`);
  }
  
  if (req.body.language) {
    console.log(`🌍 [${req.requestId}] Language: ${req.body.language}`);
  }
  
  next();
};

module.exports = {
  requestLogger,
  aiRequestLogger
}; 