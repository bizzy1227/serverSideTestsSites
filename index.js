const fs = require("fs");

const deviceSettings = require('./devices');
const parseNeogara = require('./parsers/neogaraParser');
const CONSTS = require('./consts');
const handlerSwitch = require('./siteHandlerSwitch');
const SaveJson = require('./save_json/saveJson');
const CheckJsonData = require('./check_json_data/checkJsonData');
const VirusTotal = require('./virusTotal/virusTotal');
const CheckAvailability = require('./check_availability/checkAvailability');

let startDate;
let lastResultObj = {};
let additionalСhecks = 0;
let updatedSiteQuery = [];

const runServer = async function(sites, typeRun, typeSites) {
    // обновляем при каждом запросе данные
    lastResultObj = {};
    updatedSiteQuery = [];
    

    let mainRespone = {};



    console.log('server side sites', sites);

    // настрока времени старта
    startDate = new Date().toISOString();
    console.log(startDate);

    // добавляем количество сайтов для проверки запросов
    // additionalСhecks += deviceSettings.DEVICES.length;

    for (let i of sites) {
        console.log('in loop for', i);

        additionalСhecks = 0;
        // результаты обработок
        let selfUpdateResult = null;
        let checkJsonResult;
        const testResult = [];
        let lighthouseResult;
        let virusTotal = false;
        let consoleErrors = false;
        let exitSiteHandle = false;
        let checkAvailability = false;


        let inputURL = '';
        // проверка на домен и если надо добавляем https://
        if (i.match(/^https:\/\//)) inputURL = i;
        else inputURL = 'https://' + i;

        let nodeUrl = new URL(inputURL);

        let returnedJsonData;

        // если тест сфейлился на получении settings.json
        try {
            returnedJsonData = await CheckJsonData.checkJsonData(nodeUrl.href, typeSites);
            if (returnedJsonData === false) {
                mainRespone[nodeUrl.href] = {
                    testResult: false
                };
                continue;
            }
        } catch (error) {
            console.log(error)
            mainRespone[nodeUrl.href] = {
                testResult: false
            };
            continue;
        }

        console.log('returnedJsonData', returnedJsonData);

        // если хоть одно поле неправильное - сохраняем результат и переходим к другому сайту
        for (key in returnedJsonData) {
            // console.log('typeof returnedJsonData[key]', typeof returnedJsonData[key]);
            if (typeof returnedJsonData[key] !== 'object' && returnedJsonData[key] !== true ) {
                mainRespone[nodeUrl.href] = {
                    testResult: returnedJsonData
                };
                exitSiteHandle = true;
            }
        }
        if (exitSiteHandle) continue;

        let options = {
            inputURL: nodeUrl.href,
            email: await getEmail(typeRun),
            device: false,
            jsonData: returnedJsonData.json,
            typeSite: typeSites
        }

        // тут можно вызвать switcher(options) с device: false для получения консольных ошибок 1 раз
        consoleErrors = await getConsoleErrors(options);

        let scanIdVirusTotal = await VirusTotal.scanVirusTotal(nodeUrl.href);

        // let idCheckAvailability = await CheckAvailability.callToCheckAvailability(nodeUrl.href);
        
        for (const device of deviceSettings.DEVICES) {
            additionalСhecks++;
            options.device = device;
            testResult.push(await handlerSwitch.switcher(options));
        }

        virusTotal = await VirusTotal.getReportVirusTotal(scanIdVirusTotal);

        // checkAvailability = await CheckAvailability.getReportCheckAvailability(idCheckAvailability);

        console.log('testResult after loop', testResult)    

        updatedSiteQuery.push(nodeUrl.href);

        mainRespone[nodeUrl.href] = {
            selfUpdateResult: selfUpdateResult,
            checkJsonResult: checkJsonResult,
            testResult: testResult,
            lighthouseResult: lighthouseResult,
            virusTotal: virusTotal,
            // checkAvailability: checkAvailability,
            consoleErrors: consoleErrors,
            neogaraResults: (typeSites === 'preland') ? null : true,
            passed: false
        }

    }

    if (typeSites !== 'preland') {
        let neogaraRes = await checkNeogara(startDate, await getEmail(typeRun));
        if (Object.keys(lastResultObj).length !== 0) {
            for (let key in lastResultObj) {
                if (neogaraRes === 'neogara is empty') mainRespone[key].neogaraResults = neogaraRes;
                else mainRespone[key].neogaraResults = lastResultObj[key];
            }
        }
    }

    for (key in mainRespone) {
        mainRespone[key].passed = await getMainResult(mainRespone[key], typeSites);
    }
 


    console.log('log response mainRespone', JSON.stringify(mainRespone));
    return mainRespone;
}

// runServer([
//   'powblzaslwflzkzis.info/b.php'
// ]);

async function getMainResult(responseData, typeSites) {
    if (typeSites === 'preland') {
        let result = false;
            try {
                for (let device of responseData.testResult) {
                    if (device.relink === true && device.yandex === true) {
                        result = true;
                    } 
                    else {
                        result = false;
                        return result;
                    } 
                }
            }
            catch {
                result = false;
                return result;
            }
        return result;
    }
    else if (typeSites === 'land') {
        let result = false;
            try {
                for (let device of responseData.testResult) {
                    if (device.thanks === true && responseData.neogaraResults === true) {
                        result = true;
                    } 
                    else {
                        result = false;
                        return result;
                    }
                }
            }
            catch {
                result = false;
                return result;
            }

        return result;
    }
    else if(typeSites === 'prelandWithLand') {
        let result = false;
            try {
                for (let device of responseData.testResult) {
                    if (device.preland.relink === true && device.preland.yandex === true) {
                        result = true;
                    } 
                    else {
                        result = false;
                        return result;
                    } 
                    if (device.land.thanks === true && responseData.neogaraResults === true) {
                        result = true;
                    } 
                    else {
                        result = false;
                        return result;
                    } 
                }
            }
            catch {
                result = false;
                return result;
            }

        return result;
    }
}

async function getConsoleErrors(options) {
    additionalСhecks++;
    if (options.typeSite === 'prelandWithLand') {
        let returnedResultTest = await handlerSwitch.switcher(options);
        let getConsoleErrorsResult = {
            preland: returnedResultTest.preland.consoleErrors,
            land: returnedResultTest.land.consoleErrors
        }
        return getConsoleErrorsResult;
    }

    if (options.typeSite === 'preland' || 'land') {
        let returnedResultTest = await handlerSwitch.switcher(options);
        return returnedResultTest.consoleErrors;
    }

    return false;

}

async function getEmail(typeRun) {
    if (typeRun === 'webErrors') return CONSTS.USER_DATA['emailWebErrors'];
    if (typeRun === 'sendFormErrors') return CONSTS.USER_DATA['sendFormEmailErrors'];
    if (typeRun === 'autoWebErrors') return CONSTS.USER_DATA['autoEmailWebErrors'];
    if (typeRun === 'autoSendFormErrors') return CONSTS.USER_DATA['autoSendFormEmailErrors'];
}

// checkNeogara для работы с сайтами после всех итераций
async function checkNeogara(startDate, email) {
  console.log('in checkNeogara', startDate);
  
  const neogararesults = await parseNeogara.NeogaraGetConversions(startDate, 0, email);
  
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
  
  // console.log('new test log in neogara', total, updatedSiteQuery.length * additionalСhecks);
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
  
  // пушим следующие конверсии в массив
  if(pageCount > 1) {
    for (page; page <= pageCount; page++) {
      let newConvs = await parseNeogara.NeogaraGetConversions(startDate, page, email);
      await newConvs.forEach(conv => allConversions.push(conv));
    }
  }

  console.log('all allConversions', allConversions);
  

  for (let conversion of allConversions) {
    let convNodeUrl = new URL(conversion.ref);
    for (let sqIndex of updatedSiteQuery) {
      let queryNodeUrl = new URL(sqIndex);
      if (convNodeUrl.host === queryNodeUrl.host && conversion.email === email) {
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

}

module.exports.runServer = runServer;
// module.exports.runServerWebErrors = runServerWebErrors;
// module.exports.autoRunServerWebErrors = autoRunServerWebErrors;
// module.exports.autoRunServerFormErrors = autoRunServerFormErrors;
