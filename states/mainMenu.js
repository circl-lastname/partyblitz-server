import { lobbyManager } from "../lobby.js";
import { checkUsername } from "../username.js";

const mainMenu = {};
mainMenu.calls = {};

mainMenu.calls.setUsername = function (lobby, session, argument) {
  if (typeof argument != "string") {
    return;
  }
  
  if (checkUsername(argument)) {
    session.playerData.username = argument;
    lobbyManager.sendUpdate(lobby, session, [ "username" ], [], []);
  }
};

export { mainMenu };
