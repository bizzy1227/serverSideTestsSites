// const axios = require('axios');


$( ".sendToTest" ).click(function() {
    const typeSites = $('#exampleFormControlSelect1  option:selected').text();
    const sitesString = $('#exampleFormControlTextarea1').val();
    const sitesArray = sitesString.split('\n');
    const data = {
                    "sites": sitesArray,
                    "typeSites": typeSites
                }
    if (sitesArray.length > 10) {
        alert('Поставь на тест не более 10 сайтов за 1 раз.');
        return;
    } else {

        $.ajax({
            url: "http://138.68.69.213:8080/site",
            type: "POST",
            crossDomain: true,
            data: data,
            dataType: "json",
            success: function (response) {
                // const resp = JSON.parse(response)
                console.log('response', response);
                // console.log(resp);
            },
            error: function (xhr, status) {
                console.log('xhr', xhr.responseText);
                if (xhr.responseText === 'The tests are currently running') {
                    console.log('in 9000 post');
                    $.ajax({
                        url: "http://138.68.69.213:9000/site",
                        type: "POST",
                        crossDomain: true,
                        data: data,
                        dataType: "json",
                        success: function (response) {
                            console.log('response', response);
                        },
                        error: function (xhr, status) {
                            console.log('xhr', xhr.responseText);
                            if (xhr.responseText === 'The tests are currently running') {
                                alert("Все тесты сейчас заняты. Попробуй чуть позже");
                            }
                            console.log('status', status);
                            
                        }
                    });
                }
                // console.log('status', status);
                // alert("error");
            }
        });
    }
});