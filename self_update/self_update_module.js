const {Builder, By, Key, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { Options } = require('selenium-webdriver/chrome');
const winston = require('winston');

let driver;

const options = new Options()
// options.setChromeBinaryPath('/usr/local/bin/chromedriver');
options.addArguments(['--ignore-certificate-errors', '--ignore-ssl-errors', '--headless', '--disable-gpu', '--no-sandbox']);

const selfUpdate  = async function(inputURL, withLogs) {

    let logger = winston.createLogger({
        level: 'error',
        format: winston.format.json(),
        defaultMeta: { service: 'headless browser' },
        transports: [
          new winston.transports.File({ filename: '../self_update_errors.log', level: 'error' }),
        ]
    });
    // '--headless'
    driver = await new Builder().forBrowser('chrome')
    .setChromeOptions(options)
    .build();

    let nodeUrl = new URL(inputURL);

    try {
        nodeUrl.pathname = '/api/selfUpdate.me';
        console.log('in self module', nodeUrl.href);
        await driver.get(nodeUrl.href);

        // получаю и обрабатываю ответ после selfUpdate
        let elements = await driver.findElements(By.css('pre'));
        let result = await elements[0].getText();
        if (result.match(/^Archive downloaded/)) return true;
        else {
            console.log('selfUpdate failed!');
            if (withLogs) {
                logger.log({
                    level: 'error',
                    message: result,
                    URL: nodeUrl.href
                });
            }
            
            return result;
        } 

    } catch (e) {
        console.log(e);
        if (withLogs) {
            logger.log({
                level: 'error',
                message: e.message,
                URL: nodeUrl.href
            });
        }
        return {message: e.message, URL: nodeUrl.href};
    } finally {
        driver.quit();
    }
}

module.exports.selfUpdate = selfUpdate;