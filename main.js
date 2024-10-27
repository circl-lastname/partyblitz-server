import { WebSocketServer } from "ws";

let server = new WebSocketServer({ port: 6256 });

const HANDSHAKE = 0;
const CONNECTED = 1;
const SUPERSEDED = 2;

const sessions = {};

function generateSessionID() {
  while (true) {
    let id = "";
    
    for (let i = 0; i < 16; i++) {
      id += Math.floor(Math.random() * 256).toString(16).padStart(2, "0");
    }
    
    if (!sessions[id]) {
      return id;
    }
  }
}

function sendFullUpdate(socket) {
  let session = sessions[socket.sessionID];
  
  let packet = {
    type: "update",
    playerData: session.playerData,
    state: session.state,
    playerStateData: session.playerStateData
  };
  
  socket.send(JSON.stringify(packet));
}

function createNewSession(socket) {
  socket.sessionID = generateSessionID();
  
  sessions[socket.sessionID] = {
    socket: socket,
    playerData: { username: "RandomGamer" },
    state: "mainMenu",
    playerStateData: {},
    room: undefined
  };
  
  socket.send(JSON.stringify({
    type: "session",
    id: socket.sessionID
  }));
  
  socket.state = CONNECTED;
  sendFullUpdate(socket);
}

function handleHandshakePacket(socket, packet) {
  switch (packet.type) {
    case "newSession":
      createNewSession(socket);
    break;
    case "resumeSession": {
      if (typeof packet.id != "string") {
        return;
      }
      
      let session = sessions[packet.id];
      
      if (session) {
        if (session.socket) {
          session.socket.state = SUPERSEDED;
          session.socket.close();
        }
        
        session.socket = socket;
        socket.sessionID = packet.id;
        
        socket.send(JSON.stringify({
          type: "session",
          id: socket.sessionID
        }));
        
        socket.state = CONNECTED;
        sendFullUpdate(socket);
      } else {
        createNewSession(socket);
      }
    } break;
  }
}

server.on("connection", (socket) => {
  socket.state = HANDSHAKE;
  socket.sessionID = "";
  
  socket.on("message", (data) => {
    let packet;
    
    try {
      packet = JSON.parse(data);
    } catch {
      return;
    }
    
    if (typeof packet != "object") {
      return;
    }
    
    switch (socket.state) {
      case HANDSHAKE:
        handleHandshakePacket(socket, packet);
      break;
    }
  });
  
  socket.send(JSON.stringify({
    type: "handshake",
    protocolVersion: 1,
    name: "Partyblitz server (https://github.com/circl-lastname/partyblitz-server)"
  }));
});
