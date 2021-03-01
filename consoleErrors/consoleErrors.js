
let consoleErrorsResults = {
    URL: false,
    countErrors: false
};

const runConsoleErrors  = async function(inputURL, driver) {
    console.log('in runConsoleErrors');

    consoleErrorsResults = {};

    console.log('start: ', await driver.getCurrentUrl());

    try {

        console.log('before: ', await driver.getCurrentUrl());

        let errors = await driver.manage().logs().get('browser');

        // если есть ошибки
        let allErrors = [];
        
        if (errors.length !== 0) {
            for (let [i, err] of errors.entries()) {
                let obj = new Object(err);
                // если нужно скипать WARNING ошибки
                if (obj.level.name_ === 'WARNING') continue;

                allErrors.push({ level: 'error', message: obj.message, URL: await driver.getCurrentUrl() })
            }
        }

        consoleErrorsResults.URL = inputURL;
        consoleErrorsResults.countErrors = allErrors.length;
        return consoleErrorsResults;

    } catch (error) {
        console.log(error);
    }
}

module.exports.runConsoleErrors = runConsoleErrors;
