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
    const posts = await page.$$('.athing');

    const url = await page.url();
    const description = await page.$$();
    const date = await page.$$('.dates');
    const time = await page.$$('.detail-c2 > div:nth-child(7)');
    // const recurring = await page.;
    // const street = await page.;
    // const city = await page.;
    // const state = await page.;
    // const postal = await page.;
    // const contact = await page.;
    // const phone = await page.;
    // const admission = await page.;
    // const timestamp = await page.;

    //Create Event object
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

    console.log(`Page ${request.url} succeeded`);
    console.log("EVENT DATA IS:", event);

    // Log data (util is a tool that nicely formats objects in the console)
    console.log(util.inspect(title, false, null));
}
