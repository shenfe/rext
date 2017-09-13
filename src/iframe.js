import * as Util from './util.js'

/**
 * Parse the origin from a url string.
 * @param  {String} url [description]
 * @return {String}     [description]
 */
function parseOrigin(url) {
    var atag = window.document.createElement('a');
    atag.href = url;
    return atag.protocol + '//' + atag.host;
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
        originIdTable[origin] = Util.gid();
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
function send(options) {
    var targetOrigin = parseOrigin(options.url);
    if (options.agentPageUrl) {
        originAgentUrlTable[targetOrigin] = options.agentPageUrl;
    }
    var thenDo = {
        success: options.success || arguments[1] || function () {},
        error: options.error || arguments[2] || function () {},
        always: options.always || arguments[3] || function () {}
    };
    var id = Util.gid();

    if (!callbackTable[targetOrigin]) callbackTable[targetOrigin] = {};
    callbackTable[targetOrigin][id] = thenDo;

    var iframe = getIframe(targetOrigin);
    doOnReady(targetOrigin, iframe, id, options);

    /* Setup chaining */
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

    return _this;
}

export {
    send
}
