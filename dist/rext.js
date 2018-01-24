(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.rexter = factory());
}(this, (function () { 'use strict';

// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.io/#x15.4.4.18
if (!Array.prototype.forEach) {

    Array.prototype.forEach = function (callback /*, thisArg*/ ) {

        var T, k;

        if (this == null) {
            throw new TypeError('this is null or not defined');
        }

        // 1. Let O be the result of calling toObject() passing the
        // |this| value as the argument.
        var O = Object(this);

        // 2. Let lenValue be the result of calling the Get() internal
        // method of O with the argument "length".
        // 3. Let len be toUint32(lenValue).
        var len = O.length >>> 0;

        // 4. If isCallable(callback) is false, throw a TypeError exception.
        // See: http://es5.github.com/#x9.11
        if (typeof callback !== 'function') {
            throw new TypeError(callback + ' is not a function');
        }

        // 5. If thisArg was supplied, let T be thisArg; else let
        // T be undefined.
        if (arguments.length > 1) {
            T = arguments[1];
        }

        // 6. Let k be 0.
        k = 0;

        // 7. Repeat while k < len.
        while (k < len) {

            var kValue;

            // a. Let Pk be ToString(k).
            //    This is implicit for LHS operands of the in operator.
            // b. Let kPresent be the result of calling the HasProperty
            //    internal method of O with argument Pk.
            //    This step can be combined with c.
            // c. If kPresent is true, then
            if (k in O) {

                // i. Let kValue be the result of calling the Get internal
                // method of O with argument Pk.
                kValue = O[k];

                // ii. Call the Call internal method of callback with T as
                // the this value and argument list containing kValue, k, and O.
                callback.call(T, kValue, k, O);
            }
            // d. Increase k by 1.
            k++;
        }
        // 8. return undefined.
    };
}

var gid = function () {
    return new Date().getTime() * 10000 + Math.floor(Math.random() * 10000);
};

var uid = (function () {
    var n = 0;
    return function () {
        return n++;
    };
})();

var isNumber = function (v) {
    return typeof v === 'number';
};

var isNumeric = function (v) {
    var n = parseInt(v);
    if (isNaN(n)) return false;
    return (typeof v === 'number' || typeof v === 'string') && n == v;
};

var isString = function (v) {
    return typeof v === 'string';
};

var isFunction = function (v) {
    return typeof v === 'function';
};

var isObject = function (v) {
    return v != null && Object.prototype.toString.call(v) === '[object Object]';
};

var isArray = function (v) {
    return Object.prototype.toString.call(v) === '[object Array]';
};

var isBasic = function (v) {
    return v == null || typeof v === 'boolean' || typeof v === 'number' || typeof v === 'string' || typeof v === 'function';
};

var each = function (v, func, arrayReverse) {
    if (isObject(v)) {
        for (var p in v) {
            if (!v.hasOwnProperty(p)) continue;
            var r = func(v[p], p);
            if (r === false) break;
        }
    } else if (isArray(v)) {
        if (!arrayReverse) {
            for (var i = 0, len = v.length; i < len; i++) {
                var r = func(v[i], i);
                if (r === false) break;
            }
        } else {
            for (var i = v.length - 1; i >= 0; i--) {
                var r = func(v[i], i);
                if (r === false) break;
            }
        }
    } else if (isFunction(v.forEach)) {
        v.forEach(func);
    }
};

var clone = function (val) {
    var r = val;
    if (isObject(val)) {
        r = {};
        each(val, function (v, p) {
            r[p] = clone(v);
        });
    } else if (isArray(val)) {
        r = [];
        each(val, function (v) {
            r.push(clone(v));
        });
    }
    return r;
};

var hasProperty = function (val, p) {
    if (isObject(val)) {
        return val.hasOwnProperty(p);
    } else if (isArray(val)) {
        var n = parseInt(p);
        return isNumeric(p) && val.length > n && n >= 0;
    }
    return false;
};

var clear = function (val, p, withBasicVal) {
    var inRef = isString(p) || isNumber(p);
    var target = inRef ? val[p] : val;

    if (isObject(target) || isArray(target)) {
        each(target, function (v, p) {
            clear(target, p);
        });
        if (isArray(target)) {
            shrinkArray(target);
        }
    }

    if (inRef) {
        val[p] = withBasicVal;
    }
};

var shrinkArray = function (arr, len) {
    var limited = isNumber(len);
    if (!limited) {
        each(arr, function (v, i) {
            if (v === undefined) arr.length--;
        }, true);
    } else {
        each(arr, function (v, i) {
            if (i >= len) arr.length--;
            else return false;
        }, true);
        while (arr.length < len) {
            arr.push(null);
        }
    }
    return arr;
};

var extend = function (dest, srcs, clean) {
    if (!isObject(dest)) return null;
    var args = Array.prototype.slice.call(arguments, 1,
        arguments[arguments.length - 1] === true ? (arguments.length - 1) : arguments.length);
    clean = arguments[arguments.length - 1] === true ? true : false;

    function extendObj(obj, src, clean) {
        if (!isObject(src)) return;
        each(src, function (v, p) {
            if (!hasProperty(obj, p) || isBasic(v)) {
                if (obj[p] !== v) {
                    obj[p] = clone(v);
                }
            } else {
                extendObj(obj[p], v, clean);
            }
        });
        if (clean) {
            each(obj, function (v, p) {
                if (!hasProperty(src, p)) {
                    clear(obj, p);
                }
            });
            if (isArray(obj)) {
                shrinkArray(obj);
            }
        }
    }

    each(args, function (src) {
        extendObj(dest, src, clean);
    });
    return dest;
};

var type = function (v) {
    if (v === null) return 'null';
    if (v === undefined) return 'undefined';
    var t = Object.prototype.toString.call(v);
    return t.substring('[object '.length, t.length - 1).toLowerCase();
};

var param = function (obj) {
    // if (type(obj) === 'formdata') return obj;
    if (obj == null) return '';
    if (type(obj) === 'array') return JSON.stringify(obj);
    if (isBasic(obj)) return String(obj);
    var encoded = [];
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            encoded.push(encodeURIComponent(prop) + '=' + encodeURIComponent(isBasic(obj[prop]) ? String(obj[prop]) : JSON.stringify(obj[prop])));
        }
    }
    return encoded.join('&');
};

function completeUrl(url) {
    if (url.charAt(0) === '/') {
        if (url.charAt(1) === '/') {
            url = window.location.protocol + url;
        } else {
            url = window.location.protocol + '//' + window.location.host + url;
        }
    }
    return url;
}

function isCrossDomain(url) {
    url = completeUrl(url);
    var rurl = /^([\w.+-]+:)?(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/;
    var locParts = rurl.exec(window.location.href.toLowerCase()) || [];
    var curParts = rurl.exec(url.toLowerCase());
    if (curParts[1] === undefined) {
        curParts[1] = locParts[1];
    }
    return !!(curParts &&
        (
            curParts[1] !== locParts[1]
            || curParts[2] !== locParts[2]
            || (curParts[3] || (curParts[1] === 'http:' ? '80' : '443'))
                !== (locParts[3] || (locParts[1] === 'http:' ? '80' : '443'))
        )
    );
}

function funcontinue(target, prop) {
    return function (fn) {
        var oldFn = target[prop];
        target[prop] = function () {
            var args = [].slice.call(arguments);
            oldFn && oldFn.apply(this, args);
            fn && fn.apply(this, args);
        };
        return this;
    };
}

function promiseWrap(send) {
    return function (options) {
        var ret = send.apply(null, arguments);
        if (!options.promise) return ret;

        var Prom = options.promise;
        return new Prom(function (resolve, reject) {
            ret.success(function (data) {
                resolve(data);
            });
            ret.error(function (data) {
                reject(data);
            });
        });
    };
}

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
    var settings = extend({}, defaults, options || {});
    if (options.simple) {
        if (!('X-Requested-With' in options.headers))
            delete settings.headers['X-Requested-With'];
    }
    var id = uid();

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
                each(options.data, function (v, p) {
                    paramData.append(p, v);
                });
            }
        } else {
            paramData = options.data;
        }
    } else {
        paramData = param(settings.data);
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
        success: funcontinue(thenDo, 'success'),
        error: funcontinue(thenDo, 'error'),
        always: funcontinue(thenDo, 'always'),
        abort: function () {
            if (xhrCallback) {
                xhrCallback(undefined, true);
            }
        }
    };
}

