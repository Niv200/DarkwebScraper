const prompt = require("prompt-sync")();
const colors = require("colors/safe");

const color = (text) => {
  return colors.green.bold(text);
};
const displayMessage = (array) => {
  for (i in array) {
    let text = array[i];
    console.log(text);
  }
};

const version = "V0.3.0";
const startingMessage = [
  color("Starting scraper..."),
  color("~Be sure to run Tor proxy in background"),
  color("~Link your firebase in settings!"),
  color(version + "by Niv"),
];

console.clear();
displayMessage(startingMessage);

let settings = { headless: false, backup: false, interval: 5, showPosts: true, statusInterval: 30, scans: 30 };
const promptSettings = () => {
  //Prompt headless
  const headlessAnswer = prompt(colors.cyan.bold("Should Puppeteer run headless? (Y/N) "));
  if (headlessAnswer.toLowerCase() === "y") {
    console.log(colors.italic.bold("Going headless..."));
    settings.headless = true;
  } else if (headlessAnswer.toLowerCase() === "n") {
    console.log(colors.italic.bold("Showing browser..."));
  } else {
    console.log(colors.red.bold("Unknown command."));
    console.log(colors.red.bold("Showing browser as default."));
  }
  //Prompt local backup
  const backupAnswer = prompt(colors.cyan.bold("Should posts be backed locally aswell? (Y/N) "));
  if (backupAnswer.toLowerCase() === "y") {
    console.log(colors.italic.bold("Backing posts locally..."));
    settings.backup = true;
  } else if (headlessAnswer.toLowerCase() === "n") {
    console.log(colors.italic.bold("Posts will not be backed up locally."));
  } else {
    console.log(colors.red.bold("Unknown command."));
    console.log(colors.red.bold("Not backing up posts by default."));
  }
  //Prompt scanning interval
  const intervalAnswer = prompt(colors.cyan.bold("Specify scanning interval in seconds (minimum 5, suggested 120) "));
  if (!isNaN(intervalAnswer)) {
    if (intervalAnswer < 5) {
      console.log(colors.red.bold("Interval cannot be less than 5!"));
      console.log(colors.red.bold("setting the default time to suggested 120 seconds."));
      settings.interval = 120;
    } else {
      settings.interval = intervalAnswer;
      let minutes = intervalAnswer % 60;
      let time = minutes == 0 ? intervalAnswer / 60 + " minutes." : intervalAnswer + " seconds.";
      console.log(colors.italic.bold("Scanning every " + time));
    }
  } else {
    console.log(colors.red.bold("Could not parse number."));
    console.log(colors.red.bold("setting the default time to suggested 120 seconds."));
    settings.interval = 120;
  }
  //Prompt show posts in console
  const showPostsAnswer = prompt(colors.cyan.bold("Should new posts be shown in console? (Y/N) "));
  if (showPostsAnswer.toLowerCase() === "y") {
    console.log(colors.italic.bold("Showing new posts"));
  } else if (showPostsAnswer.toLowerCase() === "n") {
    console.log(colors.italic.bold("New posts will not be shown in console."));
    settings.showPosts = false;
  } else {
    console.log(colors.red.bold("Unknown command."));
    console.log(colors.red.bold("Showing new posts per default"));
  }
  //Status updates
  const statusIntervalAnswer = prompt(colors.cyan.bold("After how many scans should status update be given? "));
  if (!isNaN(statusIntervalAnswer)) {
    if (statusIntervalAnswer < 1) {
      settings.statusInterval = 30;
      let statusTime =
        settings.interval % 60 == 0
          ? (settings.interval / 60) * settings.statusInterval + " minute(s)."
          : intervalAnswer * settings.statusInterval + " seconds.";
      console.log(colors.red.bold("Interval cannot be less than 1!"));
      console.log(colors.red.bold("Setting to the default of 30 scans which is " + statusTime));
    } else {
      settings.statusInterval = statusIntervalAnswer;
      let statusTime =
        settings.interval % 60 == 0
          ? (settings.interval / 60) * statusIntervalAnswer + " minute(s)."
          : intervalAnswer * statusIntervalAnswer + " seconds.";
      console.log(colors.italic.bold("Setting status updates to be given after " + statusIntervalAnswer + " scan(s) which is " + statusTime));
    }
  } else {
    console.log(colors.red.bold("Could not parse number."));
    console.log(colors.red.bold("setting the default of 30 scans per status update."));
    settings.statusInterval = 30;
  }
  //Prompt scan limit
  const scansAnswer = prompt(colors.cyan.bold("How many scans should be performed? (enter 0 to scan indefinitely)"));
  if (!isNaN(scansAnswer)) {
    if (scansAnswer === "0") {
      settings.scans = -1;
      console.log(colors.italic.bold("Scanning indefinitely..."));
    } else if (scansAnswer < 1) {
      console.log(colors.red.bold("Scans cannot be smaller than 1!"));
      console.log(colors.red.bold("Setting to the default amount of 30 scans."));
      settings.scans = 60;
    } else {
      settings.scans = scansAnswer;
      console.log(colors.italic.bold("Scanning " + scansAnswer + " times."));
    }
  } else {
    console.log(colors.red.bold("Could not parse number."));
    console.log(colors.red.bold("Setting to the default amount of 30 scans."));
    settings.scans = 60;
  }
  return settings;
};

const giveUpdate = (scrapes, newPosts, settings) => {
  let add = ".";
  if (settings.scans != -1) {
    add = ", " + settings.scans - scrapes + " scans left.";
  }
  console.log("---------------------------------");
  console.log("Status update:");
  console.log("Scraped for total of: " + scrapes + " times" + add);
  console.log("Of which " + newPosts + " new post(s) were scraped.");
  console.log("Scanned for a total of " + settings.interval * scrapes + " seconds.");
  console.log("---------------------------------");
};

exports.promptSettings = promptSettings;
exports.giveUpdate = giveUpdate;
