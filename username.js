import * as fs from 'node:fs';

const usernames = JSON.parse(fs.readFileSync("usernames.json", "utf8"));

function generateUsername() {
  return usernames.adjectives[Math.floor(Math.random() * usernames.adjectives.length)] +
         usernames.animals[Math.floor(Math.random() * usernames.animals.length)];
}

function checkUsername(username) {
  if (username.length <= 16 && !(/\s/g.test(username))) {
    return true;
  }
  
  return false;
}

export { generateUsername, checkUsername };
