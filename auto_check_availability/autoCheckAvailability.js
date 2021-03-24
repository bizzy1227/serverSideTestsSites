const CheckAvailability = require('../check_availability/checkAvailability');
const axios = require('axios');


const requestSites = [
    "adgcadloxode.info",
    "adgcdoxode.info",
    "adgncdlodhde.info",
    "biiqbuilhhpaswdkwre.info",
    "bizdyslkdutohyiyere.info",
    "bifgdynnewftbyfuerre.info",
    "gabfheohoedaqghst.info",
    "gakhtbfsxjmnkjst.info",
    "bastcoskatpl.info"
];

async function buitySites(sites) {
    let buitySites = [];
    for (let site of sites) {
        let inputURL = '';
        // проверка на домен и если надо добавляем https://
        if (site.match(/^https:\/\//)) inputURL = site;
        else inputURL = 'https://' + site;
        let nodeUrl = new URL(inputURL);
        buitySites.push(nodeUrl.href);
    }
    return buitySites;
}

async function asyncCallToCheck(sites) {
    let checkIds = new Map();
    let bSites = await buitySites(sites);
    const promises = [];
    for (let site of bSites) {
        // console.log('1', site);
        promises.push(CheckAvailability.callToCheckAvailability(site));
    }
    const result = await Promise.all(promises);
    for (let [index, site] of bSites.entries()) {
        checkIds.set(site, result[index]);
    }
    return checkIds;
}

async function asyncCallToResult(mapIds) {
    let checkResults = [];
    const promises = [];
    mapIds.forEach((value, key) => {
        promises.push(CheckAvailability.getReportCheckAvailability(value));
    });
    const result = await Promise.all(promises);
    let index = 0;
    mapIds.forEach((value, key) => {
        checkResults.push({ node: key, result: result[index]} );
        index++;
    });
    return checkResults;
}

async function getSites() {
    let result;
    const requestSites = axios.create({
        headers: {
            "accept": "application/json"
        }
    });

    await requestSites.get(`http://138.68.94.189/api/sites_list`)
    .then(res => {
        // console.log('res.data', res.data);
        result = res.data;
    });
    return result;
}

async function main() {
    let mainResult = [];
    let crmData = await getSites();
    // console.log('before sort', crmData);
    crmData = await crmData.sort(compare);
    crmData = crmData.slice(0, 8);
    // console.log('after sort', crmData);

    let crsDomains = crmData.map(item => {
        return item.domain;
    });
    console.log('crsDomains', crsDomains);
    // throw Error('stop')
    
    let mapWithCheckId;
    let mapWithCheckResult;
    // console.log('mapWithCheckId', mapWithCheckId);
    mapWithCheckId = await asyncCallToCheck(crsDomains);
    await sleep(30000);
    mapWithCheckResult = await asyncCallToResult(mapWithCheckId);
    console.log('typeof mapWithCheckResult', typeof mapWithCheckResult);

    for (let [index, domain] of crsDomains.entries()) {
        // console.log('test_3', index, domain);
        
        mainResult.push({
            'domain': domain,
            'available': evaluationResult(mapWithCheckResult[index].result)
        })
    }
    console.log('mainResult', mainResult);
    await setResultToCrm(mainResult);
    console.log('end', new Date());

    setTimeout(main, 600000);
}

main();

async function setResultToCrm(mainResult) {
    const requestCRM = axios.create({
        headers: {
            "accept": "application/json"
        }
    });
    for (let res of mainResult) {
        if (res.available === null) {
            console.log('available === null');
            continue;
        }
        await requestCRM.post('http://138.68.94.189/api/sites_test/available', res).then(res => {
            console.log('Response CRM', res.data);
            console.log('Result returned to CRM');
        });
    }
}

function evaluationResult(inputResult) {
    let outputResult = true;
    if (inputResult) {
        if (inputResult.counts.startsWith('0')) {
            outputResult = false;
        }
        else {
            if (inputResult.failed.length !== 0) {
                outputResult = false;
            }
        }
    }
    else {
        outputResult = null;
    }

    return outputResult;
}

function compare(a, b) {
    if ( a.last_check < b.last_check ){
      return -1;
    }
    if ( a.last_check > b.last_check ){
      return 1;
    }
    return 0;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


