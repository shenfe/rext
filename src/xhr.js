import * as Util from './util.js'

/* Default settings */
var defaults = {
    type: 'GET',
    url: null,
    data: {},
    headers: {
        'Content-type': 'application/x-www-form-urlencoded'
    },
    responseType: 'text',
    withCredentials: false
};

/**
 * Parse text response into JSON
 * @param  {String} req             The response
 * @param  {String} responseType    The responseType in settings
 * @return {String|JSON}            A JSON Object of the responseText, plus the orginal response
 */
function parseResponse(req, responseType) {
    var result;
    if (responseType !== 'text' && responseType !== '') {
        return req.response;
    }
    try {
        result = JSON.parse(req.responseText);
    } catch (e) {
        result = req.responseText;
    }
    return result;
}

/**
 * Make an XML HTTP request
 * @param  {Object} options     Options
 * @return {Object}             Chained success/error/always methods
 */
function xhr(options) {
    var settings = Util.extend(defaults, options || {});

    /* Then-do methods */
    var thenDo = {
        success: options.success || function () {},
        error: options.error || function () {},
        always: options.always || function () {}
    };

    /* Override defaults with user methods and setup chaining */
    var _this = {
        success: function (callback) {
            thenDo.success = callback;
            return _this;
        },
        error: function (callback) {
            thenDo.error = callback;
            return _this;
        },
        always: function (callback) {
            thenDo.always = callback;
            return _this;
        }
    };

    /* Create our HTTP request */
    var request = new XMLHttpRequest();

    /* Setup our listener to process compeleted requests */
    request.onreadystatechange = function () {
        /* Only run if the request is complete */
        if (request.readyState !== 4) return;

        /* Parse the response data */
        var responseData = parseResponse(request, settings.responseType);

        /* Process the response */
        if (request.status >= 200 && request.status < 300) {
            thenDo.success.call(thenDo, responseData, request);
        } else {
            thenDo.error.call(thenDo, responseData, request);
        }

        thenDo.always.call(thenDo, responseData, request);
    };

    /* Setup our HTTP request */
    request.open(settings.type, settings.url, true);
    request.responseType = settings.responseType;

    /* Add headers */
    for (var header in settings.headers) {
        if (settings.headers.hasOwnProperty(header)) {
            request.setRequestHeader(header, settings.headers[header]);
        }
    }

    /* Add withCredentials */
    if (settings.withCredentials) {
        request.withCredentials = true;
    }

    /* Send the request */
    request.send(/application\/json/i.test(settings.headers['Content-type'])
        ? JSON.stringify(settings.data)
        : Util.param(settings.data)
    );

    return _this;
}

export {
    supported: !!window.XMLHttpRequest && !!window.JSON,
    send: xhr
}
