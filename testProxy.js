// const HttpsProxyAgent = require('https-proxy-agent');

// const axiosDefaultConfig = {
//     proxy: false,
//     httpsAgent: new HttpsProxyAgent('https://45.76.15.121:8080')
// };

// const axios = require ('axios').create(axiosDefaultConfig);
// axios.get('https://api.ipify.org?format=json')
//     .then(function (response) {
//         console.log('Response' + response);
//     })
//     .catch(function (error) {
//         console.log(error);
//     });

const axiosDefaultConfig = {
    proxy: {
        host: '176.37.146.145',
        port: 7001,
        protocol: 'https',
        auth: {
            username: '7g18mGBm',
            password: '7u6pF4uL'
        }
    }
};

// const axios = require ('axios').create(axiosDefaultConfig);
// axios.get('https://api.ipify.org?format=json')
//     .then(function (response) {
//         console.log('Response with axios was ok: ' + response.status);
//     })
//     .catch(function (error) {
//         console.log(error);
//     });

const axiosFixed = require ('axios-https-proxy-fix').create(axiosDefaultConfig);
axiosFixed.get('https://api.ipify.org?format=json')
    .then(function (response) {
        let r = JSON.stringify(response.data);
        console.log('Response with axios-https-proxy-fix was ok: ' + r);
    })
    .catch(function (error) {
        console.log(error);
    });


// 176.37.146.145:7010:z53Tz5Fi:3Yze3E5r

// 176.37.146.145:7001:7g18mGBm:7u6pF4uL