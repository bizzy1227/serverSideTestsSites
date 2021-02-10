const fs = require("fs");

const sendModule = require('./send_form/send_module_3');
// const webErrorsModule = require('./web_errors/web_errors_module');
const lighthouseModule = require('./lighthouse/lighthouse_module');
const selfUpdateModule = require('./self_update/self_update_module');
const checkJsonModule = require('./check_json/check_json_module');
const deviceSettings = require('./devices');
const parseNeogara = require('./parsers/neogaraParser');
const CONSTS = require('./consts')
const countries = ['PL', 'UA', 'US', 'RU', 'EN', 'GR', 'GB', 'HR', 'HU', 'HK', 'PH', 'ZA', 'IT', 'ES', 'FR', 'NL', 'CH', 'CA', 'CZ', 'SK', 'KR', 'SI', 'SG', 'DE', 'TR', 'AE', 'IS', 'AU', 'BE', 'GB', 'HK', 'FI', 'NL', 'NO', 'NZ', 'CH', 'CA', 'SE', 'DK', 'DE', 'AU', 'AT', 'IE'];

let myArgs = String(process.argv.slice(2));
myArgs = myArgs.split(',');

// проверка установлен ли флаг на работу с thanks.php
let processThanksPage = false;
if (myArgs.includes('--with-thanks')) processThanksPage = true;

// проверка установлен ли флаг на быструю работу
let fastMode = false;
if (myArgs.includes('--fast')) fastMode = true;

// первый параметр должен быть код страны для проверки
let testCountry = false;
if (countries.includes(myArgs[0])) testCountry = myArgs[0];

let startDate;
let sendFormErrors = [];
const promises = [];
let lastResultObj = {};
let additionalСhecks = 0;
let updatedSiteQuery = [];



