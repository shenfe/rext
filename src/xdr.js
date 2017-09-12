import * as Util from './util.js'

var httpRegEx = /^(https?:)?\/\//i;
var getOrPostRegEx = /^get|post$/i;
var sameSchemeRegEx = new RegExp('^(\/\/|' + window.location.protocol + ')', 'i');

/* Default settings */
var defaults = {
    type: 'GET',
    url: null,
    data: {},
    responseType: 'text'
};

/**
 * Parse text response into JSON
 * @param  {String} req             The responseText
 * @return {String|JSON}            A JSON object or string
 */
function parseResponseData(req) {
    var result;
    try {
        result = JSON.parse(req);
    } catch (e) {
        result = req;
    }
    return result;
}

/**
 * Make an XDomainRequest (IE 8-9)
 * @param  {Object} options     Options
 * @return {Object}             Chained success/error/always methods
 */
function send(options) {
    options = Util.extend({}, defaults, options || {});

    /* Only if the request: uses GET or POST method, has HTTP or HTTPS protocol, has the same scheme as the calling page */
    if (!getOrPostRegEx.test(options.type) || !httpRegEx.test(options.url) || !sameSchemeRegEx.test(options.url)) {
        return;
    }

    var dataType = (options.responseType || 'json').toLowerCase();

    var request = new XDomainRequest();

    if (/^\d+$/.test(options.timeout)) {
        request.timeout = options.timeout;
    }

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
        },
        abort: function () {
            request.abort();
        }
    };

    request.ontimeout = function () {
        thenDo.error.call(thenDo, null, {
            status: {
                code: 500,
                message: 'timeout'
            }
        });
    };

    /* Set an empty handler for 'onprogress' so requests don't get aborted */
    request.onprogress = function () {};

    request.onload = function () {
        var status = {
            code: 200,
            message: 'success'
        };
        var response = {
            headers: {
                'Content-Length': request.responseText.length,
                'Content-Type': request.contentType
            },
            text: request.responseText,
            data: parseResponseData(request.responseText)
        };

        if (dataType === 'html' || /text\/html/i.test(request.contentType)) {
            response.data = request.responseText;
        } else if (dataType === 'json' || (dataType !== 'text' && /\/json/i.test(request.contentType))) {
            try {
                response.data = JSON.parse(request.responseText);
            } catch (e) {
                status.code = 500;
                status.message = 'parser error: invalid json';
            }
        } else if (dataType === 'xml' || (dataType !== 'text' && /\/xml/i.test(request.contentType))) {
            var doc = new ActiveXObject('Microsoft.XMLDOM');
            doc.async = 'false';
            try {
                doc.loadXML(request.responseText);
            } catch (e) {
                doc = undefined;
            }
            if (!doc || !doc.documentElement || doc.getElementsByTagName('parsererror').length) {
                status.code = 500;
                status.message = 'parser error: invalid xml';
            }
            response.data = doc;
        }

        response.status = status;
        if (status.code >= 200 && status.code < 300) {
            thenDo.success.call(thenDo, response.data, response);
        } else {
            thenDo.error.call(thenDo, response.data, response);
        }
        thenDo.always.call(thenDo, response.data, response);
    };

    request.onerror = function () {
        thenDo.error.call(thenDo, request.responseText, {
            status: {
                code: 500,
                message: 'error'
            },
            text: request.responseText
        });
    };

    request.open(options.type, options.url);

    window.setTimeout(function () {
        request.send(Util.param(options.data));
    }, 0);

    return _this;
}

var supported = !!window.XDomainRequest;

export {
    supported,
    send
}
