import { WebSocketServer } from "ws";
import { lobbyManager } from "./lobby.js";
import { generateUsername, checkUsername } from "./username.js";

let server = new WebSocketServer({ port: 6256 });

const HANDSHAKE = 0;
const CONNECTED = 1;
const DISABLED = 2;

const sessions = {};

function generateSessionID() {
  const chars = "0123456789abcdef";
  
  while (true) {
    let id = "";
    
    for (let i = 0; i < 32; i++) {
      id += chars[Math.floor(Math.random() * 16)];
    }
    
    if (!sessions[id]) {
      return id;
    }
  }
}

function removeSessionFunction(id) {
  return () => {
    let session = sessions[id];
    
    if (session.lobby) {
      lobbyManager.removePlayer(session.lobby, session);
    }
    
    sessions[id] = undefined;
  };
}

function createNewSession(socket, packet) {
  let sessionID = generateSessionID();
  sessions[sessionID] = {};
  let session = sessions[sessionID];
  socket.sessionID = sessionID;
  
  let lobby = lobbyManager.create("mainMenu");
  
  session.socket = socket;
  session.timeout = setTimeout(removeSessionFunction(sessionID), 4*60*1000);
  session.playerData = {};
  session.lobby = lobby;
  
  if (typeof packet.username == "string") {
    let username = checkUsername(packet.username);
    
    if (username) {
      session.playerData.username = username;
    } else {
      session.playerData.username = generateUsername();
    }
  } else {
    session.playerData.username = generateUsername();
  }
  
  socket.send(JSON.stringify({
    type: "session",
    id: sessionID
  }));
  
  socket.state = CONNECTED;
  
  lobbyManager.addPlayer(lobby, session, true);
}

function handleHandshakePacket(socket, packet) {
  switch (packet.type) {
    case "newSession":
      createNewSession(socket, packet);
    break;
    case "resumeSession": {
      if (typeof packet.id != "string") {
        return;
      }
      
      let sessionID = packet.id;
      let session = sessions[sessionID];
      
      if (session) {
        if (session.socket) {
          session.socket.state = DISABLED;
          session.socket.send(JSON.stringify({
            type: "disable"
          }));
          session.socket.close(1000);
        }
        
        clearTimeout(session.timeout);
        session.timeout = setTimeout(removeSessionFunction(sessionID), 4*60*1000);
        
        session.socket = socket;
        socket.sessionID = sessionID;
        
        socket.send(JSON.stringify({
          type: "session",
          id: sessionID
        }));
        
        socket.state = CONNECTED;
        
        lobbyManager.sendFullUpdate(session.lobby, session, true);
      } else {
        createNewSession(socket, packet);
      }
    } break;
  }
}

function handlePacket(socket, packet) {
  let session = sessions[socket.sessionID];
  
  switch (packet.type) {
    case "call":
      lobbyManager.call(session.lobby, session, packet.state, packet.name, packet.argument);
    break;
  }
}

server.on("connection", (socket) => {
  function closeSocket() {
    // "Timeout" close code
    socket.close(3008);
  }
  
  socket.state = HANDSHAKE;
  socket.sessionID = "";
  
  socket.timeout = setTimeout(closeSocket, 2*60*1000);
  
  socket.on("message", (data) => {
    let packet;
    
    try {
      packet = JSON.parse(data);
    } catch {
      return;
    }
    
    if (typeof packet != "object" && typeof packet.type != "string") {
      return;
    }
    
    if (packet.type == "keepAlive") {
      clearTimeout(socket.timeout);
      socket.timeout = setTimeout(closeSocket, 2*60*1000);
      
      let sessionID = socket.sessionID;
      let session = sessions[sessionID];
      
      clearTimeout(session.timeout);
      session.timeout = setTimeout(removeSessionFunction(sessionID), 4*60*1000);
      return;
    }
    
    switch (socket.state) {
      case HANDSHAKE:
        handleHandshakePacket(socket, packet);
      break;
      case CONNECTED:
        handlePacket(socket, packet);
      break;
    }
  });
  
  socket.on("close", () => {
    if (socket.state == CONNECTED) {
      sessions[socket.sessionID].socket = undefined;
    }
  });
  
  socket.send(JSON.stringify({
    type: "handshake",
    protocolVersion: 1,
    name: "Partyblitz server (https://github.com/circl-lastname/partyblitz-server)"
  }));
});
