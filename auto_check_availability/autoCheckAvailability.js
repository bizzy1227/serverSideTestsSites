// const CheckAvailability = require('../check_availability/checkAvailability');
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
    console.log('in getProxyCheckAvailability');
    let result = [];
        console.log('prik 1');
        
        for (let proxyItem of proxys) {
            result = [];
            console.log('prik 2');
            const axiosDefaultConfig = {
                proxy: proxyItem.settings
            };
            console.log('prik 3');

            const axiosFixed = require ('axios-https-proxy-fix').create(axiosDefaultConfig);
            console.log('prik 4');

            try {
                const response = await axiosFixed.get(`${site}`)
                // Success 🎉
                console.log(response);
                result.push({ country: proxyItem.country, status: response.status, contentLength: JSON.stringify(response.data).length });
            } catch (error) {
                // Error 😨
                if (error.response) {
                    /*
                     * The request was made and the server responded with a
                     * status code that falls out of the range of 2xx
                     */
                    console.log(error.response.data);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                } else if (error.request) {
                    /*
                     * The request was made but no response was received, `error.request`
                     * is an instance of XMLHttpRequest in the browser and an instance
                     * of http.ClientRequest in Node.js
                     */
                    console.log(error.request);
                } else {
                    // Something happened in setting up the request and triggered an Error
                    console.log('Error', error.message);
                }
                console.log(error);
            }
            
            // await axiosFixed.get(`${site}`)
            // .then(function (response) {
            //     console.log('prik 5');
            //     // let r = JSON.stringify(response.data);
            //     // console.log(`${site}`, response.status);
            //     result.push({ country: proxyItem.country, status: response.status, contentLength: JSON.stringify(response.data).length });
            // })
            // .catch(function (error) {
            //     console.log('prik 6');
            //     console.log('error 1', 1);
            //     result.push({ country: proxyItem.country, status: -1, contentLength: error.message.length });
            // });
            console.log('prik 7');
        }
    console.log('prik 8');
    return result;
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
    let mainResult = [];
    let crmData = await getSites();
    // console.log('before sort', crmData);
    crmData = await crmData.sort(compare);
    crmData = crmData.slice(0, 30);


    let crsDomains = crmData.map(item => {
        return item.domain;
    });

    let buityCrsDomains = await buitySites(crsDomains);
    console.log('crsDomains buity', crsDomains);
    
    let proxyCheckResult;

    proxyCheckResult = await asyncCallToResult(buityCrsDomains);
    console.log('proxyCheckResult', proxyCheckResult);

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

    setTimeout(main, 60000);
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
        if (result) {
    
            if (result.status !== 200 || result.contentLength < 5000) {
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


