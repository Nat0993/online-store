// Импорты - подключение необходимых модулей
import express from 'express';          // фреймворк для создания сервера
import path from 'path';                // для работы с путями файлов
import { fileURLToPath } from 'url';    // для совместимости с ES модулями

// Создание специальных переменных для работы с путями в ES модулях
const __filename = fileURLToPath(import.meta.url);  // получаем путь к текущему файлу
const __dirname = path.dirname(__filename);         // получаем папку где лежит server.js

// Создание Express приложения
const app = express();
const PORT = 3000;  // порт на котором будет работать сервер

// Путь к фронтенду
const FRONTEND_ROOT = path.join(__dirname, '../frontend');

// Раздаем статические файлы (CSS, JS, изображения)
// express.static делает файлы доступными по HTTP
app.use(express.static(FRONTEND_ROOT));

// Для Single Page Application (SPA)
// Все маршруты (кроме статических файлов) отдаем index.html
app.get('*', (req, res) => {
    // req - запрос от браузера, res - ответ сервера
    const indexPath = path.join(FRONTEND_ROOT, 'public/index.html');
    res.sendFile(indexPath);  // отправляем index.html браузеру
});

// Запускаем сервер
app.listen(PORT, () => {
    console.log('Сервер запущен на http://localhost:' + PORT);
});