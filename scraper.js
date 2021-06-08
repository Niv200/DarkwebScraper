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
	await page.goto("http://nzxj65x32vh2fkhk.onion/all");

	//div.col-sm-12
	await page.evaluate(() => {
		let elements = $("div.col-sm-12").toArray();
		let authors = $("div.col-sm-6").toArray();
		// let authors = authors.filter((author) => authors[0].innerHTML.contains);
		console.log(elements[1]);
		console.log(authors[1]);
		console.log(elements.length);
	});
	// console.log(titles); // Returns "central-featured-lang lang1"
})();
