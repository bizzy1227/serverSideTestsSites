
const DEV_NEOGARA_CRM_URL = 'https://dev.admin.neogara.com/';
const STAGE_NEOGARA_CRM_URL = 'https://stage.admin.neogara.com/';

const DEV_NEOGARA_CREDENTIALS = {
    username: 'admin',
    password: 'password'
}

const STAGE_NEOGARA_CREDENTIALS = {
    username: 'yaroslav',
    password: 'yaroslav1'
}


const PROXY = {
    'US': '206.189.189.81:3128',
    'PL': '45.159.147.232:8000'
};

const USER_DATA = {
    firstname: 'test',
    lastname: 'test',
    sendFormEmailErrors: 'testmail5@gmail.com',
    emailWebErrors: 'testmail6@gmail.com',
    autoSendFormEmailErrors: 'testmail7@gmail.com',
    autoEmailWebErrors: 'testmail8@gmail.com',
    tel: 9111111111
};

const VIRUS_TOTAL_KEY = 'e90c1ec1f55ec17df28c4997bbde2ad019f3cfff8c9fe0914c5032ee00bd6bfc';

module.exports.USER_DATA = USER_DATA;
module.exports.PROXY = PROXY;
module.exports.DEV_NEOGARA_CRM_URL = DEV_NEOGARA_CRM_URL;
module.exports.STAGE_NEOGARA_CRM_URL = STAGE_NEOGARA_CRM_URL;
module.exports.DEV_NEOGARA_CREDENTIALS = DEV_NEOGARA_CREDENTIALS;
module.exports.STAGE_NEOGARA_CREDENTIALS = STAGE_NEOGARA_CREDENTIALS;
module.exports.VIRUS_TOTAL_KEY = VIRUS_TOTAL_KEY;