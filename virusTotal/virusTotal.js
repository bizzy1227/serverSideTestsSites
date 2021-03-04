const axios = require('axios');
const CONSTS = require('../consts');

const requestVirus = axios.create({
    baseURL: 'https://www.virustotal.com/vtapi/v2/url',
});

const scanVirusTotal = async function(inputUrl) {
    console.log('in setVirusTotal');
    let virusTotalResult = false;
    await requestVirus.post('/scan', null, { params: {
        url: inputUrl,
        apikey: CONSTS.VIRUS_TOTAL_KEY
    }}).then(async res => {
        virusTotalResult = res.data.scan_id;
    });

    return virusTotalResult;
}

const getReportVirusTotal = async function(scanId) {
    console.log('in getReportVirusTotal');

    const countRequest = 0;

    let virusTotalResult = false;
    let scanDate = false;

    while (typeof scanDate !== 'string') {
        if (countRequest > 5) {
            return virusTotalResult;
        }
        console.log('in run while iteration');
        countRequest++;
        await requestVirus.get('/report', { params: {
            resource: scanId,
            apikey: CONSTS.VIRUS_TOTAL_KEY
        }}).then(res => {
            scanDate = res.data.scan_date;
            virusTotalResult = res.data.positives;
        });
        await sleep(5000);
    }

    return virusTotalResult;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports.scanVirusTotal = scanVirusTotal;
module.exports.getReportVirusTotal = getReportVirusTotal;