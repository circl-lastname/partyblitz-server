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
