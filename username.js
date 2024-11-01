import * as fs from 'node:fs';

const usernames = JSON.parse(fs.readFileSync("usernames.json", "utf8"));

function generateUsername() {
  return usernames.adjectives[Math.floor(Math.random() * usernames.adjectives.length)] +
         usernames.animals[Math.floor(Math.random() * usernames.animals.length)];
}

export { generateUsername };
