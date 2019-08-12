const puppeteer = require('puppeteer');
const { expect } = require('chai');
const _ = require('lodash'); //JS helper to give us access to some functions
const globalVariables = _.pick(global, ['browser', 'expect']);

// puppeteer options
const opts = {
  headless: false,
  slowMo: 100,
  timeout: 10000
};

//Simple node testing
const assert = require('assert');
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
    }
  )
});


// expose variables
before (async function () {
  global.expect = expect;
  global.browser = await puppeteer.launch(opts);
});

});
