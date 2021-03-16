const axios = require('axios');
const https = require('https')



const checkJsonData = async function(site, typeSite) {
    let resultCheckJsonData = {
        json: null,
        yandex: null,
        cloakit: null
    };

    const requestSiteJson = axios.create({
        baseURL: `${site}/settings.json`
    });

    try {

        let siteJson = await requestSiteJson.get().then(res => {return res.data});
        console.log('siteJson', siteJson);
        
        resultCheckJsonData.json = siteJson;
        if (!siteJson) {
           resultCheckJsonData.json = 'no settings.json';
           return resultCheckJsonData;
        } 

        let yandex = await checkField(siteJson, 'yandex');
        console.log('yandex', yandex);
        if (yandex) {
            resultCheckJsonData.yandex = await requestYandexMetrika(siteJson.yandex);
        }
        else {
            resultCheckJsonData.yandex = 'field yandex empty';
        }

        if (typeSite === 'preland') {
            resultCheckJsonData['relink'] = null;
            let relink = await checkField(siteJson, 'relink');
            console.log('relink', relink);
            if (relink) {
                resultCheckJsonData['relink'] = relink;
            }
            else {
                resultCheckJsonData['relink'] = 'field relink empty';
            } 
        }

        let cloakit = await checkField(siteJson, 'cloakit');
        console.log('cloakit', cloakit);

        if (cloakit) {
            resultCheckJsonData.cloakit = await requestCloakit(siteJson.cloakit);
        }
        else {
            resultCheckJsonData.cloakit = 'field cloakit empty';
        }
        

    } catch (error) {
        console.log(error);
    }

    console.log('resultCheckJsonData', resultCheckJsonData);

    return resultCheckJsonData;
}

async function checkField(json, nameField) {
    if (!json[nameField]) return false;
    return true;
}

async function requestYandexMetrika(yandex) {
    console.log(+yandex);
    let statusCode = 0;
    let countTokens = 0;
    let resultRequestYandexMetrika = null;
    const authTokens = [
        'OAuth AgAAAAAJdMiHAAYcwBw2Ba7oQU66slynwFj-HPA',
        'OAuth AgAAAAAyj4bWAAYcySS1esOXekbXjeVS7xxK8LY',
        'OAuth AgAAAAA9C3FLAAYixpJN6Bxy8UM0gPRIRMiqDt0'
    ];

    while (statusCode !== 200 && countTokens < 3) {
        let requestYandexMetrika = axios.create({
            baseURL: `https://api-metrika.yandex.net/stat/v1/data?preset=sources_summary&id=${+yandex}`,
            headers: {
                "Authorization": authTokens[countTokens]
            }
        });
        countTokens++;
    
        resultRequestYandexMetrika = await requestYandexMetrika.get()
            .then(res => {
                return res.data
            })
            .catch(error => {
                statusCode = error.response.status;
                console.log('error.response.status', error.response.status);
            });
    }

    if (resultRequestYandexMetrika) return true;
    else return 'no metric in yandex';

}

async function requestCloakit(cloakit) {
    console.log(+cloakit);
    let allResultsRequestCloakit = null;
    let resultRequestCloakit = null;

    let requestCloakit = axios.create({
        baseURL: 'https://panel.cloakit.space/search',
        headers: {
            "Cookie": '_ym_d=1610714955; _ym_uid=16107149555976594; _sd_demo_page_promo=true; _ym_isad=1; CLK_LOGED=1; CLK_USER=307; _sd_cs_visible=true; _ym_visorc=w; CLK_USER_HASH=91bef2ff1f1ca10f761ebc3052ed74eb'
        },
        httpsAgent: new https.Agent({  
            rejectUnauthorized: false
        })
    });

    allResultsRequestCloakit = await requestCloakit.post()
        .then(res => {
            return res.data
        })
        .catch(error => {
            console.log('error', error);
            return false;
        });

    if (allResultsRequestCloakit) {
        let findId = new RegExp(`id ${+cloakit} `, 'gm');
        let matchData = allResultsRequestCloakit.match(findId);
        if (matchData) {
            resultRequestCloakit = true;
        }
        else {
            console.log('cloakit not found');
            resultRequestCloakit = 'cloakit not found';
        }
        console.log('matchData', matchData);
    }
    else {
        console.log('failed request to cloakit');
        resultRequestCloakit = 'failed request to cloakit';
    }

    return resultRequestCloakit;

}

checkJsonData('https://fawjimxqsgwbjyp.info/', 'preland');