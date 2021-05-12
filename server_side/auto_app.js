const axios = require('axios');
const express = require('express');
const { request } = require('express');
const app = express();
const port = 9000;
const mainProcc = require('../index');

let testInProcess = false;

var server = app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${port}`)
})

server.setTimeout(0);
// для локальной проверки нужно установить maxConnections = 2
// server.maxConnections = 1;


app.use(express.urlencoded());
app.use(express.json());


app.get('/', (request, response) => {
    response.send('Hello from Express!')
})

app.post('/site', async (request, response) => {
    response.set('Access-Control-Allow-Origin', '*');
    console.log('req body', request.body);
    try {

        if (!testInProcess) {
            if (request.body.callback) {
                testInProcess = true;
                response.send('Site(s) in processing'); 
                let res = await mainProcc.runServer(request.body.sites, 'sendFormErrors', request.body.typeSites);
                await setResultToCRM(res, request.body.callback);
                testInProcess = false;
            }
            if (!request.body.callback) {
                testInProcess = true;
                let res = await mainProcc.runServer(request.body.sites, 'sendFormErrors', request.body.typeSites);
                response.send(res);
                testInProcess = false;
            }
        }
        else {
            response.send('The tests are currently running');
        }

    } catch (error) {
        testInProcess = false;
        console.log(error);
        response.send(error.message);
    }

})

async function setResultToCRM(res, callback) {

    const requestSettings = axios.create({
        baseURL: callback,
    });
    
    await requestSettings.post('/', res).then(res => {
        console.log('Result returned to CRM');
    });

}


