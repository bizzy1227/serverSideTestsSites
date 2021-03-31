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
        host: '009.28.50.133',
        port: 8080,
        protocol: 'https',
        auth: {
            username: 'md9ZXK',
            password: 'AvNguA'
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
        // let r = JSON.stringify(response.data);
        console.log('Response with axios-https-proxy-fix was ok: ' + response.status);
    })
    .catch(function (error) {
        console.log(error);
    });


// 45.159.146.97:8000:md9ZXK:AvNguA

// 176.37.146.145:7010:z53Tz5Fi:3Yze3E5r

// 176.37.146.145:7001:7g18mGBm:7u6pF4uL