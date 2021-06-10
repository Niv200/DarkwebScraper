const fs = require("fs");
const puppeteer = require("puppeteer");
const colors = require("colors/safe");
const mongo = require("./test.js");

const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

let scanningInterval = 120;

console.log(colors.green.bold("Starting scraper..."));
const prompt = require("prompt-sync")();

const interval = prompt(colors.cyan.bold("How often do you want to scan for new posts (seconds)? "));
if (!isNaN(interval)) {
  scanningInterval = interval;
  console.log(colors.italic.bold("Scanning every " + scanningInterval + " seconds."));
} else {
  console.log(colors.red.bold("This is not a number."));
  console.log(colors.red.bold("setting the default time to 120 seconds."));
}

let displayPost = prompt(colors.cyan.bold("Should the scraped post be shown on console? (Y/N)"));
if (displayPost.toLowerCase() == "y") {
  console.log(colors.italic.bold("New posts will be shown on console."));
  displayPost = true;
} else {
  console.log(colors.italic.bold("New posts will not be shown on console."));
}

// let count = prompt(colors.cyan.bold("How often do you want to receive status updates? (how many posts before an update appear)"));
// if (!isNaN(interval)) {
//   scanningInterval = interval;
//   console.log(colors.italic.bold("A status will be shown every " + count + " scans."));
// } else {
//   count = 30;
//   console.log(colors.red.bold("This is not a number."));
//   console.log(colors.red.bold("setting the default time to 30 scans for status."));
// }

let timesScan = 0;
let timesToScan = prompt(colors.cyan.bold("How many times should the website be scanned? Leave 0 for no limit/"));
if (!isNaN(timesToScan)) {
  timesScan = timesToScan;
  if (timesToScan === 0) {
    console.log(colors.italic.bold("Scanning indefinitely..."));
    timesScan = -1;
  } else {
    console.log(colors.italic.bold("Scanning for " + timesScan + " times."));
    console.log(colors.italic.bold("The script will shutdown once done."));
  }
} else {
  console.log(colors.red.bold("This is not a number."));
  console.log(colors.red.bold("Scanning for default of 10 times."));
  timesScan = 10;
}

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
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

// <<<<<<< dev
//   // Go to stronghold
//   let previousText = undefined;
//   let count = 0;
//   let scrapes = 0;
//   let newPosts = 0;
//   while (true) {
//     try {
//       await page.goto("http://nzxj65x32vh2fkhk.onion/all");
//       // await page.goto("http://nzxj65x32vh2fkhk.onion/pawpmwnog"); anonymous
//       // await page.goto("http://nzxj65x32vh2fkhk.onion/pfrk6vj35"); by antodb
//       let test = await page.evaluate(() => {
//         document.querySelector("#list > div:nth-child(2) > div > div.pre-info.pre-header > div > div.col-sm-7.text-right > a").click();

//         document.querySelector("#list > div:nth-child(2) > div > div.pre-info.pre-header > div > div.col-sm-7.text-right > a");
//       });
// =======
// 	// Go to stronghold
// 	let previousText = undefined;
// 	let count = 0;
// 	let scrapes = 0;
// 	let newPosts = 0;
// 	while (true) {
// 		try {
// 			await page.goto("http://nzxj65x32vh2fkhk.onion/all");
// 			// await page.goto("http://nzxj65x32vh2fkhk.onion/pawpmwnog"); anonymous
// 			// await page.goto("http://nzxj65x32vh2fkhk.onion/pfrk6vj35"); by antodb
// 			let test = await page.evaluate(() => {
// 				document
// 					.querySelector(
// 						"#list > div:nth-child(2) > div > div.pre-info.pre-header > div > div.col-sm-7.text-right > a"
// 					)
// 					.click();
// 			});
// >>>>>>> main

//       await page.waitForSelector("#show > div > div > div.well.well-sm.well-white.pre > div > ol > li > div", {
//         visible: true,
//       });

