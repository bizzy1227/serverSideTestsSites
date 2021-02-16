const mainProcc = require('../index');
const hourse = 12;


setInterval(() => {
    mainProcc.autoRunServerWebErrors();
}, getMs());

async function autoRunServerWebErrorsIndex() {
    mainProcc.autoRunServerWebErrors();
}

function getMs() {
    return ((hourse * 60) * 60) * 1000;
}