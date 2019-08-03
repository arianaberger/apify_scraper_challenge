const Apify = require('apify');
const util = require('util');

Apify.main(async () => {

    // Get queue and enqueue first url.
    const requestQueue = await Apify.openRequestQueue();
    await requestQueue.addRequest(new Apify.Request({ url: 'https://www.visithoustontexas.com/event/zumba-in-the-plaza/59011/' }));

    console.log(requestQueue);
    // Create crawler.
    const crawler = new Apify.PuppeteerCrawler({
        requestQueue,

        // This page is executed for each request.
        // If request failes then it's retried 3 times.
        // Parameter page is Puppeteers page object with loaded page.
        handlePageFunction: getEventData,

        // If request failed 4 times then this function is executed.
        handleFailedRequestFunction: async ({ request }) => {
            console.log(`Request ${request.url} failed 4 times`);
        },
    });

    // Run crawler.
    await crawler.run();

});

const getEventData = async ({ page, request }) => {

    // Function to get data from page
    const title = await page.title();

    const url = await page.url();
    const description = await page.$eval('div[class^=description] p', (el => el.textContent));
    const date = await page.$eval('div[class=dates]', (el => el.textContent));
    const time = await page.$eval('div[class^=detail-c2] div:nth-of-type(7)', (el => el.textContent));
    const recurring = await page.$eval('div[class^=detail-c2] div:nth-of-type(2)', (el => el.textContent));
    const address = await page.$eval('div[class=adrs]', (el => el.textContent));
    const contact = await page.$eval('div[class^=detail-c2] div:nth-of-type(5)', (el => el.textContent));
    const phone = await page.$eval('div[class^=detail-c2] div:nth-of-type(6)', (el => el.textContent));
    const admission = await page.$eval('div[class^=detail-c2] div:nth-of-type(8)', (el => el.textContent));
    // const lastRunTimestamp = await page.$$eval('time', (els) => els[1].getAttribute('datetime'));
    // const timestamp = new Date(Number(lastRunTimestamp));
    const timestamp = "timestamp"

    //Create Event object
    let event = {
      url: url,
      description: description,
      date: date,
      time: time.slice(7),
      recurring: recurring,
      place: {
        street: address.split('|')[0].trim(),
        city: address.split('|')[1].split(',')[0].trim(),
        state: address.split('|')[1].split(',')[1].split(' ')[1],
        postal: address.split('|')[1].split(',')[1].split(' ')[2]
      },
      details: {
        contact: contact.slice(9),
        phone: phone.slice(7),
        admission: admission.slice(11)
      },
      timestamp: timestamp
    }

    console.log(`Page ${request.url} succeeded`);
    console.log("***EVENT DATA IS:", event);

    // Log data (util is a tool that nicely formats objects in the console)
    console.log(util.inspect(title, false, null));
}