// <<<<<<< dev
//       let data = await page.evaluate(() => {
//         let topic = document.querySelector("#show > div > div > div.pre-info.pre-header > div > div.col-sm-5 > h4").innerHTML;
//         topic = topic.replaceAll("\t", "").replaceAll("\n", "");
//         let items = Array.from(document.querySelectorAll("#show > div > div > div.well.well-sm.well-white.pre > div > ol > li > div"));
//         let newmap = items.map((item) => item.innerHTML);
//         newmap = newmap.filter((item) => !item.includes("&nbsp"));
//         let text = newmap.join("~");
//         text = "~" + text;
//         let stamp = document
//           .querySelector("#show > div > div > div.pre-info.pre-footer > div > div:nth-child(1)")
//           .innerHTML.replaceAll("\t", "")
//           .replaceAll("\n", "");
//         let time = stamp.split(" at ")[1];
//         if (stamp.includes("</a>")) {
//           let newStamp = stamp.replaceAll('">', "$").replaceAll("</a>", "$").split("$")[1];
//           stamp = newStamp;
//         } else {
//           stamp = "Anonymous";
//         }
//         return { topic, stamp, time, text };
//       });
//       if (previousText != data.text) {
//         previousText = data.text;
//         if (displayPost) {
//           console.log(colors.green.bold("Scraped new post!"));
//           console.log(data);
//         }
//         newPosts++;
//         createNewFile(data);
//       } else {
//         //Do when fail to scrape
//       }
//       count++;
//       scrapes++;
//       if (count >= 30) {
//         console.log("---------------------------------");
//         console.log("status:");
//         console.log("Scraped for total of: " + scrapes + " times");
//         console.log("Of which " + newPosts + " new post(s) were scraped.");
//         console.log("---------------------------------");
//         count = 0;
//       }
//     } catch (error) {
//       console.log(error);
//     }
//     await delay(scanningInterval * 1000);
//   }
// =======
// 			let data = await page.evaluate(() => {
// 				let topic = document.querySelector(
// 					"#show > div > div > div.pre-info.pre-header > div > div.col-sm-5 > h4"
// 				).innerHTML;
// 				topic = topic.replaceAll("\t", "").replaceAll("\n", "");
// 				let items = Array.from(
// 					document.querySelectorAll(
// 						"#show > div > div > div.well.well-sm.well-white.pre > div > ol > li > div"
// 					)
// 				);
// 				let newmap = items.map((item) => item.innerHTML);
// 				newmap = newmap.filter((item) => !item.includes("&nbsp"));
// 				let text = newmap.join("~");
// 				text = "~" + text;
// 				let stamp = document
// 					.querySelector(
// 						"#show > div > div > div.pre-info.pre-footer > div > div:nth-child(1)"
// 					)
// 					.innerHTML.replaceAll("\t", "")
// 					.replaceAll("\n", "");
// 				let time = stamp.split(" at ")[1];
// 				if (stamp.includes("</a>")) {
// 					let newStamp = stamp
// 						.replaceAll('">', "$")
// 						.replaceAll("</a>", "$")
// 						.split("$")[1];
// 					stamp = newStamp;
// 				} else {
// 					stamp = "Anonymous";
// 				}
// 				let id = Math.floor(Math.random() * 100000000000000);
// 				return { id, topic, stamp, time, text };
// 			});
// 			if (previousText != data.text) {
// 				previousText = data.text;
// 				console.log(data);
// 				console.log(colors.green.bold("Scraped new post!"));
// 				newPosts++;
// 				createNewFile(data);
// 			} else {
// 				//Do when fail to scrape
// 			}
// 			count++;
// 			scrapes++;
// 			if (count >= 30) {
// 				console.log("---------------------------------");
// 				console.log("1 hour status:");
// 				console.log("Scraped for total of: " + scrapes + " times");
// 				console.log("Of which " + newPosts + " new post(s) were scraped.");
// 				console.log("---------------------------------");
// 				count = 0;
// 			}
// 		} catch (error) {
// 			console.log(error);
// 		}
// 		await delay(120000);
// 	}
// 	// debugger;
// 	// await browser.close();
// >>>>>>> main
// })();

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
