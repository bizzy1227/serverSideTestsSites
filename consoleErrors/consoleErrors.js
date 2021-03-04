


const runConsoleErrors  = async function(inputURL, driver) {
    console.log('in runConsoleErrors');

    let errorsArr = [];
    let warningsArr = [];
    let messageErrorsArr = [];

    let consoleErrorsResults = {
        URL: false,
        countErrors: {
            errors: false,
            warnings: false
        },
        messageErrors: false
    };

    console.log('start: ', await driver.getCurrentUrl());

    try {

        console.log('before: ', await driver.getCurrentUrl());

        let errors = await driver.manage().logs().get('browser');

        console.log('errors in page', errors);
        
        if (errors.length !== 0) {
            
            for (let [i, err] of errors.entries()) {
                let obj = new Object(err);
                
                if (obj.level.name_ === 'SEVERE') {
                    errorsArr.push({ level: 'error', message: obj.message, URL: await driver.getCurrentUrl() });
                    messageErrorsArr.push({ level: 'error', message: obj.message, URL: await driver.getCurrentUrl() });
                };
                if (obj.level.name_ === 'WARNING') {
                    warningsArr.push({ level: 'warning', message: obj.message, URL: await driver.getCurrentUrl() });
                    messageErrorsArr.push({ level: 'warning', message: obj.message, URL: await driver.getCurrentUrl() });
                };
            }
        }

        consoleErrorsResults.URL = inputURL;
        consoleErrorsResults.countErrors.errors = errorsArr.length;
        consoleErrorsResults.countErrors.warnings = warningsArr.length;
        consoleErrorsResults.messageErrors = messageErrorsArr;
        return consoleErrorsResults;

    } catch (error) {
        console.log(error);
        return consoleErrorsResults;
    }
}

module.exports.runConsoleErrors = runConsoleErrors;
