const Apify = require('apify');
const util = require('util');
const fs = require('fs');

Apify.main(async () => {

    const homepage = 'https://www.visithoustontexas.com/events/'

    const requestQueue = await Apify.openRequestQueue();
    await requestQueue.addRequest(new Apify.Request({url: homepage}))
    // await requestQueue.addRequest(new Apify.Request({ url: 'https://www.visithoustontexas.com/event/zumba-in-the-plaza/59011/' }));

    // Setup and run paginate crawler
    const paginateCrawler = new Apify.PuppeteerCrawler({
      requestQueue,
      handlePageFunction: getEventURLs,

      // If request failed 4 times then this function is executed.
      handleFailedRequestFunction: async ({ request }) => {
          console.log(`Request ${request.url} failed 4 times`);
      },
    })

    await paginateCrawler.run();

    // Setup and run event crawler
    const eventCrawler = new Apify.PuppeteerCrawler({
        requestQueue,
        handlePageFunction: getEventData,

        // If request failed 4 times then this function is executed.
        handleFailedRequestFunction: async ({ request }) => {
            console.log(`Request ${request.url} failed 4 times`);
        },
    });

    // Run crawler.
    await eventCrawler.run();

});

// Function to get data from page
const getEventData = async ({ page, request }) => {
    const title = await page.title();

    const url = await page.url();
    const description = await page.$eval('div[class^=description] p', (el => el.textContent));
    const date = await page.$eval('div[class=dates]', (el => el.textContent));

    // Ideally pull out repetitive 'detail-c2' class to avoid issues with missing data
    const time = await page.$eval('div[class^=detail-c2] div:nth-of-type(7)', (el => el.textContent.slice(7)));
    const recurring = await page.$eval('div[class^=detail-c2] div:nth-of-type(2)', (el => el.textContent));
    const contact = await page.$eval('div[class^=detail-c2] div:nth-of-type(5)', (el => el.textContent.slice(9)));
    const phone = await page.$eval('div[class^=detail-c2] div:nth-of-type(6)', (el => el.textContent.slice(7)));
    const admission = await page.$eval('div[class^=detail-c2] div:nth-of-type(8)', (el => el.textContent.slice(11)));

    // Time is monotonic - does it need to be converted?
    const getTimestamp = await page.metrics();
    const timestamp = getTimestamp["Timestamp"];

    const address = await page.$eval('div[class=adrs]', (el => el.textContent));
    const street = address.split('|')[0].trim();
    const city = address.split('|')[1].split(',')[0].trim();
    const state = address.split('|')[1].split(',')[1].split(' ')[1];
    const postal = address.split('|')[1].split(',')[1].split(' ')[2];

    // Create Event object
    let event = {
      url: url,
      description: description,
      date: date,
      time: time,
      recurring: recurring,
      place: {
        street: street,
        city: city,
        state: state,
        postal: postal
      },
      details: {
        contact: contact,
        phone: phone,
        admission: admission
      },
      timestamp: timestamp
    }

    // Print and save scraped event data
    console.log("EVENT DATA:", event)
    const jsonData = JSON.stringify(event);

    fs.writeFile('eventData.text', jsonData, function (err) {
      if (err) {
        console.log("There was an error saving event data")
        return console.log(err)
      }
      console.log("Event data has been saved")
    })

    // Log data (util is a tool that nicely formats objects in the console, use true to add colors)
    console.log(util.inspect(title, false, null, true));
}

const getEventURLs = async ({ page, request }) => {
    // This works to get a url in the console, but so far only getting an empty array or undefined:
    // document.querySelectorAll('div.info div.title')[0].querySelector('a').href
    const getURLs = await page.$$eval('div.info div.title', (el =>
      el.map((div) => console.log(div)) //printing empty arrays
    ));

    getURLs.forEach(link => {
      Apify.addRequest(new Apify.Request({url: link}));
    })

    // Incorporate paginate functionality
    // paginateFunction();
}

const paginateFunction = async () => {
    let timeout;
    const buttonSelector = 'a.arrow.next';

    while (true) {
      log.info('Waiting for the "next" button...');
      try {
          await page.waitFor(buttonSelector, { timeout }); // Default timeout first time.
          timeout = 2000; // 2 sec timeout after the first.
      } catch (err) {
          // Ignore the timeout error.
          log.info('Could not find the "next" button, we\'ve reached the end.');
          break;
      }
      log.info('Clicking the "next" button.');
      //instead of clicking on the button we can also just grab the actual link and incremement the page value
      await page.click(buttonSelector);
    }
 }
