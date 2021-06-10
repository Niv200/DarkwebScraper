const fs = require("fs");
const puppeteer = require("puppeteer");
const colors = require("colors/safe");
const mongo = require("./test.js");

let scanningInterval = 120;
console.clear();
console.log(colors.green.bold("Starting scraper..."));
console.log(colors.green.bold("V0.1.1 by Niv"));
const prompt = require("prompt-sync")();

//Should be headless?
let headless = prompt(colors.cyan.bold("Should Puppeteer run headless? (Y/N)"));
if (headless.toLowerCase() == "y") {
  console.log(colors.italic.bold("Going headless..."));
  headless = true;
} else {
  headless = false;
  console.log(colors.italic.bold("Showing browser..."));
}

//Scanning interval
const interval = prompt(colors.cyan.bold("How often do you want to wait between scans (seconds)? (minimum value - 5) "));
if (!isNaN(interval)) {
  if (interval < 5) {
    console.log(colors.red.bold("Interval cannot be less than 5!"));
    console.log(colors.red.bold("setting the default time to 120 seconds."));
  } else {
    scanningInterval = interval;
    console.log(colors.italic.bold("Scanning every " + scanningInterval + " seconds."));
  }
} else {
  console.log(colors.red.bold("This is not a number."));
  console.log(colors.red.bold("setting the default time to 120 seconds."));
}

//Should posts be displayed in console?
let displayPost = prompt(colors.cyan.bold("Should the scraped post be shown on console? (Y/N) "));
if (displayPost.toLowerCase() == "y") {
  console.log(colors.italic.bold("New posts will be shown on console."));
  displayPost = true;
} else {
  displayPost = false;
  console.log(colors.italic.bold("New posts will not be shown on console."));
}

//How often should a status update be given?
let countUpdate = prompt(colors.cyan.bold("How often do you want to receive status updates? (how many scrapes before an update appear) "));
if (!isNaN(countUpdate)) {
  if (countUpdate < 1) {
    console.log(colors.red.bold("The minimum value is 1!"));
    console.log(colors.red.bold("An update will be given every single scrape."));
  } else {
    console.log(colors.italic.bold("Status update will be given after " + countUpdate + " posts."));
  }
} else {
  countUpdate = 30;
  console.log(colors.red.bold("This is not a number."));
  console.log(colors.red.bold("setting the default time to 30 scans for status."));
}

let timesScan = 0;
let timesToScan = prompt(colors.cyan.bold("How many times should the website be scanned? Leave 0 for no limit "));
if (!isNaN(timesToScan)) {
  timesScan = timesToScan;
  if (timesToScan < 1) {
    console.log(colors.red.bold("Scans cant be smaller than 1!"));
    console.log(colors.red.bold("Scanning for default of 10 times."));
    timesScan = 10;
  } else if (timesToScan === "0") {
    console.log(colors.italic.bold("Scanning indefinitely..."));
    timesScan = -1;
  } else {
    console.log(colors.italic.bold("Scanning for " + timesToScan + " times."));
    console.log(colors.italic.bold("The script will shutdown once done."));
    timesScan = timesToScan;
  }
} else {
  console.log(colors.red.bold("This is not a number."));
  console.log(colors.red.bold("Scanning for default of 10 times."));
  timesScan = 10;
}
let bool = true;
(async () => {
  const browser = await puppeteer.launch({
    headless: headless,
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
    console.log(timesScan);
    if (timesScan == 0) {
      console.log(colors.green.bold("Finished"));
      await browser.close();
      bool = false;
      return await browser.close();
    }
    if (timesScan != -1 && timesScan > 0) {
      timesScan = timesScan - 1;
    }
    try {
      await page.goto("http://nzxj65x32vh2fkhk.onion/all");
      // await page.goto("http://nzxj65x32vh2fkhk.onion/pawpmwnog"); anonymous
      // await page.goto("http://nzxj65x32vh2fkhk.onion/pfrk6vj35"); by antodb
      let test = await page.evaluate(() => {
        document.querySelector("#list > div:nth-child(2) > div > div.pre-info.pre-header > div > div.col-sm-7.text-right > a").click();
      });

      await page.waitForSelector("#show > div > div > div.well.well-sm.well-white.pre > div > ol", {
        visible: true,
      });

      let data = await page.evaluate(() => {
        let topic = document.querySelector("#show > div > div > div.pre-info.pre-header > div > div.col-sm-5 > h4").innerHTML;
        topic = topic.replaceAll("\t", "").replaceAll("\n", "");
        let items = Array.from(document.querySelectorAll("#show > div > div > div.well.well-sm.well-white.pre > div > ol > li > div"));
        let newmap = items.map((item) => item.innerHTML);
        newmap = newmap.filter((item) => !item.includes("&nbsp"));
        let text = newmap.join("~");
        text = "~" + text;
        let stamp = document
          .querySelector("#show > div > div > div.pre-info.pre-footer > div > div:nth-child(1)")
          .innerHTML.replaceAll("\t", "")
          .replaceAll("\n", "");
        let time = stamp.split(" at ")[1];
        if (stamp.includes("</a>")) {
          let newStamp = stamp.replaceAll('">', "$").replaceAll("</a>", "$").split("$")[1];
          stamp = newStamp;
        } else {
          stamp = "Anonymous";
        }
        let id = Math.floor(Math.random() * 100000000000000);
        return { id, topic, stamp, time, text };
      });
      if (previousText != data.text) {
        previousText = data.text;
        if (displayPost) {
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
      if (count >= countUpdate) {
        console.clear();
        console.log("---------------------------------");
        console.log("Status update:");
        console.log("Scraped for total of: " + scrapes + " times");
        console.log("Of which " + newPosts + " new post(s) were scraped.");
        console.log("---------------------------------");
        count = 0;
      }
    } catch (error) {
      console.log("An error occured.");
      console.log("Trying again...");
    }
    await delay(scanningInterval * 1000);
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
  fs.readdir("posts/", (err, files) => {
    console.log(files.length);
    fs.writeFileSync("posts/" + files.length + ".json", JSON.stringify(data));
  });
  mongo.createPost(data);
}
