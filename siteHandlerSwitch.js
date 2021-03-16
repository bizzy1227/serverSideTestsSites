const {Builder, By, Key, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
let opts = new chrome.Options();

const PrelandOutside = require('./preland_outside/prelandOutside');
const Land = require('./land/land');
const deviceSettings = require('./devices');

const switcher = async function(optionsSwitcher) {
    let timeInputInSwitcher = new Date();

    console.log('in switcher');

    let checkJsonFieldsResult = await checkJsonFields(optionsSwitcher.typeSite, optionsSwitcher.jsonData);
    if (checkJsonFieldsResult !== true) {
        return checkJsonFieldsResult;
    }

    let driver;
    // console.log('optionsSwitcher', optionsSwitcher)

    try {
        
        if (optionsSwitcher.device) {
            console.log('before BS build');
            driver = await new Builder().usingServer('http://hub-cloud.browserstack.com/wd/hub')
            .withCapabilities(optionsSwitcher.device).setChromeOptions(new chrome.Options().addArguments(['--ignore-certificate-errors', '--ignore-ssl-errors', '--headless']))
            .build();
            console.log('after BS build');
        } else {
            console.log('before local build');
            opts.addArguments(['--ignore-certificate-errors', '--ignore-ssl-errors', '--disable-gpu', '--no-sandbox'])
            .addExtensions(['./extension_4_29_2_0.crx'])
            driver = await new Builder().forBrowser('chrome')
            .setChromeOptions(opts)
            .build();
            console.log('after local build');
        }
        console.log('in log after connect BS/build local\ntime to connect BS', (new Date() - timeInputInSwitcher) / 1000, 'seconds');

        let options = {
            driver: driver,
            inputURL: new URL(optionsSwitcher.inputURL),
            email: optionsSwitcher.email,
            capabilities: optionsSwitcher.device,
            relink: optionsSwitcher.jsonData.relink,
            yandex: optionsSwitcher.jsonData.yandex
        }

        if (optionsSwitcher.typeSite === 'preland') {
            console.log('in preland');
            const resultTest = await PrelandOutside.handlePrelandOutside(options);
            console.log('resultTest', resultTest);
            return resultTest;
        }
        if (optionsSwitcher.typeSite === 'land') {
            console.log('in land');
            let resultTest = await Land.handleLand(options);
            console.log('resultTest', resultTest);
            return resultTest;
        }
        if (optionsSwitcher.typeSite === 'prelandWithLand') {
            console.log('in prelandWithLand');
            let resultTest = {
                preland: false,
                land: false
            }
            resultTest.preland = await PrelandOutside.handlePrelandOutside(options);
            // если локально расположен ленд - добавляем к урлу релинк в pathname
            options.inputURL.pathname = options.relink;
            // console.log('options', options);
            resultTest.land = await Land.handleLand(options);
            console.log('from return with switcher resultTest', resultTest);
            return resultTest;
        }
    } catch (error) {
        console.log(error)
    } finally {
        driver.quit();
    }

}

async function checkJsonFields(typeSite, options) {
    if (typeSite === 'preland' && (!options.relink || !options.yandex)) {
        return 'no relink or yandex';
    }
    if (typeSite === 'land' && !options.yandex) {
        return 'no yandex';
    }
    if (typeSite === 'prelandWithLand' && (!options.relink || !options.yandex)) {
        return 'no relink or yandex';
    }
    return true;
}

module.exports.switcher = switcher;