const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Настройка EJS
app.set('view engine', 'ejs');
app.set('views', 'views');

// Статические файлы
app.use(express.static('public'));

// Рендер главной страницы
app.get('/', (req, res) => {
  res.render('index');
});

// Socket.IO обработка
io.on('connection', (socket) => {
  console.log('🔌 Пользователь подключился');

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg); // отправка всем
  });

  socket.on('disconnect', () => {
    console.log('❌ Пользователь отключился');
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});