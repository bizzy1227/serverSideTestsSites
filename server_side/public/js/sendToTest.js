
$('.sendToTest').click(function() {
    var jsonViewer = new JSONViewer();
    $('.sendToTest').attr('disabled','disabled');
    $('.sendToTest').removeClass('btn-primary').addClass('btn-warning');
    $('.sendToTest').html('Test is running');
    const typeSites = $('#exampleFormControlSelect1  option:selected').text();
    const sitesString = $('#exampleFormControlTextarea1').val();
    const sitesArray = sitesString.split('\n');
    const data = {
                    "sites": sitesArray,
                    "typeSites": typeSites
                }
    if (sitesArray.length > 10) {
        alert('Поставь на тест не более 10 сайтов за 1 раз.');
        enabledButton();
        return;
    } else {

        $.ajax({
            url: "http://138.68.69.213:8080/site",
            type: "POST",
            crossDomain: true,
            data: data,
            dataType: "json",
            success: function (response) {
                $('.body').empty();
                $('.body').append('<div id="json"></div>');
                $('#json').append(jsonViewer.getContainer());
                jsonViewer.showJSON(response);
            },
            error: function (xhr, status) {
                // console.log('xhr', xhr.responseText);
                if (xhr.responseText === 'The tests are currently running') {
                    console.log('in 9000 post');
                    $.ajax({
                        url: "http://138.68.69.213:9000/site",
                        type: "POST",
                        crossDomain: true,
                        data: data,
                        dataType: "json",
                        success: function (response) {
                            $('.body').empty();
                            $('.body').append('<div id="json"></div>');
                            $('#json').append(jsonViewer.getContainer());
                            jsonViewer.showJSON(response);
                        },
                        error: function (xhr, status) {
                            console.log('xhr', xhr.responseText);
                            if (xhr.responseText === 'The tests are currently running') {
                                enabledButton();
                                alert("Все тесты сейчас заняты. Попробуй чуть позже");
                            } else {
                                alert(xhr.responseText);
                                enabledButton();
                            }   
                        }
                    });
                } else {
                    alert(xhr.responseText);
                    enabledButton();
                }
            }
        });
    }
});

function enabledButton() {
    $('.sendToTest').removeClass('btn-warning').addClass('btn-primary');
    $('.sendToTest').html('Test');
    $('.sendToTest').removeAttr('disabled');
}