var piwebapi = (function () {
    //private variables
    var basePIWebAPIUrl = null;
    var currentUserName = null;
    var currentPassword = null;

    //private methods
    var processJsonContent = function (url, type, data, successCallBack, errorCallBack, async) {
        return $.ajax({
            url: url,
            type: type,
            data: data,
            contentType: "application/json; charset=UTF-8",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", makeBasicAuth(currentUserName, currentPassword));
            },
            success: successCallBack,
            error: errorCallBack,
            async: async

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
        },
        Authorize: function (successCallBack, errorCallBack) {
            return processJsonContent(basePIWebAPIUrl, 'GET', null, successCallBack, errorCallBack);
        },
        Reset: function () {
            basePIWebAPIUrl = null;
            currentUserName = null;
            currentPassword = null;

        },
        GetDataBaseWebId: function (afServerName, afDatabaseName, successCallBack, errorCallBack) {
            afServerName = encodeURI(afServerName);
            afDatabaseName = encodeURI(afDatabaseName);
            return processJsonContent(basePIWebAPIUrl + 'assetdatabases?path=\\\\' + afServerName + '\\' + afDatabaseName, 'GET', null, successCallBack, errorCallBack, true);
        },
        GetDataBaseElements: function (databaseWebId, successCallBack, errorCallBack) {
            return processJsonContent(basePIWebAPIUrl + '/assetdatabases/' + databaseWebId + '/elements', 'GET', null, successCallBack, errorCallBack, true);
        },
        GetElementAttributes: function (elementWebId, successCallBack, errorCallBack) {
            return processJsonContent(basePIWebAPIUrl + '/elements/' + elementWebId + '/attributes', 'GET', null, successCallBack, errorCallBack, false);
        },
        GetAttributeValue: function (attributetWebId, successCallBack, errorCallBack) {
            return processJsonContent(basePIWebAPIUrl + '/streams/' + attributetWebId + '/value', 'GET', null, successCallBack, errorCallBack, false);
        },
        GetAttributeTimeValues: function (attributetWebId, start, stop, successCallBack, errorCallBack) {
            return processJsonContent(basePIWebAPIUrl + '/streams/' + attributetWebId + '/recorded?starttime='+start+'&endtime='+stop, 'GET', null, successCallBack, errorCallBack, false);
        },
        GetElement: function (elementWebId, successCallBack, errorCallBack) {
            return processJsonContent(basePIWebAPIUrl + '/elements/' + elementWebId, 'GET', null, successCallBack, errorCallBack, false);
        },
        PostValue: function (attributetWebId, successCallBack, errorCallBack, value) {
            console.log(value);
            console.log(basePIWebAPIUrl + '/streams/' + attributetWebId + '/value');
            return processJsonContent(basePIWebAPIUrl + '/streams/' + attributetWebId + '/value', 'POST', value, successCallBack, errorCallBack, false);
        }


    }
})();