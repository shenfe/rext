import './polyfill'
import * as Util from './util.js'
import * as XHR from './xhr.js'
import * as XDR from './xdr.js'
import jsonp from './jsonp.js'
import * as IframeAgent from './iframe.js'

function xhr(options) {
    var isCrossDomain = Util.isCrossDomain(options.url);
    var args = [].slice.call(arguments);
    if (!isCrossDomain || XHR.corsSupported) {
        return XHR.send.apply(null, args);
    } else if (XDR.supported && !options.withCredentials) {
        return XDR.send.apply(null, args);
    } else {
        return IframeAgent.send.apply(null, args);
    }
}

export default function (options) {
    var args = [].slice.call(arguments);
    if (options.jsonp) {
        return jsonp.apply(null, args);
    } else {
        return xhr.apply(null, args);
    }
}
