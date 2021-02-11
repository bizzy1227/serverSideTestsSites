const fs = require('fs');
const lighthouse = require('lighthouse');
const config = require('lighthouse/lighthouse-core/config/lr-mobile-config.js');
const chromeLauncher = require('chrome-launcher');
const winston = require('winston');
chrome.setDefaultService(new chrome.ServiceBuilder('usr/local/bin/chromedriver').build());

// let URL = 'https://maxwmuizazer.info/';

const checkLighthouse  = async function(URL, withLogs) {
  try {
    const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
    const options = {logLevel: 'info', output: 'json', onlyCategories: ['performance'], port: chrome.port};
    const runnerResult = await lighthouse(URL, options, config);

    const logger = winston.createLogger({
      level: 'error',
      format: winston.format.json(),
      defaultMeta: { service: 'test str' },
      transports: [
        new winston.transports.File({ filename: 'lighthouse_report.log', level: 'info' }),
      ]
    });

    if (withLogs) {
        logger.log({
          level: 'info',
          message: 'mock',
          performance: runnerResult.lhr.categories.performance.score * 100,
          URL: URL
        });
    }

    console.log('Report is done for', runnerResult.lhr.finalUrl);
    console.log('Performance score was', runnerResult.lhr.categories.performance.score * 100);

    await chrome.kill();

    return { performance: runnerResult.lhr.categories.performance.score * 100 };
  } catch (e) {
    return { performance: e.message };
  }

};

module.exports.checkLighthouse = checkLighthouse;