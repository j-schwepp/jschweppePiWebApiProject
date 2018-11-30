var piwebapi = (function () {
    //private variables
    var basePIWebAPIUrl;
    var currentUserName;
    var currentPassword;

    //private methods
    var processJsonContent = function (url, type, data, successCallBack, errorCallBack) {
        return $.ajax({
            url: url,
            type: type,
            data: data,
            contentType: "application/json; charset=UTF-8",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", makeBasicAuth(currentPassword, currentPassword));
            },
            success: successCallBack,
            error: errorCallBack

        })
    }

    var makeBasicAuth = function (user, password) {
        var tok = user + ':' + password;
        var hash = window.btoa(tok);
        return "Basic " + hash;
    }
    return {
        //Set base PI Web API URL
        SetBaseUrl: function (baseUrl) {
            basePIWebAPIUrl = baseUrl;
            if (basePIWebAPIUrl.slice(-1) !== '/') {
                basePIWebAPIUrl = basePIWebAPIUrl + '/';
            }
        },
        SetCredentials: function (user, password) {
            currentUserName = user;
            currentPassword = password;
        }


    }
})();