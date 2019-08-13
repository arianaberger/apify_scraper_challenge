const Apify = require('apify');
const util = require('util');

Apify.main(async () => {

    // Get queue and enqueue first url.
    const requestQueue = await Apify.openRequestQueue();
    // Change to main events page when able to iterate over events and paginate
    await requestQueue.addRequest(new Apify.Request({ url: 'https://www.visithoustontexas.com/events/' }));
    console.log(requestQueue);

    // // Tried to paginate with a for loop and add event links, but await only works in async functions
    // for (let i = 0; i < 5; i++) {
    //
    //   // Iterate over each event link
    //   getEventLinks().forEach(link => {
    //     await requestQueue.addRequest(new Apify.Request({ url: link }));

        // Create crawler
        const crawler = new Apify.PuppeteerCrawler({
            // How to dynamically make sure the requestQueue is updated for each link?
            requestQueue,

            // This page is executed for each request.
            // If request failes then it's retried 3 times.
            // Parameter page is Puppeteers page object with loaded page.
            handlePageFunction: getNextPage,

            // If request failed 4 times then this function is executed.
            handleFailedRequestFunction: async ({ request }) => {
                console.log(`Request ${request.url} failed 4 times`);
            },
        });

        // Run crawler.
        await crawler.run();

        // // Go to next page
        // getNextPage();

});

// // Function to get data from page
// const getEventData = async ({ page, request }) => {
//     const title = await page.title();

    // const url = await page.url();
    // const description = await page.$eval('div[class^=description] p', (el => el.textContent));
    // const date = await page.$eval('div[class=dates]', (el => el.textContent));
    // const time = await page.$eval('div[class^=detail-c2] div:nth-of-type(7)', (el => el.textContent.slice(7)));
    // const recurring = await page.$eval('div[class^=detail-c2] div:nth-of-type(2)', (el => el.textContent));
    // const contact = await page.$eval('div[class^=detail-c2] div:nth-of-type(5)', (el => el.textContent.slice(9)));
    // const phone = await page.$eval('div[class^=detail-c2] div:nth-of-type(6)', (el => el.textContent.slice(7)));
    // const admission = await page.$eval('div[class^=detail-c2] div:nth-of-type(8)', (el => el.textContent.slice(11)));
    //
    // // Time is monotonic - does it need to be converted?
    // const getTimestamp = await page.metrics();
    // const timestamp = getTimestamp["Timestamp"];
    //
    // const address = await page.$eval('div[class=adrs]', (el => el.textContent));
    // const street = address.split('|')[0].trim();
    // const city = address.split('|')[1].split(',')[0].trim();
    // const state = address.split('|')[1].split(',')[1].split(' ')[1];
    // const postal = address.split('|')[1].split(',')[1].split(' ')[2];
    //
    // // Create Event object
    // let event = {
    //   url: url,
    //   description: description,
    //   date: date,
    //   time: time,
    //   recurring: recurring,
    //   place: {
    //     street: street,
    //     city: city,
    //     state: state,
    //     postal: postal
    //   },
    //   details: {
    //     contact: contact,
    //     phone: phone,
    //     admission: admission
    //   },
    //   timestamp: timestamp
    // }
    //
    // // Return scraped event data
    // console.log("***EVENT DATA IS:", event);

    // Trying to get event links!
    // const getLinks = await page.$$eval('#eventsContainer', (arr => arr[0]));
    // const linksArr = []
    // function gatherLinks = (getLinks) => {
    //   getLinks.forEach(el => {
    //     debugger
    //   })
    // }
    //
    // console.log(getLinks);
    //
    // // Log data (util is a tool that nicely formats objects in the console)
    // console.log(util.inspect(title, false, null));
// }

///////////////Attempt at steps 2 and 3///////////////

// This function should return an array of links from each event page
// const getEventLinks = async ({ page, request }) => {
//   // Having issues getting eventsContainer div. Use .each() to iterate over each a link once working?
//     const pageLinks = [];
//     const getLinks = await page.$('div.eventsContainer');
//   // Insert links into the pageLinks array and then return the array
//     // return pageLinks;
//     console.log(getLinks);
//     let arr = ["https://www.visithoustontexas.com/event/candytopia-houston/66348/", "https://www.visithoustontexas.com/event/clint-black-%26-trace-adkins-hats-hits-history-tour/68124/"]
//     return arr;
// }

const getNextPage = async () => {
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
      await page.click(buttonSelector);
    }
}
