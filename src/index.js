import './polyfill'
import * as Util from './util.js'
import * as XHR from './xhr.js'
import * as XDR from './xdr.js'
import jsonp from './jsonp.js'
import * as IframeAgent from './iframe.js'

function rext(options) {
    var args = [].slice.call(arguments);

    if (options.promise && typeof options.promise !== 'function') {
        options.promise = rext.defaults.promise;
    }

    var isJsonp = !!options.jsonp || options.dataType === 'jsonp' || options.responseType === 'jsonp';
    if (isJsonp) {
        return jsonp.apply(null, args);
    }

    var isCrossDomain = Util.isCrossDomain(options.url);

    var isWithCredentials = !!options.withCredentials || (options.xhrFields && !!options.xhrFields.withCredentials);
    options.withCredentials = isWithCredentials;

    if (!options.type && typeof options.method === 'string') options.type = options.method;
    if (typeof options.type !== 'string') options.type = 'get';
    options.type = options.type.toLowerCase();
    var isntGet = options.type !== 'get';

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

    if (!isCrossDomain || XHR.corsSupported) {
        return XHR.promiseSend.apply(null, args);

    /* If you want to disable XDomainRequest, comment the two lines below and build your version. */
    } else if (!forceIframe && XDR.supported && !isWithCredentials && !isntGet && !(/\/json/i.test(options.headers['Content-Type']))) {
        return XDR.promiseSend.apply(null, args);
    /* If you want to disable XDomainRequest, comment the two lines above and build your version. */

    } else {
        return IframeAgent.promiseSend.apply(null, args);
    }
}

rext.defaults = {};

if (typeof Promise === 'function') {
    rext.defaults.promise = Promise;
}

export default rext
