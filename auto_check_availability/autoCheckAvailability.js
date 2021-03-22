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
        promises.push(CheckAvailability.getReportCheckAvailability(value));
    });
    const result = await Promise.all(promises);
    let index = 0;
    mapIds.forEach((value, key) => {
        checkResults.set(key, result[index]);
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
        console.log('res.data', res.data);
        result = res.data;
    });
    return result;
}

(async () => {
    let crmData = await getSites();
    let crsDomains = crmData.map(item => {
        return item.domain;
    });
    crsDomains = buitySites(crsDomains);
    // console.log('crsDomains', crsDomains);
    
    let mapWithCheckId;
    let mapWithCheckResult;
    // console.log('mapWithCheckId', mapWithCheckId);
    mapWithCheckId = await asyncCallToCheck(requestSites);
    await sleep(30000);
    mapWithCheckResult = await asyncCallToresult(mapWithCheckId);
    console.log('mapWithCheckResult', mapWithCheckResult);
})();

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


