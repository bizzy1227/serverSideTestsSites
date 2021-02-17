const mainProcc = require('../index');
const hourse = 12;


// setInterval(() => {
//     mainProcc.autoRunServerFormErrors();
// }, getMs());

async function autoRunServerFormErrorsIndex() {
    mainProcc.autoRunServerFormErrors();
}

// mainProcc.autoRunServerFormErrors();

function getMs() {
    return ((hourse * 60) * 60) * 1000;
}