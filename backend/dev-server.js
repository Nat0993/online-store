import browserSync from 'browser-sync';
import { spawn } from 'child_process';

// Запускаем Express сервер
const expressProcess = spawn('node', ['server.js'], { stdio: 'inherit' });

// Настраиваем BrowserSync
const bs = browserSync.create();

bs.init({
    proxy: 'http://localhost:3000', // проксируем Express
    files: [
        '../frontend/src/**/*.js',   // следим за JS
        '../frontend/src/**/*.scss', // следим за SCSS  
        '../frontend/dist/**/*.css', // следим за CSS
        '../frontend/public/**/*.html' // следим за HTML
    ],
    port: 3001, // BrowserSync на порту 3001
    open: false // не открывать браузер автоматически
});

// При завершении работы убиваем процессы
process.on('SIGINT', () => {
    expressProcess.kill();
    bs.exit();
    process.exit();
});