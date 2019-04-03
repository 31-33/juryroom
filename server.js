const server = require('http').createServer();
const io = require('socket.io')(server);
io.on('connection', client => {
  client.on('event', data => {
    console.log("data recieved...");
  });
  client.on('disconnect', () => {
    console.log("client disconnected...");
  });
});