var promiseSend = promiseWrap(send);

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

var httpRegEx = /^(https?:)?\/\//i;
var getOrPostRegEx = /^get|post$/i;
var sameSchemeRegEx = new RegExp('^(\/\/|' + window.location.protocol + ')', 'i');

/* Default settings */
var defaults$1 = {
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
function send$1(options) {
    options = extend({}, defaults$1, options || {});

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

    request.ontimeout = function () {
        var r = {
            status: {
                code: 500,
                message: 'timeout'
            }
        };
        thenDo.error.call(thenDo, null, r);
        thenDo.always.call(thenDo, null, r);
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
        var args = [request.responseText, {
            status: {
                code: 500,
                message: 'error'
            },
            text: request.responseText
        }];
        thenDo.error.apply(thenDo, args);
        thenDo.always.apply(thenDo, args);
    };

    var isntGet = (typeof options.type === 'string' && options.type.toLowerCase() !== 'get');
    var paramData = param(options.data);

    request.open(options.type, (isntGet || !paramData) ? options.url : (options.url + (options.url.indexOf('?') > 0 ? '&' : '?') + paramData));

    window.setTimeout(function () {
        request.send(isntGet ? paramData : '');
    }, 0);

    return {
        success: funcontinue(thenDo, 'success'),
        error: funcontinue(thenDo, 'error'),
        always: funcontinue(thenDo, 'always'),
        abort: function () {
            request.abort();
        }
    };
}

var promiseSend$1 = promiseWrap(send$1);

var supported$1 = !!window.XDomainRequest;

/**
 * Make a JSONP request
 * @param  {Object} options     Options
 * @param  {Function} callback  Callback
 * @return {Undefined|Function}
 */
function send$2(options, callback) {
    var callbackGlobalName = 'jsonp_' + gid();
    window[callbackGlobalName] = callback || options.callback || options.complete;

    /* Create and insert */
    var ref = window.document.getElementsByTagName('script')[0];
    var script = window.document.createElement('script');
    script.src = options.url
        + (options.url.indexOf('?') >= 0 ? '&' : '?')
        + param(options.data)
        + '&callback=' + callbackGlobalName;
    ref.parentNode.insertBefore(script, ref);

    /* When loaded and executed, clean up */
    script.onload = script.onreadystatechange = function () {
        if (!script.readyState || /loaded|complete/.test(script.readyState)) {
            script.onload = script.onreadystatechange = null;
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
            script = null;
            window[callbackGlobalName] = undefined;
            try {
                delete window[callbackGlobalName];
            } catch (e) {}
        }
    };

    var resolver = funcontinue(window, callbackGlobalName);
    return {
        success: resolver,
        complete: resolver,
        error: function () {}
    };
}

var promiseSend$2 = promiseWrap(send$2);

/**
 * Parse the origin from a url string.
 * @param  {String} url [description]
 * @return {String}     [description]
 */
function parseOrigin(url) {
    var org = url.toString().replace(/^(.*\/\/[^\/?#]*).*$/, '$1');
    return org;
}

/**
 * Add event listener.
 * @param  {String} event           The event name
 * @param  {Function} handler       The event handler
 * @param  {Node|Undefined} target  The target element
 * @return {[type]}                 [description]
 */
function listenEvent(event, handler, target) {
    target = target || window;
    if (window.addEventListener) {
        target.addEventListener(event, handler, false);
    } else {
        target.attachEvent('on' + event, handler);
    }
}

/**
 * Map from an origin string to an id.
 * @type {Object}
 */
var originIdTable = {};

/**
 * Map from an origin string to an map which is from a request id to its callbacks.
 * @type {Object}
 */
var callbackTable = {};

/**
 * Map from an origin string to its agent page url.
 * @type {Object}
 */
var originAgentUrlTable = {};

/**
 * Map from an origin string to a boolean value which is whether the agent page is ready.
 * @type {Object}
 */
var agentStatusTable = {};

/**
 * Map from an origin string to a waiting list of requests
 * waiting for the agent page to get ready and receive them.
 * @type {Object}
 */
var waitingRequestTable = {};

/**
 * Get the id of an origin.
 * @param  {String} origin The origin string
 * @return {Number}        The origin id
 */
function getOriginId(origin) {
    if (originIdTable[origin] === undefined) {
        originIdTable[origin] = gid();
    }
    return originIdTable[origin];
}

/**
 * Get the agent page url of an origin.
 * @param  {String} origin The origin string
 * @return {String}        The agent page url
 */
function getOriginAgent(origin) {
    if (originAgentUrlTable[origin] === undefined) {
        originAgentUrlTable[origin] = origin + '/iframe-agent.html';
    }
    return originAgentUrlTable[origin];
}

/**
 * Get the iframe id of an agent page of an origin.
 * @param  {String} origin The origin string
 * @return {String}        The iframe id
 */
function getIframeId(origin) {
    return 'iframe-agent-' + getOriginId(origin);
}

/**
 * Get the iframe of an origin.
 * @param  {String} origin The origin string
 * @return {Node}          The iframe
 */
function getIframe(origin) {
    var iframeId = getIframeId(origin);
    var ifr = window.document.getElementById(iframeId);
    if (!ifr) {
        ifr = window.document.createElement('iframe');
        ifr.id = iframeId;
        ifr.style.display = 'none';
        window.document.body.appendChild(ifr);
    }
    var agentPageUrl = getOriginAgent(origin);
    if (ifr.src !== agentPageUrl)
        ifr.src = agentPageUrl;
    return ifr;
}

/**
 * Message event handler.
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
function messageEventHandler(e) {
    var msg;
    try {
        msg = JSON.parse(e.data);
    } catch (ex) {}
    if (!msg) return;

    switch (msg.type) {
        case 'iframe-agent-ready':
            agentStatusTable[msg.origin] = true;
            var iframe = window.document.getElementById(getIframeId(msg.origin));
            if (waitingRequestTable[msg.origin]) {
                waitingRequestTable[msg.origin].forEach(function (req) {
                    iframe.contentWindow.postMessage(req, msg.origin);
                });
                waitingRequestTable[msg.origin].length = 0;
            }
            delete waitingRequestTable[msg.origin];
            break;
        case 'iframe-agent-response':
            if (msg.id != null && callbackTable[msg.origin][msg.id]) {
                if (msg.message === 'success') {
                    callbackTable[msg.origin][msg.id].success.apply(null, msg.data);
                } else if (msg.message === 'error') {
                    callbackTable[msg.origin][msg.id].error.apply(null, msg.data);
                }
                if (callbackTable[msg.origin][msg.id].always)
                    callbackTable[msg.origin][msg.id].always.apply(null, msg.data);
                delete callbackTable[msg.origin][msg.id];
            }
            break;
    }
}

listenEvent('message', messageEventHandler);

/**
 * If the agent page is ready, post the request to it;
 * otherwise, push the request to the waiting list.
 * @param  {String} agentOrigin   The origin string
 * @param  {Node} iframe          The iframe
 * @param  {Number} requestId     The request id
 * @param  {Object} requestOption The request option
 * @return {[type]}               [description]
 */
function doOnReady(agentOrigin, iframe, requestId, requestOption) {
    var msg = {
        type: 'iframe-agent-request',
        origin: agentOrigin,
        id: requestId,
        data: requestOption
    };
    if (agentStatusTable[agentOrigin]) {
        iframe.contentWindow.postMessage(JSON.stringify(msg), agentOrigin);
    } else {
        if (!waitingRequestTable[agentOrigin]) {
            waitingRequestTable[agentOrigin] = [];
        }
        waitingRequestTable[agentOrigin].push(JSON.stringify(msg));
    }
}

/**
 * Main function.
 * @param  {Object} options The request option
 * @return {[type]}         [description]
 */
function send$3(options) {
    options.url = completeUrl(options.url);
    var targetOrigin = parseOrigin(options.url);
    if (options.agentPageUrl) {
        options.agentPageUrl = completeUrl(options.agentPageUrl);
        originAgentUrlTable[targetOrigin] = options.agentPageUrl;
    }
    var thenDo = {
        success: options.success || arguments[1] || function () {},
        error: options.error || arguments[2] || function () {},
        always: options.always || arguments[3] || function () {}
    };
    var id = gid();

    if (!callbackTable[targetOrigin]) callbackTable[targetOrigin] = {};
    callbackTable[targetOrigin][id] = thenDo;

    var iframe = getIframe(targetOrigin);
    doOnReady(targetOrigin, iframe, id, options);

    return {
        success: funcontinue(thenDo, 'success'),
        error: funcontinue(thenDo, 'error'),
        always: funcontinue(thenDo, 'always')
    };
}

var promiseSend$3 = promiseWrap(send$3);

var util = {
    doAsync: function (fn, arg, target) {
        (typeof process === 'undefined' ? setTimeout : process.nextTick)(
            (arguments.length === 1) ? fn : function () {
                fn.apply(target, (arg instanceof Array) ? arg : [arg]);
            }
        );
    },
    isFunction: function (v) { return typeof v === 'function' },
    isObject: function (v) { return typeof v === 'object' && v !== null }
};

var extension = function (Prom) {
    /* Prototype methods */

    Prom.prototype['catch'] = function (onRejected) {
        return this.then(undefined, onRejected);
    };

    // https://www.promisejs.org/api/
    Prom.prototype.done = function (onFulfilled, onRejected) {
        var _this = arguments.length ? this.then.apply(this, arguments) : this;
        _this.then(undefined, function (err) {
            util.doAsync(function () { throw err });
        });
    };

    Prom.prototype['finally'] = function (fn) {
        if (!util.isFunction(fn)) return this;
        fn = function (value) {
            return Prom.resolve(fn()).then(function () {
                return value;
            });
        };
        return this.then(fn, fn);
    };

    /* Static methods */

    Prom.resolved = Prom.resolve = function (value) {
        return new Prom(function (resolve) {
            resolve(value);
        });
    };

    Prom.rejected = Prom.reject = function (reason) {
        return new Prom(function (_, reject) {
            reject(reason);
        });
    };

    Prom.deferred = function () {
        var _resolve, _reject;
        return {
            promise: new Prom(function (resolve, reject) {
                _resolve = resolve;
                _reject = reject;
            }),
            resolve: _resolve,
            reject: _reject
        };
    };

    Prom.all = function (arr) {
        var ps = Array.prototype.slice.call(arr);
        return new Prom(function (resolve, reject) {
            if (ps.length === 0) return resolve([]);
            var total = ps.length, remain = ps.length;
            for (var i = 0; i < total; i++) {
                Prom.resolved(ps[i]).then(function (value) {
                    ps[i] = value;
                    remain--;
                    if (remain === 0) resolve(ps);
                }, reject);
            }
        });
    };

    Prom.race = function (arr) {
        var ps = Array.prototype.slice.call(arr);
        return new Prom(function (resolve, reject) {
            if (ps.length === 0) return resolve(null);
            for (var i = 0, total = ps.length; i < total; i++)
                Prom.resolve(ps[i]).then(resolve, reject);
        });
    };
};

var Resolve = function (promise, x) {
    if (promise === x) { // 2.3.1
        TransitionPromise(promise, 2, new TypeError('The promise and its value refer to the same object.'));
    } else if (x && x.constructor === Prom) { // 2.3.2
        if (x.state === 0) { // 2.3.2.1
            x.then(function (value) { Resolve(promise, value); },
                function (reason) { TransitionPromise(promise, 2, reason); });
        } else
            TransitionPromise(promise, x.state, x.value); // 2.3.2.2, 2.3.2.3
    } else if (util.isObject(x) || util.isFunction(x)) { // 2.3.3
        var called = false;
        try {
            var xthen = x.then; // 2.3.3.1
            if (util.isFunction(xthen)) { // 2.3.3.3
                xthen.call(x, function (y) { // 2.3.3.3.1
                        if (called) return; // 2.3.3.3.3
                        Resolve(promise, y);
                        called = true;
                    }, function (r) { // 2.3.3.3.2
                        if (called) return; // 2.3.3.3.3
                        TransitionPromise(promise, 2, r);
                        called = true;
                    });
            } else { // 2.3.3.4
                TransitionPromise(promise, 1, x);
                called = true;
            }
        } catch (e) { // 2.3.3.2, 2.3.3.3.4
            if (!called) {
                TransitionPromise(promise, 2, e);
                called = true;
            }
        }
    } else
        TransitionPromise(promise, 1, x); // 2.3.4
};

var ThenPromise = function (promise2, promise1state, promise1value) {
    if (promise1state !== 0 && promise2.callbacks[promise1state]) { // 2.2.2, 2.2.3
        var value;
        try {
            value = promise2.callbacks[promise1state].call(undefined, promise1value); // 2.2.5
        } catch (e) {
            TransitionPromise(promise2, 2, e); // 2.2.7.2
            return;
        }
        Resolve(promise2, value); // 2.2.7.1
    } else if (promise1state === 1 && !promise2.callbacks[1]) // 2.2.1.1
        Resolve(promise2, promise1value); // 2.2.7.3
    else if (promise1state === 2 && !promise2.callbacks[2]) // 2.2.1.2
        TransitionPromise(promise2, 2, promise1value); // 2.2.7.4
};

var TransitionPromise = function (promise, state, value) {
    if (promise.state !== 0 || state === 0) return; // 2.1.1.1, 2.1.2.1, 2.1.3.1
    promise.state = state;
    promise.value = value; // 2.1.2.2, 2.1.3.2
    util.doAsync(function () { // 2.2.6
        while (promise.queue.length) ThenPromise(promise.queue.shift(), promise.state, promise.value);
    });
};

var Prom = function (executor) {
    this.state = 0; // 0: pending, 1: fulfilled (resolved), 2: rejected
    this.value = null;
    this.queue = [];
    this.callbacks = {};

    if (util.isFunction(executor)) {
        var _this = this;
        executor(function (value) { Resolve(_this, value); },
            function (reason) { TransitionPromise(_this, 2, reason); });
    }
};

Prom.prototype.then = function (onFulfilled, onRejected) {
    var p = new Prom();
    p.callbacks[1] = util.isFunction(onFulfilled) && onFulfilled;
    p.callbacks[2] = util.isFunction(onRejected) && onRejected;
    (this.state === 0) ? this.queue.push(p) : util.doAsync(ThenPromise, [p, this.state, this.value]); // 2.2.4
    return p;
};

Prom.prototype.resolve = function (value) {
    Resolve(this, value);
    return this;
};

Prom.prototype.reject = function (reason) {
    TransitionPromise(this, 2, reason);
    return this;
};

extension(Prom);

var src = Prom;

function rext(options) {
    var args = [].slice.call(arguments);

    if (options.promise !== false) {
        options.promise = rext.defaults.promise;
    }
    
    if (typeof options.dataType === 'string') {
        options.dataType = options.dataType.toLowerCase();
    }
    if (typeof options.responseType === 'string') {
        options.responseType = options.responseType.toLowerCase();
    }
    if (typeof options.method === 'string') {
        options.method = options.method.toLowerCase();
    }
    if (typeof options.type === 'string') {
        options.type = options.type.toLowerCase();
    }

    var isJsonp = !!options.jsonp || options.dataType === 'jsonp' || options.responseType === 'jsonp';
    if (isJsonp) {
        return promiseSend$2.apply(null, args);
    }

    var isCrossDomain$$1 = isCrossDomain(options.url);

    var isWithCredentials = !!options.withCredentials || (options.xhrFields && !!options.xhrFields.withCredentials);
    options.withCredentials = isWithCredentials;

    if (!options.type && typeof options.method === 'string') options.type = options.method;
    if (typeof options.type !== 'string') options.type = 'get';
    options.type = options.type.toLowerCase();
    var isntGet = options.type !== 'get';
    
    if (options.cache !== false) options.cache = true;
    if (!options.cache && !isntGet && isObject(options.data)) {
        options.data._ = gid();
    }

    if (!options.headers) options.headers = {};
    if (options.contentType) {
        if (!options.headers['Content-Type'])
            options.headers['Content-Type'] = options.contentType;
        else
            delete options.contentType;
    }
    if (!options.headers['Content-Type'])
        options.headers['Content-Type'] = 'application/x-www-form-urlencoded';

    if (typeof options.responseType !== 'string') {
        if (typeof options.dataType === 'string' && /^(text|json|xml|html)$/i.test(options.dataType))
            options.responseType = options.dataType;
        else
            options.responseType = 'text';
    }

    if (options.complete) {
        options.always = options.complete;
        delete options.complete;
    }

    var forceIframe = !!options.agent;

    if (!isCrossDomain$$1 || (corsSupported && !forceIframe)) {
        return promiseSend.apply(null, args);

    /* If you want to disable XDomainRequest, comment the two lines below and build your version. */
    } else if (!forceIframe && supported$1 && !isWithCredentials && !isntGet && !(/\/json/i.test(options.headers['Content-Type']))) {
        return promiseSend$1.apply(null, args);
    /* If you want to disable XDomainRequest, comment the two lines above and build your version. */

    } else {
        return promiseSend$3.apply(null, args);
    }
}

rext.defaults = {};

window.rext_promises_aplus = src;
if (typeof Promise === 'undefined') {
    rext.defaults.promise = src;
} else {
    rext.defaults.promise = Promise;
}

return rext;

})));
