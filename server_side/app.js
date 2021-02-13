const express = require('express');
const { request } = require('express');
const app = express();
const port = 8080;
const mainProcc = require('../index');
const timeout = require('connect-timeout');


app.use(express.urlencoded());
app.use(express.json());
app.use(timeout(0));



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
