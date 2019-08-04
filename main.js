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

// Function to get data from page
const getEventData = async ({ page, request }) => {
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
    // Time is monotonic - does it need to be converted?
    const timestamp = await page.metrics();

    // Create Event object
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
      timestamp: timestamp["Timestamp"]
    }

    console.log(`Page ${request.url} succeeded`);
    // Return scraped event data
    console.log("***EVENT DATA IS:", event);

    // Log data (util is a tool that nicely formats objects in the console)
    console.log(util.inspect(title, false, null));
}

const getEventLinks = async () => {
  let url = 'https://www.visithoustontexas.com/events/';
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

// Get event links, iterate through them
// div.eventsContainer > a

// On main page, iterate through event links and gather URLs
// Send each URL to the request Queue and get event data for each page
