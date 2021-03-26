const axios = require('axios');

// https://api.ipify.org?format=json

const request = axios.create({
    headers: {
        "accept": "application/json"
    }
});


(async () => {
    await request.get(`https://api.ipify.org?format=json`, {
        proxy: {
            host: '95.179.189.45',
            port: 8080,
            // auth: {username: 'WuPu4wA5', password: 'NaQc7hgd'}
        }
    })
    .then(res => {
        console.log(res.data);
    });
})();

