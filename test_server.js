
const net = require('net');
const server = net.createServer((socket) => {
    socket.end('goodbye\n');
});
server.listen(3000, () => {
    console.log('opened server on', server.address());
});
