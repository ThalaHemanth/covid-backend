const puppeteer = require("puppeteer");
// Require the framework and instantiate it
// const express = require("expreess");

// const app = express();

let dummy = new Array();
const bigArray = new Array();
let cutOff = 3;

async function cityWiseResource() {
  console.log("\x1Bc");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto("https://www.covidsource.info/city-wise-resource-list");

  await page.waitForTimeout(3000);
  let data = await page.evaluate(() => {
    const trs = Array.from(document.querySelectorAll("td"));
    return trs.map((tr, i) => {
      return tr.innerText;
    });
  });
  (async () => {
    data.forEach((d, i) => {
      dummy.push(d);
      if (i === cutOff) {
        bigArray.push({
          city: dummy[0],
          neccessity: dummy[1],
          authority: dummy[2],
          contact: dummy[3],
        });
        cutOff += 4;
        dummy = [];
        return;
      }
    });
  })();
}

module.exports = {
  cityWiseResource,
  bigArray,
};

// // Declare a route
// fastify.get("/", function (request, reply) {
//   reply.send({ hi: { ...bigArray } });
// });

// // Run the server!
// fastify.listen(3000, function (err, address) {
//   if (err) {
//     fastify.log.error(err);
//     process.exit(1);
//   }
//   fastify.log.info(`server listening on ${address}`);
// });
