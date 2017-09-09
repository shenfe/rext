import * as Util from './util.js'

/* Feature test */
var supports = !!window.XMLHttpRequest && !!window.JSON;

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
 * @param  {Object} options     Settings
 * @return {Object}             Chained success/error/always methods
 */
function xhr(options) {
    if (!supports) return null;

    var settings = Util.extend(defaults, options || {});

    /* Our default methods */
    var methods = {
        success: function () {},
        error: function () {},
        always: function () {}
    };

    /* Override defaults with user methods and setup chaining */
    var atomXHR = {
        success: function (callback) {
            methods.success = callback;
            return atomXHR;
        },
        error: function (callback) {
            methods.error = callback;
            return atomXHR;
        },
        always: function (callback) {
            methods.always = callback;
            return atomXHR;
        }
    };

    /* Create our HTTP request */
    var request = new XMLHttpRequest();

    /* Setup our listener to process compeleted requests */
    request.onreadystatechange = function () {

        /* Only run if the request is complete */
        if (request.readyState !== 4) return;

        /* Parse the response text */
        var resText = parseResponse(request, settings.responseType);

        /* Process the response */
        if (request.status >= 200 && request.status < 300) {
            /* If successful */
            methods.success.call(methods, resText, request);
        } else {
            /* If failed */
            methods.error.call(methods, resText, request);
        }

        /* Run always */
        methods.always.call(methods, resText, request);

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

    return atomXHR;
}

export default xhr
