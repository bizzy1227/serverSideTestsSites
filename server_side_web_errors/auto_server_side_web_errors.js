const mainProcc = require('../index');
const minutes = 1


setInterval(() => {
    mainProcc.autoRunServerWebErrors();
}, getMs());

async function autoRunServerWebErrorsIndex() {
    mainProcc.autoRunServerWebErrors();
}

function getMs() {
    return minutes * 60 * 1000
}