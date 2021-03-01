const axios = require('axios');
const CONSTS = require('../consts');


const runVirusTotal = async function(inputUrl) {
    console.log('in runVirusTotal');

    let virusTotalResult = false;
    let scanDate = false;

    const requestVirus = axios.create({
        baseURL: 'https://www.virustotal.com/vtapi/v2/url',
    });

    await requestVirus.post('/scan', null, { params: {
        url: inputUrl,
        apikey: CONSTS.VIRUS_TOTAL_KEY
    }}).then(res => {
    });

    while (typeof scanDate !== 'string') {
        console.log('in run while iteration');
        await requestVirus.get('/report', { params: {
            resource: inputUrl,
            apikey: CONSTS.VIRUS_TOTAL_KEY
        }}).then(res => {
            scanDate = res.data.scan_date;
            virusTotalResult = res.data.positives;
        });
        await sleep(10000);
    }


    return virusTotalResult;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports.runVirusTotal = runVirusTotal;