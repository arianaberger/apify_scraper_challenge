//Testing with puppeteer
const puppeteer = require('puppeteer');
const { expect } = require('chai');
const _ = require('lodash'); //JS helper to give us access to some functions
const globalVariables = _.pick(global, ['browser', 'expect']);

//Simple node testing
const assert = require('assert'); //use assertion library to verify test results
const http = require('https');
const url = 'https://www.visithoustontexas.com/event/zumba-in-the-plaza/59011/';

describe('sample test', function () {
  it('tests are working!', function () {
    expect(true).to.be.true;
  });

  it('should return 200', function (done) {
    http.get(url, function (res) {
      assert.equal(200, res.statusCode);
      done();
    });
  });

  it('should have the correct heading', function (done) {
    http.get(url, function (res) {
      res.setEncoding('utf8');
        res.on('data', function(chunk){
          // returns html, not what I need for querying the document
          // console.log(chunk)
        })
      })
      done();
  });
});


// // puppeteer options
// const opts = {
//   headless: false,
//   slowMo: 100,
//   timeout: 10000
// };
//
// // expose variables
// before (async function () {
//   global.expect = expect;
//   global.browser = await puppeteer.launch(opts);
// });


// describe('check the basics', function () {
//   let page;
//
//   before (async function () {
//     // page = await browser.newPage();
//     // await page.goto('https://www.visithoustontexas.com/event/zumba-in-the-plaza/59011/');
//
//     it('should return 200', function (done) {
//         http.get('https://www.visithoustontexas.com/event/zumba-in-the-plaza/59011/', function (res) {
//           assert.equal(200, res.statusCode);
//           done();
//         })

  //   page = browser.newPage()
  //   page.then(function(page){
  //     page.goto('https://www.visithoustontexas.com/event/zumba-in-the-plaza/59011/');
  //     done()
  //   })
  // });

  // it('should have the correct page title', async function () {
  //   expect(await page.title()).to.eql('Zumba in the Plaza | Free Events in Sugar Land, TX 77479');

  // it('should have the correct page title', function () {
  //   expect(page.title()).to.eql('Zumba in the Plaza | Free Events in Sugar Land, TX 77479');
  //
  // });
  //
  // it('should have a heading', async function () {
  //   const HEADING_SELECTOR = 'h1';
  //   let heading;
  //
  //   await page.waitFor(HEADING_SELECTOR);
  //   heading = await page.$eval(HEADING_SELECTOR, heading => heading.innerText);
  //
  //   expect(heading).to.eql('Zumba in the Plaza | Free Events in Sugar Land, TX 77479');
  // });

//   after (async function () {
//     await page.close();
//   })
// });
//
//
// // close browser and reset global variables
// after (function () {
//   browser.close();
//
//   global.browser = globalVariables.browser;
//   global.expect = globalVariables.expect;
// });
