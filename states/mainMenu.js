import { lobbyManager } from "../lobby.js";

const mainMenu = {};
mainMenu.calls = {};

mainMenu.calls.setUsername = function (lobby, session, argument) {
  if (typeof argument != "string") {
    return;
  }
  
  if (argument.length <= 16) {
    session.playerData.username = argument;
    lobbyManager.sendUpdate(lobby, session, [ "username" ], [], []);
  }
};

export { mainMenu };
