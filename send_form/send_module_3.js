const {Builder, By, Key, until} = require('selenium-webdriver');
const fs = require("fs");
const winston = require('winston');
const chrome = require('selenium-webdriver/chrome');
let proxy = require('selenium-webdriver/proxy');
const webErrorsModule = require('../web_errors/web_errors_module');
let opts = new chrome.Options();
const CONSTS = require('../consts');

let countRedirect = 0;
let logger;

let capabilities = false;
let processWebErrors = false;
let proxyAddress = false;
let writeLogsWeb = false;
let writeLogsForm = false;
let webErrosrResult = {};

let mainResult;

const checkSend  = async function(URL, getWebErr, cp, myProxy, withLogsWeb, withLogsForm) {
    webErrosrResult = {};
    
    console.log('in checkSend');
    let driver;
    capabilities = cp;
    console.log('cp =', capabilities);
    processWebErrors = getWebErr;
    proxyAddress = myProxy;
    writeLogsWeb = withLogsWeb;
    writeLogsForm = withLogsForm;

    console.log('run on', capabilities ? 'browser-stack' : 'browser');

    /*
        
        
        1. Возвращая ошибки консоли приходит то путстой массив то пустой обьект
            - maxigjmizer.info
            - papgtekgdtefrvcrn.info/b.php
        2. Пересмотреть как возвращать результат с проклой.
        3. Автозапуск сбора консольных ошибок

    */

    if (withLogsForm) {
        logger = winston.createLogger({
            level: 'error',
            format: winston.format.json(),
            defaultMeta: { service: capabilities ? 'browser-stack' : 'browser' },
            transports: [
            new winston.transports.File({ filename: 'send_form_errors.log', level: 'error' }),
            ]
        });
    }


    if (capabilities) {
        driver = await new Builder().usingServer('http://hub-cloud.browserstack.com/wd/hub')
        .withCapabilities(capabilities).setChromeOptions(new chrome.Options().addArguments(['--ignore-certificate-errors', '--ignore-ssl-errors', '--headless']))
        .build();
    } else {
        console.log('useProxy', proxyAddress);
        if (proxyAddress) opts.setProxy(proxy.manual({https: proxyAddress}));
        opts.addArguments(['--ignore-certificate-errors', '--ignore-ssl-errors', '--headless', '--disable-gpu', '--no-sandbox'])
        driver = await new Builder().forBrowser('chrome')
        .setChromeOptions(opts)
        .build();
    }

    try {
        // добавляем параметры для отправки на dev.neogara
        let searchParams = URL.searchParams;
        searchParams.set('action', 'test');
        searchParams.set('pid', 'kag318');
        searchParams.set('group', '1');
        URL.search = searchParams.toString();
        // переходим на ссылку с параметрами дял dev
        await driver.get(URL.href);

        // await driver.get(URL.href);
        // driver.sleep(5000);

        await checkForm(driver, URL);

        return mainResult;

    } catch (e) {
        console.log(e);
        if (writeLogsForm) {
            logger.log({
                level: 'error',
                message: e.message,
                URL: URL,
                capabilities: capabilities
            });
        }
        driver.quit();
        mainResult = {error: e.message, capabilities: capabilities, URL: URL.href};
        return mainResult;
    }

}

async function checkForm(driver, inputURL) {

    // записываем текущую вкладку
    // const originalWindow = await driver.getWindowHandle();

    console.log('in checkForm');
    // получаем ошибки консоли
    if (processWebErrors) webErrosrResult[inputURL.origin + inputURL.pathname] = await webErrorsModule.processUrl(inputURL.href, false, driver, capabilities, writeLogsWeb);
    console.log('11111111111111111', webErrosrResult)
    let indexElements = 0;
    let form = await driver.findElements(By.css('form'));
    // console.log(await form[0].isDisplayed());
    console.log('form length', form.length);

    // если есть форма
    if (form.length > 0) {
        for (let item of form) {
            if (await item.isDisplayed()) {
                form = item;
                break;
             } 
        }
        // if (!await form[indexElements].isDisplayed()) indexElements = 1;
        await fillForm(driver, inputURL, form);
    } 
    else {
        // если нет формы
        console.log('in block no form');
        const originalWindow = await driver.getWindowHandle();
        console.log('originalWindow.length',  originalWindow.length);
        let link = await driver.findElements(By.xpath('//a'));
        // проверить видна ли ссылка
        for(i of link) {
            if (await i.isDisplayed() === true) {
                link = i;
                break;
            }
            else continue
        };        
        let href = await link.getAttribute('href');
        let testNodeUrl = new URL(href);
        if (testNodeUrl.protocol === 'chrome-error:') {
            if (writeLogsForm) {
                logger.log({
                    level: 'error',
                    message: href,
                    URL: inputURL.href,
                    capabilities: capabilities
                });
            }
            driver.quit();
            mainResult = {error:  href, capabilities: capabilities, URL: inputURL.href};
            return mainResult;
        }

        await link.click();

        // // проверка открывается ли ссылка в новой вкладке
        // let targetLink = await link.getAttribute('target');
        // let href = await link.getAttribute('href');
        // console.log('href', href);
        // console.log('targetLink', targetLink);
        // await link.click();
        // // await driver.get(href);

        // // если открывается ссылка в новой вкладке
        // if (targetLink === '_blank') {
        //     await driver.sleep(5000);
        //     const windows = await driver.getAllWindowHandles();
        //     console.log('windows.length', windows.length);
        //     windows.forEach(async handle => {
        //         if (handle !== originalWindow) {
        //             await driver.switchTo().window(handle);
        //         }
        //     });
        // }

        // жду когда появится форма (возможно улучшить, что бы ждать загрузку страницы)
        // await driver.wait(until.elementLocated(By.css('form')), 10000);
        await driver.sleep(5000);

        let currentUrl = new URL(await driver.getCurrentUrl());
        await checkForm(driver, currentUrl);
    } 
}

