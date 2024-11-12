import { lobbyManager } from "../lobby.js";
import { checkUsername } from "../username.js";

const mainMenu = {};
mainMenu.calls = {};

mainMenu.calls.setUsername = function (lobby, session, argument) {
  if (typeof argument != "string") {
    return;
  }
  
  let username = argument.trim();
  
  if (checkUsername(username)) {
    session.playerData.username = username;
    lobbyManager.sendUpdate(lobby, session, [ "username" ], [], []);
  }
};

export { mainMenu };
