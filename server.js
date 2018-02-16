const WebSocketServer = require('websocket').server;
const http = require('http');
const uuidV1 = require('uuid/v1');

const server = http.createServer(function(request, response) {
    console.log(`ServerSocket ::: ${new Date()} Received request for ${request.url}`);
    response.writeHead(404);
    response.end();
});

let connections = {};

server.listen(8080, function() {
    console.log(`ServerSocket ::: ${new Date()}  Server is listening on port 8080`);
});
const wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log(`ServerSocket ::: ${new Date()} Connection from origin ${request.origin} rejected`);
      return;
    }

    const connection = request.accept('echo-protocol', request.origin);
    console.log(`ServerSocket ::: ${new Date()}  Connection accepted from ${request.remoteAddress}`);
    connection.on('message', message => {
        if (message.type === 'utf8') {
            console.log(`ServerSocket ::: Received Message: ${message.utf8Data}`);
        }
        else if (message.type === 'binary') {
            console.log(`ServerSocket ::: Received Binary Message of ${message.binaryData.length} bytes`);
        }
    });
    connection.on('close', (reasonCode, description) => {
        console.log(`ServerSocket ::: ${new Date()} Peer ${connection.remoteAddress} disconnected.`);
    });
    const uuid = uuidV1();
    connections[uuid] = connection;
    connection.sendUTF(JSON.stringify({
        id: uuid, 
        type: 'connection_confirmed',
        message: 'Connection confirmed'
    }));
});

function broadcast() {
    Object.keys(connections).forEach(key => {
        connections[key].sendUTF(JSON.stringify({
            type: 'broadcast',
            message: `Broadcasting from Socket`
        }));
    });
}

setInterval(broadcast, 30000);