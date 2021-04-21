const request = require('request-promise');
const cheerio = require('cheerio');
const axios = require('axios');


// const data = request.get('https://www.covidsource.info/remdesivir-distributor-list');

// const $ = cheerio.load(data);

async function main() {
    const { data } = await axios.get("https://www.covidsource.info/remdesivir-distributor-list");
    // console.log("Axios Data", data)
    const $ = cheerio.load(data)
    console.log("Cheerio Data", $.body())

    // $("body > table > tbody > tr > td").each((index, element) => {
    //   console.log($(element).text());
    // });
    // $('tbody').find('td').each((index, element) => {
    //     console.log($(element).text())
    // })
   }
    
   main();