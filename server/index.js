const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173","http://localhost:5174"],
    methods: ["GET", "POST"]
  }
});

let clients = [];//只有两个

// 用户连接
io.on('connection', (socket) => {
  console.log('client connection:', socket.id)

  // 向客户端数列中添加用户
  clients.push(socket.id);

  // 监听连接断开
  socket.on('disconnect', () => {
    console.log('disconnect~')
    handleUserDisconnect(socket)
  })
  //=============================
  // 用户发送 offer
  socket.on('sendoffer', (data) => {
    console.log('sendoffer:', data)
    const anotherClient = clients.find(client => client !== socket.id);
    if(anotherClient) {
      socket.to(anotherClient).emit('getoffer', data)
    }
  })
  // 用户发送 answer
  socket.on('sendanswer', (data) => {
    console.log('sendanswer:', data)
    const anotherClient = clients.find(client => client !== socket.id);
    if(anotherClient) {
      socket.to(anotherClient).emit('getanswer', data)
    }
  })

})

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});