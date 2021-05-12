
const axios = require('axios');


$( ".sendToTest" ).click(function() {
    const typeSites = $('#exampleFormControlSelect1  option:selected').text();
    const sitesString = $('#exampleFormControlTextarea1').val();
    const sitesArray = sitesString.split('\n');
    const data = {
                    "sites": sitesArray,
                    "typeSites": typeSites
                }
    if (sitesArray.length > 10) {
        alert('Не будь жадн(ым/ой). Поставь на тест не более 10 сайтов за 1 раз.');
        return;
    } else {
        axios({
            method: 'post',
            url: 'http://138.68.69.213:8080/site',
            data: data
        });
    }
});