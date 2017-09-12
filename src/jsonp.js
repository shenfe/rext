import * as Util from './util.js'

/**
 * Make a JSONP request
 * @param  {Object} options     Options
 * @param  {Function} callback  Callback
 * @return {Undefined|Function}
 */
function send(options, callback) {
    var callbackGlobalName = 'jsonp_' + String((new Date().getTime()) * 1000 + Math.round(Math.random() * 1000));
    window[callbackGlobalName] = callback || options.callback;

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
        }
    };

    if (window[callbackGlobalName] == null) {
        return function (fn) {
            window[callbackGlobalName] = fn;
        };
    }
}

export default send
