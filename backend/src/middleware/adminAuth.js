/**
 * Middleware для базовой HTTP авторизации админки
 */
const adminAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  
  if (!auth) {
    res.setHeader('WWW-Authenticate', 'Basic realm="SnapCal Admin"');
    return res.status(401).json({
      success: false,
      error: 'Требуется авторизация'
    });
  }

  // Декодируем Basic Auth
  const credentials = Buffer.from(auth.split(' ')[1], 'base64').toString().split(':');
  const username = credentials[0];
  const password = credentials[1];

  // Проверяем учетные данные
  const ADMIN_USERNAME = 'Geron';
  const ADMIN_PASSWORD = 'zWU-Nyq-Ruj-J4u';

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    res.setHeader('WWW-Authenticate', 'Basic realm="SnapCal Admin"');
    return res.status(401).json({
      success: false,
      error: 'Неверные учетные данные'
    });
  }

  // Добавляем информацию об админе в запрос
  req.admin = {
    username: username,
    authenticated: true
  };

  next();
};

module.exports = { adminAuth }; 