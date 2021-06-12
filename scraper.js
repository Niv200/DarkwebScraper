const fs = require("fs");
const puppeteer = require("puppeteer");
const colors = require("colors/safe");
// const mongo = require("./database.js");
const startup = require("./startup.js");

/////
var firebase = require("firebase/app");

// Add the Firebase products that you want to use
require("firebase/auth");
require("firebase/firestore");

// TODO: Replace the following with your app's Firebase project configuration
// For Firebase JavaScript SDK v7.20.0 and later, `measurementId` is an optional field
// Initialize Firebase
firebase.initializeApp({
  apiKey: "AIzaSyDR_6IUS5zqRSHyhEKs4GFzHmmRKaodOis",
  authDomain: "darkwebscraper.firebaseapp.com",
  projectId: "darkwebscraper",
  storageBucket: "darkwebscraper.appspot.com",
  messagingSenderId: "503028802234",
  appId: "1:503028802234:web:a1012a6cb4b48e716b1883",
  measurementId: "G-BR9QDL0XKT",
});

var db = firebase.firestore();
/////

// let settings = { headless: false, backup: false, interval: 5, showPosts: true, statusInterval: 30, scans: 30 };
settings = startup.promptSettings();

//Should posts be displayed in console?

let bool = true;
(async () => {
  const browser = await puppeteer.launch({
    headless: settings.headless,
    ignoreHTTPSErrors: true,
    args: [
      "--disable-dev-shm-usage",
      "--proxy-server=socks5://localhost:9050",
      '--user-agent="Mozilla/5.0 (Windows NT 6.1; rv:60.7) Gecko/20100101 Firefox/60.7"',
      "--no-sandbox",
      "--disable-setuid-sandbox",
    ],
  });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60000);
  await page.goto("https://check.torproject.org/");
  console.log(colors.green.bold("Verifying Tor..."));
  const isUsingTor = await page.$eval("body", (el) => el.innerHTML.includes("Congratulations. This browser is configured to use Tor"));
  if (!isUsingTor) {
    console.log(colors.red.bold("Not using Tor. please install and verify tor at torproject.org"));
    return await browser.close();
  }
  console.log(colors.green.bold("Tor verified..."));

  // Go to stronghold
  let previousText = undefined;
  let count = 0;
  let scrapes = 0;
  let newPosts = 0;
  while (bool) {
    if (settings.scans == 0) {
      console.log(colors.green.bold("Finished"));
      await browser.close();
      bool = false;
      return await browser.close();
    }
    if (settings.scans != -1 && settings.scans > 0) {
      settings.scans = settings.scans - 1;
    }
    try {
      await page.goto("http://nzxj65x32vh2fkhk.onion/all");
      // await page.goto("http://nzxj65x32vh2fkhk.onion/pawpmwnog"); anonymous
      // await page.goto("http://nzxj65x32vh2fkhk.onion/pfrk6vj35"); by antodb
      let test = await page.evaluate(() => {
        document.querySelector("#list > div:nth-child(2) > div > div.pre-info.pre-header > div > div.col-sm-7.text-right > a").click();
      });

      await page.waitForSelector("#show > div > div > div.well.well-sm.well-white.pre ", {
        visible: true,
      });
      let data = await page.evaluate(() => {
        let topic = document.querySelector("#show > div > div > div.pre-info.pre-header > div > div.col-sm-5 > h4").innerHTML;
        // let items = Array.from(document.querySelectorAll("#show > div > div > div.well.well-sm.well-white.pre > div > ol > li > div"));
        // let stamp = document.querySelector("#show > div > div > div.pre-info.pre-footer > div > div:nth-child(1)").innerHTML;
        let stamp = document.querySelector("#show > div:nth-child(1) > div > div.pre-info.pre-footer").textContent;
        // if(!topic || !stamp || !items){
        //   console.log("Error reading inner html");
        //   return undefined;
        // }
        topic = topic.replaceAll("\t", "").replaceAll("\n", "");
        // let newmap = items.map((item) => item.innerHTML);
        // newmap = newmap.filter((item) => !item.includes("&nbsp"));
        // let text = newmap.join("~");
        // text = "~" + text;
        let text = document.querySelector("#show > div:nth-child(1) > div > div.well.well-sm.well-white.pre").textContent;

        stamp = stamp.replaceAll("\t", "").replaceAll("\n", "");
        let time = stamp.split(" at ")[1];
        if (stamp.includes("</a>")) {
          let newStamp = stamp.replaceAll('">', "$").replaceAll("</a>", "$").split("$")[1];
          stamp = newStamp;
        } else {
          stamp = "Anonymous";
        }
        let id = Math.floor(Math.random() * 100000000000000);
        time = time.split("Language")[0];
        return { id, topic, stamp, time, text };
      });
      if (!data) {
        console.log("Unable to retrieve data");
        return;
      }
      if (previousText != data.text) {
        previousText = data.text;
        if (settings.showPosts) {
          console.log(data);
          console.log(colors.green.bold("Scraped new post!"));
        }
        newPosts++;
        createNewFile(data);
      } else {
        //Do when fail to scrape
      }
      count++;
      scrapes++;
      if (count >= settings.statusInterval) {
        console.clear();
        startup.giveUpdate(scrapes, newPosts, settings);
      }
    } catch (error) {
      console.log("An error occured.");
      console.log("Trying again...");
      console.log(error);
    }
    await delay(settings.interval * 1000);
  }
  // debugger;
  // await browser.close();
})();

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

function createNewFile(data) {
  if (settings.backup) {
    fs.readdir("posts/", (err, files) => {
      fs.writeFileSync("posts/" + files.length + ".json", JSON.stringify(data));
    });
  }
  // mongo.createPost(data);
  postToFirebase(data);
}

const postToFirebase = (data) => {
  db.collection("posts")
    .add({
      topic: data.topic,
      text: data.text,
      stamp: data.stamp,
      time: data.time,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    })
    .then((docRef) => {
      console.log("Document written with ID: ", docRef.id);
    })
    .catch((error) => {
      console.error("Error adding document: ", error);
    });
};
