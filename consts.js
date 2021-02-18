
const DEV_NEOGARA_CRM_URL = 'https://dev.admin.neogara.com/';
const DEV_NEOGARA_AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibG9naW4iOiJhZG1pbiIsInJvbGVzIjpbIlNVUEVSX0FETUlOIl0sImNyZWF0ZWRBdCI6MTYxMzYzNjE3MDI1MCwiaWF0IjoxNjEzNjM2MTcwfQ.SA6jz4wYHJOTZWr56jhdwPiELXo-btIHXEo_NZMtcrs';

const PROXY = {
    'US': '206.189.189.81:3128',
    'PL': '45.159.147.232:8000'
};

const USER_DATA = {
    firstname: 'test',
    lastname: 'test',
    email: 'testmail5@gmail.com',
    emailWebErrors: 'testmail6@gmail.com',
    tel: 9111111111
};

module.exports.USER_DATA = USER_DATA;
module.exports.PROXY = PROXY;
module.exports.DEV_NEOGARA_CRM_URL = DEV_NEOGARA_CRM_URL;
module.exports.DEV_NEOGARA_AUTH_TOKEN = DEV_NEOGARA_AUTH_TOKEN;