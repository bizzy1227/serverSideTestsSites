


const runConsoleErrors  = async function(inputURL, driver) {
    console.log('in runConsoleErrors');

    let consoleErrorsResults = {
        URL: false,
        countErrors: {
            errors: false,
            warnings: false
        }
    };

    console.log('start: ', await driver.getCurrentUrl());

    try {

        console.log('before: ', await driver.getCurrentUrl());

        let errors = await driver.manage().logs().get('browser');

        // если есть ошибки
        let errorsArr = [];
        let warningsArr = [];
        
        if (errors.length !== 0) {
            for (let [i, err] of errors.entries()) {
                let obj = new Object(err);

                if (obj.level.name_ === 'ERROR') {
                    errorsArr.push({ level: 'error', message: obj.message, URL: await driver.getCurrentUrl() })
                };
                if (obj.level.name_ === 'WARNING') {
                    warningsArr.push({ level: 'warning', message: obj.message, URL: await driver.getCurrentUrl() })
                };
            }
        }

        consoleErrorsResults.URL = inputURL;
        consoleErrorsResults.countErrors.errors = errorsArr.length;
        consoleErrorsResults.countErrors.warnings = warningsArr.length;
        return consoleErrorsResults;

    } catch (error) {
        console.log(error);
        return consoleErrorsResults;
    }
}

module.exports.runConsoleErrors = runConsoleErrors;
