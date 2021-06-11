//Use this file to dump local backup (json files) to mongoDB
const fs = require("fs");
const mongo = require("./database.js");

let number = 0;
fs.readdir("posts/", (err, files) => {
  number = files.length;
  for (let i = 0; i < number; i++) {
    let json = require(`./posts/${i}.json`);
    if (json.id) {
      console.log(json.id);
    } else {
      let id = Math.floor(Math.random() * 100000000000000);
      json.id = id;
    }
    mongo.createPost(json);
  }
});

console.log(number);
