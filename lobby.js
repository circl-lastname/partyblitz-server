import { states } from "./states.js";

const lobbyManager = {};

lobbyManager.create = function (state) {
  let lobby = {
    state: state,
    stateData: {},
    players: []
  };
  
  if (states[lobby.state].enter) {
    states[lobby.state].enter(lobby);
  }
  
  return lobby;
};

lobbyManager.addPlayer = function (lobby, session, sendPlayerData = false) {
  lobby.players.push(session);
  session.playerStateData = {};
  
  if (states[lobby.state].addPlayer) {
    states[lobby.state].addPlayer(lobby, session);
  }
  
  this.sendFullUpdate(lobby, session, sendPlayerData);
};

lobbyManager.removePlayer = function (lobby, session) {
  if (states[lobby.state].removePlayer) {
    states[lobby.state].removePlayer(lobby, session);
  }
  
  lobby.players.splice(lobby.players.indexOf(session), 1);
};

lobbyManager.call = function (lobby, session, state, name, argument) {
  if (lobby.state != state || typeof name != "string") {
    return;
  }
  
  if (states[lobby.state].calls[name]) {
    states[lobby.state].calls[name](lobby, session, argument);
  }
};

lobbyManager.sendUpdate = function (lobby, session, playerDataKeys, stateDataKeys, playerStateDataKeys) {
  let packet = {
    type: "update"
  };
  
  for (let key of playerDataKeys) {
    if (!packet.playerData) {
      packet.playerData = {};
    }
    
    packet.playerData[key] = session.playerData[key];
  }
  
  for (let key of stateDataKeys) {
    if (!packet.stateData) {
      packet.stateData = {};
    }
    
    packet.stateData[key] = lobby.stateData[key];
  }
  
  for (let key of playerStateDataKeys) {
    if (!packet.playerStateData) {
      packet.playerStateData = {};
    }
    
    packet.playerStateData[key] = lobby.playerStateData[key];
  }
  
  session.socket.send(JSON.stringify(packet));
};

lobbyManager.sendFullUpdate = function (lobby, session, sendPlayerData = false) {
  let packet = {
    type: "update",
    state: lobby.state,
    stateData: lobby.stateData,
    playerStateData: session.playerStateData
  };
  
  if (sendPlayerData) {
    packet.playerData = session.playerData;
  }
  
  session.socket.send(JSON.stringify(packet));
};

export { lobbyManager };
