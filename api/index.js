const express = require("express");
const cheerio = require("cheerio");
const { default: axios } = require("axios");
const app = express();

const cityWiseData = new Array();
const remdesivirData = new Array();
let dummyCity = new Array();

let cutOff1 = 3;

app.get("/", (req, res) => {
  (async () => {
    const { data } = await axios.get(
      "https://www.covidsource.info/city-wise-resource-list",
      {
        timeout: 3000,
      }
    );
    const $ = cheerio.load(data);
    $("td").each((index, element) => {
      dummyCity.push($(element).text());
      if (index === cutOff1) {
        cityWiseData.push({
          city: dummyCity[0],
          necessity: dummyCity[1],
          authority: dummyCity[2],
          contact: dummyCity[3],
        });
        cutOff1 += 4;
        dummyCity = [];
      }
    });
  })();
  res.send({ data: cityWiseData });
});

app.get("/rem", (req, res) => {
  (async () => {
    const { data } = await axios.get(
      "https://api.jsonbin.io/b/608bc75ed64cd16802a505da",
      {
        headers: {
          "secret-key":
            "$2b$10$DXAEPpxQp/eduNzmv0zLA.VwruPNzRKElwZb7AIRE6/L6kNFGD9sG",
        },
      }
    );

    data.forEach((element, index) => {
      remdesivirData.push({
        state: element[0],
        distributorName: element[1],
        telephone: element[2],
        address: element[3],
      });
    });
  })();
  setTimeout(() => {
    res.send({ data: remdesivirData });
  }, 2000);
});

app.listen(4000, () => {
  console.log("Server Running");
});
