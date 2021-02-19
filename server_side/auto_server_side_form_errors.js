const mainProcc = require('../index');
const hourse = 12;


// setInterval(async () => {
//     await mainProcc.autoRunServerFormErrors();
// }, 10000);

(async function foo() {
    await mainProcc.autoRunServerFormErrors();
    setTimeout(foo, 10000);
})();

async function autoRunServerFormErrorsIndex() {
    mainProcc.autoRunServerFormErrors();
}

// mainProcc.autoRunServerFormErrors();

function getMs() {
    return ((hourse * 60) * 60) * 1000;
}