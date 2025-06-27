const fs = require('fs');
const path = require('path');

// Читаем исправленный файл
const aiRouteContent = fs.readFileSync('backend/src/routes/ai.js', 'utf8');

console.log('📁 Исправленный файл AI роута:');
console.log('='.repeat(50));
console.log(aiRouteContent);
console.log('='.repeat(50));

console.log('\n✅ Файл готов к загрузке на сервер через FTP');
console.log('📂 Путь на сервере: /home/snapcalfun/www/src/routes/ai.js');
console.log('🔄 После загрузки нужно перезапустить сервер: pm2 restart snapcal'); 