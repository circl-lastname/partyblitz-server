import * as fs from 'node:fs';

const usernames = JSON.parse(fs.readFileSync("usernames.json", "utf8"));

function generateUsername() {
  return usernames.adjectives[Math.floor(Math.random() * usernames.adjectives.length)] +
         usernames.animals[Math.floor(Math.random() * usernames.animals.length)];
}

function checkUsername(candidate) {
  let username = candidate.trim().replace(/\s+/g, " ");
  
  if (username.length >= 1 && username.length <= 16) {
    return username;
  }
  
  return false;
}

export { generateUsername, checkUsername };
