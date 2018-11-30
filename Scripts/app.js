//location of the pi server
var baseServiceUrl = "https://osi.burnsmcdbts.com/piwebapi"

//function to show app if authentication is successful
var authSuccessCallBack = function (data, statusMessage, statusObj) {

    if (statusObj.status == 200) {
        $('#authentication').hide();
        $('#piapp').show();
    }
}
//let the user know if authentication is unsuccessful
var authErrorCallBack = function (data) {
    if (data.status == 401) {
        alert("Invalid username and password");
    }
    else {
        alert("Error in authentication");
    }
}
//authentication click handler 
$("#authenticate").click(function () {
    var username = $('#username').val();
    var password = $('#password').val();
    piwebapi.SetBaseUrl(baseServiceUrl);
    piwebapi.SetCredentials(username, password);
    piwebapi.Authorize(authSuccessCallBack, authErrorCallBack);

});
//back button click handler to clear the user authentication
$("#back-button").click(function () {
    $('#username').val('');
    $('#password').val('');
    $('#authentication').show();
    $('#piapp').hide();
    piwebapi.Reset();
});

//button handler to retrieve hottest element
$('#getHottest').click(function () {
    var max = 0;
    var maxElement = '';
    function listAttributes(data, parentWebId) {
        
        var FoundAverageTemp = false;
        $.each(data.Items, function (i, item) {
            
            if (Object.values(item).includes("AverageTemp")) {
                //The element has the AverageTemp attribut
                FoundAverageTemp = true;
                $.when(piwebapi.GetAttributeValue(item.WebId, function (data) { return data }, function () { console.log('attributes failed') })).done(function (data) {

                    //check to see if this attribute is more than previous max if it is set it as the new max
                    if (data.Value > max) {
                        max = data.Value;
                        maxElement = parentWebId;

                    }

                });
            }
            if (Object.values(item).includes("IsHotest")) {
               
                //reset all IsHotest values to False
                piwebapi.PostValue(item.WebId, function (data) { return data }, function () { console.log('post failed') }, JSON.stringify({ "Timestamp": "1970-01-01T00:00:00Z", "Value": 0 }));
            }

        });

        if (!FoundAverageTemp) {
            //We have to have Average Temps
            alert("No elements had average tempatures");
        }

    }

    //list the elements
    function listElements(data) {
        $.when($.each(data.Items, function (i, item) {
            //test to see if the element matches our selected template
            if (item.TemplateName == $('#etemplate').val()) {
                piwebapi.GetElementAttributes(item.WebId, function (data) { listAttributes(data, item.WebId) }, function () { console.log('attributes failed') });
            }
        })).then(function () {
            piwebapi.GetElement(maxElement, function (data) {
                //Max values were found notify the user
                $('#result').html('The hottest ' + $('#etemplate').val() + ' is named ' + data.Name + ' with a temparture of ' + max + '.');

                piwebapi.GetElementAttributes(data.WebId, function (data) {
                    $.each(data.Items, function (i, item) {
                        if (Object.values(item).includes("IsHotest")) {
                            
                            //record the IsHotest attribute value for the hottest city
                            piwebapi.PostValue(item.WebId, function (data) {
                                $('#result').html($('#result').html() + '<br> This ' + $('#etemplate').val() + ' was recorded as the hottest in the AF Database.');
                                return data
                            }, function () { console.log('post failed') }, JSON.stringify({ "Timestamp": "1970-01-01T00:00:00Z", "Value": 1 }));
                        }

                    });

                }, function () { console.log('max attributes failed') });





            }, function () { console.log('attributes failed') });
        });
    }
    //Retrieve the elements and call the function to list them
    function getElements(data) {
        piwebapi.GetDataBaseElements(data.WebId, function (data) { listElements(data) }, function () { console.log('elements failed') });
    }
    //Get the provided Server and Database and call the function to retrieve the Elements
    piwebapi.GetDataBaseWebId($('#afServer').val(), $('#afDatabase').val(), function (data) { getElements(data) }, function () { console.log('fail') });
});