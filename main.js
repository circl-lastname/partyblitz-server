import { WebSocketServer } from "ws";

let server = new WebSocketServer({ port: 6257 });

server.on("connection", (socket) => {
  socket.send(JSON.stringify({
    type: "handshake",
    protocolVersion: 1,
    name: "Partyblitz server (https://github.com/circl-lastname/partyblitz-server)"
  }));
});
