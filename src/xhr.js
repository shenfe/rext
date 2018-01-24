import * as Util from './util.js'
import * as Helper from './helper.js'

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

var xhrCallbacks = {};

/* Default settings */
var defaults = {
    type: 'GET',
    url: null,
    data: {},
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest'
    },
    responseType: 'text',
    withCredentials: false
};

/**
 * Parse text response into JSON
 * @param  {String} req             The response
 * @param  {String} typeRequired    The response type specified in the options
 * @return {String|JSON}            A JSON object or string
 */
function parseResponse(req, typeRequired) {
    var result;
    if (typeRequired === 'blob') {
        return typeof Blob === 'function' ? req.response : req.responseText;
    }
    if (('responseType' in req) && req.responseType !== 'text' && req.responseType !== '') {
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
function send(options) {
    var settings = Util.extend({}, defaults, options || {});
    if (options.simple) {
        if (!('X-Requested-With' in options.headers))
            delete settings.headers['X-Requested-With'];
    }
    var id = Util.uid();

    /* Then-do methods */
    var thenDo = {
        success: options.success || arguments[1] || function () {},
        error: options.error || arguments[2] || function () {},
        always: options.always || arguments[3] || function () {}
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
        var responseData = parseResponse(request, settings.responseType);

        /* Process the response */
        var req = {
            status: request.status,
            statusText: request.statusText,
            responseText: request.responseText,
            readyState: request.readyState
        };
        if (request.status >= 200 && request.status < 300) {
            thenDo.success.call(thenDo, responseData, req);
        } else {
            thenDo.error.call(thenDo, responseData, req);
        }

        thenDo.always.call(thenDo, responseData, req);
    };

    /* Setup the request */
    var isntGet = (typeof settings.type === 'string' && settings.type.toLowerCase() !== 'get');
    var paramData;
    if (/multipart\/form-data/i.test(settings.headers['Content-Type'])) {
        if (typeof FormData === 'function') {
            if (options.data instanceof FormData)
                paramData = options.data;
            else {
                paramData = new FormData();
                Util.each(options.data, function (v, p) {
                    paramData.append(p, v);
                });
            }
        } else {
            paramData = options.data;
        }
    } else {
        paramData = Util.param(settings.data);
    }
    request.open(settings.type,
        (isntGet || !paramData) ? settings.url : (settings.url + (settings.url.indexOf('?') > 0 ? '&' : '?') + paramData),
        true);
    // request.responseType = settings.responseType;
    if (request.overrideMimeType) {
        switch (settings.responseType) {
        case 'document':
        case 'xml':
            request.overrideMimeType('text/xml; charset=utf-8');
            break;
        case 'text':
            request.overrideMimeType('text/plain; charset=utf-8');
            break;
        case 'blob':
            request.overrideMimeType('text/plain; charset=x-user-defined');
            break;
        }
    }

    /* Set headers */
    for (var header in settings.headers) {
        if (settings.headers.hasOwnProperty(header)) {
            if (header === 'Content-Type' && /multipart\/form-data/i.test(settings.headers[header])) continue;
            request.setRequestHeader(header, settings.headers[header]);
        }
    }
    
    /* Set timeout */
    if (/^\d+$/.test(options.timeout)) {
        request.timeout = options.timeout;
        request.ontimeout = xhrCallback;
    }

    /* Set `withCredentials` */
    if (settings.withCredentials) {
        request.withCredentials = true;
    }

    /* Send the request */
    if (isntGet) {
        request.send(/application\/json/i.test(settings.headers['Content-Type'])
            ? JSON.stringify(settings.data)
            : paramData
        );
    } else {
        request.send('');
    }

    if (request.readyState === 4) {
        window.setTimeout(xhrCallback);
    } else {
        request.onreadystatechange = xhrCallbacks[id] = xhrCallback;
    }

    return {
        success: Util.funcontinue(thenDo, 'success'),
        error: Util.funcontinue(thenDo, 'error'),
        always: Util.funcontinue(thenDo, 'always'),
        abort: function () {
            if (xhrCallback) {
                xhrCallback(undefined, true);
            }
        }
    };
}

var promiseSend = Helper.promiseWrap(send);

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
var supported = !!xhrInstance;
var corsSupported = supported && ('withCredentials' in xhrInstance);

export {
    supported,
    corsSupported,
    promiseSend
}