async function runLocal() {

  // получаем список сайтов
  let siteQuery = fs.readFileSync("./input.txt", "utf8");
  siteQuery = siteQuery.replace(/\r/g, '');
  siteQuery = siteQuery.split('\n');
  
  // настрока времени старта
  // Date.prototype.addHours = function(h) {
  //   this.setTime(this.getTime() + (h*60*60*1000));
  //   return this;
  // }
  startDate = new Date().toISOString();
  console.log(startDate);

  // добавляем количество сайтов для проверки запросов
  additionalСhecks += deviceSettings.DEVICES.length;
  
  for (let i of siteQuery) {
    let inputURL = '';
    // проверка на домен и если надо добавляем https://
    if (i.match(/^https:\/\//)) inputURL = i;
    else inputURL = 'https://' + i;
  
    let nodeUrl = new URL(inputURL);

    // делаю selfUpdate для каждого сайта
    await selfUpdateModule.selfUpdate(nodeUrl.href, true);

    // проверка settings.json на каждом сайте
    let localCheckJsonResult = await checkJsonModule.checkJson(nodeUrl.href, true);
    let relink;
    if (!localCheckJsonResult.hasError) {
      relink = localCheckJsonResult.result;
      localCheckJsonResult = true;
    } else {
      localCheckJsonResult = localCheckJsonResult.result;
    }

    // запуск для теста формы для разных девайсов c browserstack
    for (let device of deviceSettings.DEVICES) {
      await sendModule.checkSend(nodeUrl, false, device, false, true);
    }

    // перезаписываю nodeUrl на relink, если илд будет отправлен с другого url
    if (relink) nodeUrl = new URL(relink);
    // создаю массив коректных урлов 
    updatedSiteQuery.push(nodeUrl.href);

  }
  
  // использовать Promise.all(promises) для паралельного тестирования
  // const result = await Promise.all(promises);

  let neogaraRes = await checkNeogara(startDate);
  if (Object.keys(lastResultObj).length !== 0) console.log('Has Errors send form', lastResultObj);
  else console.log('Test send form done', lastResultObj);

};

// runLocal();

const runServer = async function(sites) {
    lastResultObj = {};
    updatedSiteQuery = [];

    let mainRespone = {};


    console.log('server side sites', sites);

    // настрока времени старта
    startDate = new Date().toISOString();
    console.log(startDate);

    // добавляем количество сайтов для проверки запросов
    additionalСhecks += deviceSettings.DEVICES.length;

    for (let i of sites) {
      // результаты обработок
      let selfUpdateResult;
      let checkJsonResult;
      let sendFormResult = [];


      let inputURL = '';
      // проверка на домен и если надо добавляем https://
      if (i.match(/^https:\/\//)) inputURL = i;
      else inputURL = 'https://' + i;
    
      let nodeUrl = new URL(inputURL);
  
      // делаю selfUpdate для каждого сайта
      selfUpdateResult = await selfUpdateModule.selfUpdate(nodeUrl.href, false);
  
      // проверка settings.json на каждом сайте
      checkJsonResult = await checkJsonModule.checkJson(nodeUrl.href, false);
      let relink;
      if (!checkJsonResult.hasError) {
        relink = checkJsonResult.result;
        checkJsonResult = true;
      } else {
        checkJsonResult = checkJsonResult.result;
      }
  
      // запуск для теста формы для разных девайсов c browserstack
      for (let device of deviceSettings.DEVICES) {
        sendFormResult.push(await sendModule.checkSend(nodeUrl, false, device, false, false));
      }
  
      // перезаписываю nodeUrl на relink, если илд будет отправлен с другого url
      if (relink) nodeUrl = new URL(relink);
      // создаю массив коректных урлов 
      updatedSiteQuery.push(nodeUrl.href);

      mainRespone[nodeUrl.href] = {
        selfUpdateResult: selfUpdateResult,
        checkJsonResult: checkJsonResult,
        sendFormResult: sendFormResult,
        neogaraResults: true
      }
  
    }

    // console.log('1 selfUpdateResult', selfUpdateResult, '2 checkJsonResult', checkJsonResult, '3 sendFormResult', sendFormResult);

    let neogaraRes = await checkNeogara(startDate);
    if (Object.keys(lastResultObj).length !== 0) {
      for (let key in lastResultObj) {
        if (neogaraRes === 'neogara is empty') mainRespone[key].neogaraResults = neogaraRes;
        else mainRespone[key].neogaraResults = lastResultObj[key];
      }
    }


    console.log('log response mainRespone', JSON.stringify(mainRespone));
    return mainRespone;
}


async function getProxy(testCountry) {
  if (testCountry) return CONSTS.PROXY[testCountry];
  else return false;
}

// checkNeogara для работы с сайтами после всех итераций
async function checkNeogara(startDate) {
  console.log('in checkNeogara', startDate);
  
  const neogararesults = await parseNeogara.NeogaraGetConversions(startDate);
  
  for (let sqIndex of updatedSiteQuery) {
    lastResultObj[sqIndex] = [];
  }

  console.log('lastResultObj empty: ', lastResultObj);
  console.log('neogararesults', neogararesults);

  if (neogararesults.length === 0) return 'neogara is empty'
  
  let count = neogararesults[0].totals.count;
  let total = neogararesults[0].totals.total;
  // добавляем +1 для следующего запроса
  let page = neogararesults[0].totals.page + 1;
  let pageCount = neogararesults[0].totals.pageCount;
  
  // возвращаемся из функции если совпало количество конверсий с количеством запросов
  if (total === updatedSiteQuery.length * additionalСhecks) {
    console.log('better outcome condition');
    lastResultObj = {};
    return lastResultObj;
  }  

  let allConversions = [];
  // пушим сразу первые данные
  // allConversions.push(neogararesults);
  neogararesults.forEach(conv => allConversions.push(conv));

  console.log('first push convi', allConversions);
  

  // пушим следующие конверсии в массив
  if(pageCount > 1) {
    for (page; page <= pageCount; page++) {
      let newConvs = await parseNeogara.NeogaraGetConversions(startDate, page);
      await newConvs.forEach(conv => allConversions.push(conv));
    }
  }

  console.log('all allConversions', allConversions);
  

  for (let conversion of allConversions) {
    let convNodeUrl = new URL(conversion.ref);
    for (let sqIndex of updatedSiteQuery) {
      let queryNodeUrl = new URL(sqIndex);
      if (convNodeUrl.host === queryNodeUrl.host && conversion.email === 'testmail5@gmail.com') {
        lastResultObj[sqIndex].push(conversion);
      }
    }
  }

  console.log('lastResultObj before check: ', lastResultObj);

  // в конце удаляем те сайты, которые имеют в себе лидов ровно столько сколько было отправлено форм
  // если лидо не ровно - какая-то отправка сфейлилась
  for (let key in lastResultObj) {
    if (lastResultObj[key].length === additionalСhecks) {
      delete lastResultObj[key];
    }
  }

  console.log('lastResultObj after delete: ', lastResultObj);

  // пушим в новый файл сайты которы имеют ошибку после теста
  if (Object.keys(lastResultObj).length !== 0) {
    let keysObj = Object.keys(lastResultObj)
    console.log(keysObj);
    keysObj.forEach(key => {
      fs.appendFile('inputAfterTest.txt', key + '\n', function (err) {
        if (err) throw err;
      });
    })
    console.log('results saved!');
  }
  // if (Object.keys(lastResultObj).length !== 0) sendFormErrors.push(lastResultObj);
  // if (Object.keys(lastResultObj).length !== 0) {

  //   console.log('Has Errors send form');
  // } 
}

module.exports.runServer = runServer;

// 'browserstack.user' : 'yaroslavsolovev1',
// 'browserstack.key' : 'Y5QWsrsNx9pjNdHkZnKN'