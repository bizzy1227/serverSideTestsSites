const axios = require('axios');

const requestCheckAvailability = axios.create({
    headers: {
        "accept": "application/json"
    }
});

const callToCheckAvailability = async function(inputUrl) {
    console.log('in callToCheckAvailability');
    let checkAvailabilityResult = false;
    await requestCheckAvailability.get(`https://check-host.net/check-http?host=${inputUrl}&max_nodes=10`)
        .then(res => {
            checkAvailabilityResult = res.data.request_id;
        });

    return checkAvailabilityResult;
}

const getReportCheckAvailability = async function(id) {
    console.log('in getReportCheckAvailability');

    let countRequest = 0;
    let scanData = null;
    let checkAvailabilityResult = false;

    while (scanData === null) {
        checkAvailabilityResult = false;
        if (countRequest > 5) {
            return checkAvailabilityResult;
        }
        console.log('in run while iteration');
        countRequest++;
        await requestCheckAvailability.get(`https://check-host.net/check-result/${id}`)
        .then(res => {
            scanData = true; 
            for (key in res.data) {
                if (res.data[key] === null) {
                    scanData = null;
                }
            }
            checkAvailabilityResult = res.data;
        });
        await sleep(5000);
    }

    if (checkAvailabilityResult) {
        // console.log('checkAvailabilityResult', checkAvailabilityResult);
        let countAllNodes = 0;
        let countPassedNodes = 0;
        let failedNodes = [];
        for (key in checkAvailabilityResult) {
            countAllNodes++;
            try {
                if (checkAvailabilityResult[key][0] === null) {
                    console.log('check-host error side: No route to host');
                    countAllNodes--;
                    continue;
                }
                else if (checkAvailabilityResult[key][0][3] && (checkAvailabilityResult[key][0][3] == '200' || checkAvailabilityResult[key][0][3] == '301')) {
                    countPassedNodes++;
                }
                else {
                    failedNodes.push({[key]: checkAvailabilityResult[key]});
                }
            } catch (error) {
                // console.log('1', key, checkAvailabilityResult[key]);
                failedNodes.push({[key]: checkAvailabilityResult[key]});
            }

        }
        checkAvailabilityResult = {
            counts: `${countPassedNodes}/${countAllNodes}`,
            failed: failedNodes
        };

    }
    return checkAvailabilityResult;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


module.exports.callToCheckAvailability = callToCheckAvailability;
module.exports.getReportCheckAvailability = getReportCheckAvailability;