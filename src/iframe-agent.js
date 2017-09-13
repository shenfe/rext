import * as XHR from './xhr.js'

var localOrigin = window.location.protocol + '//' + window.location.host;

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
 * Message event handler.
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
function messageEventHandler(e) {
    var msg;
    try {
        msg = JSON.parse(e.data);
    } catch (ex) {}
    if (!msg || msg.origin !== localOrigin) return;

    switch (msg.type) {
        case 'iframe-agent-request':
            if (msg.id == null) return;
            var res = {
                type: 'iframe-agent-response',
                origin: localOrigin,
                id: msg.id,
                message: '',
                data: null
            };
            XHR.promiseSend(msg.data, function () {
                res.message = 'success';
                res.data = [].slice.call(arguments);
                window.parent.postMessage(JSON.stringify(res), '*');
            }, function () {
                res.message = 'error';
                res.data = [].slice.call(arguments);
                window.parent.postMessage(JSON.stringify(res), '*');
            });
            break;
    }
}

listenEvent('message', messageEventHandler);

if (!String.prototype.endsWith) {
    String.prototype.endsWith = function (searchStr, Position) {
        if (!(Position < this.length))
            Position = this.length;
        else
            Position |= 0;
        return this.substr(Position - searchStr.length, searchStr.length) === searchStr;
    };
}

function isArray(arr) {
    return Object.prototype.toString.call(arr) === '[object Array]';
}

function inArray(item, arr) {
    for (var i = 0, len = arr.length; i < len; i++) {
        if (item === arr[i]) return i;
    }
    return -1;
}

(function (whitelist, strictMatch) {
    function parseDomain(url) {
        var aTag = window.document.createElement('a');
        aTag.href = url;
        return aTag.hostname;
    }
    var parentHost = parseDomain(window.document.referrer);
    if (strictMatch) {
        if (inArray(parentHost, whitelist) < 0) {
            throw new Error('Host blocked!');
        }
    } else {
        for (var i = 0, len = whitelist.length; i < len; i++) {
            if (parentHost.endsWith(whitelist[i]) || ('.' + parentHost) === whitelist[i]) return true;
        }
        throw new Error('Host blocked!');
    }
})(HostWhitelist);

(function () {
    var msg = {
        type: 'iframe-agent-ready',
        origin: localOrigin
    };
    window.parent.postMessage(JSON.stringify(msg), '*');
})();
