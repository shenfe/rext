import * as Util from './util.js'

function createStandardXHR() {
    try {
        return new window.XMLHttpRequest();
    } catch (e) {}
}

function createActiveXHR() {
    try {
        return new window.ActiveXObject('Microsoft.XMLHTTP');
    } catch (e) {}
}

var createXHR = (window.ActiveXObject === undefined || window.document.documentMode > 8)
    ? createStandardXHR
    : function () {
        return createStandardXHR() || createActiveXHR();
    };

var xhrId = 0;
var xhrCallbacks = {};

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
 * @return {String|JSON}            A JSON Object of the responseText, plus the orginal response
 */
function parseResponse(req) {
    var result;
    if (req.responseType !== 'text' && req.responseType !== '') {
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
    var id = ++xhrId;

    /* Then-do methods */
    var thenDo = {
        success: options.success || arguments[1] || function () {},
        error: options.error || arguments[2] || function () {},
        always: options.always || function () {}
    };

    /* Create an HTTP request */
    var request = createXHR();

    /* Setup our listener to process completed requests */
    var xhrCallback = function (_, toAbort) {
        /* Only run if the request is complete */
        if (xhrCallback == null || (request.readyState !== 4 && !toAbort)) return;

        /* Clean up */
        delete xhrCallbacks[id];
        xhrCallback = undefined;
        request.onreadystatechange = null;

        /* Abort manually if needed */
        if (toAbort) {
            if (request.readyState !== 4) {
                request.abort();
            }
            return;
        }

        /* Parse the response data */
        var responseData = parseResponse(request);

        /* Process the response */
        if (request.status >= 200 && request.status < 300) {
            thenDo.success.call(thenDo, responseData, request);
        } else {
            thenDo.error.call(thenDo, responseData, request);
        }

        thenDo.always.call(thenDo, responseData, request);
    };

    /* Setup the request */
    request.open(settings.type, settings.url, true);
    request.responseType = settings.responseType;

    /* Set headers */
    for (var header in settings.headers) {
        if (settings.headers.hasOwnProperty(header)) {
            request.setRequestHeader(header, settings.headers[header]);
        }
    }

    /* Set `withCredentials` */
    if (settings.withCredentials) {
        request.withCredentials = true;
    }

    /* Send the request */
    request.send(/application\/json/i.test(settings.headers['Content-type'])
        ? JSON.stringify(settings.data)
        : Util.param(settings.data)
    );

    if (request.readyState === 4) {
        window.setTimeout(xhrCallback);
    } else {
        request.onreadystatechange = xhrCallbacks[id] = xhrCallback;
    }

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
        },
        abort: function () {
            if (xhrCallback) {
                xhrCallback(undefined, true);
            }
        }
    };

    return _this;
}

/**
 * IE 9-: Open requests must be manually aborted on unload (#5280)
 * @refer https://support.microsoft.com/kb/2856746
 */
if (window.attachEvent) {
    window.attachEvent('onunload', function () {
        for (var id in xhrCallbacks) {
            xhrCallbacks.hasOwnProperty(id) && xhrCallbacks[id](undefined, true);
        }
    });
}

var xhrInstance = createXHR();
var xhrSupported = !!xhrInstance;
var corsSupported = xhrSupported && ('withCredentials' in xhrInstance);

export {
    supported: xhrSupported,
    corsSupported,
    send: xhr
}