async function fillForm(driver, inputUrl, form) {
    
    try {
        let firstname = await form.findElement(By.name('firstname'));
        await setValue('firstname', firstname);

        let lastname = await form.findElement(By.name('lastname'));
        await setValue('lastname',lastname);

        let tel = await form.findElement(By.name('phone_number'));
        await setValue('tel',tel);
    
        let email = await form.findElement(By.name('email'));
        await setValue('email', email);

        let submit = await form.findElement(By.xpath(`//*[@type='submit']`));
        if (!await submit.isDisplayed()) submit = await form.findElement(By.css(`button`));
        // await submit.click();




        // let oldUrl = inputUrl.href;
        // console.log('in fillForm', inputUrl.href);
    
        // let firstname = await driver.findElements(By.name('firstname'));
        // await setValue('firstname', firstname.length, firstname, i); 
    
        // let lastname = await driver.findElements(By.name('lastname'));
        // await setValue('lastname', lastname.length, lastname, i);
    
        // let tel = await driver.findElements(By.name('phone_number'));
        // await setValue('tel', tel.length, tel, i);
    
        // let email = await driver.findElements(By.name('email'));
        // await setValue('email', email.length, email, i);
    
        // let submit = await driver.findElements(By.xpath(`//*[@type='submit']`));

        // console.log(await submit[i].getText());

        // скролим к кнопке
        driver.executeScript("arguments[0].scrollIntoView()", submit);
        driver.sleep(300);

        await submit.click();
    
        
        await driver.sleep(5000);
    
        
        inputUrl = new URL(await driver.getCurrentUrl());
        await checkLastUrl(driver, inputUrl.href);

    } catch (error) {
        console.log('test log', error.message);
        throw new Error('fill form failed');
    }

}

async function checkLastUrl(driver, inputUrl) {
    console.log('in checkLastUrl');

    let currentUrl = new URL(inputUrl);

    console.log('crrURL.pathname', currentUrl.pathname);
    console.log('currentUrl.pathname === "/thanks.php"', currentUrl.pathname === '/thanks.php');
    
    if (currentUrl.pathname !== '/thanks.php') {
        countRedirect++;
        if (countRedirect < 3) await checkForm(driver, currentUrl);
        else {
            console.log(`The limit (${countRedirect}) of clicks on links has been exceeded`, currentUrl.href);
            countRedirect = 0;
            if (writeLogsForm) {
                logger.log({
                    level: 'error',
                    message: `The limit (${countRedirect}) of clicks on links has been exceeded`,
                    URL: currentUrl.href
                });
            }
            mainResult ={error: `The limit (${countRedirect}) of clicks on links has been exceeded`, capabilities: capabilities, URL: currentUrl.href};
            return mainResult;
        }
    } else if (currentUrl.pathname === '/thanks.php') {
        countRedirect = 0;
        console.log('Test send form done', currentUrl.href);
        driver.quit();
        mainResult = true;
        if (processWebErrors) mainResult = webErrosrResult;
        return mainResult;
    } else {
        if (writeLogsForm) {
            logger.log({
                level: 'error',
                message: 'Test send form failed',
                URL: currentUrl.href
            });
        }
        driver.quit();
        mainResult = {error: 'Test send form failed', URL: currentUrl.href};
        return mainResult;
    }
}

async function setValue(name, element) {
    console.log('in setValue');


        await element.clear();
        if (name === 'email' && processWebErrors) {
            await element.sendKeys(CONSTS.USER_DATA['emailWebErrors']);
            return;
        }
        await element.sendKeys(CONSTS.USER_DATA[name]);


}

async function clickBtn(submit, i) {
    try {
        console.log('in clickBtn');
        submit[i].click();
    } catch (error) {
        console.log('test log', error.message);
        throw new Error('Click submit failed');
    }

}

// checkSend('https://magxeomizpeper.pl/');

module.exports.checkSend = checkSend;