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
        console.log('here');

        $.ajax({
            url: "http://138.68.69.213:8080/site",
            type: "POST",
            crossDomain: true,
            data: data,
            dataType: "json",
            success: function (response) {
                const resp = JSON.parse(response)
                console.log(resp.status);
                console.log(resp);
            },
            error: function (xhr, status) {
                console.log('xhr', xhr);
                console.log('status', status);
                alert("error");
            }
        });

        // const posting = $.post( 'http://138.68.69.213:8080/site', data );

        // posting.done(function( data ) {
        //     const content = $( data );
        //     console.log('content', content);
        //     $("body").empty().append(content);
        // });

        // $.post("http://138.68.69.213:8080/site", function(data) {
        //     $('body').append(data)
        // }, "json");

        
        // $.post( "http://138.68.69.213:8080/site", data)
        //     .done(function( res ) {
        //         console.log( "Data Loaded: " + res );
        //     })
        //     .fail(function( err ) {
        //         console.log( err );
        //     })
        // axios({
        //     method: 'post',
        //     url: 'http://138.68.69.213:8080/site',
        //     data: data
        // });
    }
});