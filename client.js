const WebSocketClient = require('websocket').client;

const client = new WebSocketClient();
let socketConnection;
let socketId;
client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', connection => {
    socketConnection = connection;
    console.log('WebSocket Client Connected');
    connection.on('error', error => {
        console.log(`Connection Error: ${error.toString()}`);
    });
    connection.on('close', () => {
        console.log('echo-protocol Connection Closed');
    });
    connection.on('message', message => {
        if (message.type === 'utf8') {
            let data = JSON.parse(message.utf8Data);
            if ( data.type === 'connection_confirmed') {
                socketId = data.id;
            }
            console.log(`http://localhost:${process.env.PORT} ::: Received: ${message.utf8Data}`);
        }
    });
});

function sendMessage(message) {
    if (socketConnection.connected && socketId) {
        socketConnection.sendUTF(JSON.stringify({
            id: socketId,
            message
        }));
    }
}

client.connect('ws://localhost:8080/', 'echo-protocol');


const express = require('express');
const app = express();

app.get('/sendMessage/:message', (req, res) => {
    sendMessage(req.params.message);
    res.send('Hello World!');
});
  
app.listen(process.env.PORT, () => {
    console.log(`client app listening on port ${process.env.PORT}`);
});
  