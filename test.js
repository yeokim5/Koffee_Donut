const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Intercept network requests and filter for images
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    if (request.resourceType() === "image") {
      console.log("Image request:", request.url());
    }
    request.continue();
  });

  // Go to the page
  await page.goto("http://localhost:3000/dash/notes/66dfff28fc0e514f34509e77", {
    waitUntil: "networkidle2",
  });

  // Optionally, take some action or wait for certain elements to load
  await page.waitForTimeout(5000); // Wait for some time to ensure all resources are loaded

  await browser.close();
})();
