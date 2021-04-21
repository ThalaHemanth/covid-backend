const puppeteer = require("puppeteer");
const firebase = require("firebase");
// Require the framework and instantiate it
const fastify = require("fastify")({
  logger: true,
});

const { bigArray: newBigArray, cityWiseResource } = require("./allList");
const { firebaseConfig } = require("./firebase-config");

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let dummy = new Array();
const bigArray = new Array();
let cutOff = 3;

(async () => {
  console.log("\x1Bc");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  // await page.goto('https://www.covidsource.info/city-wise-resource-list');
  await page.goto(
    "https://wix-visual-data.appspot.com/app/widget?pageId=nfei2&compId=comp-knlbia39&viewerCompId=comp-knlbia39&siteRevision=94&viewMode=site&deviceType=desktop&locale=en&tz=Asia%2FKolkata&regionalLanguage=en&width=980&height=434&instance=nJde997KoVvi2Yet_C3nUKtKiINatryFV50cgf3ck8E.eyJpbnN0YW5jZUlkIjoiNjhlMGRkODQtNGQwZS00MGIwLTk5YjMtMjlkNjY3NTRhYWI4IiwiYXBwRGVmSWQiOiIxMzQxMzlmMy1mMmEwLTJjMmMtNjkzYy1lZDIyMTY1Y2ZkODQiLCJtZXRhU2l0ZUlkIjoiN2U4YjY1MWUtYjcyYi00ZjFkLWEyZjktMWMzOTZhY2M1ZDI4Iiwic2lnbkRhdGUiOiIyMDIxLTA0LTIwVDAzOjQ3OjQyLjE3NFoiLCJkZW1vTW9kZSI6ZmFsc2UsImFpZCI6IjUzODNjYjc5LTE4YmUtNDUzZi1hZDliLTQxODRhMzNiYjQzZCIsImJpVG9rZW4iOiIxNjZiYjg5YS1mYTI1LTBmYWQtM2I0YS0zNWVmMGQ5OGY3OTAiLCJzaXRlT3duZXJJZCI6IjlhOWI4NjVjLTVkZjUtNDQwMy05Yzg2LTNlMGNlOWU2ZjI2ZSJ9&currency=INR&currentCurrency=INR&commonConfig=%7B%22brand%22%3A%22wix%22%2C%22bsi%22%3A%22669f9718-4497-460c-8fea-e1a06d5a8a93%7C4%22%2C%22BSI%22%3A%22669f9718-4497-460c-8fea-e1a06d5a8a93%7C4%22%7D&vsi=71a99416-c90e-4102-ae8a-99db25b8dba2"
  );
  await page.waitForTimeout(5000);
  let data = await page.evaluate(() => {
    const trs = Array.from(document.querySelectorAll("td"));
    return trs.map((tr, i) => {
      return tr.innerText;
    });
  });
  // let data = await page.$$eval("tr", (trs) => {
  //   return trs.map((tr) => tr.textContent);
  // });
  // console.log(data);
  // const refinedData = data.filter((item) => {
  //   return item !== "";
  // });
  // console.log(data)
  // data = data.reduce((result, item, i) => {
  //     result[i] = item
  //     return result
  // }, {})

  // const tr = await page.$$eval('.cell .cell static', tds => tds.map(tds => tds.innerText))
  let count = 0;
  const newBigArray = new Array();
  function removeEmptyTableRow() {
    data.forEach((item, index) => {
      if (index === count) {
        count += 5;
        return;
      } else {
        return newBigArray.push(item);
      }
    });
  }
  removeEmptyTableRow();
  (async () => {
    newBigArray.forEach((d, i) => {
      dummy.push(d);
      if (i === cutOff) {
        bigArray.push({
          state: dummy[0],
          distributorName: dummy[1],
          telephone: dummy[2],
          address: dummy[3],
        });
        cutOff += 4;
        dummy = [];
        return;
      }
    });
  })();
  (async () => {
    // console.log(Array(data));
    bigArray.forEach((d, i) => {
      // console.log(i, cutOff)
      dummy.push(d);

      if (i === cutOff) {
        // console.log(dummy)
        bigArray.push({
          city: dummy[0],
          neccessity: dummy[1],
          authority: dummy[2],
          contact: dummy[3],
        });
        cutOff += 4;
        dummy = [];
        return;
        // bigArray.push(dummy);
        // count = count + 4
      }
      // console.log("Iteration", i)
      // const header = d
      // dummy.push(header)
    });
  })();
  // console.log(dummy)
})();

// Resource Fetching
cityWiseResource();

// Declare a route
fastify.get("/", function (request, reply) {
  reply.send({ data: bigArray });
});

fastify.get("/city", function (request, reply) {
  reply.send({ data: newBigArray });
});

fastify.post("/api/create", function (request, reply) {
  (async function () {
    try {
      bigArray.forEach(async (item) => {
        await db.collection(request.body.remdesivir).add(item);
      });

      newBigArray.forEach(async (item) => {
        await db.collection(request.body.citywiseresource).add(item);
      });
      reply.status(200).send();
    } catch (error) {
      console.log(error);
      reply.status(400).send("Error");
    }
  })();
});

// Run the server!
fastify.listen(3000, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`server listening on ${address}`);
});
