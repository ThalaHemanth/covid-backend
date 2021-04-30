const express = require("express");
const cheerio = require("cheerio");
const cors = require('cors')
const { default: axios } = require("axios");
const app = express();

const cityWiseData = new Array();
const remdesivirData = new Array();
let dummyCity = new Array();

let cutOff1 = 3;

app.use(cors())

app.get("/api/city", (req, res) => {
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
  setTimeout(() => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.send({ data: cityWiseData });
  }, 2000);
});

app.get("/api/rem", (req, res) => {
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
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.send({ data: remdesivirData });
  }, 2000);
});

const PORT = process.env.PORT || 4000;

// app.listen(PORT, () => {
//   console.log("Server Running");
// });

module.exports = app;
