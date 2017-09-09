import * as Util from './util.js'

/**
 * Make a JSONP request
 * @param  {Object} options     Options
 * @param  {Function} callback  Callback
 * @return {Undefined|Function}
 */
function jsonp(options, callback) {
    var callbackGlobalName = 'jsonp_' + String((new Date().getTime()) * 1000 + Math.round(Math.random() * 1000));
    window[callbackGlobalName] = callback || options.callback || function () {};

    /* Create and insert a script */
    var ref = window.document.getElementsByTagName('script')[0];
    var script = window.document.createElement('script');
    script.src = options.url
        + (options.url.indexOf('?') >= 0 ? '&' : '?')
        + Util.param(options.data)
        + '&callback=' + callbackGlobalName;
    ref.parentNode.insertBefore(script, ref);

    /* After the script is loaded and executed, remove it */
    if (script.readyState) { /* IE */
        script.onreadystatechange = function () {
            if (script.readyState === 'loaded' || script.readyState === 'complete') {
                script.onreadystatechange = null;
                this.remove();
            }
        };
    } else {
        script.onload = function () {
            this.remove();
        };
    }
    
    if (window[callbackGlobalName] == null) {
        return function (fn) {
            window[callbackGlobalName] = fn;
        };
    }
}

export {
    send: jsonp
}
