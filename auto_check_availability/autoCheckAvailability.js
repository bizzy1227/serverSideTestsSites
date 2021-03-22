const CheckAvailability = require('../check_availability/checkAvailability');


const requestSites = [
    "adgcadloxode.info",
    "adgcdoxode.info",
    "adgncdlodhde.info"
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
        console.log('1', site);
        promises.push(CheckAvailability.callToCheckAvailability(site));
    }
    const result = await Promise.all(promises);
    for (let [index, site] of bSites.entries()) {
        checkIds.set(site, result[index]);
    }
    return checkIds; 
}

async function asyncCallToresult(mapIds) {
    let checkResults = new Map();
    const promises = [];
    mapIds.forEach((value, key) => {
        // console.log('element', key, value);
        promises.push(CheckAvailability.getReportCheckAvailability(value));
    });
    const result = await Promise.all(promises);
    // console.log('res 2', result);
    let index = 0;
    mapIds.forEach((value, key) => {
        checkResults.set(key, result[index]);
        index++;
    });
    return checkResults; 
}


(async () => {
    let mapWithCheckId;
    let mapWithCheckResult;
    // console.log('mapWithCheckId', mapWithCheckId);
    mapWithCheckId = await asyncCallToCheck(requestSites);
    // sleep(20000);
    mapWithCheckResult = await asyncCallToresult(mapWithCheckId);
    console.log('mapWithCheckResult', mapWithCheckResult);
})();

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}



// async function someFunc1(){}
// async function someFunc2(){}
// async function someFunc3(){}

// const promises = []
// promises.push(someFunc1())
// promises.push(someFunc2())
// promises.push(someFunc3())

// const result = await Promisses.All(promises)

