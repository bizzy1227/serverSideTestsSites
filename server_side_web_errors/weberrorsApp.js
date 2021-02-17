const express = require('express');
const { request } = require('express');
const app = express();
const port = 9000;
const mainProcc = require('../index');
const fs = require("fs");
const { url } = require('inspector');


var server = app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${port}`)
})

server.setTimeout(300000);


app.use(express.urlencoded());
app.use(express.json());


app.get('/', (request, response) => {
    response.send('Hello from Express!')
})

app.post('/site', async (request, response) => {

    console.log('req body', request.body);
    try {
        let res = await mainProcc.runServerWebErrors(request.body.sites);
        let goodSites = [];
        for (key in res) {
            if (res[key].webErrors.hasOwnProperty('error')) continue;
            else goodSites.push(key);
        }
        console.log('goodSites', goodSites);
        addToSiteQuery(goodSites);
        response.send(res);
    } catch (error) {
        console.log(error);
        response.send(error.message);
    }
})

const addToSiteQuery = async function(newSites) {
    let oldUrls;
    let newUrls;
    let strSite = fs.readFileSync('../inputAutoWebErrors.txt', 'utf8');

    let oldSites = strSite.split(/\r?\n/);
    oldUrls = oldSites.map(function(site) {
        if (!site.startsWith('http')) site = 'https://' + site;
        let data = new URL(site);
        return data.href;
    });

    newUrls = newSites.map(function(site) {
        if (!site.startsWith('http')) site = 'https://' + site;
        let data = new URL(site);
        return data.href;
    });

    console.log('oldUrls', oldUrls)
    console.log('newUrls', newUrls)

    for (let elem of newUrls) {
        if (oldUrls.includes(elem)) continue;
        else {
            fs.appendFileSync('../inputAutoWebErrors.txt', '\n' + elem, function (err) {
                if (err) throw err;
            });
        }
    }
}


