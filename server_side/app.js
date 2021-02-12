const express = require('express');
const { request } = require('express');
const app = express();
const port = 8080;
const mainProcc = require('../index');


app.use(express.urlencoded());
app.use(express.json());
app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    res.append('Content-Type', 'text/event-stream');
    res.append('Cache-Control', 'no-cache');
    res.append('Connection', 'keep-alive');
    next();
});


app.get('/', (request, response) => {
    response.send('Hello from Express!')
})

app.post('/site', async (request, response) => {
    console.log('req body', request.body);
    try {
        let res = await mainProcc.runServer(request.body.sites);
        response.send(res);
    } catch (error) {
        console.log(error);
        response.send(error.message);
    }

})

app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${port}`)
})
