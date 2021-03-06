// const CheckAvailability = require('../check_availability/checkAvailability');
const axios = require('axios');


const requestSites = [
    "bavnoklpdpl.info"
];

const proxys = [
    {
        country: 'PL',
        settings: {
            host: '45.159.146.97',
            port: 8000,
            protocol: 'https',
            auth: {
                username: 'md9ZXK',
                password: 'AvNguA'
            }
        }
    },
    {
        country: 'DE',
        settings: {
            host: '45.150.112.120',
            port: 58077,
            protocol: 'http',
            auth: {
                username: 'ayAbxMAX',
                password: '4YZJtPGF'
            }
        }
    }
]

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

async function getProxyCheckAvailability(site) {
    // console.log('in getProxyCheckAvailability');
    let result = [];
        
        for (let proxyItem of proxys) {
            // result = [];
            const axiosDefaultConfig = {
                proxy: proxyItem.settings
            };

            const axiosFixed = require ('axios-https-proxy-fix').create(axiosDefaultConfig);
            
            await axiosFixed.get(`${site}`)
            .then(function (response) {
                // let r = JSON.stringify(response.data);
                // console.log(`${site}`, response.status);
                result.push({ country: proxyItem.country, status: response.status, contentLength: JSON.stringify(response.data).length });
            })
            .catch(function (error) {
                console.log('error 1', 1);
                result.push({ country: proxyItem.country, status: -1, contentLength: error.message.length });
            });
        }
    // console.log('test log result', result);
    return result;
}

async function testAvailabilityProxy() {
        
    for (let proxyItem of proxys) {
        // result = [];
        const axiosDefaultConfig = {
            proxy: proxyItem.settings
        };

        const axiosFixed = require ('axios-https-proxy-fix').create(axiosDefaultConfig);
        
        await axiosFixed.get('https://google.com')
        .then(function (response) {
            // let r = JSON.stringify(response.data);
            // console.log(`${site}`, response.status);
            if (response.status !== 200) {
                console.log(`Proxy ${proxyItem.country} not avaible`);
                throw Error(`Proxy ${proxyItem.country} not avaible`);
            }         })
        .catch(function (error) {
            console.log(`Proxy ${proxyItem.country} not avaible`);
            throw Error(`Proxy ${proxyItem.country} not avaible`);
        });
    }
    console.log('All proxy avaible');
}

async function asyncCallToResult(sites) {
    console.log('in asyncCallToResult');
    
    let checkResults = [];
    try {
        const promises = [];
        sites.forEach((site, key) => {
            promises.push(getProxyCheckAvailability(site));
        });
        const result = await Promise.all(promises);
        let index = 0;
        sites.forEach((site, indexItem) => {
            checkResults.push({ index: indexItem, result: result[index]} );
            index++;
        });
    } catch (error) {
        console.log('eeror 2', 2);
    }

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
    await testAvailabilityProxy();

    let mainResult = [];
    let crmData = await getSites();
    // console.log('before sort', crmData);
    crmData = await crmData.sort(compare);
    crmData = crmData.slice(0, 50);


    // let crsDomains = requestSites; // ---> для локального теста
    let crsDomains = crmData.map(item => {
        return item.domain;
    });

    let buityCrsDomains = await buitySites(crsDomains);
    console.log('crsDomains buity', crsDomains);
    
    let proxyCheckResult;

    proxyCheckResult = await asyncCallToResult(buityCrsDomains);
    // console.log('proxyCheckResult', proxyCheckResult);

    for (let [index, domain] of crsDomains.entries()) {
        // console.log('test_3', index, domain);
        
        mainResult.push({
            'domain': domain,
            'available': evaluationResult(proxyCheckResult[index].result)
        })
    }
    console.log('mainResult', mainResult);
    await setResultToCrm(mainResult);
    console.log('end', new Date());

    setTimeout(main, 180000);
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
    for (let result of inputResult) {
        // console.log('test log result', result);
        if (result) {
    
            if (result.status !== 200 || result.contentLength < 300) {
                return false;
            }
        }
        else {
            return null;
        }
    }

    return true;
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


