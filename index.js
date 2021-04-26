const puppeteer = require("puppeteer");
const express = require("express");
const firebase = require("firebase");
const { v4 } = require("uuid");
// Require the framework and instantiate it
const app = express();

const { bigArray: newBigArray, cityWiseResource } = require("./api/allList");
const { firebaseConfig } = require("./firebase-config");

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let dummy = new Array();
const bigArray = new Array();
let cutOff = 3;

(async () => {
  console.log("\x1Bc");
  console.log("HEEEEEEEEEEEEEE", v4());
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  await page.waitForTimeout(2000);
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
    bigArray.forEach((d, i) => {
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
})();

// Resource Fetching
cityWiseResource();

// Declare a route
app.get("/", async function (request, reply) {
  if (newBigArray.length === 0) {
    setTimeout(() => {
      res.send({ data: bigArray });
    }, 3000);
  } else {
    res.send({ data: bigArray });
  }
});

app.get("/city", async function (request, res) {
  if (newBigArray.length === 0) {
    setTimeout(() => {
      res.send({ data: newBigArray });
    }, 3000);
  } else {
    res.send({ data: newBigArray });
  }
});

app.post("/api/create", function (request, res) {
  (async function () {
    try {
      bigArray.forEach(async (item) => {
        await db.collection(request.body.remdesivir).add(item);
      });

      newBigArray.forEach(async (item) => {
        await db.collection(request.body.citywiseresource).add(item);
      });
      res.status(200).send();
    } catch (error) {
      console.log(error);
      res.status(400).send("Error");
    }
  })();
});

// Run the server!
app.listen(process.env.PORT || 3000);
