const fs = require("fs");
const puppeteer = require("puppeteer");
const colors = require("colors/safe");

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
	const isUsingTor = await page.$eval("body", (el) =>
		el.innerHTML.includes(
			"Congratulations. This browser is configured to use Tor"
		)
	);
	if (!isUsingTor) {
		console.log(colors.red.bold("Not using Tor. Closing..."));
		return await browser.close();
	}
	console.log(colors.green.bold("Using Tor. Continuing... "));

	// Go to stronghold
	let previousText = undefined;
	let count = 0;
	let scrapes = 0;
	let newPosts = 0;
	while (true) {
		await page.goto("http://nzxj65x32vh2fkhk.onion/all");
		// await page.goto("http://nzxj65x32vh2fkhk.onion/pawpmwnog"); anonymous
		// await page.goto("http://nzxj65x32vh2fkhk.onion/pfrk6vj35"); by antodb
		let test = await page.evaluate(() => {
			document
				.querySelector(
					"#list > div:nth-child(2) > div > div.pre-info.pre-header > div > div.col-sm-7.text-right > a"
				)
				.click();
		});

		await page.waitForSelector(
			"#show > div > div > div.well.well-sm.well-white.pre > div > ol > li > div",
			{
				visible: true,
			}
		);

		let data = await page.evaluate(() => {
			let topic = document.querySelector(
				"#show > div > div > div.pre-info.pre-header > div > div.col-sm-5 > h4"
			).innerHTML;
			topic = topic.replaceAll("\t", "").replaceAll("\n", "");
			let items = Array.from(
				document.querySelectorAll(
					"#show > div > div > div.well.well-sm.well-white.pre > div > ol > li > div"
				)
			);
			let newmap = items.map((item) => item.innerHTML);
			newmap = newmap.filter((item) => !item.includes("&nbsp"));
			let text = newmap.join("~");
			text = "~" + text;
			console.log(text);
			let stamp = document
				.querySelector(
					"#show > div > div > div.pre-info.pre-footer > div > div:nth-child(1)"
				)
				.innerHTML.replaceAll("\t", "")
				.replaceAll("\n", "");
			let time = stamp.split(" at ")[1];
			if (stamp.includes("</a>")) {
				let newStamp = stamp
					.replaceAll('">', "$")
					.replaceAll("</a>", "$")
					.split("$")[1];
				stamp = newStamp;
			} else {
				stamp = "Anonymous";
			}
			return { topic, stamp, time, text };
		});
		if (previousText != data.text) {
			previousText = data.text;
			console.log(data);
			console.log(colors.green.bold("Scraped new post!"));
			newPosts++;
			createNewFile(data);
		} else {
			//Do when fail to scrape
		}
		count++;
		scrapes++;
		if (count >= 60) {
			console.log("---------------------------------");
			console.log("1 hour status:");
			console.log("Scraped for total of: " + scrapes + " times");
			console.log("Of which " + newPosts + " new post(s) were scraped.");
			console.log("---------------------------------");
			count = 0;
		}
		await delay(60000);
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
}
