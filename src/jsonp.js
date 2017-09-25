import * as Util from './util.js'
import * as Helper from './helper.js'

/**
 * Make a JSONP request
 * @param  {Object} options     Options
 * @param  {Function} callback  Callback
 * @return {Undefined|Function}
 */
function send(options, callback) {
    var callbackGlobalName = 'jsonp_' + Util.gid();
    window[callbackGlobalName] = callback || options.callback || options.complete;

    /* Create and insert */
    var ref = window.document.getElementsByTagName('script')[0];
    var script = window.document.createElement('script');
    script.src = options.url
        + (options.url.indexOf('?') >= 0 ? '&' : '?')
        + Util.param(options.data)
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

    var resolver = Util.funcontinue(window, callbackGlobalName);
    return {
        success: resolver,
        complete: resolver,
        error: function () {}
    };
}

var promiseSend = Helper.promiseWrap(send);

export default promiseSend
