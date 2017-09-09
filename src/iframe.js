function parseOrigin(url) {
    var aTag = window.document.createElement('a');
    aTag.href = url;
    return aTag.origin;
}

function addMessageListener(handler) {
    if (window.addEventListener) {
        window.addEventListener('message', handler, false);
    } else {
        window.attachEvent('onmessage', handler);
    }
}

var originIdTable = {};
var callbackIdTable = {};

function getIframe(origin) {
    var iframeId = 'xajax-' + getOriginId(origin);
    var ifr = window.document.getElementById(iframeId);
    if (!ifr) {
        ifr = window.document.createElement('iframe');
        ifr.id = iframeId;
        ifr.style.display = 'none';
        window.document.body.appendChild(ifr);
    }
    if (ifr.src !== (origin + '/xajax.html'))
        ifr.src = origin + '/xajax.html';
    return ifr;
}

var defaults = {
    autoRemove: false
};

function getOriginId(origin) {
    if (originIdTable[origin] === undefined) {
        originIdTable[origin] = idGen();
    }
    return originIdTable[origin];
}

var idGen = (function () {
    var id = 0;
    return function () {
        id++;
        return id;
    };
})();

function messageEventHandler(e) {
    var p0 = '[iframexajax:'.length;
    if (e.data.substr(0, p0) === '[iframexajax:') {
        var p1 = e.data.indexOf(']', p0);
        if (p1 < 0) return;
        var iframexajax_origin = e.data.substring(p0, p1);
        var originId = originIdTable[iframexajax_origin];
        var msgbody = e.data.substr(p1 + 1);
        try {
            var r = JSON.parse(msgbody);
            if (callbackIdTable[originId]) {
                callbackIdTable[originId](r);
                delete callbackIdTable[originId];
            }
        } catch (e) {
            // TODO with msgbody
        }
    }
}

addMessageListener(messageEventHandler);

function iframexajax(option) {
    var targetOrigin = parseOrigin(option.url);
    var callback = option.doneWith;
    var id = idGen();
    if (callback) callbackIdTable[id] = callback;

    var iframe = getIframe(targetOrigin);
}

export default iframexajax
