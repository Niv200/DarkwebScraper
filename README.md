# Darkweb Scraper

This is an app made to scrape the website "Stronghold Paste" in the dark web.

## Serverless

This app is made with Firebase, meaning the front end is completely independent and without a backend.\
The puppeteer is run by a node.js script\
Posts collected can be saved locally (as a backup) but will always be saved on firebase.

To view the posts, open the client with your firebase credentials.

## Installation

Clone the repo.\
Run

```node
npm i
```

both on client and root folder.\
Be sure to install Tor proxy.

Create .env file with the following, using your firebase values.

```Javascript
APIKEY=
AUTHDOMAIN=
PROJECTID=
STORAGEBUCKET=
MESSAGINGID=
APPID=
MEASUREMENTID=

```

## Usage

**To run the bot:**\
in your console, run the following command:

```node
node scraper.js
```

You will then be prompt with questions to set your puppeteer.\
Hit enter multiple time for quickstart with the default values.

**To run the client to view the posts:**\
run the following:

```node
cd client
npm start
```

## Startup settings

The console is used to prompt the user to change settings to fit their need.\
If any incorrect value would be inserted into any prompt the code will go for the\
default value of that field and alert the user.

1. Should the browser be in headless mode? (Y/N)
2. Should posts be backed up locally in json files? (Y/N)
3. At what interval should the website be scanned? (Default 120 seconds, minimum 5 seconds)
4. Should new posts be shown in console? (Y/N)
5. At what interval of scans should a status update be given?
6. How many scans should be performed? (enter 0 for indefinitely)

**The default values are**:

```node
Headless: *false* //Should the puppeteer browser be shown?
Backup locally: *false* //Should files be kept as local .json files?
Interval: *120 seconds* //How long in seconds between each attempt to scan for new posts?
Show posts: *true* //Should new posts be shown on console?
Status interval: *30 scans* //How often should a status update be given in scans (ie 30 scans per update)
total scans: *30* //How many scans should be performed before shutdown? enter 0 for indefinitely
```

## Status updates

The puppeteer script will give the user an update based on what the define on startup.\
The update will show how many new posts have been found (if any), \
how much time the bot is running, how many scans are left to performed (if specified), and how many scans were done in total.
